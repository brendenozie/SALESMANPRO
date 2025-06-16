'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, CalendarDaysIcon, UsersIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

export default function BookingAppointmentsDashboard() {
  const stats = [
    {
      title: 'Upcoming Bookings',
      value: 12,
      icon: <CalendarDaysIcon className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-100',
    },
    {
      title: 'Total Clients',
      value: 87,
      icon: <UsersIcon className="w-8 h-8 text-green-500" />,
      color: 'bg-green-100',
    },
    {
      title: 'Completed Sessions',
      value: 540,
      icon: <ChartBarIcon className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-100',
    },
    {
      title: 'Hours Booked This Week',
      value: 34,
      icon: <ClockIcon className="w-8 h-8 text-orange-500" />,
      color: 'bg-orange-100',
    },
  ];

  const upcoming = [
    {
      name: 'Sarah Wambui',
      time: '10:00 AM',
      date: 'June 18, 2025',
      type: 'Consultation',
    },
    {
      name: 'James Odhiambo',
      time: '11:30 AM',
      date: 'June 18, 2025',
      type: 'Follow-up',
    },
    {
      name: 'Linda Njeri',
      time: '2:00 PM',
      date: 'June 18, 2025',
      type: 'New Appointment',
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Bookings & Appointments Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl shadow-md p-6 flex items-center gap-4 ${stat.color}`}
          >
            <div className="bg-white p-3 rounded-full shadow">{stat.icon}</div>
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Bookings Overview</h2>
          <ChartTwo />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Appointments Summary</h2>
          <ChartThree />
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
          <Link href="/appointments" className="text-sm text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <ul className="space-y-4">
          {upcoming.map((app, index) => (
            <li
              key={index}
              className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
            >
              <div>
                <h3 className="font-bold text-gray-800">{app.name}</h3>
                <p className="text-sm text-gray-500">{app.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{app.date}</p>
                <p className="text-lg font-semibold text-gray-800">{app.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
