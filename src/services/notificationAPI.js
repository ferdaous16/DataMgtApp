import { supabase } from '../supabaseClient';

export const NotificationAPI = {
  createNotification: async (recipientId, senderId, type, content, referenceId = null, referenceType = null) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          recipient_id: recipientId,
          sender_id: senderId,
          type,
          content,
          reference_id: referenceId,
          reference_type: referenceType
        })
        .select();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  getUserNotifications: async (userId, limit = 20) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:profiles!sender_id(id, first_name, last_name, role)
        `)
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  markAllAsRead: async (userId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  getUnreadCount: async (userId) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  },
  
  deleteNotification: async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};