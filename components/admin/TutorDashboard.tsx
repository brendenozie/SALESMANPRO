'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import {
  
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon, // For general educator theme
  BookOpenIcon, // For courses
  ChartBarIcon,
  HeartIcon,
  UsersIcon, // For students
  ClipboardDocumentListIcon, // For assignments/grading
  CalendarDaysIcon, // For schedule/upcoming
  MegaphoneIcon, // For announcements
  ChartPieIcon, // For performance/analytics
  ArrowRightIcon, // For action links
  SparklesIcon, // For welcome accent
  ClockIcon, // For time
  EyeIcon, // For view details
} from '@heroicons/react/24/outline';
import { LightBulbIcon } from '@heroicons/react/24/solid'; // For quick tips

// Mock data for demonstration
const mockEducatorData = {
  name: "Dr. Anya Sharma",
  totalStudents: 185,
  totalCoursesTaught: 7,
  upcomingClasses: [
    {
      id: 1,
      course: "Advanced Data Structures",
      date: "Jul 10, 2024",
      time: "10:00 AM - 11:30 AM",
      topic: "Graph Algorithms",
      link: "#/class/data-structures-graph",
      students: 15,
    },
    {
      id: 2,
      course: "Introduction to Machine Learning",
      date: "Jul 11, 2024",
      time: "02:00 PM - 03:30 PM",
      topic: "Linear Regression",
      link: "#/class/ml-linear-regression",
      students: 15,
    },
  ],
  courses: [
    {
      id: 101,
      title: "Introduction to Computer Science",
      students: 65,
      pendingGrades: 12,
      lastActivity: "Assignment 3 graded",
      link: "#/course/intro-cs",
    },
    {
      id: 102,
      title: "Web Development Fundamentals",
      students: 40,
      pendingGrades: 5,
      lastActivity: "New discussion post",
      link: "#/course/web-dev",
    },
    {
      id: 103,
      title: "Advanced Data Structures",
      students: 30,
      pendingGrades: 8,
      lastActivity: "Quiz 2 released",
      link: "#/course/adv-ds",
    },
  ],
  pendingGrading: [
    {
      id: 1,
      assignment: "Chapter 5 Quiz",
      course: "Introduction to Computer Science",
      submissions: 12,
      dueDate: "Jul 08, 2024",
      link: "#/grading/cs-quiz5",
    },
    {
      id: 2,
      assignment: "Web Dev Project Proposal",
      course: "Web Development Fundamentals",
      submissions: 5,
      dueDate: "Jul 12, 2024",
      link: "#/grading/webdev-proj-prop",
    },
  ],
  quickLinks: [
    { label: "Create New Assignment", icon: ClipboardDocumentListIcon, link: "#/assignments/new" },
    { label: "View All Students", icon: UsersIcon, link: "#/students/all" },
    { label: "Post Announcement", icon: MegaphoneIcon, link: "#/announcements/new" },
    { label: "My Calendar", icon: CalendarDaysIcon, link: "#/calendar" },
  ]
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 80, damping: 10 } },
};

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
  
  const { name, totalStudents, totalCoursesTaught, upcomingClasses, courses, pendingGrading, quickLinks } = mockEducatorData;

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
                <h3 className="text-lg font-semibold text-blue-900">{cls.course}</h3>
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

      <motion.div
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Welcome Section */}
        <motion.div
          className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex items-center justify-between flex-wrap gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
              Hello, {name}! <SparklesIcon className="w-8 h-8 text-lime-300" />
            </h1>
            <p className="text-lg text-teal-100">Your teaching hub awaits.</p>
          </div>
          <button
            className="inline-flex items-center bg-white text-teal-700 font-semibold py-3 px-6 rounded-full shadow-md
                       hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => console.log('Create New Course clicked')}
          >
            Create New Course <BookOpenIcon className="w-5 h-5 ml-2" />
          </button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
            <UsersIcon className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents}</h3>
            </div>
          </motion.div>
          <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
            <BookOpenIcon className="w-10 h-10 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Courses Taught</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCoursesTaught}</h3>
            </div>
          </motion.div>
          <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
            <ClipboardDocumentListIcon className="w-10 h-10 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Grades</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pendingGrading.reduce((sum, item) => sum + item.submissions, 0)}</h3>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: My Courses */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white">My Courses</h2>
            <div className="space-y-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-start sm:items-center group
                             hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  variants={cardVariants}
                  onClick={() => console.log(`Course clicked: ${course.title}`)}
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <UsersIcon className="inline-block w-4 h-4 mr-1 text-blue-500" /> {course.students} Students
                      <span className="mx-2 text-gray-400">|</span>
                      <ClipboardDocumentListIcon className="inline-block w-4 h-4 mr-1 text-orange-500" /> {course.pendingGrades} Pending Grades
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Last activity: {course.lastActivity}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-auto flex flex-col sm:flex-row gap-2">
                    <button
                      className="inline-flex items-center text-teal-600 border border-teal-600 bg-transparent font-medium py-2 px-4 rounded-full
                                 hover:bg-teal-600 hover:text-white transition-all duration-200 text-sm"
                      onClick={(e) => { e.stopPropagation(); console.log(`View Students for ${course.title}`); }}
                    >
                      <UsersIcon className="w-4 h-4 mr-1" /> Students
                    </button>
                    <button
                      className="inline-flex items-center bg-teal-600 text-white font-medium py-2 px-4 rounded-full shadow-sm
                                 hover:bg-teal-700 transition-all duration-200 text-sm"
                      onClick={(e) => { e.stopPropagation(); console.log(`Manage Course ${course.title}`); }}
                    >
                      Manage <ArrowRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <button
              className="w-full mt-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl
                         hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
              onClick={() => console.log('View All My Courses clicked')}
            >
              View All My Courses <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
          </motion.div>

          {/* Right Column: Upcoming & Pending */}
          <div className="lg:col-span-1 space-y-8">
            {/* Upcoming Classes */}
            <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" variants={itemVariants}>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                <CalendarDaysIcon className="w-6 h-6 text-indigo-500" /> Upcoming Classes
              </h2>
              <ul className="space-y-4">
                {upcomingClasses.map((cl) => (
                  <motion.li
                    key={cl.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                    variants={cardVariants}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{cl.course}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Topic: {cl.topic}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-4 h-4" /> {cl.date}
                      <span className="text-gray-400">|</span>
                      <ClockIcon className="w-4 h-4" /> {cl.time}
                    </p>
                    <a
                      href={cl.link}
                      className="inline-flex items-center text-teal-500 hover:underline text-sm mt-2 group"
                      onClick={(e) => { e.preventDefault(); console.log(`Class link: ${cl.course}`); }}
                    >
                      Join Class <ArrowRightIcon className="ml-1 w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Pending Grading */}
            <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" variants={itemVariants}>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                <ClipboardDocumentListIcon className="w-6 h-6 text-rose-500" /> Pending Grading
              </h2>
              <ul className="space-y-4">
                {pendingGrading.map((assignment) => (
                  <motion.li
                    key={assignment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                    variants={cardVariants}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{assignment.assignment}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.course}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                      <UsersIcon className="w-4 h-4" /> {assignment.submissions} Submissions
                      <span className="text-gray-400">|</span>
                      <ClockIcon className="w-4 h-4" /> Due: {assignment.dueDate}
                    </p>
                    <a
                      href={assignment.link}
                      className="inline-flex items-center text-teal-500 hover:underline text-sm mt-2 group"
                      onClick={(e) => { e.preventDefault(); console.log(`Grade: ${assignment.assignment}`); }}
                    >
                      Review Submissions <EyeIcon className="ml-1 w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Quick Links */}
            <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" variants={itemVariants}>
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                <LightBulbIcon className="w-6 h-6 text-yellow-500" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickLinks.map((link, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm
                               hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-semibold text-gray-800 dark:text-white"
                    onClick={() => console.log(`${link.label} clicked!`)}
                  >
                    <link.icon className="w-5 h-5 mr-2 text-teal-500" /> {link.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
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