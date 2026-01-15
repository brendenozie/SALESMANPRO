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
  IdentificationIcon, // For student ID
  ArrowRightIcon, // For view details
  UsersIcon, // Generic users icon
} from '@heroicons/react/24/outline';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export type StudentRosterStudent = {
  id: string; // Student ID
  userId: string; // User ID associated with the student
  name: string; // Student's name (from User model)
  email: string; // Student's email (from User model)
  profilePicture: string | null; // Student's profile picture (from Student model)
  parentId: string | null;
  parentEmail: string | null; // Parent's email (from Parent.User model)
  studentGrade: string | null; // From Student model
  
};

interface StudentRosterPageProps {
  students: StudentRosterStudent[];
  companyId: string; // Passed from server component for dynamic links
}

export default function StudentRosterPage({
  students,
  companyId,
}: StudentRosterPageProps) {
  
  const router = useRouter();

  const primaryColor = "#fd2121";
  const accentColor = "#FFC107";

  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students?.filter((student: StudentRosterStudent) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) // Search by Student ID
  );

  // --- Placeholder Functions for Student Management ---
  const handleViewStudentProfile = (studentId: string) => {
    router.push(`/admin/${companyId}/students/${studentId}/profile`); // Navigate to student profile page
  };

  const handleSendMessageToStudent = (studentId: string, studentName: string, studentEmail?: string) => {
    console.log(`Sending message to Student ID: ${studentId} (${studentName})`);
    // In a real app, open a messaging interface pre-populated for this student
    alert(`Functionality: Send Message to "${studentName}" (Email: ${studentEmail || 'N/A'})`);
  };

  const handleSendMessageToParent = (studentId: string, studentName: string, parentEmail?: string) => {
    console.log(`Sending message to Parent of Student ID: ${studentId} (${studentName})`);
    // In a real app, open a messaging interface pre-populated for this student's parent
    alert(`Functionality: Send Message to Parent of "${studentName}" (Email: ${parentEmail || 'N/A'})`);
  };

  const handleAddEditStudentNote = (studentId: string, studentName: string) => {
    console.log(`Adding/Editing note for Student ID: ${studentId} (${studentName})`);
    // In a real app, open a modal for adding/editing notes for this student
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
            onClick={() => router.back()} // Use router.back() for consistent navigation
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Student Roster 
              {/* <span style={{ color: primaryColor }}>{academicLevelInfo.name}</span> */}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Currently viewing 
              {/* {academicLevelInfo.studentsCount} students in {academicLevelInfo.name}. */}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search students by name or ID..."
          className={`w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white`}
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
        {filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student: StudentRosterStudent) => (
            <motion.div
              key={student.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col items-center text-center
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              {student.profilePicture ? (
                <img
                  src={student.profilePicture}
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
                <IdentificationIcon className="h-4 w-4 text-gray-400" /> {student.studentGrade ? `${student.studentGrade} | ` : ''} {student.id}
              </p>

              <div className="mt-6 w-full space-y-3">
                <button
                  onClick={() => handleViewStudentProfile(student.id)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm font-medium
                              hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                >
                  View Profile <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSendMessageToStudent(student.id, student.name, student.email)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                              bg-[${accentColor}] text-gray-900
                              hover:opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                  style={{ backgroundColor: accentColor }} // Apply accent color dynamically
                >
                  <ChatBubbleBottomCenterTextIcon className="h-4 w-4" /> Message Student
                </button>
                {student.parentEmail && (
                  <button
                    onClick={() => handleSendMessageToParent(student.id, student.name, student.parentEmail || '')}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium
                                hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400`}
                  >
                    <EnvelopeIcon className="h-4 w-4" /> Message Parent
                  </button>
                )}
                <button
                  onClick={() => handleAddEditStudentNote(student.id, student.name)}
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
