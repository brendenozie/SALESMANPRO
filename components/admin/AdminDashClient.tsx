'use client';

import React from 'react';
import { ChartBarIcon, UserIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

export default function UncategorizedDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 space-y-8">
      {/* Welcome Message */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome to Your Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          No specific category has been selected. Here are some general stats and tips to get started.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <UserIcon className="w-6 h-6 text-white" />, title: 'Users', value: '0', bg: 'bg-blue-500',
          },
          {
            icon: <ChartBarIcon className="w-6 h-6 text-white" />, title: 'Analytics', value: '0%', bg: 'bg-green-500',
          },
          {
            icon: <QuestionMarkCircleIcon className="w-6 h-6 text-white" />, title: 'Help Tickets', value: '0', bg: 'bg-yellow-500',
          },
          {
            icon: <ChartBarIcon className="w-6 h-6 text-white" />, title: 'Progress', value: '0%', bg: 'bg-purple-500',
          },
        ].map((item, i) => (
          <div key={i} className={`p-6 rounded-2xl shadow-lg text-white ${item.bg} flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.title}</span>
              <div className="p-2 rounded-full bg-white bg-opacity-20">{item.icon}</div>
            </div>
            <h2 className="text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Activity Overview</h3>
          <ChartTwo />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Engagement Trends</h3>
          <ChartThree />
        </div>
      </div>

      {/* Setup Guide */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-6">
        <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Get Started</h4>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Choose a category to personalize your dashboard.</li>
          <li>Customize your settings under the Profile section.</li>
          <li>Track analytics, tasks, and updates once set up.</li>
          <li>Contact support if you need help navigating.</li>
        </ul>
      </div>
    </div>
  );
}