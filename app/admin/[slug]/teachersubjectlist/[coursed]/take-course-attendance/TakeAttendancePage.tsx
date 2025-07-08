'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserCircleIcon, // For student avatar placeholder
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date picker icon
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with student data and mock attendance records
      {
        id: 'CL101',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
        room: 'Room 101',
        students: [
          { studentId: 'S001', name: 'Alice Smith', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=AS' },
          { studentId: 'S002', name: 'Bob Johnson', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=BJ' },
          { studentId: 'S003', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100/28A745/FFFFFF?text=CB' },
          { studentId: 'S004', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100/007BFF/FFFFFF?text=DP' },
          { studentId: 'S005', name: 'Ethan Hunt', avatarUrl: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=EH' },
          { studentId: 'S006', name: 'Fiona Gallagher', avatarUrl: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=FG' },
          { studentId: 'S007', name: 'George Costanza', avatarUrl: 'https://placehold.co/100x100/4169E1/FFFFFF?text=GC' },
          { studentId: 'S008', name: 'Hannah Montana', avatarUrl: 'https://placehold.co/100x100/FF4500/FFFFFF?text=HM' },
        ],
        // Mock attendance records for demonstration (e.g., for a previous date)
        attendanceRecords: {
          '2025-07-01': {
            'S001': 'Present', 'S002': 'Absent', 'S003': 'Late', 'S004': 'Excused',
            'S005': 'Present', 'S006': 'Present', 'S007': 'Absent', 'S008': 'Present',
          },
        } as Record<string, Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>,
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
        room: 'Room 102',
        students: [
          { studentId: 'S009', name: 'Isabelle Lightwood', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=IL' },
          { studentId: 'S010', name: 'Jacob Black', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=JB' },
        ],
        attendanceRecords: {} as Record<string, Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>,
      },
    ]
  },
});

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

interface TakeAttendancePageProps {
  classId: string; // The ID of the class for which to take attendance
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class Roster)
}

interface Student {
  studentId: string;
  name: string;
  avatarUrl?: string;
}

interface TeacherClass {
  id: string;
  name: string;
  grade: string;
  studentsEnrolled: number;
  schedule: string;
  room: string;
  students: Student[];
  attendanceRecords: Record<string, Record<string, AttendanceStatus>>;
}

export default function TakeAttendancePage({ classId }: TakeAttendancePageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  const [studentAttendance, setStudentAttendance] = useState<{ [studentId: string]: 'Present' | 'Absent' | 'Late' | 'Excused' }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);

    if (foundClass) {
      // Initialize attendance for all students as 'Present' by default
      // Or load existing attendance for the selected date if available
      const initialAttendance: { [studentId: string]: 'Present' | 'Absent' | 'Late' | 'Excused' } = {};
      foundClass.students.forEach((student: any) => {
        initialAttendance[student.studentId] = 'Present'; // Default to Present
      });

      // If there's existing attendance for this date, load it
      if (foundClass.attendanceRecords && foundClass.attendanceRecords[attendanceDate]) {
        Object.assign(initialAttendance, foundClass.attendanceRecords[attendanceDate]);
      }
      setStudentAttendance(initialAttendance);
    }
  }, [classId, storeFormData?.teacherClasses, attendanceDate]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    if (!currentClass) {
      showStatus('error', 'No class selected.');
      return;
    }

    console.log(`Saving attendance for ${currentClass.name} on ${attendanceDate}:`, studentAttendance);
    // In a real application, you would send this data to your backend API
    // e.g., fetch('/api/attendance', { method: 'POST', body: JSON.stringify({ classId, date: attendanceDate, attendance: studentAttendance }) });

    showStatus('success', `Attendance saved successfully for ${currentClass.name} on ${attendanceDate}!`);
  };

  const handleBulkAttendanceChange = (status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    const updatedAttendance: { [studentId: string]: 'Present' | 'Absent' | 'Late' | 'Excused' } = {};
    filteredStudents.forEach((student: any) => {
      updatedAttendance[student.studentId] = status;
    });
    setStudentAttendance(updatedAttendance);
  };

  const filteredStudents = currentClass?.students?.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for attendance.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back to Class List
        </button>
      </div>
    );
  }

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
            onClick={() => window.history.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class Roster"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Take Attendance <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Mark attendance for {currentClass.studentsEnrolled} students.</p>
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
            onClick={() => handleBulkAttendanceChange('Present')}
            className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700
                        hover:bg-green-50 hover:text-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkAttendanceChange('Absent')}
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
          filteredStudents.map((student: any) => (
            <motion.div
              key={student.studentId}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              {student.avatarUrl ? (
                <img
                  src={customLoader({ src: student.avatarUrl, width: 80 })}
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
                  {['Present', 'Absent', 'Late', 'Excused'].map(status => (
                    <label key={status} className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`attendance-${student.studentId}`}
                        value={status}
                        checked={studentAttendance[student.studentId] === status}
                        onChange={() => handleAttendanceChange(student.studentId, status as any)}
                        className={`form-radio h-5 w-5 text-[${primaryColor}] border-gray-300 focus:ring-[${primaryColor}]`}
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
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
          >
            Save Attendance
            <CheckCircleIcon className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
