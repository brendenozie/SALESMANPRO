// app/student/[slug]/my-classes/StudentClassesPageClient.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon, // For overall classes
  CalendarDaysIcon, // For date
  BookOpenIcon, // For individual classes/courses
  UsersIcon, // For teacher
  ClockIcon, // For schedule
  ClipboardDocumentListIcon, // For assignments
  ChartBarIcon, // For grades
  MapPinIcon, // For room
  ArrowRightIcon, // For navigation buttons
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { EnrolledClassData } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface StudentClassesPageClientProps {
  studentName: string;
  studentGradeLevel: string;
  enrolledClasses: EnrolledClassData[];
  studentId: string;
  companyId: string;
}

export default function StudentClassesPageClient({
  studentName,
  studentGradeLevel,
  enrolledClasses,
  studentId,
  companyId,
}: StudentClassesPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalClasses = enrolledClasses.length;
  const classesWithUpcomingAssignments = enrolledClasses.filter(
    (cls) => cls.upcomingAssignmentsCount > 0
  ).length;

  const getGradeColor = useCallback((grade: string) => {
    if (grade.includes('A')) return 'bg-green-100 text-green-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-yellow-100 text-yellow-800';
    if (isNaN(Number(grade))) return 'bg-gray-100 text-gray-800'; // For "N/A"
    if (Number(grade) >= 80) return 'bg-green-100 text-green-800';
    if (Number(grade) >= 65) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  }, []);

  const handleViewDetails = useCallback((classId: string, section: 'assignments' | 'grades' | 'schedule') => {
    // Navigate to the specific page for assignments, grades, or schedule
    // Adjust these paths based on your actual routing structure
    if (section === 'assignments') {
      router.push(`/student/${companyId}/my-classes/${classId}/assignments`);
    } else if (section === 'grades') {
      router.push(`/student/${companyId}/my-classes/${classId}/grades`);
    } else if (section === 'schedule') {
      router.push(`/student/${companyId}/my-classes/${classId}/schedule`);
    }
  }, [router, companyId]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Enrolled Classes
              <span className="ml-2 text-indigo-600 text-base sm:text-xl">📚</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Overview of your academic schedule, {studentName}.</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </motion.div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalClasses}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentListIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Classes with Upcoming Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{classesWithUpcomingAssignments}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Academic Level</p>
              <h2 className="text-3xl font-bold text-gray-800">{studentGradeLevel}</h2>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* List of Enrolled Classes */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {enrolledClasses.length > 0 ? (
          enrolledClasses.map((cls) => (
            <motion.div
              key={cls.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-blue-600" /> {cls.name}
                </h3>

                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span>Teacher: {cls.teacher}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span>Schedule: {cls.schedule}</span>
                  </div>
                  {cls.room && ( // Conditionally render room if available
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                      <span>Room: {cls.room}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Current Grade:</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(cls.currentGrade)}`}>
                    {cls.currentGrade}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Upcoming Assignments:</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{cls.upcomingAssignmentsCount}</span>
                </div>
                {cls.upcomingAssignmentsCount > 0 && (
                  <p className="text-xs text-gray-500 text-right mt-1">Next due: {cls.nextAssignmentDue}</p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleViewDetails(cls.id, 'assignments')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-[${primaryColor}] text-white rounded-md shadow-sm
                              hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                >
                  View Assignments <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewDetails(cls.id, 'grades')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-[${primaryColor}] text-[${primaryColor}] rounded-md shadow-sm
                              hover:bg-[${primaryColor}10] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                >
                  View Grades <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewDetails(cls.id, 'schedule')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md shadow-sm
                              hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
                >
                  View Schedule <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">You are not currently enrolled in any classes.</p>
            <p className="text-sm mt-2">Please contact your academic advisor if you believe this is incorrect.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
