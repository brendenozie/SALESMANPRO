'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CubeTransparentIcon,
  UsersIcon,
  StarIcon,
  TagIcon,
  UserIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  EnvelopeIcon,
  CreditCardIcon, // For credits
} from '@heroicons/react/24/outline';

import CourseFormModal from './CourseFormModal'; // Import the new modal component

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (matching API response) ---
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

// NEW: Type for educators in CourseType, including role
export type CourseEducator = {
  id: string;
  name: string;
  email?: string;
  roleInCourse?: string | null;
}

export type DepartmentOption = {
  id: string;
  name: string;
};

export type CourseType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  credits?: number | null; // NEW
  code: string; // NEW: Required unique code
  rating?: number | null;
  totalLessons: number; // Calculated on backend
  studentsEnrolled: number; // Calculated on backend
  companyId: string;
  departmentId?: string | null;
  departmentName?: string;
  academicLevels: AcademicLevelOption[]; // Array of assigned academic levels
  educators: CourseEducator[]; // NEW: Array of assigned educators with roles
  createdAt: string;
  updatedAt: string;
};

interface CoursesClientProps {
  initialCourses: CourseType[];
  allEducators: EducatorOption[];
  allDepartments: DepartmentOption[];
  allAcademicLevels: AcademicLevelOption[];
  companyId: string;
  apiBaseUrl: string;
}

export default function CoursesClient({ initialCourses, allEducators, allDepartments, allAcademicLevels, companyId, apiBaseUrl }: CoursesClientProps) {
  const [courses, setCourses] = useState<CourseType[]>(initialCourses);
  const [educators, setEducators] = useState<EducatorOption[]>(allEducators);
  const [departments, setDepartments] = useState<DepartmentOption[]>(allDepartments);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterAcademicLevel, setFilterAcademicLevel] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchCoursesAndDependencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const coursesRes = await fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`);
      const educatorsRes = await fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`);
      const departmentsRes = await fetch(`${apiBaseUrl}/admin/departments?companyId=${encodeURIComponent(companyId)}`);
      const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`);

      if (coursesRes.ok) {
        const data: CourseType[] = (await coursesRes.json()).data;
        
        setCourses(data);
      } else {
        const errorData = await coursesRes.json();
        setError(errorData.message || "Failed to fetch courses.");
        setCourses(initialCourses);
      }

      if (educatorsRes.ok) {
        const fetchedEducators = (await educatorsRes.json()).data.data as any[];
        setEducators(fetchedEducators.map(e => ({ id: e.id, name: e.name, email: e.email })));
      } else {
        const errorData = await educatorsRes.json();
        setError(errorData.message || "Failed to fetch educators.");
        setEducators(allEducators);
      }

      if (departmentsRes.ok) {
        const data: DepartmentOption[] = (await departmentsRes.json()).data.data;
        
        setDepartments(data);
      } else {
        const errorData = await departmentsRes.json();
        setError(errorData.message || "Failed to fetch departments.");
        setDepartments(allDepartments);
      }

      if (academicLevelsRes.ok) {
        const data: AcademicLevelOption[] = (await academicLevelsRes.json()).data;
        
        setAcademicLevels(data);
      } else {
        const errorData = await academicLevelsRes.json();
        setError(errorData.message || "Failed to fetch academic levels.");
        setAcademicLevels(allAcademicLevels);
      }

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
      setCourses(initialCourses);
      setEducators(allEducators);
      setDepartments(allDepartments);
      setAcademicLevels(allAcademicLevels);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId, initialCourses, allEducators, allDepartments, allAcademicLevels]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialCourses.length === 0 || allEducators.length === 0 || allDepartments.length === 0 || allAcademicLevels.length === 0) {
      fetchCoursesAndDependencies();
    }
  }, [fetchCoursesAndDependencies, initialCourses, allEducators, allDepartments, allAcademicLevels]);


  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = (course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (course.code?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || // NEW: Search by code
                            course.educators.some(e =>
                              e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (e.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
                            ) || // UPDATED: Search through educators array
                            (course.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            course.academicLevels.some(level => level.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDepartment = filterDepartment === 'All' || course.departmentId === filterDepartment;
      const matchesAcademicLevel = filterAcademicLevel === 'All' || course.academicLevels.some(level => level.id === filterAcademicLevel);

      return matchesSearch && matchesDepartment && matchesAcademicLevel;
    }).sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title
  }, [courses, searchTerm, filterDepartment, filterAcademicLevel]);

  // --- API Interaction Functions ---
  const handleSaveCourse = async (courseData: Omit<CourseType, 'id' | 'totalLessons' | 'studentsEnrolled' | 'createdAt' | 'updatedAt' | 'departmentName' | 'academicLevels' | 'educators'> & { id?: string; academicLevelIds?: string[] | null; educatorIds?: string[] | null; }) => {
    setIsLoading(true);
    setError(null);
    const method = courseData.id ? 'PATCH' : 'POST';

    try {
      const url = courseData.id ? `${apiBaseUrl}/admin/courses/${courseData.id}` : `${apiBaseUrl}/admin/courses`;

      const payload = {
        ...courseData,
        companyId: companyId, // Ensure companyId is always included
        // academicLevelIds and educatorIds will be handled by the backend
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchCoursesAndDependencies(); // Re-fetch to get the latest data with calculated counts
        setShowFormModal(false);
        setEditingCourse(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} course.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} course.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone and may affect linked records (enrollments, assignments, etc.).")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchCoursesAndDependencies();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete course.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting course.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalCourses = courses.length;
  const totalStudentsEnrolledAcrossAllCourses = courses.reduce((sum, c) => sum + c.studentsEnrolled, 0);
  const avgRating = courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1) : '0';


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpenIcon className="h-10 w-10 text-green-600" />
            Courses Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Define and manage the curriculum, subjects, and academic offerings.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-green-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Courses</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalCourses}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UsersIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students Enrolled</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalStudentsEnrolledAcrossAllCourses}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <StarIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Average Course Rating</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgRating}</h2>
          </div>
        </div>
      </div>

      {/* Courses List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6 text-indigo-500" /> All Courses
          </h3>
          <button
            onClick={() => { setEditingCourse(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                         hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Course
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
              placeholder="Search by title, code, instructor, department, or academic level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
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

        {/* Courses Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Course Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th> {/* NEW */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th> {/* NEW */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructors</th> {/* Changed from Instructor */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Levels</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                            src={course.imageUrl || `https://placehold.co/100x100/E0F2F7/0288D1?text=${course.title?.charAt(0) || 'C'}`}
                            alt={course.title || 'Course Image'}
                            width={40}
                            height={40}
                            loader={loader}
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x100/E0F2F7/0288D1?text=${course.title?.charAt(0) || 'C'}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-xs text-gray-500 truncate w-48">{course.description || 'No description.'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.code} {/* NEW */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CreditCardIcon className="h-4 w-4 text-gray-400" /> {course.credits || 'N/A'} {/* NEW */}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.educators && course.educators.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {course.educators.map((edu, index) => (
                            <div key={edu.id || index} className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4 text-gray-500" /> {edu.name}
                              {edu.roleInCourse && <span className="text-xs text-gray-500">({edu.roleInCourse})</span>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BuildingOffice2Icon className="h-4 w-4 text-gray-500" /> {course.departmentName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.academicLevels && course.academicLevels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {course.academicLevels.map(level => (
                            <span key={level.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              <TagIcon className="h-3 w-3 mr-1" /> {level.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpenIcon className="h-4 w-4 text-gray-400" /> Lessons: {course.totalLessons}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" /> Enrolled: {course.studentsEnrolled}
                      </div>
                      {course.rating !== null && course.rating !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" /> Rating: {course.rating.toFixed(1)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingCourse(course); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Course"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Course"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500"> {/* Updated colspan */}
                    <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No courses found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add a new course.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <CourseFormModal
          isOpen={showFormModal}
          courseData={editingCourse}
          onClose={() => { setShowFormModal(false); setEditingCourse(null); }}
          onSave={handleSaveCourse}
          isLoading={isLoading}
          companyId={companyId}
          allEducators={educators}
          allDepartments={departments}
          allAcademicLevels={academicLevels}
        />
      )}
    </div>
  );
}
