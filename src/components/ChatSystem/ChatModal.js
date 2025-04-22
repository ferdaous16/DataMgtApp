import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import MessageList from './MessageList';
import { MessageAPI } from '../../services/messageAPI';

const ChatModal = ({ isOpen, onClose, userId, employees }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [view, setView] = useState('conversations');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  
  useEffect(() => {
    if (!isOpen) {
      setView('conversations');
      setSelectedConversation(null);
      setSelectedRecipient('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartNewConversation = async () => {
    if (!selectedRecipient) return;
    
    try {
      const { id } = await MessageAPI.createDirectConversation(userId, selectedRecipient);
      setSelectedConversation(id);
      setView('messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Messaging</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r p-4 flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-medium">Your Conversations</h3>
              <button 
                onClick={() => setView('new')}
                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
              >
                New Message
              </button>
            </div>
            
            {view === 'new' ? (
              <div className="space-y-4">
                <h4 className="font-medium">Select a recipient:</h4>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Employee --</option>
                  {employees
                    .filter(emp => emp.id !== userId)
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.role})
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartNewConversation}
                    disabled={!selectedRecipient}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    Start Conversation
                  </button>
                  <button
                    onClick={() => setView('conversations')}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <ConversationList
                userId={userId}
                onSelectConversation={(convId) => {
                  setSelectedConversation(convId);
                  setView('messages');
                }}
                selectedConversationId={selectedConversation}
              />
            )}
          </div>
          
          <div className="w-2/3 flex flex-col">
            <MessageList
              conversationId={selectedConversation}
              currentUserId={userId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;