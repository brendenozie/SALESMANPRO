'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentListIcon, // For assignments overview
  MagnifyingGlassIcon, // For search
  UsersIcon, // For teachers/students count
  BookOpenIcon, // For class icon
  ChartBarIcon, // For grading/progress
  ExclamationTriangleIcon, // For overdue
  ClockIcon, // For pending marking
  CheckCircleIcon, // For graded
  TagIcon,
  EyeIcon, // For assignment type
} from '@heroicons/react/24/outline';

// Sample Data (Simplified and combined for admin view)
const allClassesForAdmin = [
  { id: 'CL101', name: 'Grade 7 Mathematics', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 35 },
  { id: 'CL102', name: 'Grade 8 English Language', teacherId: 'T002', teacherName: 'Mrs. Jane Smith', totalStudents: 30 },
  { id: 'CL103', name: 'Grade 9 Algebra', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 28 },
  { id: 'CL104', name: 'Grade 10 Geometry', teacherId: 'T001', teacherName: 'Mr. John Doe', totalStudents: 22 },
  { id: 'CL105', name: 'Grade 8 Science', teacherId: 'T003', teacherName: 'Ms. Emily White', totalStudents: 32 },
  { id: 'CL106', name: 'Grade 11 Physics', teacherId: 'T006', teacherName: 'Dr. Anne Ndugu', totalStudents: 20 },
];

const allSchoolAssignmentsRaw = [
  {
    id: 'ASG001',
    name: 'Algebra Homework Set 2',
    classId: 'CL103',
    dueDate: '2025-07-01', // Future
    type: 'Homework',
    totalPoints: 20,
    overallSubmissionStatus: 'Mixed', // How many students submitted
    overallGradingStatus: 'Pending Marking', // Teacher's grading progress
    submittedCount: 20,
    gradedCount: 5, // Example: 5 out of 20 submitted are graded
  },
  {
    id: 'ASG002',
    name: 'Literary Analysis Essay Draft',
    classId: 'CL102',
    dueDate: '2025-07-05', // Future
    type: 'Essay',
    totalPoints: 50,
    overallSubmissionStatus: 'None Submitted',
    overallGradingStatus: 'Not Started',
    submittedCount: 0,
    gradedCount: 0,
  },
  {
    id: 'ASG003',
    name: 'Geometry Midterm Review',
    classId: 'CL104',
    dueDate: '2025-06-25', // Past
    type: 'Review',
    totalPoints: 0,
    overallSubmissionStatus: 'All Submitted',
    overallGradingStatus: 'Completed',
    submittedCount: 22,
    gradedCount: 22,
  },
  {
    id: 'ASG004',
    name: 'Grade 7 Math Quiz 1',
    classId: 'CL101',
    dueDate: '2025-06-20', // Past
    type: 'Quiz',
    totalPoints: 10,
    overallSubmissionStatus: 'All Submitted',
    overallGradingStatus: 'Completed',
    submittedCount: 35,
    gradedCount: 35,
  },
  {
    id: 'ASG005',
    name: 'Science Lab Report - Photosynthesis',
    classId: 'CL105',
    dueDate: '2025-07-10', // Future
    type: 'Lab Report',
    totalPoints: 40,
    overallSubmissionStatus: 'Mixed',
    overallGradingStatus: 'Not Started',
    submittedCount: 15,
    gradedCount: 0,
  },
  {
    id: 'ASG006',
    name: 'Physics Kinematics Problem Set',
    classId: 'CL106',
    dueDate: '2025-07-03', // Future
    type: 'Homework',
    totalPoints: 25,
    overallSubmissionStatus: 'Mixed',
    overallGradingStatus: 'Pending Marking',
    submittedCount: 10,
    gradedCount: 2,
  },
  {
    id: 'ASG007',
    name: 'English Creative Writing Piece',
    classId: 'CL102',
    dueDate: '2025-06-28', // Future, soon
    type: 'Project',
    totalPoints: 75,
    overallSubmissionStatus: 'None Submitted',
    overallGradingStatus: 'Not Started',
    submittedCount: 0,
    gradedCount: 0,
  },
  {
    id: 'ASG008',
    name: 'Algebra II Midterm',
    classId: 'CL103',
    dueDate: '2025-07-08', // Future
    type: 'Exam',
    totalPoints: 100,
    overallSubmissionStatus: 'None Submitted',
    overallGradingStatus: 'Not Started',
    submittedCount: 0,
    gradedCount: 0,
  },
];

export default function AdminAssignmentsOverviewPage() {
  const [assignments, setAssignments] = useState(allSchoolAssignmentsRaw);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterTeacher, setFilterTeacher] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterGradingStatus, setFilterGradingStatus] = useState('All');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Enhance assignments with class and teacher info
  const enhancedAssignments = useMemo(() => {
    return assignments.map(assignment => {
      const classInfo = allClassesForAdmin.find(cls => cls.id === assignment.classId);
      return {
        ...assignment,
        className: classInfo ? classInfo.name : 'Unknown Class',
        teacherName: classInfo ? classInfo.teacherName : 'Unknown Teacher',
        totalStudentsInClass: classInfo ? classInfo.totalStudents : 0,
      };
    });
  }, [assignments]);

  const uniqueClasses = useMemo(() => Array.from(new Set(allClassesForAdmin.map(cls => JSON.stringify({ id: cls.id, name: cls.name })))).map(str => JSON.parse(str)).sort((a, b) => a.name.localeCompare(b.name)), []);
  
  const uniqueTeachers = useMemo(() => Array.from(new Set(allClassesForAdmin.map(cls => cls.teacherName))).sort(), []);
  
  const uniqueTypes = useMemo(() => Array.from(new Set(enhancedAssignments.map(a => a.type))).sort(), [enhancedAssignments]);
  
  const uniqueGradingStatuses = useMemo(() => Array.from(new Set(enhancedAssignments.map(a => a.overallGradingStatus))).sort(), [enhancedAssignments]);


  const filteredAssignments = enhancedAssignments.filter(assignment => {
    const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || assignment.classId === filterClass;
    const matchesTeacher = filterTeacher === 'All' || assignment.teacherName === filterTeacher;
    const matchesType = filterType === 'All' || assignment.type === filterType;
    const matchesGradingStatus = filterGradingStatus === 'All' || assignment.overallGradingStatus === filterGradingStatus;

    return matchesSearch && matchesClass && matchesTeacher && matchesType && matchesGradingStatus;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort by due date


  // Calculate overview stats
  const totalAssignments = enhancedAssignments.length;
  const assignmentsDueSoon = enhancedAssignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= sevenDaysFromNow && a.overallGradingStatus !== 'Completed';
  }).length;

  const overdueAssignments = enhancedAssignments.filter(a => {
    const dueDate = new Date(a.dueDate);
    const today = new Date();
    return dueDate < today && a.overallGradingStatus !== 'Completed'; // Overdue if past due date and not completed
  }).length;

  const pendingMarkingAssignments = enhancedAssignments.filter(a =>
    a.overallGradingStatus === 'Pending Marking' || a.overallGradingStatus === 'Not Started' && a.submittedCount > 0
  ).length;

  // Helper for status badge colors
  const getGradingStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending Marking': return 'bg-yellow-100 text-yellow-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'All Submitted': return 'bg-green-100 text-green-800';
      case 'Mixed': return 'bg-yellow-100 text-yellow-800';
      case 'None Submitted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Placeholder for detail view
  const handleViewDetails = (assignment: typeof enhancedAssignments[number]) => {
    console.log("Viewing details for assignment:", assignment);
    alert(`Showing more details for: ${assignment.name} (Class: ${assignment.className}, Teacher: ${assignment.teacherName})`);
    // In a real app, this might open a modal or navigate to a detailed report page for that assignment.
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Assignments Overview
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor assignments across all classes and teachers.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CalendarDaysIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assignments Due Soon</p>
              <h2 className="text-3xl font-bold text-gray-800">{assignmentsDueSoon}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{overdueAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Marking</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingMarkingAssignments}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* All Assignments List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
          <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> All School Assignments
        </h3>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by assignment, class, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Teachers</option>
              {uniqueTeachers.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterGradingStatus}
              onChange={(e) => setFilterGradingStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Grading Statuses</option>
              {uniqueGradingStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class (Teacher)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grading Progress</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.className} <br />
                      <span className="text-xs text-gray-400">({assignment.teacherName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800`}>
                            {assignment.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getSubmissionStatusColor(assignment.overallSubmissionStatus)}`}>
                            {assignment.submittedCount}/{assignment.totalStudentsInClass} ({assignment.overallSubmissionStatus})
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getGradingStatusColor(assignment.overallGradingStatus)}`}>
                        {assignment.overallGradingStatus}
                        {assignment.overallGradingStatus === 'Pending Marking' && assignment.submittedCount > 0 &&
                            ` (${assignment.gradedCount}/${assignment.submittedCount})` // Show graded count if pending
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
