'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardDocumentListIcon, // Main icon for assignments
  PlusCircleIcon, // Add assignment
  PencilIcon, // Edit assignment
  TrashIcon, // Delete assignment
  MagnifyingGlassIcon, // Search
  CalendarDaysIcon, // Date
  BookOpenIcon, // Course icon
  UserIcon, // Instructor icon
  TagIcon, // Academic Level icon
  ClockIcon, // Due Date icon
  ChartBarIcon, // Max Grade icon
  DocumentCheckIcon, // Total Submissions icon
  XMarkIcon, // Error close
} from '@heroicons/react/24/outline';

import AssignmentFormModal from './AssignmentFormModal'; // Import the new modal component

// --- Type Definitions (matching API response) ---
export type CourseAssignmentType = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseInstructorName?: string;
  courseAcademicLevels: { id: string; name: string }[];
  title: string;
  description?: string | null;
  dueDate: Date; // Will be Date object after transformation
  maxGrade?: number | null;
  assignedAt: Date;
  updatedAt: Date;
  totalSubmissions: number; // Calculated on backend
};

export type CourseOption = {
  id: string;
  title: string;
  instructorName?: string;
  academicLevels: { id: string; name: string }[];
};

export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

interface CourseAssignmentsClientProps {
  initialAssignments: CourseAssignmentType[];
  allCourses: CourseOption[];
  allAcademicLevels: AcademicLevelOption[];
  companyId: string;
  apiBaseUrl: string;
}

export default function CourseAssignmentsClient({ initialAssignments, allCourses, allAcademicLevels, companyId, apiBaseUrl }: CourseAssignmentsClientProps) {
  // Convert ISO strings to Date objects for initial data
  const parsedInitialAssignments = useMemo(() => initialAssignments.map(assign => ({
    ...assign,
    dueDate: new Date(assign.dueDate),
    assignedAt: new Date(assign.assignedAt),
    updatedAt: new Date(assign.updatedAt),
  })), [initialAssignments]);

  const [assignments, setAssignments] = useState<CourseAssignmentType[]>(parsedInitialAssignments);
  const [courses, setCourses] = useState<CourseOption[]>(allCourses);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterAcademicLevel, setFilterAcademicLevel] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CourseAssignmentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const assignmentsRes = await fetch(`${apiBaseUrl}/course-assignments?companyId=${encodeURIComponent(companyId)}`);
      const coursesRes = await fetch(`${apiBaseUrl}/courses?companyId=${encodeURIComponent(companyId)}`);
      const academicLevelsRes = await fetch(`${apiBaseUrl}/academic-levels?companyId=${encodeURIComponent(companyId)}`);

      if (assignmentsRes.ok) {
        const data: CourseAssignmentType[] = await assignmentsRes.json();
        setAssignments(data.map(assign => ({
          ...assign,
          dueDate: new Date(assign.dueDate),
          assignedAt: new Date(assign.assignedAt),
          updatedAt: new Date(assign.updatedAt),
        })));
      } else {
        const errorData = await assignmentsRes.json();
        setError(errorData.message || "Failed to fetch course assignments.");
        setAssignments(parsedInitialAssignments);
      }

      if (coursesRes.ok) {
        const fetchedCourses = (await coursesRes.json()) as any[];
        setCourses(fetchedCourses.map(c => ({
          id: c.id,
          title: c.title,
          instructorName: c.instructorName,
          academicLevels: c.academicLevels,
        })));
      } else {
        const errorData = await coursesRes.json();
        setError(errorData.message || "Failed to fetch courses.");
        setCourses(allCourses);
      }

      if (academicLevelsRes.ok) {
        const data: AcademicLevelOption[] = await academicLevelsRes.json();
        setAcademicLevels(data);
      } else {
        const errorData = await academicLevelsRes.json();
        setError(errorData.message || "Failed to fetch academic levels.");
        setAcademicLevels(allAcademicLevels);
      }

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
      setAssignments(parsedInitialAssignments);
      setCourses(allCourses);
      setAcademicLevels(allAcademicLevels);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId, parsedInitialAssignments, allCourses, allAcademicLevels]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (parsedInitialAssignments.length === 0 || allCourses.length === 0 || allAcademicLevels.length === 0) {
      fetchAllData();
    }
  }, [fetchAllData, parsedInitialAssignments, allCourses, allAcademicLevels]);


  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = (assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (assignment.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (assignment.courseInstructorName?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

      const matchesCourse = filterCourse === 'All' || assignment.courseId === filterCourse;

      // Check if assignment's course is associated with the filtered academic level
      const matchesAcademicLevel = filterAcademicLevel === 'All' ||
                                   assignment.courseAcademicLevels.some(al => al.id === filterAcademicLevel);

      return matchesSearch && matchesCourse && matchesAcademicLevel;
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date
  }, [assignments, searchTerm, filterCourse, filterAcademicLevel]);

  // --- API Interaction Functions ---
  const handleSaveAssignment = async (assignmentData: Omit<CourseAssignmentType, 'id' | 'courseTitle' | 'courseInstructorName' | 'courseAcademicLevels' | 'assignedAt' | 'updatedAt' | 'totalSubmissions'> & { id?: string }) => {
    setIsLoading(true);
    setError(null);
    const method = assignmentData.id ? 'PATCH' : 'POST';
    try {

      const url = assignmentData.id ? `${apiBaseUrl}/course-assignments/${assignmentData.id}` : `${apiBaseUrl}/course-assignments`;

      const payload = {
        ...assignmentData,
        dueDate: assignmentData.dueDate.toISOString(), // Convert Date object back to ISO string for API
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchAllData(); // Re-fetch to get the latest data
        setShowFormModal(false);
        setEditingAssignment(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} assignment.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} assignment.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment? This action cannot be undone and may affect linked submissions.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/course-assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete assignment.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting assignment.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalAssignments = assignments.length;
  const upcomingAssignments = assignments.filter(a => a.dueDate > new Date()).length;
  const overdueAssignments = assignments.filter(a => a.dueDate < new Date() && a.totalSubmissions === 0).length;


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <ClipboardDocumentListIcon className="h-10 w-10 text-pink-600" />
            Course Assignments Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Manage all assignments across all courses in your institution.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-pink-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Assignments</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalAssignments}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <CalendarDaysIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Upcoming Assignments</p>
            <h2 className="text-3xl font-bold text-gray-800">{upcomingAssignments}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <ClockIcon className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Overdue Assignments (No Submissions)</p>
            <h2 className="text-3xl font-bold text-gray-800">{overdueAssignments}</h2>
          </div>
        </div>
      </div>

      {/* Assignments List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-500" /> All Assignments
          </h3>
          <button
            onClick={() => { setEditingAssignment(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Assignment
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, description, course, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterAcademicLevel}
              onChange={(e) => setFilterAcademicLevel(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Academic Levels</option>
              {academicLevels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Assignment Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course & Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-xs text-gray-500 truncate w-64">{assignment.description || 'No description.'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/admin/${companyId}/courses/${assignment.courseId}/materials`} 
                        // {/* Link to course materials for context */}
                        className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                        title={`View materials for ${assignment.courseTitle}`}
                      >
                        <BookOpenIcon className="h-4 w-4" /> {assignment.courseTitle || 'N/A'}
                      </Link>
                      {assignment.courseInstructorName && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <UserIcon className="h-3 w-3 text-gray-400" /> {assignment.courseInstructorName}
                        </div>
                      )}
                      {assignment.courseAcademicLevels && assignment.courseAcademicLevels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assignment.courseAcademicLevels.map(level => (
                            <span key={level.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <TagIcon className="h-3 w-3 mr-1" /> {level.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-gray-500" /> {assignment.dueDate.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {assignment.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="h-4 w-4 text-gray-500" /> {assignment.maxGrade || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <DocumentCheckIcon className="h-4 w-4 text-gray-500" /> {assignment.totalSubmissions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingAssignment(assignment); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Assignment"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Assignment"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No assignments found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add a new assignment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <AssignmentFormModal
          assignmentData={editingAssignment}
          onClose={() => { setShowFormModal(false); setEditingAssignment(null); }}
          onSave={handleSaveAssignment}
          isLoading={isLoading}
          allCourses={courses} // Pass all courses for selection
        />
      )}
    </div>
  );
}
