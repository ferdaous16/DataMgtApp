import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { MessageAPI } from '../../services/messageAPI';
import { format } from 'date-fns';

const MessageList = ({ conversationId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationDetails, setConversationDetails] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversationDetails();
      
      // Mark messages as read when opening conversation
      MessageAPI.markMessagesAsRead(conversationId, currentUserId);
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          // Only add message if it's not from current user or not already in the list
          if (payload.new && 
              (!messages.some(m => m.id === payload.new.id))) {
            
            fetchSenderInfo(payload.new).then(messageWithSender => {
              setMessages(prev => [...prev, messageWithSender]);
              
              // Mark as read if we're currently viewing this conversation
              if (payload.new.sender_id !== currentUserId) {
                MessageAPI.markMessagesAsRead(conversationId, currentUserId);
              }
            });
          }
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [conversationId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSenderInfo = async (message) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .eq('id', message.sender_id)
      .single();
    
    return { ...message, sender: data };
  };

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const data = await MessageAPI.getConversationMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async () => {
    try {
      // Fetch conversation details
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (!conversation) return;
      
      // Fetch members
      const { data: members } = await supabase
        .from('conversation_members')
        .select('profiles:profile_id(id, first_name, last_name, role)')
        .eq('conversation_id', conversationId);
      
      const memberProfiles = members?.map(m => m.profiles) || [];
      
      // For direct messages, set title as the other person's name
      let displayName = conversation.title;
      if (!conversation.is_group) {
        const otherMember = memberProfiles.find(m => m.id !== currentUserId);
        displayName = otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : 'Unknown';
      }
      
      setConversationDetails({
        ...conversation,
        members: memberProfiles,
        displayName
      });
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;
    
    setSending(true);
    try {
      await MessageAPI.sendMessage(conversationId, currentUserId, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8 rounded-lg">
        <p className="text-gray-500">Select a conversation or start a new one</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      {conversationDetails && (
        <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">{conversationDetails.displayName}</h3>
            <p className="text-sm text-gray-500">
              {conversationDetails.is_group 
                ? `${conversationDetails.members.length} members` 
                : conversationDetails.members.find(m => m.id !== currentUserId)?.role || ''}
            </p>
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center p-4">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No messages yet</div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div 
                key={message.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    isCurrentUser 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-medium mb-1">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </p>
                  )}
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageList;