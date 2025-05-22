import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  WifiIcon,
  PhoneIcon,
  LifebuoyIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  { id: 'inbox', label: 'Messages/Inbox', icon: <EnvelopeIcon className='h-6 w-6' /> },
  { id: 'supportTickets', label: 'Support Tickets', icon: <LifebuoyIcon className='h-6 w-6' /> },
  { id: 'contactSupport', label: 'Contact Support', icon: <PhoneIcon className='h-6 w-6' /> },
  { id: 'faqs', label: 'FAQs/Help Center', icon: <WifiIcon className='h-6 w-6' /> },
];

const CommunicationSupport = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-lg rounded-2xl bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-4">💬 Communication & Support</h2>

      {/* Tabs List */}
      <div className="grid grid-cols-4 gap-2 mb-4 border-b dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 p-2 text-sm font-medium border-b-2 transition-colors duration-300 ${
              activeTab === tab.id
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {activeTab === 'inbox' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">No new messages in your inbox.</p>
          </motion.div>
        )}

        {activeTab === 'supportTickets' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">You have no active support tickets.</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Create New Ticket</button>
          </motion.div>
        )}

        {activeTab === 'contactSupport' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">Need help? Contact our support team.</p>
            <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md">Call Support</button>
          </motion.div>
        )}

        {activeTab === 'faqs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">Visit our Help Center for FAQs and guides.</p>
            <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md">Go to Help Center</button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunicationSupport;
