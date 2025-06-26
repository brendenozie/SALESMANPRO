'use client';

import React from 'react';
import {
  AcademicCapIcon, // For classes/education
  CalendarDaysIcon, // For date
  BookOpenIcon, // For classes list
  UsersIcon, // For students enrolled
  ClockIcon, // For schedule
  MapPinIcon, // For room
  ArrowRightIcon, // For view details
} from '@heroicons/react/24/outline';

// Sample Data for the Teacher's Class List Page
const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name
const teacherRole = "Mathematics Teacher";

const teacherClasses = [
  {
    id: 'CL101',
    name: 'Grade 7 Mathematics',
    grade: '7',
    studentsEnrolled: 35,
    schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
    room: 'Room 101',
    description: 'Foundational concepts of algebra and geometry.',
    students: [ // Sample student roster for this class
        { studentId: 'S001', name: 'Alice Smith' },
        { studentId: 'S002', name: 'Bob Johnson' },
        { studentId: 'S003', name: 'Charlie Brown' },
        { studentId: 'S005', name: 'Fatuma Hassan' },
        // ... more students
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
     students: [ // Sample student roster for this class
        { studentId: 'S003', name: 'Charlie Brown' },
        { studentId: 'S004', name: 'Michael Njoroge' },
        { studentId: 'S006', name: 'Daniel Maina' },
        // ... more students
    ]
  },
  {
    id: 'CL103',
    name: 'Grade 9 Algebra',
    grade: '9',
    studentsEnrolled: 28,
    schedule: 'Mon, Wed | 1:00 PM - 1:45 PM',
    room: 'Room 103',
    description: 'Intermediate algebra topics and problem-solving strategies.',
     students: [ // Sample student roster for this class
        { studentId: 'S007', name: 'Olivia Davis' },
        { studentId: 'S008', name: 'Liam Wilson' },
        // ... more students
    ]
  },
   {
    id: 'CL104',
    name: 'Grade 10 Geometry',
    grade: '10',
    studentsEnrolled: 22,
    schedule: 'Tue, Thu | 1:00 PM - 1:45 PM',
    room: 'Room 205',
    description: 'Exploration of geometric principles and theorems.',
     students: [ // Sample student roster for this class
        { studentId: 'S009', name: 'Sophia Miller' },
        { studentId: 'S010', name: 'Noah Taylor' },
        // ... more students
    ]
  },
];

export default function TeachersClassListPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Function to simulate navigating to a class roster page
  const handleViewRoster = (classId: string, className: string) => {
    // In a real application, you would use a router (e.g., Next.js useRouter)
    // to navigate to a dynamic route like /teacher/classes/[classId]/roster
    console.log(`Navigating to roster for Class ID: ${classId} (${className})`);
    alert(`Viewing Roster for: ${className}\n(See console for student details if available)`); // Placeholder
    // Example: Router.push(`/teacher/classes/${classId}/roster`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Classes
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Overview of all classes assigned to {teacherName}.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Classes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherClasses.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                       hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
          >
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpenIcon className="h-6 w-6 text-indigo-500" /> {cls.name}
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
                onClick={() => handleViewRoster(cls.id, cls.name)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm
                           hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Student Roster <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {teacherClasses.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200">
            <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No classes assigned to you yet.</p>
            <p className="text-sm mt-2">Please contact your administrator if you believe this is incorrect.</p>
          </div>
        )}
      </div>
    </div>
  );
}
