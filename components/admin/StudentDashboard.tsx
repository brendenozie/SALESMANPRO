'use client';

import React from 'react';
import { CalendarDaysIcon, UsersIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

const studentStats = [
  {
    title: "Classes Today",
    icon: <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />,
    value: "3",
    subtitle: "Upcoming today"
  },
  {
    title: "Total Subjects",
    icon: <ChartBarIcon className="w-6 h-6 text-blue-600" />,
    value: "7",
    subtitle: "This term"
  },
  {
    title: "Study Hours",
    icon: <ClockIcon className="w-6 h-6 text-green-600" />,
    value: "16h",
    subtitle: "This week"
  },
  {
    title: "Peers",
    icon: <UsersIcon className="w-6 h-6 text-orange-600" />,
    value: "24",
    subtitle: "In your class"
  },
];

const upcomingClasses = [
  { subject: "Mathematics", time: "09:00 AM", teacher: "Mr. Otieno", room: "B3" },
  { subject: "Science", time: "11:00 AM", teacher: "Ms. Achieng", room: "Lab 1" },
  { subject: "History", time: "2:00 PM", teacher: "Mr. Mwangi", room: "C2" },
];

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {studentStats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow hover:shadow-md transition-all">
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-full">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">Attendance Over Time</h3>
          <ChartTwo />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">Subject Performance</h3>
          <ChartThree />
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Today's Classes</h3>
        <div className="space-y-4">
          {upcomingClasses.map((cls, i) => (
            <div
              key={i}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-all flex justify-between items-center"
            >
              <div>
                <h4 className="text-md font-bold text-indigo-800">{cls.subject}</h4>
                <p className="text-sm text-indigo-600">{cls.teacher} · {cls.room}</p>
              </div>
              <div className="text-sm font-medium text-indigo-700">{cls.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// Quick stats (classes, subjects, hours, peers)

// Charts for attendance and subject performance

// Today's classes list with teacher and room info

// Let me know if you want to add homework tracking, a calendar, grades, or messaging!