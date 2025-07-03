'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon, // For classes/education
  CalendarDaysIcon, // For date
  BookOpenIcon, // For classes list
  UsersIcon, // For students enrolled
  ClockIcon, // For schedule
  MapPinIcon, // For room
  ArrowRightIcon, // For view details
  EllipsisVerticalIcon, // For class action dropdown
  TrashIcon, // For Delete Class (request)
  ClipboardDocumentListIcon, // For Manage Assignments
  ChatBubbleBottomCenterTextIcon, // For Send Message
  MagnifyingGlassIcon, // For search
  ClipboardDocumentCheckIcon, // For Take Attendance
  ChartBarIcon, // For Consolidated Grades/Reports
  CloudArrowUpIcon, // For Upload Resources
  PlusIcon, // For Add Class Event
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

import { useRouter } from "next/navigation";

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherInfo: { // Mock teacher's own profile info
      name: "Mr. John Doe",
      role: "Mathematics Teacher",
    },
    teacherClasses: [ // Sample classes assigned to this teacher
      {
        id: 'CL101',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
        room: 'Room 101',
        description: 'Foundational concepts of algebra and geometry, focusing on critical thinking and problem-solving skills.',
        students: [
          { studentId: 'S001', name: 'Alice Smith', email: 'alice.s@example.com', parentEmail: 'parent.alice@example.com' },
          { studentId: 'S002', name: 'Bob Johnson', email: 'bob.j@example.com', parentEmail: 'parent.bob@example.com' },
          { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
          { studentId: 'S005', name: 'Fatuma Hassan', email: 'fatuma.h@example.com', parentEmail: 'parent.fatuma@example.com' },
        ],
        assignments: [{ id: 'A001', title: 'Algebra Worksheet 1', dueDate: '2025-07-10', status: 'pending' }],
        resources: [{ id: 'R001', name: 'Math Syllabus', type: 'PDF' }],
        events: [{ id: 'E001', name: 'Math Club Meeting', date: '2025-07-15', time: '3:00 PM' }],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
        room: 'Room 102',
        description: 'Developing critical reading, writing, and communication skills through literature analysis and essay writing.',
        students: [
          { studentId: 'S003', name: 'Charlie Brown', email: 'charlie.b@example.com', parentEmail: 'parent.charlie@example.com' },
          { studentId: 'S004', name: 'Michael Njoroge', email: 'michael.n@example.com', parentEmail: 'parent.michael@example.com' },
          { studentId: 'S006', name: 'Daniel Maina', email: 'daniel.m@example.com', parentEmail: 'parent.daniel@example.com' },
        ],
        assignments: [{ id: 'A002', title: 'Essay Outline', dueDate: '2025-07-12', status: 'completed' }],
        resources: [{ id: 'R002', name: 'Grammar Guide', type: 'Doc' }],
        events: [{ id: 'E002', name: 'Poetry Reading', date: '2025-07-20', time: '2:00 PM' }],
      },
      {
        id: 'CL103',
        name: 'Grade 9 Algebra',
        grade: '9',
        studentsEnrolled: 28,
        schedule: 'Mon, Wed | 1:00 PM - 1:45 PM',
        room: 'Room 103',
        description: 'Intermediate algebra topics and problem-solving strategies, preparing students for advanced mathematics.',
        students: [
          { studentId: 'S007', name: 'Olivia Davis', email: 'olivia.d@example.com', parentEmail: 'parent.olivia@example.com' },
          { studentId: 'S008', name: 'Liam Wilson', email: 'liam.w@example.com', parentEmail: 'parent.liam@example.com' },
        ],
        assignments: [], resources: [], events: [],
      },
      {
        id: 'CL104',
        name: 'Grade 10 Geometry',
        grade: '10',
        studentsEnrolled: 22,
        schedule: 'Tue, Thu | 1:00 PM - 1:45 PM',
        room: 'Room 205',
        description: 'Exploration of geometric principles and theorems, including proofs and real-world applications.',
        students: [], assignments: [], resources: [], events: [],
      },
    ]
  },
});

export default function TeachersClassListPage() {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext(); // Using mock for consistent data and colors

  const router = useRouter();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107"; // Ensure accentColor is picked up

  const teacherName = storeFormData?.teacherInfo?.name || "Teacher";
  const teacherRole = storeFormData?.teacherInfo?.role || "Educator";
  const teacherClasses = storeFormData?.teacherClasses || [];

  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Filter classes based on search term
  const filteredClasses = teacherClasses.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Placeholder Functions for Class Management ---
  const handleViewRoster = (classId: string, className: string, students: any[]) => {
    console.log(`Navigating to roster for Class ID: ${classId} (${className})`);
    // In a real app, use router.push(`/teacher/classes/${classId}/roster`);
    // alert(`Functionality: View Roster for "${className}"\nStudents: ${students.map(s => s.name).join(', ')}\n(See console for full student details)`);
    // console.log('Student Roster Details:', students);

    //Navigate to Student Roster Page

    router.push(`/admin/${classId}/teacherclasseslist/student-roster`); // Adjust the path as needed


  };

  const handleTakeAttendance = (classId: string, className: string) => {
    console.log(`Taking Attendance for Class ID: ${classId} (${className})`);
    // In a real app, open an attendance marking interface
    alert(`Functionality: Take Attendance for "${className}"`);
  };

  const handleViewConsolidatedGrades = (classId: string, className: string) => {
    console.log(`Viewing Consolidated Grades for Class ID: ${classId} (${className})`);
    // In a real app, navigate to a consolidated grades view
    alert(`Functionality: View Consolidated Grades for "${className}"`);
  };

  const handleManageAssignments = (classId: string, className: string) => {
    console.log(`Managing Assignments for Class ID: ${classId} (${className})`);
    // In a real app, navigate to an assignments management page for this class
    alert(`Functionality: Manage Assignments for "${className}"`);
  };

  const handleUploadResources = (classId: string, className: string) => {
    console.log(`Uploading Resources for Class ID: ${classId} (${className})`);
    // In a real app, open a file upload interface
    alert(`Functionality: Upload Resources for "${className}"`);
  };

  const handleViewClassSchedule = (classId: string, className: string) => {
    console.log(`Viewing Class Schedule for Class ID: ${classId} (${className})`);
    // In a real app, navigate to a class-specific schedule view
    alert(`Functionality: View Class Schedule for "${className}"`);
  };

  const handleAddClassEvent = (classId: string, className: string) => {
    console.log(`Adding Class Event for Class ID: ${classId} (${className})`);
    // In a real app, open a modal to add a new event to the class calendar
    alert(`Functionality: Add Class Event for "${className}"`);
  };

  const handleSendMessage = (classId: string, className: string) => {
    console.log(`Sending Message to Class ID: ${classId} (${className})`);
    // In a real app, open a messaging interface pre-populated with class recipients
    alert(`Functionality: Send Message to "${className}"`);
  };

  const handleGenerateReports = (classId: string, className: string) => {
    console.log(`Generating Reports for Class ID: ${classId} (${className})`);
    // In a real app, open a report generation interface
    alert(`Functionality: Generate Reports for "${className}"`);
  };

  const handleDeleteClassRequest = (classId: string, className: string) => {
    if (window.confirm(`Are you sure you want to request deletion of "${className}"? This will send a request to the admin.`)) {
      console.log(`Requesting deletion of Class ID: ${classId} (${className})`);
      // In a real app, send a deletion request to the admin
      alert(`Functionality: Deletion Request for "${className}" sent to Admin (Simulated)`);
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Classes <span style={{ color: primaryColor }}>📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Overview of all classes assigned to {teacherName}, {teacherRole}.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <span>{today}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search classes by name, grade, or description..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                     text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Classes List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <motion.div
              key={cls.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out relative"
              variants={itemVariants}
            >
              {/* Action Dropdown */}
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <button
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click from closing dropdown
                      // Toggle dropdown visibility for this specific card
                      const dropdown = e.currentTarget.nextElementSibling;
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                      }
                    }}
                  >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                  </button>
                  <div className="hidden absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                    <button
                      onClick={() => handleTakeAttendance(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ClipboardDocumentCheckIcon className={`h-5 w-5 text-[${accentColor}]`} /> Take Attendance
                    </button>
                    <button
                      onClick={() => handleViewConsolidatedGrades(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ChartBarIcon className={`h-5 w-5 text-blue-500`} /> View Consolidated Grades
                    </button>
                    <button
                      onClick={() => handleManageAssignments(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ClipboardDocumentListIcon className={`h-5 w-5 text-green-500`} /> Manage Assignments
                    </button>
                    <button
                      onClick={() => handleUploadResources(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <CloudArrowUpIcon className={`h-5 w-5 text-purple-500`} /> Upload Resources
                    </button>
                    <button
                      onClick={() => handleViewClassSchedule(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ClockIcon className={`h-5 w-5 text-indigo-500`} /> View Class Schedule
                    </button>
                    <button
                      onClick={() => handleAddClassEvent(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <PlusIcon className={`h-5 w-5 text-orange-500`} /> Add Class Event
                    </button>
                    <button
                      onClick={() => handleSendMessage(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ChatBubbleBottomCenterTextIcon className={`h-5 w-5 text-pink-500`} /> Send Message
                    </button>
                    <button
                      onClick={() => handleGenerateReports(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ChartBarIcon className={`h-5 w-5 text-teal-500`} /> Generate Reports
                    </button>
                    <div className="border-t border-gray-100 my-1"></div> {/* Separator */}
                    <button
                      onClick={() => handleDeleteClassRequest(cls.id, cls.name)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" /> Request Class Deletion
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpenIcon className={`h-6 w-6 text-[${primaryColor}]`} /> {cls.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{cls.description}</p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-gray-500" />
                    <span>Grade {cls.grade} | {cls.studentsEnrolled} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span>{cls.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span>{cls.room}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleViewRoster("683581bba1bdf6ca3624b530", cls.name, cls.students)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-[${accentColor}] text-gray-900 rounded-md shadow-sm
                              hover:bg-[${accentColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                >
                  View Student Roster <ArrowRightIcon className="h-4 w-4" />
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
            <p className="text-lg">No classes found matching your search.</p>
            <p className="text-sm mt-2">If you believe this is incorrect, please contact your administrator.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
