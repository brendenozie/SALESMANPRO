'use client';

import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  StarIcon,
  RocketLaunchIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon as ClockSolidIcon,
} from '@heroicons/react/24/outline';

import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import SchoolCalendar from '@/components/SchoolCalendar';

const principalStats = [
  {
    title: 'Total Students',
    icon: <UsersIcon className="h-7 w-7 text-blue-600" />,
    value: '1,245',
    description: 'Enrolled across all grades',
    color: 'bg-blue-50',
    ringColor: 'focus:ring-blue-500',
  },
  {
    title: 'Total Teachers',
    icon: <HeartIcon className="h-7 w-7 text-green-600" />,
    value: '86',
    description: 'Full-time and part-time staff',
    color: 'bg-green-50',
    ringColor: 'focus:ring-green-500',
  },
  {
    title: 'Upcoming Events',
    icon: <CalendarDaysIcon className="h-7 w-7 text-purple-600" />,
    value: '3',
    description: 'Key events this week',
    color: 'bg-purple-50',
    ringColor: 'focus:ring-purple-500',
  },
  {
    title: 'Pending Approvals',
    icon: <ClockSolidIcon className="h-7 w-7 text-yellow-600" />,
    value: '12',
    description: 'Administrative actions required',
    color: 'bg-yellow-50',
    ringColor: 'focus:ring-yellow-500',
  },
];

const quickActions = [
  { label: 'Teacher Reports', icon: <BookOpenIcon className="h-6 w-6" />, href: '#' },
  { label: 'Student Discipline', icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />, href: '#' },
  { label: 'Exam Timetables', icon: <CalendarDaysIcon className="h-6 w-6" />, href: '#' },
  { label: 'School Announcements', icon: <MegaphoneIcon className="h-6 w-6" />, href: '#' },
];

const announcements = [
  { id: 1, text: '📢 Midterm exams begin next Monday.', type: 'info' },
  { id: 2, text: '🧪 Science fair projects due Friday. Submit early!', type: 'warning' },
  { id: 3, text: '📌 New cafeteria schedule published. Check details.', type: 'info' },
];

const staffMessages = [
  { id: 1, name: 'Mrs. Owino', message: 'Submitted report on 10A performance.', time: '10:30 AM' },
  { id: 2, name: 'Mr. Kiptoo', message: 'Requesting projector for staff meeting.', time: 'Yesterday' },
  { id: 3, name: 'Ms. Cherono', message: 'New student registration complete.', time: '2 hours ago' },
];

export default function PrincipalDashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Principal's Dashboard
            <span className="ml-2 text-blue-600 text-base sm:text-xl">🎓</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Key insights and quick access for school administration.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principalStats.map((stat, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-200 ease-in-out
                            hover:shadow-lg transform hover:-translate-y-1 cursor-pointer
                            ${stat.color} ${stat.ringColor}`}
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white rounded-full shadow-sm mr-3 flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-red-500" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <a
                    key={idx}
                    href={action.href}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-gray-700
                              hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200
                              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    <div className="text-blue-500 mb-2">{action.icon}</div>
                    <span className="text-center text-sm font-medium">{action.label}</span>
                  </a>
                ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-indigo-500" /> Performance Overview
                </h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                  View Full Report &rarr;
                </button>
              </div>
              <div className="flex-grow min-h-[200px]">
                <ChartTwo />
              </div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-teal-500" /> Attendance Insights
                </h3>
                <button className="text-sm text-teal-600 hover:text-teal-800 font-medium transition">
                  Detailed View &rarr;
                </button>
              </div>
              <div className="flex-grow min-h-[200px]">
                <ChartThree />
              </div>
            </div>
          </div>
          
        </div>

        <div className="lg:col-span-1 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center hover:shadow-lg transition">
              <StarIcon className="h-8 w-8 text-yellow-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Student of the Week</h4>
              <p className="text-sm text-gray-600">Jane Wanjiru - Grade 8</p>
            </div>
            <div className="p-5 bg-white rounded-xl shadow-md border border-gray-200 text-center flex flex-col items-center justify-center hover:shadow-lg transition">
              <StarIcon className="h-8 w-8 text-green-500 mb-2" />
              <h4 className="font-semibold text-gray-800">Teacher of the Week</h4>
              <p className="text-sm text-gray-600">Mr. Otieno - Science Dept.</p>
            </div>
          </div>

          {/* <SchoolCalendar role="principal" userId="admin" /> */}
          
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Latest Announcements
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {announcements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg
                                  ${note.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                  <span className="mt-0.5">{note.type === 'warning' ? '⚠️' : '📢'}</span>
                  <span>{note.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-lime-600" /> Recent Staff Messages
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {staffMessages.map((msg) => (
                <li key={msg.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-800">{msg.name}</span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{msg.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
