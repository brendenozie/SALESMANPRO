'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  UserCircleIcon, // For student avatar placeholder
  ChatBubbleBottomCenterTextIcon, // For direct message
  PencilIcon, // For add/edit note
  MagnifyingGlassIcon, // For search
  EnvelopeIcon, // For email parent
  IdentificationIcon,
  ArrowRightIcon,
  UsersIcon, // For student ID
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with student data
      {
        id: 'CL101',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
        room: 'Room 101',
        description: 'Foundational concepts of algebra and geometry.',
        students: [
          { studentId: 'S001', name: 'Alice Smith', email: 'alice.s@example.com', parentEmail: 'parent.alice@example.com', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=AS' },
          { studentId: 'S002', name: 'Bob Johnson', email: 'bob.j@example.com', parentEmail: 'parent.bob@example.com', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=BJ' },
          { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com', avatarUrl: 'https://placehold.co/100x100/28A745/FFFFFF?text=CB' },
          { studentId: 'S004', name: 'Diana Prince', email: 'diana.p@example.com', parentEmail: 'parent.diana@example.com', avatarUrl: 'https://placehold.co/100x100/007BFF/FFFFFF?text=DP' },
          { studentId: 'S005', name: 'Ethan Hunt', email: 'ethan.h@example.com', parentEmail: 'parent.ethan@example.com', avatarUrl: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=EH' },
          { studentId: 'S006', name: 'Fiona Gallagher', email: 'fiona.g@example.com', parentEmail: 'parent.fiona@example.com', avatarUrl: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=FG' },
          { studentId: 'S007', name: 'George Costanza', email: 'george.c@example.com', parentEmail: 'parent.george@example.com', avatarUrl: 'https://placehold.co/100x100/4169E1/FFFFFF?text=GC' },
          { studentId: 'S008', name: 'Hannah Montana', email: 'hannah.m@example.com', parentEmail: 'parent.hannah@example.com', avatarUrl: 'https://placehold.co/100x100/FF4500/FFFFFF?text=HM' },
        ]
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
        room: 'Room 102',
        description: 'Developing critical reading, writing, and communication skills.',
        students: [
          { studentId: 'S009', name: 'Isabelle Lightwood', email: 'isabelle.l@example.com', parentEmail: 'parent.isabelle@example.com', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=IL' },
          { studentId: 'S010', name: 'Jacob Black', email: 'jacob.b@example.com', parentEmail: 'parent.jacob@example.com', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=JB' },
        ]
      },
      // ... more classes if needed
    ]
  },
});

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface StudentRosterPageProps {
  classId: string; // The ID of the class whose roster to display
  // onBack: () => void; // Callback to navigate back to the class list
}

export default function StudentRosterPage({ classId, }: StudentRosterPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [searchTerm, setSearchTerm] = useState('');
  const [currentClass, setCurrentClass] = useState<any | null>(null);

  useEffect(() => {
    // In a real application, you would fetch this class data from an API
    // For now, we find it in our mock data
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const filteredStudents = currentClass?.students?.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // --- Placeholder Functions for Student Management ---
  const handleViewStudentProfile = (studentId: string, studentName: string) => {
    console.log(`Navigating to profile for Student ID: ${studentId} (${studentName})`);
    // In a real app, use router.push(`/teacher/students/${studentId}/profile`);
    alert(`Functionality: View Profile for "${studentName}"`);
  };

  const handleSendMessageToStudent = (studentId: string, studentName: string, studentEmail?: string) => {
    console.log(`Sending message to Student ID: ${studentId} (${studentName})`);
    // In a real app, open a messaging interface
    alert(`Functionality: Send Message to "${studentName}" (Email: ${studentEmail || 'N/A'})`);
  };

  const handleSendMessageToParent = (studentId: string, studentName: string, parentEmail?: string) => {
    console.log(`Sending message to Parent of Student ID: ${studentId} (${studentName})`);
    // In a real app, open a messaging interface
    alert(`Functionality: Send Message to Parent of "${studentName}" (Email: ${parentEmail || 'N/A'})`);
  };

  const handleAddEditStudentNote = (studentId: string, studentName: string) => {
    console.log(`Adding/Editing note for Student ID: ${studentId} (${studentName})`);
    // In a real app, open a modal for adding/editing notes
    alert(`Functionality: Add/Edit Note for "${studentName}"`);
  };

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

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class could not be loaded.</p>
        <button
          onClick={
            () => window.history.back() // Navigate back to the previous page
          }
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
            onClick={
              () => window.history.back()
            }
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Student Roster <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Currently viewing {currentClass.studentsEnrolled} students in Grade {currentClass.grade}.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search students by name or ID..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                     text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Student List Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student: any) => (
            <motion.div
              key={student.studentId}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              {student.avatarUrl ? (
                <img
                  src={customLoader({ src: student.avatarUrl, width: 100 })}
                  alt={student.name}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-100 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/100x100/${primaryColor.replace('#', '')}/FFFFFF?text=${student.name.split(' ').map((n: string) => n[0]).join('')}`;
                  }}
                />
              ) : (
                <UserCircleIcon className={`w-24 h-24 text-gray-300 mb-4`} />
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <IdentificationIcon className="h-4 w-4 text-gray-400" /> {student.studentId}
              </p>

              <div className="mt-6 w-full space-y-3">
                <button
                  onClick={() => handleViewStudentProfile(student.studentId, student.name)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium
                              hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                >
                  View Profile <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSendMessageToStudent(student.studentId, student.name, student.email)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-[${accentColor}] text-gray-900 rounded-md text-sm font-medium
                              hover:bg-[${accentColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                >
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> Message Student
                </button>
                {student.parentEmail && (
                  <button
                    onClick={() => handleSendMessageToParent(student.studentId, student.name, student.parentEmail)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium
                                hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400`}
                  >
                    <EnvelopeIcon className="h-4 w-4" /> Message Parent
                  </button>
                )}
                <button
                  onClick={() => handleAddEditStudentNote(student.studentId, student.name)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium
                              hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
                >
                  <PencilIcon className="h-4 w-4" /> Add/Edit Note
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No students found in this class or matching your search.</p>
            <p className="text-sm mt-2">Please ensure the correct class is selected or adjust your search term.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
