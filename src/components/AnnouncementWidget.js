import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AnnouncementWidget = ({ limit = 3 }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  
  useEffect(() => {
    fetchLatestAnnouncements();
    checkForUnread();
  }, []);
  
  const fetchLatestAnnouncements = async () => {
    try {
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`expires_at.is.null,expires_at.gt.${today}`)
        .order('important', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      setAnnouncements(data);
      
      // Mark these announcements as read for this user
      if (data.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const readIds = data.map(a => a.id);
          await markAsRead(user.id, readIds);
        }
      }
      
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkForUnread = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get the user's last read timestamp from local storage
      const lastReadKey = `last_read_announcement_${user.id}`;
      const lastRead = localStorage.getItem(lastReadKey) || '2000-01-01T00:00:00Z';
      
      // Check if there are any announcements newer than the last read time
      const { count, error } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .gt('published_at', lastRead);
        
      if (error) throw error;
      
      setHasUnread(count > 0);
      
      // Update the last read timestamp
      if (count > 0) {
        localStorage.setItem(lastReadKey, new Date().toISOString());
      }
      
    } catch (error) {
      console.error('Error checking for unread announcements:', error);
    }
  };
  
  const markAsRead = async (userId, announcementIds) => {
    // Update the last read timestamp in local storage
    const lastReadKey = `last_read_announcement_${userId}`;
    localStorage.setItem(lastReadKey, new Date().toISOString());
    setHasUnread(false);
  };
  
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900">Company Announcements</h3>
        <div className="mt-3 text-sm text-gray-500">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Company Announcements
          {hasUnread && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              New
            </span>
          )}
        </h3>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800" onClick={(e) => {
          e.preventDefault();
          // This function would be implemented in the parent component to switch to the announcements tab
          if (typeof window !== 'undefined' && window.switchToAnnouncementsTab) {
            window.switchToAnnouncementsTab();
          }
        }}>
          View All
        </a>
      </div>
      
      {announcements.length === 0 ? (
        <div className="mt-3 text-sm text-gray-500">No announcements</div>
      ) : (
        <div className="mt-3 space-y-3">
          {announcements.map(announcement => (
            <div 
              key={announcement.id} 
              className={`p-3 rounded-md ${announcement.important ? 'bg-red-50' : 'bg-gray-50'}`}
            >
              <h4 className={`text-sm font-medium ${announcement.important ? 'text-red-800' : 'text-gray-900'}`}>
                {announcement.important && (
                  <span className="inline-block mr-1 w-2 h-2 rounded-full bg-red-500"></span>
                )}
                {announcement.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(announcement.published_at).toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                {announcement.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementWidget;