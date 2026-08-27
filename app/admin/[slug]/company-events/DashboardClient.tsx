// app/admin/[adminSlug]/DashboardClient.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  CalendarIcon,
  TicketIcon,
  BanknotesIcon,
  BellAlertIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Mock data for demonstration
const mockDashboardData = {
  totalEvents: 125,
  upcomingEvents: 15,
  totalTicketsSold: 8765,
  totalRevenue: 123456.78,
  recentActivities: [
    { id: 1, type: 'Ticket Sale', description: 'New ticket sold for "Summer Music Fest"', time: '2 mins ago' },
    { id: 2, type: 'Event Update', description: '"Tech Conference 2025" details updated', time: '1 hour ago' },
    { id: 3, type: 'Attendee Check-in', description: 'John Doe checked in for "Art Exhibition"', time: '3 hours ago' },
  ],
  upcomingEventsList: [
    { id: 'evt1', name: 'Annual Tech Summit', date: 'Jul 25, 2025', ticketsSold: 520 },
    { id: 'evt2', name: 'Community Art Fair', date: 'Aug 10, 2025', ticketsSold: 180 },
    { id: 'evt3', name: 'Startup Pitch Night', date: 'Sep 01, 2025', ticketsSold: 95 },
  ],
};

interface DashboardClientProps {
  adminSlug: string;
  companyId: string;
}

export default function DashboardClient({ adminSlug }: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Dashboard</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Welcome back, Organizer! Here's a quick overview of your event performance.
        </motion.p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Events</p>
              <h2 className="text-3xl font-bold text-white">{mockDashboardData.totalEvents}</h2>
            </div>
            <CalendarIcon className="w-12 h-12 text-indigo-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Upcoming Events</p>
              <h2 className="text-3xl font-bold text-white">{mockDashboardData.upcomingEvents}</h2>
            </div>
            <HomeIcon className="w-12 h-12 text-purple-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Tickets Sold</p>
              <h2 className="text-3xl font-bold text-white">{mockDashboardData.totalTicketsSold.toLocaleString()}</h2>
            </div>
            <TicketIcon className="w-12 h-12 text-pink-400 opacity-70" />
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }} className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <h2 className="text-3xl font-bold text-white">${mockDashboardData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <BanknotesIcon className="w-12 h-12 text-green-400 opacity-70" />
          </motion.div>
        </div>

        {/* Recent Activities & Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Activities</h3>
            <ul className="space-y-4">
              {mockDashboardData.recentActivities.map(activity => (
                <li key={activity.id} className="flex items-start gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <BellAlertIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-medium">{activity.type}: <span className="text-gray-300">{activity.description}</span></p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }} className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Upcoming Events</h3>
            <ul className="space-y-4">
              {mockDashboardData.upcomingEventsList.map(event => (
                <li key={event.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <div>
                    <p className="text-white font-medium">{event.name}</p>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-lg font-semibold">{event.ticketsSold} <span className="text-sm text-gray-400">sold</span></p>
                    <a href={`/admin/${adminSlug}/events/${event.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center mt-1">
                      View Event <ArrowRightIcon className="ml-1 w-4 h-4" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}