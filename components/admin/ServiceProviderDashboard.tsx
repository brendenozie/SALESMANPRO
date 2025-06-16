'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon, CalendarDaysIcon, UsersIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

export default function ServiceProviderDashboard() {
  const stats = [
    {
      title: 'New Bookings',
      value: 24,
      icon: <CalendarDaysIcon className="w-8 h-8 text-blue-600" />,
      href: '/appointments',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Clients',
      value: 112,
      icon: <UsersIcon className="w-8 h-8 text-green-600" />,
      href: '/clients',
      bg: 'bg-green-50',
    },
    {
      title: 'Feedback Received',
      value: 56,
      icon: <HeartIcon className="w-8 h-8 text-pink-600" />,
      href: '/feedback',
      bg: 'bg-pink-50',
    },
    {
      title: 'Hours Worked',
      value: 143,
      icon: <ClockIcon className="w-8 h-8 text-yellow-600" />,
      href: '/timesheet',
      bg: 'bg-yellow-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500">Here's your service overview</p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Manage Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`p-6 rounded-xl shadow-md hover:shadow-xl transition-all ${item.bg}`}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white rounded-full shadow">{item.icon}</div>
              <div>
                <h4 className="text-sm text-gray-500">{item.title}</h4>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Service Trends</h3>
          <ChartTwo />
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Client Engagement</h3>
          <ChartThree />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/appointments/new" className="bg-indigo-600 text-white rounded-lg py-3 text-center font-medium hover:bg-indigo-700">New Booking</Link>
          <Link href="/clients" className="bg-green-600 text-white rounded-lg py-3 text-center font-medium hover:bg-green-700">View Clients</Link>
          <Link href="/feedback" className="bg-pink-600 text-white rounded-lg py-3 text-center font-medium hover:bg-pink-700">Feedback</Link>
          <Link href="/settings" className="bg-gray-600 text-white rounded-lg py-3 text-center font-medium hover:bg-gray-700">Settings</Link>
        </div>
      </div>
    </div>
  );
}


// A header with profile management

// Stats cards for bookings, clients, feedback, and hours worked

// Two charts (ChartTwo and ChartThree)

// A quick actions section

// Let me know if you want to:

// Add task tracking

// Show upcoming appointments

// Include earnings summary

// Make it responsive for mobile optimization