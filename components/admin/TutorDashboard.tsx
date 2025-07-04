'use client';

import React from 'react';
import {
  UsersIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  AcademicCapIcon, // For classes
  PaperAirplaneIcon, // For send message
  MegaphoneIcon, // For announcements
  ChatBubbleBottomCenterTextIcon, // For messages
  PencilSquareIcon, // For grading
  BellAlertIcon, // For overdue
  Bars3BottomLeftIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon, // For assignments overview
} from '@heroicons/react/24/outline'; // Using outline for main icons

// Sample Data for the Teacher Dashboard
const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name
const teacherRole = "Mathematics Teacher, Grade 7 & 8";

const teacherStats = [
  {
    title: 'Total Students',
    icon: <UsersIcon className="h-7 w-7 text-blue-600" />,
    value: '180',
    description: 'Across all your classes',
    color: 'bg-blue-50',
  },
  {
    title: 'Assignments Due',
    icon: <ClipboardDocumentCheckIcon className="h-7 w-7 text-purple-600" />,
    value: '7',
    description: 'To be collected/marked this week',
    color: 'bg-purple-50',
  },
  {
    title: 'Unread Messages',
    icon: <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-green-600" />,
    value: '4',
    description: 'From students & parents',
    color: 'bg-green-50',
  },
  {
    title: 'Upcoming Classes',
    icon: <ClockIcon className="h-7 w-7 text-yellow-600" />,
    value: '3',
    description: 'Scheduled for today',
    color: 'bg-yellow-50',
  },
];

const quickActions = [
  { label: 'Mark Attendance', icon: <UsersIcon className="h-6 w-6" />, href: '#' },
  { label: 'Enter Grades', icon: <PencilSquareIcon className="h-6 w-6" />, href: '#' },
  { label: 'View Class Roster', icon: <BookOpenIcon className="h-6 w-6" />, href: '#' },
  { label: 'Send Message', icon: <PaperAirplaneIcon className="h-6 w-6" />, href: '#' },
  { label: "Create New Assignment", icon: <ClipboardDocumentListIcon className="h-6 w-6" />, href: "#/assignments/new" },
  { label: "View All Students", icon: <UsersIcon className="h-6 w-6" />, href: "#/students/all" },
  { label: "Post Announcement", icon: <MegaphoneIcon className="h-6 w-6" />, href: "#/announcements/new" },
  { label: "My Calendar", icon: <CalendarDaysIcon className="h-6 w-6" />, href: "#/calendar" },
];

const assignments = [
  { id: 1, title: 'Algebra Homework Set 2', class: 'Grade 8 Math', dueDate: 'Today', status: 'Pending Marking', color: 'bg-yellow-500' },
  { id: 2, title: 'Geometry Project Proposal', class: 'Grade 7 Math', dueDate: 'Tomorrow', status: 'Due Soon', color: 'bg-blue-500' },
  { id: 3, title: 'Calculus Quiz 1', class: 'Grade 11 Math', dueDate: 'Yesterday', status: 'Overdue', color: 'bg-red-500' },
  { id: 4, title: 'Statistics Assignment 3', class: 'Grade 9 Math', dueDate: 'July 5', status: 'Assigned', color: 'bg-green-500' },
];

const recentAnnouncements = [
  { id: 1, text: '📢 Parent-Teacher Conference sign-ups are open.', type: 'info' },
  { id: 2, text: '📅 Professional Development session on Friday, 2 PM.', type: 'info' },
  { id: 3, text: '⚠️ Please submit Q2 grades by EOD Tuesday.', type: 'warning' },
];

const studentParentMessages = [
  { id: 1, sender: 'Student: Jane (G7)', message: 'Can you clarify question 5 on the homework?', time: '10:15 AM' },
  { id: 2, sender: 'Parent: Mr. Smith', message: 'Requesting a meeting regarding John\'s progress.', time: 'Yesterday' },
  { id: 3, sender: 'Student: Mark (G8)', message: 'I missed class. What did I miss?', time: '9:00 AM' },
];

const myClasses = [
  { id: 1, name: 'Grade 7 Mathematics', students: 35, schedule: 'Mon, Wed, Fri - 9:00 AM' },
  { id: 2, name: 'Grade 8 Mathematics', students: 30, schedule: 'Tue, Thu - 10:30 AM' },
  { id: 3, name: 'Grade 9 Algebra', students: 28, schedule: 'Mon, Wed - 1:00 PM' },
];

const personalTimetable = [
  { time: '8:00 - 8:45 AM', event: 'Prep Period', location: 'Office' },
  { time: '9:00 - 9:45 AM', event: 'Grade 7 Math', location: 'Room 101' },
  { time: '10:00 - 10:45 AM', event: 'Grade 8 Math', location: 'Room 102' },
  { time: '11:00 - 11:45 AM', event: 'Recess Duty', location: 'Playground' },
  { time: '1:00 - 1:45 PM', event: 'Grade 9 Algebra', location: 'Room 103' },
];


// --- Type Definitions for Props ---
export type PrincipalStat = {
  title: string;
  value: string;
  description: string;
  color: string; // Tailwind bg-color class
};

export type QuickAction = {
  label: string;
  href: string;
};

export type Announcement = {
  id: number;
  text: string;
  type: 'info' | 'warning';
};

export type RecentStaffMessage = {
  id: string;
  name: string;
  message: string;
  time: string;
};

export type PerformanceOverviewData = {
  series: { name: string; data: number[] }[];
  categories: string[];
};

export type AttendanceInsightsData = {
  series: number[];
  labels: string[];
};

export interface PrincipalDashboardData {
  principalStats: PrincipalStat[];
  quickActions: QuickAction[];
  announcements: Announcement[];
  recentStaffMessages: RecentStaffMessage[];
  performanceOverviewData: PerformanceOverviewData;
  attendanceInsightsData: AttendanceInsightsData;
}

export type TutorDashboardData = {
  tutorStats: { title: string; value: string; description: string; color: string }[];
  coursesTaught: { id: string; title: string; totalStudents: number }[];
  recentSubmissions: { studentName: string; assignment: string; status: string; submissionDate: string }[];
  pendingGrading: { id: string; assignment: string; student: string }[];
  // Add other tutor-specific data fields as needed
};

interface PrincipalDashboardProps extends TutorDashboardData {
  companyId: string; // Pass companyId for dynamic links
  currentUserId: string; // Pass currentUserId for dynamic links
}


export default function TeachersClient({
  companyId,
  currentUserId,
}: PrincipalDashboardProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome, {teacherName}
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">{teacherRole}</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Stats, Assignments & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teacherStats.map((stat, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl shadow-md border border-gray-200 transition-all duration-200 ease-in-out
                            hover:shadow-lg transform hover:-translate-y-1 cursor-pointer
                            ${stat.color}`}
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

          {/* Quick Actions */}
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
                             hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                  <div className="text-indigo-500 mb-2">{action.icon}</div>
                  <span className="text-center text-sm font-medium">{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Assignments Overview */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <Bars3BottomLeftIcon className="h-5 w-5 text-indigo-500" /> Assignments Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${assignment.status === 'Pending Marking' && 'bg-yellow-100 text-yellow-800'}
                          ${assignment.status === 'Due Soon' && 'bg-blue-100 text-blue-800'}
                          ${assignment.status === 'Overdue' && 'bg-red-100 text-red-800'}
                          ${assignment.status === 'Assigned' && 'bg-green-100 text-green-800'}
                        `}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Manage</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Announcements, Messages, My Classes & Timetable */}
        <div className="lg:col-span-1 space-y-6">

          {/* Recent Announcements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> Recent Announcements
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {recentAnnouncements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg
                                  ${note.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                  <span className="mt-0.5">{note.type === 'warning' ? '⚠️' : '📢'}</span>
                  <span>{note.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Student & Parent Messages */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-lime-600" /> Student & Parent Messages
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {studentParentMessages.map((msg) => (
                <li key={msg.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-800">{msg.sender.split(':')[0]}</span> {/* Display only name */}
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <p className="text-gray-700 text-sm leading-snug">{msg.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* My Classes */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-teal-500" /> My Classes
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {myClasses.map((cl) => (
                <li key={cl.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-800">{cl.name}</span>
                  <span className="text-xs text-gray-600">Students: {cl.students}</span>
                  <span className="text-xs text-gray-500 mt-1">{cl.schedule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Timetable (Today's Schedule) */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-red-500" /> Today's Timetable
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {personalTimetable.map((slot, idx) => (
                <li key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">{slot.time}</span>
                    <span className="text-gray-700 text-sm">{slot.event}</span>
                  </div>
                  <span className="text-xs text-gray-500">{slot.location}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
