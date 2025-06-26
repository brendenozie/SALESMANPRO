'use client';

import React from 'react';
import {
  AcademicCapIcon, // For overall classes
  CalendarDaysIcon, // For date
  BookOpenIcon, // For individual classes/courses
  UsersIcon, // For teacher
  ClockIcon, // For schedule
  ClipboardDocumentListIcon, // For assignments
  ChartBarIcon, // For grades
  MapPinIcon
} from '@heroicons/react/24/outline';

// Sample Data for the Student's Classes Page
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

const studentEnrolledClasses = [
  {
    id: 'CL101',
    name: 'Grade 7 Mathematics', // Assuming CL101 is now 'Grade 7 Mathematics' for Jane (can vary by implementation)
    teacher: 'Mr. John Doe',
    schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
    room: 'Room 101',
    currentGrade: 'A-', // Sample grade in this class
    upcomingAssignmentsCount: 2,
    nextAssignmentDue: 'July 1',
  },
  {
    id: 'CL102',
    name: 'Grade 8 English Language',
    teacher: 'Mrs. Jane Smith',
    schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
    room: 'Room 102',
    currentGrade: 'B+',
    upcomingAssignmentsCount: 1,
    nextAssignmentDue: 'July 5',
  },
  {
    id: 'CL103',
    name: 'Grade 8 Science', // Assuming this is Jane's actual science class
    teacher: 'Ms. Emily White',
    schedule: 'Mon, Wed | 1:00 PM - 1:45 PM',
    room: 'Lab 2',
    currentGrade: 'A',
    upcomingAssignmentsCount: 0, // No upcoming for this one
    nextAssignmentDue: 'None',
  },
  {
    id: 'CL104',
    name: 'Grade 8 History', // Assuming this is Jane's actual history class
    teacher: 'Mr. David Green',
    schedule: 'Tue, Thu | 2:00 PM - 2:45 PM',
    room: 'Room 203',
    currentGrade: 'B',
    upcomingAssignmentsCount: 1,
    nextAssignmentDue: 'July 10',
  },
];

export default function StudentClassesPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalClasses = studentEnrolledClasses.length;
  const classesWithUpcomingAssignments = studentEnrolledClasses.filter(
    (cls) => cls.upcomingAssignmentsCount > 0
  ).length;

  // Placeholder function for navigation (e.g., to class detail or assignments page)
  const handleViewDetails = (classId: string, className: string, section: string) => {
    console.log(`Navigating to ${section} for Class ID: ${classId} (${className})`);
    alert(`Viewing ${section} for: ${className}`); // Placeholder
    // In a real app, you would use a router (e.g., Next.js useRouter)
    // Router.push(`/student/classes/${classId}/${section}`);
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-green-100 text-green-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Enrolled Classes
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Overview of your academic schedule, {studentName}.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalClasses}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentListIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Classes with Upcoming Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{classesWithUpcomingAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Grade Level</p>
              <h2 className="text-3xl font-bold text-gray-800">{studentGradeLevel}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* List of Enrolled Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studentEnrolledClasses.length > 0 ? (
          studentEnrolledClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
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
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span>Room: {cls.room}</span>
                  </div>
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
                  onClick={() => handleViewDetails(cls.id, cls.name, 'assignments')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                             hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Assignments <ClipboardDocumentListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewDetails(cls.id, cls.name, 'grades')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md shadow-sm
                             hover:bg-indigo-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Grades <ChartBarIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200">
            <AcademicCapIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">You are not currently enrolled in any classes.</p>
            <p className="text-sm mt-2">Please contact your academic advisor if you believe this is incorrect.</p>
          </div>
        )}
      </div>
    </div>
  );
}
