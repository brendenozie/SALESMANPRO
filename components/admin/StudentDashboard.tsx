'use client';

import React from 'react';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  BookOpenIcon,
  LinkIcon,
  ClockIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

// --- Updated Type Definitions to match API response ---

export type StudentStat = {
  title: string;
  value: string;
  description: string;
  color: string;
};

export type DashboardAssignment = {
  id: string;
  title: string;
  class: string;
  dueDate: string;
  status: string;
};

export type DashboardCourse = {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  currentGrade: string;
};

export type DashboardGrade = {
  id: string;
  assignment: string;
  subject: string;
  grade: string;
  date: string;
};

export type DashboardTimetable = {
  time: string;
  event: string;
  location: string;
};

export type DashboardAnnouncement = {
  id: string;
  text: string;
  type: 'info' | 'warning';
};

export interface StudentDashboardData {
  studentName: string;
  studentGradeLevel: string;
  studentStats: StudentStat[];
  upcomingAssignments: DashboardAssignment[];
  myCourses: DashboardCourse[];
  recentGrades: DashboardGrade[];
  personalTimetable: DashboardTimetable[];
  studentAnnouncements: DashboardAnnouncement[];
}

interface StudentDashboardProps extends StudentDashboardData {
  companyId: string;
  currentUserId: string;
}

const quickLinks = [
  { label: 'Homework Portal', icon: <ClipboardDocumentListIcon className="h-6 w-6" />, href: '#' },
  { label: 'Library Resources', icon: <BookOpenIcon className="h-6 w-6" />, href: '#' },
  { label: 'Student Handbook', icon: <LinkIcon className="h-6 w-6" />, href: '#' },
];

export default function StudentDashboard({
  studentName,
  studentGradeLevel,
  studentStats,
  upcomingAssignments,
  myCourses,
  recentGrades,
  personalTimetable,
  studentAnnouncements,
  companyId,
  currentUserId,
}: StudentDashboardProps) {
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Helper to map icons to stat titles since icons aren't sent via JSON
  const getStatIcon = (title: string) => {
    switch (title) {
      case 'Current GPA': return <AcademicCapIcon className="h-7 w-7 text-blue-600" />;
      case 'Assignments Due': return <ClipboardDocumentListIcon className="h-7 w-7 text-purple-600" />;
      case 'Classes Today': return <BookOpenIcon className="h-7 w-7 text-yellow-600" />;
      default: return <ChartBarIcon className="h-7 w-7 text-green-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Hello, {studentName}!
            <span className="ml-2 text-blue-600 text-base sm:text-xl">🌟</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">{studentGradeLevel}</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dynamic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentStats?.map((stat, index) => (
              <div key={index} className={`p-5 rounded-xl shadow-md border border-gray-200 ${stat.color}`}>
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white rounded-full shadow-sm mr-3 flex-shrink-0">
                    {getStatIcon(stat.title)}
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

          {/* Upcoming Assignments Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> Upcoming Assignments
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingAssignments?.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {assignment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Courses List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-teal-500" /> My Courses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myCourses?.map((course) => (
                <div key={course.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{course.name}</p>
                    <p className="text-xs text-gray-600">Teacher: {course.teacher}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">{course.currentGrade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Timetable */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-red-500" /> Today's Timetable
            </h3>
            <ul className="space-y-3">
              {personalTimetable?.map((slot, idx) => (
                <li key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 text-sm">{slot.time}</span>
                    <span className="text-gray-700 text-xs">{slot.event}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase">{slot.location}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Announcements
            </h3>
            <ul className="space-y-3 text-sm">
              {studentAnnouncements?.map((note) => (
                <li key={note.id} className={`p-3 rounded-lg border-l-4 ${note.type === 'warning' ? 'bg-yellow-50 border-yellow-400' : 'bg-blue-50 border-blue-400'}`}>
                  {note.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}