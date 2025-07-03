'use client';

import React from 'react';
import {
  AcademicCapIcon, // For overall academic/grades
  ClipboardDocumentListIcon, // For assignments
  ChartBarIcon, // For grades/performance
  CalendarDaysIcon, // For date/timetable
  ChatBubbleBottomCenterTextIcon, // For messages
  MegaphoneIcon, // For announcements
  BookOpenIcon, // For courses/classes
  CheckCircleIcon, // For completed status
  ClockIcon, // For time/schedule
  LinkIcon, // For quick links
  LightBulbIcon, // For study tips/resources
} from '@heroicons/react/24/outline'; // Using outline for main icons

// Sample Data for the Student Dashboard
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

const studentStats = [
  {
    title: 'Current GPA',
    icon: <AcademicCapIcon className="h-7 w-7 text-blue-600" />,
    value: '3.8',
    description: 'Overall academic standing',
    color: 'bg-blue-50',
  },
  {
    title: 'Assignments Due',
    icon: <ClipboardDocumentListIcon className="h-7 w-7 text-purple-600" />,
    value: '5',
    description: 'Expected this week',
    color: 'bg-purple-50',
  },
  {
    title: 'Classes Today',
    icon: <BookOpenIcon className="h-7 w-7 text-yellow-600" />,
    value: '4',
    description: 'Scheduled for your timetable',
    color: 'bg-yellow-50',
  },
  {
    title: 'Attendance Rate',
    icon: <ChartBarIcon className="h-7 w-7 text-green-600" />,
    value: '95%',
    description: 'Overall percentage this term',
    color: 'bg-green-50',
  },
];

const upcomingAssignments = [
  { id: 1, title: 'Math: Algebra Worksheet', class: 'Mathematics', dueDate: 'Tomorrow', status: 'Pending' },
  { id: 2, title: 'English: Essay Draft', class: 'English Language', dueDate: 'Fri, July 5', status: 'Pending' },
  { id: 3, title: 'Science: Lab Report', class: 'Science', dueDate: 'Mon, July 8', status: 'Pending' },
  { id: 4, title: 'History: Research Project', class: 'History', dueDate: 'July 15', status: 'Pending' },
];

const myCourses = [
  { id: 1, name: 'Mathematics (Grade 8)', teacher: 'Mr. John Doe', schedule: 'Mon, Wed, Fri', currentGrade: 'A-' },
  { id: 2, name: 'English Language (Grade 8)', teacher: 'Mrs. Jane Smith', schedule: 'Tue, Thu', currentGrade: 'B+' },
  { id: 3, name: 'Science (Grade 8)', teacher: 'Ms. Emily White', schedule: 'Mon, Wed', currentGrade: 'A' },
  { id: 4, name: 'History (Grade 8)', teacher: 'Mr. David Green', schedule: 'Tue, Thu', currentGrade: 'A-' },
];

const recentGrades = [
  { id: 1, assignment: 'Math Quiz 3', subject: 'Mathematics', grade: '92%', date: 'Jun 20' },
  { id: 2, assignment: 'English Comprehension', subject: 'English Language', grade: '88%', date: 'Jun 18' },
  { id: 3, assignment: 'Science Pop Quiz', subject: 'Science', grade: '100%', date: 'Jun 15' },
  { id: 4, assignment: 'History Chapter Test', subject: 'History', grade: '85%', date: 'Jun 10' },
];

const studentAnnouncements = [
  { id: 1, text: '📢 School holiday next Monday, July 1st.', type: 'info' },
  { id: 2, text: '🧪 Science Club meeting moved to Thursday.', type: 'warning' },
  { id: 3, text: '📚 Library closed for inventory on Friday.', type: 'info' },
];

const teacherMessages = [
  { id: 1, sender: 'Mr. John Doe (Math)', message: 'Great job on the last assignment!', time: '10:30 AM' },
  { id: 2, sender: 'Mrs. Jane Smith (English)', message: 'Remember to submit your essay draft by Friday.', time: 'Yesterday' },
];

const personalTimetable = [
  { time: '9:00 - 9:45 AM', event: 'Mathematics', location: 'Room 101' },
  { time: '10:00 - 10:45 AM', event: 'English Language', location: 'Room 102' },
  { time: '11:00 - 11:45 AM', event: 'Break', location: 'Cafeteria' },
  { time: '1:00 - 1:45 PM', event: 'Science', location: 'Lab 2' },
];

const quickLinks = [
  { label: 'Homework Portal', icon: <ClipboardDocumentListIcon className="h-6 w-6" />, href: '#' },
  { label: 'Library Resources', icon: <BookOpenIcon className="h-6 w-6" />, href: '#' },
  { label: 'Counseling Services', icon: <LightBulbIcon className="h-6 w-6" />, href: '#' },
  { label: 'Student Handbook', icon: <LinkIcon className="h-6 w-6" />, href: '#' },
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

export type StudentDashboardData = {
  studentStats: { title: string; value: string; description: string; color: string }[];
  enrolledCourses: { id: string; title: string; progress: number }[];
  recentGrades: { subject: string; score: number; date: string }[];
  upcomingAssignments: { id: string; title: string; dueDate: string; course: string }[];
  // Add other student-specific data fields as needed
};

interface PrincipalDashboardProps extends StudentDashboardData {
  companyId: string; // Pass companyId for dynamic links
  currentUserId: string; // Pass currentUserId for dynamic links
}


export default function StudentDashboard({
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Academic Overview (Assignments, Courses, Grades) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Academic Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentStats.map((stat, index) => (
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

          {/* Upcoming Assignments */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> Upcoming Assignments
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${assignment.status === 'Pending' && 'bg-blue-100 text-blue-800'}
                          ${assignment.status === 'Completed' && 'bg-green-100 text-green-800'}
                        `}>
                          {assignment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-teal-500" /> My Courses
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {myCourses.map((course) => (
                <li key={course.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{course.name}</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">{course.currentGrade}</span>
                  </div>
                  <span className="text-xs text-gray-600 mt-0.5">Teacher: {course.teacher}</span>
                  <span className="text-xs text-gray-500 mt-1">Schedule: {course.schedule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Grades */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-lime-600" /> Recent Grades
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentGrades.map((grade) => (
                    <tr key={grade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{grade.assignment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${parseInt(grade.grade) >= 90 ? 'bg-green-100 text-green-800' :
                            parseInt(grade.grade) >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{grade.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Timetable, Announcements, Messages */}
        <div className="lg:col-span-1 space-y-6">

          {/* Today's Timetable */}
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

          {/* School Announcements */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-orange-500" /> School Announcements
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {studentAnnouncements.map((note) => (
                <li key={note.id} className={`flex items-start gap-3 p-3 rounded-lg
                                  ${note.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
                  <span className="mt-0.5">{note.type === 'warning' ? '⚠️' : '📢'}</span>
                  <span>{note.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Messages from Teachers */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-lime-600" /> Messages from Teachers
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {teacherMessages.map((msg) => (
                <li key={msg.id} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-semibold text-gray-800">{msg.sender}</span>
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

      {/* Quick Links (Bottom Section) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-5 text-gray-800 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-violet-500" /> Quick Links & Resources
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {quickLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-gray-700
                         hover:bg-violet-50 hover:text-violet-700 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
            >
              <div className="text-violet-500 mb-2">{link.icon}</div>
              <span className="text-center text-sm font-medium">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
