// app/admin/[slug]/teacher-classes/[courseId]/take-attendance/TakeAttendancePageClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { StudentAttendanceData, CourseAttendanceInfo } from './page';

// Mocking context data for demonstration purposes (remove in actual app if using global context)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED'; // Match Prisma enum

interface TakeAttendancePageClientProps {
  course: CourseAttendanceInfo;
  students: StudentAttendanceData[];
  initialAttendance: { [studentId: string]: string }; // Initial attendance for the current date
  educatorId: string;
  companyId: string;
}

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function TakeAttendancePageClient({
  course,
  students,
  initialAttendance,
  educatorId,
  companyId,
}: TakeAttendancePageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context in your app

  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [studentAttendance, setStudentAttendance] = useState<{ [studentId: string]: AttendanceStatus }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Effect to initialize attendance when students or initialAttendance changes
  // or when the attendanceDate changes (to load attendance for a different day)
  useEffect(() => {
    const currentDayAttendance: { [studentId: string]: AttendanceStatus } = {};
    students.forEach(student => {
      // Use existing attendance for the selected date, or default to 'PRESENT'
      currentDayAttendance[student.studentId] = (initialAttendance[student.studentId] as AttendanceStatus) || 'PRESENT';
    });
    setStudentAttendance(currentDayAttendance);
  }, [students, initialAttendance]); // Depend on students and initialAttendance

  // Effect to re-fetch attendance when attendanceDate changes
  useEffect(() => {
    const fetchAttendanceForDate = async () => {
      setLoading(true);
      setStatusMessage(null);
      try {
        const res = await fetch(
          `${apiBaserUrl}/teacher/courses/${course.id}/attendance-data?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}&date=${encodeURIComponent(attendanceDate)}`,
          { next: { revalidate: 60 } }
        );

        if (res.ok) {
          const data = await res.json();
          const fetchedAttendance: { [studentId: string]: AttendanceStatus } = {};
          data.students.forEach((student: StudentAttendanceData) => {
            fetchedAttendance[student.studentId] = (data.existingAttendance[student.studentId] as AttendanceStatus) || 'PRESENT';
          });
          setStudentAttendance(fetchedAttendance);
        } else {
          const errorData = await res.json();
          showStatus('error', errorData.message || 'Failed to load attendance for this date.');
          // If fetch fails, revert to default 'PRESENT' for all or keep current state
          const defaultAttendance: { [studentId: string]: AttendanceStatus } = {};
          students.forEach(student => {
            defaultAttendance[student.studentId] = 'PRESENT';
          });
          setStudentAttendance(defaultAttendance);
        }
      } catch (err: any) {
        showStatus('error', `Network error: ${err.message}`);
        const defaultAttendance: { [studentId: string]: AttendanceStatus } = {};
        students.forEach(student => {
          defaultAttendance[student.studentId] = 'PRESENT';
        });
        setStudentAttendance(defaultAttendance);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceForDate();
  }, [attendanceDate, course.id, educatorId, companyId, students]); // Re-fetch when date changes

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  }, []);

  const handleAttendanceChange = useCallback((studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  }, []);

  const handleSaveAttendance = useCallback(async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const payload = {
        courseId: course.id,
        academicLevelId: course.academicLevelId, // Pass the academic level associated with the course
        attendanceDate: attendanceDate,
        educatorId: educatorId,
        companyId: companyId,
        attendance: studentAttendance,
      };

      const res = await fetch(`${apiBaserUrl}/teacher/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showStatus('success', `Attendance saved successfully for ${course.title} on ${attendanceDate}!`);
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to save attendance.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [course, attendanceDate, educatorId, companyId, studentAttendance, showStatus]);

  const handleBulkAttendanceChange = useCallback((status: AttendanceStatus) => {
    const updatedAttendance: { [studentId: string]: AttendanceStatus } = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.studentId] = status;
    });
    setStudentAttendance(updatedAttendance);
  }, [students, searchTerm]); // Depend on students and searchTerm for filteredStudents

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
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
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class Roster"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Take Attendance <span style={{ color: primaryColor }}>{course.title}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Mark attendance for students in {course.academicLevelName} - {course.title}.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            className="bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-700">Loading attendance...</span>
        </div>
      )}

      {/* Search and Bulk Actions */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search student by name or ID..."
            className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                        text-gray-900 placeholder-gray-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          <button
            onClick={() => handleBulkAttendanceChange('PRESENT')}
            className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                        hover:bg-green-50 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
            disabled={loading}
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkAttendanceChange('ABSENT')}
            className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                        hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
            disabled={loading}
          >
            Mark All Absent
          </button>
        </div>
      </motion.div>

      {/* Student Attendance List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student: StudentAttendanceData) => (
            <motion.div
              key={student.studentId}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl} // Use directly, customLoader is for Next/Image
                  alt={student.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/80x80/${primaryColor.replace('#', '')}/FFFFFF?text=${student.name.split(' ').map((n: string) => n[0]).join('')}`;
                  }}
                />
              ) : (
                <UserCircleIcon className={`w-16 h-16 text-gray-300 flex-shrink-0`} />
              )}
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                  {['PRESENT', 'ABSENT', 'TARDY', 'EXCUSED'].map(status => (
                    <label key={status} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`attendance-${student.studentId}`}
                        value={status}
                        checked={studentAttendance[student.studentId] === status}
                        onChange={() => handleAttendanceChange(student.studentId, status as AttendanceStatus)}
                        className={`form-radio h-5 w-5 text-[${primaryColor}] border-gray-300 focus:ring-[${primaryColor}]`}
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <UserCircleIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No students found in this class or matching your search.</p>
            <p className="text-sm mt-2">Please ensure the correct class is selected or adjust your search term.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Save Attendance Button */}
      {filteredStudents.length > 0 && (
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <button
            onClick={handleSaveAttendance}
            className={`inline-flex items-center gap-2 px-8 py-3 bg-[${primaryColor}] text-white rounded-md shadow-lg font-semibold text-lg
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                Save Attendance
                <CheckCircleIcon className="h-5 w-5" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
