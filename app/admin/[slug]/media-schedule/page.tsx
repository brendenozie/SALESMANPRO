// app/admin/[adminSlug]/schedule/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { CalendarDaysIcon, FilmIcon, NewspaperIcon } from '@heroicons/react/24/solid';

const upcomingSchedule = [
  { id: 1, type: "Article", title: "The Rise of Interactive Media", date: "2025-07-20", status: "Scheduled", icon: NewspaperIcon },
  { id: 2, type: "Video", title: "Gaming Culture: A Deep Dive", date: "2025-07-22", status: "Scheduled", icon: FilmIcon },
  { id: 3, type: "Article", title: "Future of Space Tourism", date: "2025-07-25", status: "Draft", icon: NewspaperIcon },
  { id: 4, type: "Video", title: "Exclusive Interview: Indie Game Dev", date: "2025-07-28", status: "Scheduled", icon: FilmIcon },
  { id: 5, type: "Article", title: "Healthy Living in the Digital Age", date: "2025-08-01", status: "Scheduled", icon: NewspaperIcon },
];

export default function PublishingSchedulePage() {
  return (
    <div>
      <p className="text-gray-300 text-lg mb-8">
        Plan and manage the release dates for all your articles and videos.
      </p>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Upcoming Content</h2>
        <ul className="space-y-4">
          {upcomingSchedule.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                className="flex items-center justify-between bg-gray-900 p-4 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <div className="flex items-center space-x-4">
                  <Icon className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <span className="text-gray-400 text-sm">{item.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-md flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" /> {item.date}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}