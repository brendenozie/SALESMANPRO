'use client';

import React from 'react';
import { ChartBarIcon, UsersIcon, CalendarDaysIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

const principalStats = [
  {
    title: 'Total Students',
    icon: <UsersIcon className="h-6 w-6 text-blue-600" />,
    value: '1,245',
    description: 'Enrolled across all grades',
    color: 'bg-blue-100',
  },
  {
    title: 'Teachers',
    icon: <HeartIcon className="h-6 w-6 text-green-600" />,
    value: '86',
    description: 'Full-time and part-time',
    color: 'bg-green-100',
  },
  {
    title: 'Upcoming Events',
    icon: <CalendarDaysIcon className="h-6 w-6 text-purple-600" />,
    value: '3',
    description: 'School calendar this week',
    color: 'bg-purple-100',
  },
  {
    title: 'Pending Tasks',
    icon: <ClockIcon className="h-6 w-6 text-yellow-600" />,
    value: '12',
    description: 'Administrative tasks to review',
    color: 'bg-yellow-100',
  },
];

export default function PrincipalDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Principal's Dashboard</h1>
        <span className="text-gray-500">Monday, June 16</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {principalStats.map((stat, index) => (
          <div
            key={index}
            className={`p-5 rounded-xl shadow-lg ${stat.color} flex items-center gap-4`}
          >
            <div className="p-3 bg-white rounded-full shadow">{stat.icon}</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{stat.value}</h2>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
          <ChartTwo />
        </div>
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold mb-4">Attendance Insights</h3>
          <ChartThree />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white rounded-2xl shadow">
        <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            'Teacher Reports',
            'Student Discipline',
            'Exam Timetables',
            'Announcements'
          ].map((action, idx) => (
            <button
              key={idx}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-4 text-sm shadow"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


// Header with today's date.

// Quick Stats on students, teachers, events, and tasks.

// Performance and Attendance Charts using existing <ChartTwo /> and <ChartThree /> components.

// Quick Actions like “Teacher Reports” and “Exam Timetables.”

// Let me know if you want to add recent announcements, messages from staff, or a live calendar view.