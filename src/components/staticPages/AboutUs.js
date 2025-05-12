import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Our Flow Desk (Data Mgn App) is designed to streamline and simplify HR operations for modern businesses. 
              We believe that managing human resources should be intuitive, efficient, and empowering for both employees and administrators.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              To provide organizations with a comprehensive, user-friendly platform that transforms how they manage their most valuable asset - their people.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Core Values</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Simplicity: Making complex HR processes simple and accessible</li>
              <li>Innovation: Continuously improving with the latest technology</li>
              <li>Security: Protecting sensitive employee data with robust security measures</li>
              <li>Support: Providing exceptional customer service and support</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Team</h2>
            <p className="text-gray-600">
              We are a dedicated team of software engineers, and designers passionate about creating 
              the best HR management experience possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;