import { supabase } from '../supabaseClient';

export const MessageAPI = {
  // Create a new direct message conversation between two users
  createDirectConversation: async (user1Id, user2Id) => {
    try {
      // Check if a conversation already exists between these users
      const { data: existingConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('is_group', false)
        .eq('title', null);
      
      if (existingConvs?.length) {
        const convIds = existingConvs.map(c => c.id);
        
        const { data: members } = await supabase
          .from('conversation_members')
          .select('conversation_id, profile_id')
          .in('conversation_id', convIds);
        
        if (members) {
          const membersByConv = {};
          members.forEach(m => {
            if (!membersByConv[m.conversation_id]) {
              membersByConv[m.conversation_id] = [];
            }
            membersByConv[m.conversation_id].push(m.profile_id);
          });
          
          for (const [convId, memberIds] of Object.entries(membersByConv)) {
            if (memberIds.length === 2 && 
                memberIds.includes(user1Id) && 
                memberIds.includes(user2Id)) {
              return { id: convId, isNew: false };
            }
          }
        }
      }
      
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ is_group: false })
        .select()
        .single();
      
      if (convError) throw convError;
      
      const { error: memberError } = await supabase
        .from('conversation_members')
        .insert([
          { conversation_id: conversation.id, profile_id: user1Id },
          { conversation_id: conversation.id, profile_id: user2Id }
        ]);
      
      if (memberError) throw memberError;
      
      return { id: conversation.id, isNew: true };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },
  
  createGroupConversation: async (title, memberIds) => {
    try {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({ title, is_group: true })
        .select()
        .single();
      
      if (convError) throw convError;
      
      const members = memberIds.map(id => ({
        conversation_id: conversation.id,
        profile_id: id
      }));
      
      const { error: memberError } = await supabase
        .from('conversation_members')
        .insert(members);
      
      if (memberError) throw memberError;
      
      return conversation.id;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  },
  
  sendMessage: async (conversationId, senderId, content) => {
    try {
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        })
        .select()
        .single();
      
      if (msgError) throw msgError;
      
      const { data: members } = await supabase
        .from('conversation_members')
        .select('profile_id')
        .eq('conversation_id', conversationId)
        .neq('profile_id', senderId);
      
      if (members && members.length > 0) {
        const notifications = members.map(member => ({
          recipient_id: member.profile_id,
          sender_id: senderId,
          type: 'message',
          content: 'New message received',
          reference_id: message.id,
          reference_type: 'message'
        }));
        
        await supabase.from('notifications').insert(notifications);
      }
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  getUserConversations: async (userId) => {
    try {
      const { data: memberOf, error: memberError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('profile_id', userId);
      
      if (memberError) throw memberError;
      
      if (!memberOf || memberOf.length === 0) {
        return [];
      }
      
      const conversationIds = memberOf.map(m => m.conversation_id);
      
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });
      
      if (convError) throw convError;
      
      const { data: allMembers, error: allMembersError } = await supabase
        .from('conversation_members')
        .select('conversation_id, profiles:profile_id(id, first_name, last_name, role)')
        .in('conversation_id', conversationIds);
      
      if (allMembersError) throw allMembersError;
      
      const { data: latestMessages, error: msgError } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, conversation_id, profiles:sender_id(first_name, last_name)')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });
      
      if (msgError) throw msgError;
      
      const result = conversations.map(conversation => {
        const members = allMembers
          .filter(m => m.conversation_id === conversation.id)
          .map(m => m.profiles);
        
        const latestMessage = latestMessages.find(m => m.conversation_id === conversation.id);
        
        let displayName = conversation.title;
        if (!conversation.is_group) {
          const otherMember = members.find(m => m.id !== userId);
          displayName = otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : 'Unknown';
        }
        
        return {
          ...conversation,
          members,
          displayName,
          latestMessage
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },
  
  getConversationMessages: async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, first_name, last_name, role)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  markMessagesAsRead: async (conversationId, userId) => {
    try {
      const { error: msgError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);
      
      if (msgError) throw msgError;
      
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId);
      
      if (messages && messages.length) {
        const messageIds = messages.map(m => m.id);
        
        const { error: notifError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('recipient_id', userId)
          .eq('type', 'message')
          .eq('reference_type', 'message')
          .in('reference_id', messageIds)
          .eq('is_read', false);
        
        if (notifError) throw notifError;
      }
      
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
  
  getUnreadMessageCount: async (userId) => {
    try {
      const { data: memberOf } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('profile_id', userId);
      
      if (!memberOf || memberOf.length === 0) {
        return 0;
      }
      
      const conversationIds = memberOf.map(m => m.conversation_id);
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error counting unread messages:', error);
      return 0;
    }
  }
};