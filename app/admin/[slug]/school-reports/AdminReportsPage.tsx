'use client';

import React from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Assuming these are generic chart components you have
// In a real app, these would take specific data props
import ChartTwo from '@/components/ChartTwo'; // Example for Bar/Line chart
import ChartThree from '@/components/ChartThree'; // Example for Pie/Doughnut chart

// Sample Data for Reports (Simplified for demonstration)
const overallStats = {
  totalStudents: '1,245',
  totalTeachers: '86',
  totalClasses: '55',
  averageAttendance: '92.5%',
};

const studentPerformanceData = {
  gradeDistribution: [
    { label: 'A', value: 300 },
    { label: 'B', value: 500 },
    { label: 'C', value: 350 },
    { label: 'D', value: 70 },
    { label: 'F', value: 25 },
  ],
  attendanceTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    data: [90, 91, 92, 93, 92, 94],
  },
  topPerformingGrades: [
    { grade: 'Grade 8', avgGPA: 3.9 },
    { grade: 'Grade 10', avgGPA: 3.7 },
    { grade: 'Grade 7', avgGPA: 3.6 },
  ],
  lowPerformingStudents: [
    { name: 'Student A', grade: '9', gpa: 1.8 },
    { name: 'Student B', grade: '7', gpa: 2.1 },
  ]
};

const staffReportsData = {
  teachersByDepartment: [
    { department: 'Math', count: 15 },
    { department: 'English', count: 12 },
    { department: 'Science', count: 18 },
    { department: 'Social Studies', count: 10 },
    { department: 'Arts', count: 8 },
  ],
  teacherActivity: {
    labels: ['Reports', 'Meetings', 'Grading', 'Planning'],
    data: [30, 20, 45, 35] // Hours/week or activities count
  }
};

const academicReportsData = {
  classEnrollmentDistribution: [
    { size: '1-15', count: 10 },
    { size: '16-25', count: 30 },
    { size: '26-35', count: 15 },
  ],
  coursePopularity: [
    { course: 'Algebra I', enrollments: 120 },
    { course: 'Literary Analysis', enrollments: 105 },
    { course: 'Biology', enrollments: 130 },
    { course: 'Introduction to Programming', enrollments: 80 },
  ]
};


export default function AdminReportsPage() {
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
            Admin Reports Dashboard
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive insights for strategic decision-making.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overall School Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UsersIcon className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalStudents}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <BriefcaseIcon className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Teachers</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalTeachers}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <AcademicCapIcon className="h-7 w-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Classes</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.totalClasses}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <ArrowTrendingUpIcon className="h-7 w-7 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
            <h2 className="text-3xl font-bold text-gray-800">{overallStats.averageAttendance}</h2>
          </div>
        </div>
      </div>

      {/* Student Performance & Attendance Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-blue-500" /> Student Performance & Attendance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Grade Distribution */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Grade Distribution</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Placeholder for ChartThree (e.g., Pie Chart) */}
              {/* <ChartThree /> Pass data prop in real implementation */}
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All Grades &rarr;</button>
          </div>

          {/* Attendance Trend */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Overall Attendance Trend</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Placeholder for ChartTwo (e.g., Line Chart) */}
              {/* <ChartTwo /> Pass data prop in real implementation */}
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Attendance Report &rarr;</button>
          </div>

          {/* Top Performing Grades */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Top Performing Grade Levels</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {studentPerformanceData.topPerformingGrades.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span>{item.grade}</span>
                  <span className="font-bold text-green-700">{item.avgGPA} GPA</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Details by Grade &rarr;</button>
          </div>

          {/* Low Performing Students (Mock List) */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Students Needing Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {studentPerformanceData.lowPerformingStudents.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm border-l-4 border-red-400">
                  <span>{item.name} (G{item.grade})</span>
                  <span className="font-bold text-red-700">{item.gpa} GPA</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All &rarr;</button>
          </div>
        </div>
      </div>

      {/* Staff & Resource Utilization Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BriefcaseIcon className="h-6 w-6 text-green-500" /> Staff & Resource Utilization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Teachers by Department */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Teachers by Department</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Placeholder for ChartThree (e.g., Bar Chart) */}
              {/* <ChartTwo /> Pass data prop in real implementation */}
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Department Breakdown &rarr;</button>
          </div>

          {/* Teacher Activity Metrics */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Teacher Activity Metrics</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {staffReportsData.teacherActivity.labels.map((label, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span>{label}</span>
                  <span className="font-bold text-gray-700">{staffReportsData.teacherActivity.data[idx]} items/hrs</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View Detailed Activity &rarr;</button>
          </div>
        </div>
      </div>

      {/* Curriculum & Enrollment Insights Reports */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpenIcon className="h-6 w-6 text-purple-500" /> Curriculum & Enrollment Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Class Enrollment Distribution */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Class Enrollment Distribution</h4>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Placeholder for ChartTwo/Three */}
              {/* <ChartThree /> Pass data prop in real implementation */}
            </div>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Class Size Details &rarr;</button>
          </div>

          {/* Course Popularity */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Top Courses by Enrollment</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {academicReportsData.coursePopularity
                .sort((a, b) => b.enrollments - a.enrollments) // Sort by enrollments
                .slice(0, 5) // Show top 5
                .map((item, idx) => (
                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                  <span>{item.course}</span>
                  <span className="font-bold text-indigo-700">{item.enrollments} Enrolled</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">View All Course Stats &rarr;</button>
          </div>

           {/* Calendar Events Summary (if data available) */}
           <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Upcoming Calendar Events Summary</h4>
            <ul className="space-y-2 text-sm text-gray-700">
               <li className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                   <span>Exams: 3 upcoming</span>
                   <span className="text-gray-500">Next: July 15</span>
               </li>
               <li className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                   <span>School Holidays: 1 upcoming</span>
                   <span className="text-gray-500">Starts: Aug 1</span>
               </li>
               <li className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                   <span>Meetings: 5 this month</span>
                   <span className="text-gray-500">Next: Jun 28</span>
               </li>
            </ul>
            <button className="mt-4 w-full text-sm text-blue-600 hover:underline">Full Calendar View &rarr;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
