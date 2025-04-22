// components/NotificationCenter/NotificationCenter.js
import React, { useState, useEffect, useRef } from 'react';
import { NotificationAPI } from '../../services/notificationAPI';
import { MessageAPI } from '../../services/messageAPI';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../supabaseClient';

const NotificationCenter = ({ userId, navigateToConversation }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchUnreadCount();
      
      const subscription = supabase
        .channel(`notifications:${userId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        }, () => {
          fetchNotifications();
          fetchUnreadCount();
        })
        .subscribe();
      
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      const data = await NotificationAPI.getUserNotifications(userId, 10);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    
    try {
      const count = await NotificationAPI.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notification) => {
    try {
      await NotificationAPI.markAsRead(notification.id);
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (notification.type === 'message' && notification.reference_type === 'message') {
        const { data: message } = await supabase
          .from('messages')
          .select('conversation_id')
          .eq('id', notification.reference_id)
          .single();
        
        if (message) {
          navigateToConversation(message.conversation_id);
          setIsOpen(false);
        }
      }
      // Handle other notification types...
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationContent = (notification) => {
    const senderName = notification.sender ? 
      `${notification.sender.first_name} ${notification.sender.last_name}` : 
      'Someone';
    
    switch (notification.type) {
      case 'message':
        return `${senderName} sent you a message`;
      case 'announcement':
        return `New announcement: ${notification.content}`;
      case 'task':
        return `${senderName} assigned you a task`;
      case 'leave_request':
        return `${senderName} submitted a leave request`;
      default:
        return notification.content;
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-sm font-medium">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleMarkAsRead(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {!notification.is_read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm">
                          {getNotificationContent(notification)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;