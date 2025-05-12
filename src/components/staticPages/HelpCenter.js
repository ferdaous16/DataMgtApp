import React from 'react';

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Click on the 'Forgot Password' link on the login page and follow the instructions sent to your email."
    },
    {
      question: "How do I request leave?",
      answer: "Navigate to the Leave Management section in your dashboard and fill out the leave request form."
    },
    {
      question: "Who can see my documents?",
      answer: "Documents are visible based on role permissions. Your HR manager and direct supervisor typically have access."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your profile settings in the dashboard and click 'Edit Profile' to update your information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Help Center</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Still Need Help?</h3>
            <p className="text-gray-600">Contact our support team at support@inf.elte.hu or call +36 (1) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;