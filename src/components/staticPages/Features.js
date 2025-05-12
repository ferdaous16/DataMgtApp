import React from 'react';

const Features = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Features</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Employee Management</h3>
            <p className="text-gray-600">Efficiently manage employee profiles, roles, and permissions in one centralized system.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Task Assignment</h3>
            <p className="text-gray-600">Assign and track tasks across teams with real-time updates and progress monitoring.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Leave Management</h3>
            <p className="text-gray-600">Streamline leave requests and approvals with automated workflow and balance tracking.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Announcements</h3>
            <p className="text-gray-600">Keep everyone informed with company-wide announcements and notifications.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Document Management</h3>
            <p className="text-gray-600">Store and share important documents securely with role-based access control.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
            <p className="text-gray-600">Communicate instantly with team members through integrated messaging system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;