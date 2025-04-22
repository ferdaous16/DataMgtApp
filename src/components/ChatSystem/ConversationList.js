import React, { useState, useEffect } from 'react';
import { MessageAPI } from '../../services/messageAPI';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../../supabaseClient';


const ConversationList = ({ userId, onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
    
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchConversations = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await MessageAPI.getUserConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading conversations...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h3 className="text-lg font-medium">Conversations</h3>
      </div>
      
      <div className="divide-y overflow-y-auto max-h-96">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations yet</div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`p-3 cursor-pointer hover:bg-gray-50 ${
                selectedConversationId === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{conversation.displayName}</h4>
                  {conversation.latestMessage && (
                    <>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.latestMessage.profiles.first_name}: {conversation.latestMessage.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(conversation.latestMessage.created_at), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;