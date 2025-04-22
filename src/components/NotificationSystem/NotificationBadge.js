import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { NotificationAPI } from '../../services/notificationAPI';
import { MessageAPI } from '../../services/messageAPI';

const NotificationBadge = ({ userId, type = 'all', onClick }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    
    fetchCount();
    
    // Set up subscription for new notifications
    const notificationSubscription = supabase
      .channel(`${type}_notifications:${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        fetchCount();
      })
      .subscribe();
    
    // Set up subscription for message status changes (mark as read)
    const updateSubscription = supabase
      .channel(`notification_updates:${userId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`
      }, () => {
        fetchCount();
      })
      .subscribe();
    
    return () => {
      notificationSubscription.unsubscribe();
      updateSubscription.unsubscribe();
    };
  }, [userId, type]);

  const fetchCount = async () => {
    if (!userId) return;
    
    try {
      let unreadCount = 0;
      
      if (type === 'all' || type === 'notifications') {
        unreadCount += await NotificationAPI.getUnreadCount(userId);
      }
      
      if (type === 'all' || type === 'messages') {
        unreadCount += await MessageAPI.getUnreadMessageCount(userId);
      }
      
      setCount(unreadCount);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    }
  };

  if (count === 0) return null;

  return (
    <button 
      onClick={onClick}
      className="relative inline-flex"
    >
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
};

export default NotificationBadge;