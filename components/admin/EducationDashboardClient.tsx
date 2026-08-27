'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AcademicCapIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';

interface Task {
  id: string;
  name: string;
  dueDate: string;
  dueTime: string;
}

interface EduDashboardData {
  metrics: {
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    revenueThisMonth: number;
  };
  tasks: Task[];
}

const sampleData: EduDashboardData = {
  metrics: {
    totalCourses: 87,
    totalStudents: 1350,
    totalInstructors: 24,
    revenueThisMonth: 45720,
  },
  tasks: [
    { id: '1', name: 'Review course: React for Beginners', dueDate: '2025-06-18', dueTime: '10:00 AM' },
    { id: '2', name: 'Approve new instructor: Sarah Kim', dueDate: '2025-06-18', dueTime: '1:00 PM' },
    { id: '3', name: 'Resolve student issue: ID #2291', dueDate: '2025-06-19', dueTime: '3:30 PM' },
  ],
};

export default function EducationDashboardClient() {
  const [data, setData] = useState<EduDashboardData>(sampleData);

  useEffect(() => {
    setData(sampleData);
  }, []);

  const { totalCourses, totalStudents, totalInstructors, revenueThisMonth } = data.metrics;

  const cards = [
    {
      title: 'Courses',
      value: totalCourses,
      icon: AcademicCapIcon,
      color: 'bg-purple-100 text-purple-700',
      link: '/admin/courses',
    },
    {
      title: 'Students',
      value: totalStudents,
      icon: UsersIcon,
      color: 'bg-blue-100 text-blue-700',
      link: '/admin/students',
    },
    {
      title: 'Instructors',
      value: totalInstructors,
      icon: UserGroupIcon,
      color: 'bg-green-100 text-green-700',
      link: '/admin/instructors',
    },
    {
      title: 'Revenue',
      value: `$${revenueThisMonth.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-100 text-yellow-700',
      link: '/admin/revenue',
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Education Admin Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="group p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition bg-white hover:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-full p-2 ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-700">{card.title}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Enrollments</h2>
          <ChartTwo />
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Courses</h2>
          <ChartThree />
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Tasks</h2>
          <Link href="/admin/tasks" className="text-sm text-indigo-600 hover:underline">View All</Link>
        </div>
        <ul className="space-y-3">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-600" />
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
