import React from 'react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Documentation</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="text-gray-600 mb-4">Welcome to the Flow Desk app documentation. This guide will help you understand how to use all features of the system.</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Creating your account</li>
                <li>Setting up your profile</li>
                <li>Understanding user roles</li>
                <li>Navigating the dashboard</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Employee Guide</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Viewing and managing tasks</li>
                <li>Requesting leave</li>
                <li>Accessing documents</li>
                <li>Using the chat system</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Manager Guide</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Creating and assigning tasks</li>
                <li>Managing projects</li>
                <li>Approving leave requests</li>
                <li>Posting announcements</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">HR Administrator Guide</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Managing employee profiles</li>
                <li>Setting up leave policies</li>
                <li>Document management</li>
                <li>System configuration</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;