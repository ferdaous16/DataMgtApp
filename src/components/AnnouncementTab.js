import React, { useState } from 'react';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';

const AnnouncementTab = ({ userRole }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const canPost = userRole === 'HR Manager' || userRole === 'Project Manager';
  
  const handleAnnouncementPosted = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {canPost && (
          <div className="lg:col-span-1 p-6 border-r">
            <h2 className="text-xl font-semibold mb-4">Post New Announcement</h2>
            <AnnouncementForm onSuccess={handleAnnouncementPosted} />
          </div>
        )}
        
        <div className={canPost ? "lg:col-span-2 p-6" : "p-6"}>
          <h2 className="text-xl font-semibold mb-4">Company Announcements</h2>
          <AnnouncementList 
            key={refreshKey}
            userRole={userRole} 
          />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTab;