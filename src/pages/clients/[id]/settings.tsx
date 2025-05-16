import UserNav from '@/components/AdminNav';
import ClientLayout from '@/components/ClientLayout';
import React, { useState } from 'react';

const messages = [
  { id: 1, sender: 'John Doe', subject: 'Order Inquiry', date: '2025-01-20', content: 'Can you provide more details about my recent order?' },
  { id: 2, sender: 'Jane Smith', subject: 'Product Feedback', date: '2025-01-19', content: 'I absolutely love the product I purchased!' },
  { id: 3, sender: 'Alice Johnson', subject: 'Request for Return', date: '2025-01-18', content: 'I need to return an item I ordered by mistake.' },
  { id: 4, sender: 'Bob Brown', subject: 'Shipping Update', date: '2025-01-17', content: 'Has my package been shipped yet?' },
];

const ProductsPage = () => {
  
   const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    language: 'English',
  });

  const handleToggle = (key: string | number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key as keyof typeof settings]: !prevSettings[key as keyof typeof settings],
    }));
  };

  const handleLanguageChange = (event: { target: { value: any; }; }) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      language: event.target.value,
    }));
  };
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto">
          <div className="min-h-screen bg-gray-100 py-10">
            <h1 className="text-4xl font-bold text-center mb-10">Settings</h1>
            <div className="container mx-auto px-4">
              <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Enable Notifications</span>
                  <button
                    className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      settings.notifications ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('notifications')}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        settings.notifications ? 'translate-x-4' : ''
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Dark Mode</span>
                  <button
                    className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                      settings.darkMode ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    onClick={() => handleToggle('darkMode')}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        settings.darkMode ? 'translate-x-4' : ''
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex flex-col">
                  <label className="text-lg font-medium mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={handleLanguageChange}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductsPage;
