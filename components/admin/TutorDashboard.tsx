'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import {
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const TutorDashboard = () => {
  const stats = [
    {
      title: 'Upcoming Classes',
      value: 5,
      icon: <CalendarDaysIcon className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Total Students',
      value: 124,
      icon: <UsersIcon className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Hours Taught',
      value: 310,
      icon: <ClockIcon className="w-6 h-6 text-orange-600" />,
    },
    {
      title: 'Feedback Score',
      value: '4.8/5',
      icon: <HeartIcon className="w-6 h-6 text-red-500" />,
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      title: 'Introduction to Physics',
      date: 'Mon, Jun 17',
      time: '10:00 AM - 11:30 AM',
      students: 18,
    },
    {
      id: 2,
      title: 'Advanced Calculus',
      date: 'Tue, Jun 18',
      time: '2:00 PM - 3:30 PM',
      students: 22,
    },
    {
      id: 3,
      title: 'Chemistry Lab',
      date: 'Wed, Jun 19',
      time: '1:00 PM - 3:00 PM',
      students: 15,
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Tutor Dashboard</h1>
        <Link
          href="/schedule"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          View Full Schedule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow p-6 flex items-center gap-4 hover:shadow-lg transition"
          >
            <div className="p-3 bg-gray-100 rounded-full">{stat.icon}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-700">{stat.value}</h2>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Class Attendance Trend</h2>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Student Performance Overview</h2>
          <ChartThree />
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Classes</h2>
        <div className="space-y-4">
          {upcomingClasses.map((cls) => (
            <div
              key={cls.id}
              className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-blue-900">{cls.title}</h3>
                <p className="text-sm text-blue-800">
                  {cls.date} | {cls.time} | {cls.students} students
                </p>
              </div>
              <Link
                href={`/classes/${cls.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;


// Dashboard using React and TailwindCSS, featuring:

// Stats for Upcoming Classes, Total Students, Hours Taught, and Feedback Score.

// Charts for Class Attendance and Student Performance.

// A list of Upcoming Classes with dates, time, and student count.

// Let me know if you'd like to extend it with features like:

// Student messaging

// Class material uploads

// Assessment and grading overview

// Zoom/Google Meet links integration.