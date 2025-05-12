import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By using our HRMS platform, you agree to be bound by these Terms of Service and all 
              applicable laws and regulations.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
            <p className="text-gray-600 mb-6">
              You may use our service only for lawful purposes and in accordance with these Terms. 
              You agree not to use the service:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>In any way that violates any applicable federal, state, local, or international law</li>
              <li>To transmit any unauthorized advertising or promotional material</li>
              <li>To impersonate any person or entity</li>
              <li>In any way that infringes upon the rights of others</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Responsibilities</h2>
            <p className="text-gray-600 mb-6">
              You are responsible for maintaining the confidentiality of your account credentials 
              and for all activities that occur under your account.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Termination</h2>
            <p className="text-gray-600 mb-6">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms, please contact us at legal@hrms.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;