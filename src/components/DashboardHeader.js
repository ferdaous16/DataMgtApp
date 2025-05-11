import React, { useState, useEffect } from 'react';
import mainLogo from'../assets/logo.png';
import sign_out_icon from'../assets/icons/sign-out-icon.png';
import messages_icon from'../assets/icons/messages-icon-2.png';
import { supabase } from '../supabaseClient';
import NotificationCenter from './NotificationCenter/NotificationCenter';
import NotificationBadge from './NotificationSystem/NotificationBadge';
import ChatModal from './ChatSystem/ChatModal';

const DashboardHeader = ({user, employees}) => {
  const [showChatModal, setShowChatModal] = useState(false);

  
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

return ( 
    <header className="bg-white shadow">
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <img src={mainLogo} class='App-logo' alt='FlowDesk Logo' />
        <div className="flex items-center gap-4">
        <div className="text-right">
            <p className="text-sm text-gray-500">Welcome,</p>
            <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
        </div>
        <NotificationCenter
            userId={user?.id}
            navigateToConversation={(conversationId) => {
            setShowChatModal(true);
            // We'll need to pass this to the ChatModal
            }}
        />
        <button
            onClick={() => setShowChatModal(true)}
            
        >
            <img src={messages_icon} alt="Sign Out Icon" width="25px" className="mr-1" />
            <NotificationBadge userId={user?.id} type="messages" />
        </button>
        <button
            onClick={handleSignOut}
        >
            <img src={sign_out_icon} alt="Sign Out Icon" width="23px" className="" />
            
        </button>

        </div>
    </div>
    {showChatModal && (
            <ChatModal
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            userId={user?.id}
            employees={employees}
            />
        )}
    </header>
)
}

export default DashboardHeader;