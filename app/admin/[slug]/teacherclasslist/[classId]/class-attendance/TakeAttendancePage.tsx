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
import Image from 'next/image'; // Recommended for Next.js image optimization

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (Keep as is, they are good) ---
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'TARDY' | 'EXCUSED';

interface StudentForAttendance {
  id: string;
  userId: string;
  name: string;
  profilePicture: string | null;
  currentStatus: AttendanceStatus;
}

interface AcademicLevelInfo {
  id: string;
  name: string;
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
  educatorId: string;
}

const API_BASE_URL = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function TakeAttendancePage({ academicLevelId, educatorId }: TakeAttendancePageProps) {
  const [academicLevelData, setAcademicLevelData] = useState<TakeAttendancePageData | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState<{ [studentId: string]: { status: AttendanceStatus; reason: string } }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // New state for save button loading

  // Dynamic Tailwind JIT compilation with variables requires a workaround
  // For production builds, you might need to safelist these colors in tailwind.config.js
  // For development, inline styles work but dynamic classes are better for performance.
  // Using inline styles for dynamic colors for simplicity here.
  const primaryColor = academicLevelData?.themeSettings?.primaryColor || '#4F46E5'; // Default indigo
  const accentColor = academicLevelData?.themeSettings?.accentColor || '#10B981'; // Default emerald

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

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

      const initialAttendance: { [studentId: string]: { status: AttendanceStatus; reason: string } } = {};
      data.students.forEach(student => {
        initialAttendance[student.id] = {
          status: student.currentStatus,
          reason: ''
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

  useEffect(() => {
    if (academicLevelId && educatorId) {
      fetchAttendanceData();
    }
  }, [fetchAttendanceData, academicLevelId, educatorId]);

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
      showStatus('error', 'No academic level data loaded to save attendance.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const attendanceRecordsPayload: { [studentId: string]: { status: AttendanceStatus; reason?: string | null } } = {};
      academicLevelData.students.forEach(student => {
        const record = studentAttendance[student.id];
        if (record) {
          attendanceRecordsPayload[student.id] = {
            status: record.status,
            reason: record.reason || null
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
      fetchAttendanceData(); // Re-fetch to confirm and update UI
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      setError(err.message || "Failed to save attendance.");
      showStatus('error', err.message || "Failed to save attendance.");
    } finally {
      setIsSaving(false);
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
    showStatus('success', `All visible students marked as ${status}.`);
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
        staggerChildren: 0.07,
        delayChildren: 0.2,
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

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-300';
      case 'TARDY': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusButtonClass = (status: AttendanceStatus, currentStatus: AttendanceStatus) => {
    const base = 'px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200';
    if (status === currentStatus) {
      switch (status) {
        case 'PRESENT': return `${base} bg-green-600 text-white shadow-md`;
        case 'ABSENT': return `${base} bg-red-600 text-white shadow-md`;
        case 'TARDY': return `${base} bg-yellow-600 text-white shadow-md`;
        case 'EXCUSED': return `${base} bg-blue-600 text-white shadow-md`;
      }
    }
    return `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-700">
        <div className="text-xl font-semibold flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-xl">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 min-h-screen flex flex-col items-center justify-center">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-extrabold text-red-800 mb-4">Oops! Something Went Wrong</h2>
        <p className="text-red-700 mb-8 max-w-md">{error}</p>
        <button
          onClick={fetchAttendanceData}
          className={`inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg shadow-md
                      hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
        >
          <span className="fas fa-sync-alt"></span> Try Again
        </button>
      </div>
    );
  }

  if (!academicLevelData) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">Academic Level Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">The academic level you are looking for could not be loaded. It might not exist or you might not have access.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg shadow-md
                      hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
        >
          <ArrowLeftIcon className="h-6 w-6" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 font-inter text-gray-800">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-100">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-200 mb-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className={`p-3 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
              aria-label="Back to previous page"
            >
              <ArrowLeftIcon className="h-7 w-7" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Attendance for <span style={{ color: primaryColor }}>{academicLevelData.academicLevelInfo.name}</span>
              </h1>
              <p className="text-md text-gray-600 mt-2">Managing attendance for {academicLevelData.academicLevelInfo.studentsCount} students.</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200">
            <CalendarDaysIcon className="h-6 w-6 text-gray-500" />
            <input
              type="date"
              className="bg-transparent text-gray-700 font-semibold text-lg focus:outline-none cursor-pointer"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              aria-label="Select attendance date"
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
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 font-medium shadow-md ${
                statusMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
              )}
              {statusMessage.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Bulk Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-center mb-8">
          <div className="relative w-full sm:w-1/2 md:w-2/5">
            <input
              type="text"
              placeholder="Search student by name or ID..."
              className={`w-full p-3 pl-12 rounded-full border border-gray-300 shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                          text-gray-900 placeholder-gray-500 bg-white text-base`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search students"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end w-full sm:w-auto">
            <button
              onClick={() => handleBulkAttendanceChange('PRESENT')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg border border-green-300 bg-green-50 text-green-700
                          hover:bg-green-100 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleBulkAttendanceChange('ABSENT')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg border border-red-300 bg-red-50 text-red-700
                          hover:bg-red-100 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
            >
              Mark All Absent
            </button>
          </div>
        </motion.div>

        {/* Student Attendance List */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <motion.div
                key={student.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col items-center text-center
                           hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer"
                variants={itemVariants}
              >
                <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                  {student.profilePicture ? (
                    <Image
                      src={student.profilePicture}
                      alt={student.name}
                      loader={loader}
                      layout="fill"
                      objectFit="cover"
                      className="absolute"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        // Fallback to initial letter avatar
                        e.currentTarget.src = `https://placehold.co/80x80/${primaryColor.replace('#', '')}/FFFFFF?text=${student.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <UserCircleIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{student.name}</h3>
                <p className="text-sm text-gray-500 mb-4">ID: {student.id}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
                  {['PRESENT', 'ABSENT', 'TARDY', 'EXCUSED'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleAttendanceChange(student.id, status as AttendanceStatus)}
                      className={getStatusButtonClass(status as AttendanceStatus, studentAttendance[student.id]?.status)}
                      aria-pressed={studentAttendance[student.id]?.status === status}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="w-full">
                  <label htmlFor={`reason-${student.id}`} className="sr-only">Reason for {student.name}</label>
                  <input
                    type="text"
                    id={`reason-${student.id}`}
                    value={studentAttendance[student.id]?.reason || ''}
                    onChange={(e) => handleReasonChange(student.id, e.target.value)}
                    placeholder="Add a reason (optional)"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent transition-all duration-200"
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-full p-10 text-center bg-gray-50 rounded-xl shadow-md border border-gray-200"
              variants={itemVariants}
            >
              <UserCircleIcon className="h-20 w-20 mx-auto mb-6 text-gray-300" />
              <p className="text-xl font-semibold text-gray-700 mb-3">No students found!</p>
              <p className="text-md text-gray-600">It seems there are no students in this academic level, or your search did not yield any results.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Save Attendance Button */}
        {filteredStudents.length > 0 && (
          <motion.div variants={itemVariants} className="mt-10 text-center">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className={`inline-flex items-center gap-3 px-10 py-4 bg-[${primaryColor}] text-white rounded-xl shadow-xl font-bold text-lg
                          hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                          ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  Save Attendance
                  <CheckCircleIcon className="h-6 w-6" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}