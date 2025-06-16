'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDaysIcon,
  TicketIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo'; // Ticket Sales Trends
import ChartThree from '@/components/ChartThree'; // Attendee Growth Trends

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface EventDashboardData {
  metrics: {
    upcomingEvents: number;
    ticketsSold: number;
    revenue: number;
    attendees: number;
  };
  tasks: Task[];
}

const sampleData: EventDashboardData = {
  metrics: {
    upcomingEvents: 7,
    ticketsSold: 1250,
    revenue: 87500,
    attendees: 980,
  },
  tasks: [
    { id: '1', name: 'Send email blast for Concert Night', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: '2', name: 'Confirm venue booking: Tech Summit', dueDate: '2025-06-18', dueTime: '1:00 PM' },
    { id: '3', name: 'Print VIP badges', dueDate: '2025-06-19', dueTime: '9:30 AM' },
  ],
};

export default function EventDashboardClient() {
  const [data, setData] = useState<EventDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { upcomingEvents, ticketsSold, revenue, attendees } = data.metrics;

  const cards = [
    {
      title: 'Upcoming Events',
      value: upcomingEvents,
      icon: CalendarDaysIcon,
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/events',
    },
    {
      title: 'Tickets Sold',
      value: ticketsSold,
      icon: TicketIcon,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/tickets',
    },
    {
      title: 'Revenue',
      value: `$${revenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 text-green-700',
      link: '/admin/revenue',
    },
    {
      title: 'Attendees',
      value: attendees,
      icon: UserGroupIcon,
      color: 'bg-indigo-100 text-indigo-700',
      link: '/admin/attendees',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Event & Ticketing Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="group p-5 rounded-2xl shadow border border-gray-200 hover:shadow-md transition bg-white hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-full p-2 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-gray-500">{card.title}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Sales Trends</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendee Growth</h2>
          <ChartThree />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Staff & Event Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
                {task.name}
              </div>
              <span className="text-sm text-gray-500">{task.dueDate} @ {task.dueTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// Optional Enhancements
// Live ticket counter (WebSocket)

// Event QR check-in scanner integration

// Event performance leaderboard

// Event feedback & ratings dashboard

// Would you like to:

// Add a calendar view of events?

// Integrate seat maps or ticket types (VIP, Early Bird)?

// Enable email or SMS notifications for reminders?