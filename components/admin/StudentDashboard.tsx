'use client';

import React from 'react';
import ChartTwo from '@/components/ChartTwo';
import ChartThree from '@/components/ChartThree';
import {
  UsersIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  ArrowRightIcon,
  ChartBarIcon, // For progress/stats
  ClockIcon, // For time/duration
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid'; // For welcome accent

import { motion } from 'framer-motion';

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
// Mock data for demonstration
const mockStudentData = {
  name: "Alex Johnson",
  currentCourses: [
    {
      id: 1,
      title: "Introduction to Web Development",
      progress: 75,
      instructor: "Jane Doe",
      lessonsCompleted: 15,
      totalLessons: 20,
      imageUrl: "https://placehold.co/400x250/3498DB/FFFFFF?text=WebDev",
      link: "#/courses/web-dev",
    },
    {
      id: 2,
      title: "Data Science with Python",
      progress: 40,
      instructor: "John Smith",
      lessonsCompleted: 8,
      totalLessons: 20,
      imageUrl: "https://placehold.co/400x250/2ECC71/FFFFFF?text=DataScience",
      link: "#/courses/data-science",
    },
    {
      id: 3,
      title: "Graphic Design Fundamentals",
      progress: 90,
      instructor: "Emily White",
      lessonsCompleted: 18,
      totalLessons: 20,
      imageUrl: "https://placehold.co/400x250/E74C3C/FFFFFF?text=GraphicDesign",
      link: "#/courses/graphic-design",
    },
  ],
  upcomingAssignments: [
    {
      id: 1,
      title: "Web Dev Project Phase 1",
      course: "Introduction to Web Development",
      dueDate: "2024-07-10",
      status: "Due Soon",
      link: "#/assignments/web-dev-p1",
    },
    {
      id: 2,
      title: "Data Science Midterm Quiz",
      course: "Data Science with Python",
      dueDate: "2024-07-15",
      status: "Upcoming",
      link: "#/assignments/data-sci-quiz",
    },
    {
      id: 3,
      title: "Design Principles Essay",
      course: "Graphic Design Fundamentals",
      dueDate: "2024-07-20",
      status: "Upcoming",
      link: "#/assignments/design-essay",
    },
  ],
  recentAnnouncements: [
    {
      id: 1,
      title: "Platform Maintenance Scheduled",
      date: "2024-07-01",
      summary: "Our platform will undergo maintenance on July 5th from 2 AM to 4 AM UTC.",
      link: "#/announcements/maintenance",
    },
    {
      id: 2,
      title: "New Course: Mobile App Development!",
      date: "2024-06-28",
      summary: "Exciting news! We've launched a new course on Mobile App Development using React Native.",
      link: "#/announcements/new-course",
    },
  ],
  overallStats: {
    totalCourses: 5,
    completedCourses: 2,
    certificatesEarned: 1,
    averageProgress: "65%",
  }
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

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};
export default function StudentDashboard() {
  
  const { name, currentCourses, upcomingAssignments, recentAnnouncements, overallStats } = mockStudentData;

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

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div
              className="max-w-7xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {/* Welcome Section */}
              <motion.div
                className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex items-center justify-between flex-wrap gap-4"
                variants={itemVariants}
              >
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                    Welcome, {name}! <SparklesIcon className="w-8 h-8 text-yellow-300" />
                  </h1>
                  <p className="text-lg text-indigo-100">Your learning journey continues here.</p>
                </div>
                <button
                  className="inline-flex items-center bg-white text-indigo-700 font-semibold py-3 px-6 rounded-full shadow-md
                             hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => console.log('View All Courses clicked')}
                >
                  View All Courses <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              </motion.div>
      
              {/* Overall Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
                  <ChartBarIcon className="w-10 h-10 text-indigo-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.totalCourses}</h3>
                  </div>
                </motion.div>
                <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
                  <ClipboardDocumentCheckIcon className="w-10 h-10 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Courses Completed</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.completedCourses}</h3>
                  </div>
                </motion.div>
                <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
                  <AcademicCapIcon className="w-10 h-10 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificates Earned</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.certificatesEarned}</h3>
                  </div>
                </motion.div>
                <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex items-center gap-4" variants={cardVariants}>
                  <ClockIcon className="w-10 h-10 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Progress</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{overallStats.averageProgress}</h3>
                  </div>
                </motion.div>
              </div>
      
      
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Ongoing Courses */}
                <motion.div className="lg:col-span-2" variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-5 text-gray-800 dark:text-white">Your Courses</h2>
                  <div className="space-y-6">
                    {currentCourses.map((course) => (
                      <motion.div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col sm:flex-row group
                                   hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                        variants={cardVariants}
                        onClick={() => console.log(`Course clicked: ${course.title}`)}
                      >
                        <div className="flex-shrink-0 w-full sm:w-48 h-40 sm:h-auto overflow-hidden">
                          <img
                            src={customLoader({ src: course.imageUrl, width: 400 })}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/400x250/A0A0A0/FFFFFF?text=Course"; }}
                          />
                        </div>
                        <div className="p-5 flex-grow">
                          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Instructor: {course.instructor}</p>
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                            <div
                              className="bg-indigo-500 h-2.5 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Progress: {course.progress}% ({course.lessonsCompleted}/{course.totalLessons} Lessons)
                          </p>
                          <a
                            href={course.link}
                            className="inline-flex items-center text-indigo-600 dark:text-purple-400 font-medium hover:underline group"
                            onClick={(e) => { e.stopPropagation(); console.log(`Go to course: ${course.title}`); }}
                          >
                            Continue Learning <ArrowRightIcon className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
      
                {/* Right Column: Upcoming & Announcements */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Upcoming Assignments */}
                  <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" variants={itemVariants}>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                      <CalendarDaysIcon className="w-6 h-6 text-orange-500" /> Upcoming Deadlines
                    </h2>
                    <ul className="space-y-4">
                      {upcomingAssignments.map((assignment) => (
                        <motion.li
                          key={assignment.id}
                          className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                          variants={cardVariants}
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.course}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                            <ClockIcon className="w-4 h-4" /> Due: {assignment.dueDate}
                          </p>
                          <a
                            href={assignment.link}
                            className="inline-flex items-center text-indigo-500 hover:underline text-sm mt-2 group"
                            onClick={(e) => { e.preventDefault(); console.log(`Assignment clicked: ${assignment.title}`); }}
                          >
                            View Assignment <ArrowRightIcon className="ml-1 w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
      
                  {/* Recent Announcements */}
                  <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6" variants={itemVariants}>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-white">
                      <BellAlertIcon className="w-6 h-6 text-red-500" /> Latest Announcements
                    </h2>
                    <ul className="space-y-4">
                      {recentAnnouncements.map((announcement) => (
                        <motion.li
                          key={announcement.id}
                          className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
                          variants={cardVariants}
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{announcement.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{announcement.date}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{announcement.summary}</p>
                          <a
                            href={announcement.link}
                            className="inline-flex items-center text-indigo-500 hover:underline text-sm mt-2 group"
                            onClick={(e) => { e.preventDefault(); console.log(`Announcement clicked: ${announcement.title}`); }}
                          >
                            Read More <ArrowRightIcon className="ml-1 w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            </motion.div>
      </div>
    </div>
  );
}


// Quick stats (classes, subjects, hours, peers)

// Charts for attendance and subject performance

// Today's classes list with teacher and room info

// Let me know if you want to add homework tracking, a calendar, grades, or messaging!