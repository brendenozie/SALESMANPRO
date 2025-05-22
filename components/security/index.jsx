import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LockClosedIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  BookmarkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";


const tabs = [
  { id: 'loginHistory', label: 'Login History', icon: <DevicePhoneMobileIcon className='h-6 w-6' /> },
  { id: 'activeSessions', label: 'Active Sessions', icon: <LockClosedIcon className='h-6 w-6' /> },
  { id: 'passwordStrength', label: 'Password Strength', icon: <ShieldCheckIcon className='h-6 w-6' /> },
  { id: 'securityQuestions', label: 'Security Questions', icon: <QuestionMarkCircleIcon className='h-6 w-6' /> },
];

const SecurityOverview = () => {
  const [activeTab, setActiveTab] = useState('loginHistory');
  const [password, setPassword] = useState('');

  const calculatePasswordStrength = (password) => {
    if (password.length > 12) return 'Strong';
    if (password.length > 8) return 'Moderate';
    return 'Weak';
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto shadow-lg rounded-2xl bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-4">🔐 Security Overview</h2>

      {/* Tabs List */}
      <div className="grid grid-cols-4 gap-2 mb-4 border-b dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 p-2 text-sm font-medium border-b-2 transition-colors duration-300 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {activeTab === 'loginHistory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">No login history available.</p>
          </motion.div>
        )}

        {activeTab === 'activeSessions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">No active sessions found.</p>
            <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md">Logout from all devices</button>
          </motion.div>
        )}

        {activeTab === 'passwordStrength' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to check strength"
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
            <p className="mt-2 text-sm font-medium">
              Strength: {password ? calculatePasswordStrength(password) : 'N/A'}
            </p>
          </motion.div>
        )}

        {activeTab === 'securityQuestions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-600 dark:text-gray-300">No security questions set.</p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Add Security Questions</button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SecurityOverview;
