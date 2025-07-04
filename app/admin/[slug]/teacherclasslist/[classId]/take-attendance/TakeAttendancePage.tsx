'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserCircleIcon, // For student avatar placeholder
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date picker icon
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
} from '@heroicons/react/24/outline';

// Assuming these types match your Next.js API route's response
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';

interface StudentForAttendance {
  id: string; // Student ID (this is the Student model's ID)
  userId: string; // User ID associated with the student
  name: string; // Student's name (from User model)
  profilePicture: string | null; // Student's profile picture (from Student model)
  currentStatus: AttendanceStatus; // Current attendance status for the selected date
}

interface AcademicLevelInfo {
  id: string; // AcademicLevel ID
  name: string; // e.g., "Grade 7"
  description: string | null;
  studentsCount: number;
}

interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
}

interface TakeAttendancePageData {
  academicLevelInfo: AcademicLevelInfo;
  students: StudentForAttendance[];
  themeSettings: ThemeSettings;
}

interface TakeAttendancePageProps {
  academicLevelId: string;
  educatorId: string; // The ID of the educator recording attendance
}

// Base URL for your API. This should point to your Next.js API route.
// If your Next.js app is served from example.com, this would be /api.
// For local development, it would be /api if the API route is within the same Next.js app.
// If your API is a separate Node.js app, adjust this URL.
const API_BASE_URL =  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";; // Relative path for Next.js API routes

export default function TakeAttendancePage({ academicLevelId, educatorId }: TakeAttendancePageProps) {
  const [academicLevelData, setAcademicLevelData] = useState<TakeAttendancePageData | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [studentAttendance, setStudentAttendance] = useState<{ [studentId: string]: { status: AttendanceStatus; reason: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme colors from fetched data or defaults
  const primaryColor = academicLevelData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = academicLevelData?.themeSettings?.accentColor || "#FFC107";

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  }, []);

  // Function to fetch attendance data
  const fetchAttendanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/teacher/academic-levels/${academicLevelId}/attendance?date=${encodeURIComponent(attendanceDate)}&educatorId=${encodeURIComponent(educatorId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch attendance data: ${response.statusText}`);
      }

      const data: TakeAttendancePageData = await response.json();
      setAcademicLevelData(data);

      // Initialize studentAttendance from fetched data
      const initialAttendance: { [studentId: string]: { status: AttendanceStatus; reason: string } } = {};
      data.students.forEach(student => {
        initialAttendance[student.id] = {
          status: student.currentStatus,
          reason: '' // Reason is not returned by GET, so initialize as empty
        };
      });
      setStudentAttendance(initialAttendance);

    } catch (err: any) {
      console.error("Error fetching attendance data:", err);
      setError(err.message || "Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  }, [academicLevelId, attendanceDate, educatorId]);

  // Effect to fetch data on component mount and when dependencies change
  useEffect(() => {
    if (academicLevelId && educatorId) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, academicLevelId, educatorId]); // Re-run when these props change

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: status },
    }));
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], reason: reason },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!academicLevelData) {
      showStatus('error', 'No academic level data loaded.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const attendanceRecordsPayload: { [studentId: string]: { status: AttendanceStatus; reason?: string | null } } = {};
      academicLevelData.students.forEach(student => {
        const record = studentAttendance[student.id];
        if (record) {
          attendanceRecordsPayload[student.id] = {
            status: record.status,
            reason: record.reason || null // Send null if empty string
          };
        }
      });

      const url = `${API_BASE_URL}/teacher/academic-levels/${academicLevelId}/attendance`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: attendanceDate,
          educatorId,
          attendanceRecords: attendanceRecordsPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save attendance: ${response.statusText}`);
      }

      showStatus('success', `Attendance saved successfully for ${academicLevelData.academicLevelInfo.name} on ${attendanceDate}!`);
      // Re-fetch data to update the UI with potentially new/updated records
      fetchAttendanceData();
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError(err.message || "Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendanceChange = (status: AttendanceStatus) => {
    const updatedAttendance: { [studentId: string]: { status: AttendanceStatus; reason: string } } = {};
    const studentsToUpdate = academicLevelData?.students || [];
    studentsToUpdate.forEach(student => {
      updatedAttendance[student.id] = {
        status: status,
        reason: studentAttendance[student.id]?.reason || ''
      };
    });
    setStudentAttendance(updatedAttendance);
  };

  const filteredStudents = academicLevelData?.students?.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        <div className="text-lg font-semibold flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading attendance data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <ExclamationCircleIcon className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Data</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={fetchAttendanceData}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-red-200 text-red-800 rounded-md shadow-sm
                      hover:bg-red-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
        >
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    );
  }

  if (!academicLevelData) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Academic Level Not Found</h2>
        <p className="text-gray-500 mb-6">The academic level could not be loaded for attendance. Please check the URL or try again.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-inter text-gray-800">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
              aria-label="Back to previous page"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Take Attendance <span style={{ color: primaryColor }}>{academicLevelData.academicLevelInfo.name}</span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">Mark attendance for {academicLevelData.academicLevelInfo.studentsCount} students.</p>
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

        {/* Search and Bulk Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Search student by name or ID..."
              className={`w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                          text-gray-900 placeholder-gray-500 bg-white`}
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
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkAttendanceChange('ABSENT')}
              className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                          hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
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
            filteredStudents.map(student => (
              <motion.div
                key={student.id} // Use student.id from API
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4
                           hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
                variants={itemVariants}
              >
                {student.profilePicture ? (
                  <img
                    src={student.profilePicture} // Use profilePicture directly
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
                  <p className="text-sm text-gray-600">ID: {student.id}</p> {/* Use student.id */}
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                    {['PRESENT', 'ABSENT', 'TARDY', 'EXCUSED'].map(status => (
                      <label key={status} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`} // Use student.id
                          value={status}
                          checked={studentAttendance[student.id]?.status === status} // Check status from state
                          onChange={() => handleAttendanceChange(student.id, status as AttendanceStatus)}
                          className={`form-radio h-5 w-5 text-[${primaryColor}] border-gray-300 focus:ring-[${primaryColor}]`}
                        />
                        <span className="ml-2 text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label htmlFor={`reason-${student.id}`} className="block text-xs font-medium text-gray-600 mb-1">Reason (Optional)</label>
                    <input
                      type="text"
                      id={`reason-${student.id}`}
                      value={studentAttendance[student.id]?.reason || ''}
                      onChange={(e) => handleReasonChange(student.id, e.target.value)}
                      placeholder="Enter reason..."
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400"
                    />
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
              <p className="text-lg">No students found in this academic level or matching your search.</p>
              <p className="text-sm mt-2">Please ensure the correct academic level is selected or adjust your search term.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Save Attendance Button */}
        {filteredStudents.length > 0 && (
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <button
              onClick={handleSaveAttendance}
              className={`inline-flex items-center gap-2 px-8 py-3 bg-[${primaryColor}] text-white rounded-md shadow-lg font-semibold text-lg
                          hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
            >
              Save Attendance
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}