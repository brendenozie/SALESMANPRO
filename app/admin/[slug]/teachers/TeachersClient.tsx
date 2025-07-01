'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image'; // For profile pictures
import {
  UsersIcon,
  AcademicCapIcon, // For overall teachers
  BriefcaseIcon, // For departments
  UserPlusIcon, // For add teacher
  PencilIcon, // For edit
  TrashIcon, // For delete
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
  PhoneIcon, // For phone
  EnvelopeIcon, // For email
  MapPinIcon, // For address
  BookOpenIcon, // For courses
  ClockIcon, // For classes scheduled
  DocumentTextIcon, // For exams/materials
} from '@heroicons/react/24/outline';
import EducatorFormModal from './EducatorFormModal';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (matching API response) ---
export type EducatorType = {
  id: string;
  userId: string;
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId: string;
  departmentId?: string;
  departmentName?: string; // Flattened for display
  totalStudents: number; // Calculated by API
  totalCoursesTaught: number; // Calculated by API
  totalClassesScheduled: number;
  totalExamsCreated: number;
  totalMaterialsUploaded: number;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

interface TeachersClientProps {
  initialEducators: EducatorType[];
  allDepartments: DepartmentOption[];
  companyId: string;
  apiUrl: string;
}

export default function TeachersClient({ initialEducators, allDepartments, companyId, apiUrl }: TeachersClientProps) {
  const [educators, setEducators] = useState<EducatorType[]>(initialEducators);
  const [departments, setDepartments] = useState<DepartmentOption[]>(allDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEducator, setEditingEducator] = useState<EducatorType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchEducators = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const data: EducatorType[] = await res.json();
        setEducators(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch educators.");
        setEducators(initialEducators); // Fallback to initial data on client-side fetch error
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching educators.");
      setEducators(initialEducators); // Fallback to initial data on network error
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialEducators]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialEducators.length === 0 && allDepartments.length === 0) {
      fetchEducators();
    }
  }, [fetchEducators, initialEducators, allDepartments]);


  const filteredEducators = useMemo(() => {
    return educators.filter(educator => {
      const matchesSearch = (educator.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (educator.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (educator.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
      const matchesDepartment = filterDepartment === 'All' || educator.departmentId === filterDepartment;
      return matchesSearch && matchesDepartment;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort alphabetically by name
  }, [educators, searchTerm, filterDepartment]);

  // --- API Interaction Functions ---
  const handleSaveEducator = async (educatorData: Omit<EducatorType, 'id' | 'userId' | 'totalStudents' | 'totalCoursesTaught' | 'totalClassesScheduled' | 'totalExamsCreated' | 'totalMaterialsUploaded' | 'createdAt' | 'updatedAt' | 'departmentName'> & { id?: string; userId?: string }) => {
    setIsLoading(true);
    setError(null);
    const method = educatorData.id ? 'PATCH' : 'POST';
    try {
      const url = educatorData.id ? `${apiUrl}/admin/educators/${educatorData.id}` : `${apiUrl}/admin/educators`;

      const payload = {
        ...educatorData,
        companyId: companyId, // Ensure companyId is always included for new educators
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchEducators(); // Re-fetch to get the latest data with calculated counts
        setShowFormModal(false);
        setEditingEducator(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} educator.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} educator.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEducator = async (educatorId: string) => {
    if (!confirm("Are you sure you want to delete this educator? This action cannot be undone and may affect linked records.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/educators/${educatorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchEducators();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete educator.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting educator.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalTeachers = educators.length;
  const totalDepartments = departments.length;
  const avgCoursesPerTeacher = totalTeachers > 0 ? (educators.reduce((sum, e) => sum + e.totalCoursesTaught, 0) / totalTeachers).toFixed(1) : '0';
  const avgStudentsPerTeacher = totalTeachers > 0 ? (educators.reduce((sum, e) => sum + e.totalStudents, 0) / totalTeachers).toFixed(1) : '0';


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <AcademicCapIcon className="h-10 w-10 text-purple-600" />
            Teachers Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Efficiently manage all teaching staff information, profiles, and assignments.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-purple-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UsersIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Teachers</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalTeachers}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <BriefcaseIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Departments</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalDepartments}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <BookOpenIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Courses/Teacher</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgCoursesPerTeacher}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UsersIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Students/Teacher</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgStudentsPerTeacher}</h2>
          </div>
        </div>
      </div>

      {/* Teachers List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-indigo-500" /> All Teachers
          </h3>
          <button
            onClick={() => { setEditingEducator(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <UserPlusIcon className="h-5 w-5" /> Add New Teacher
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
              placeholder="Search by name, email, or department..."
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
        </div>

        {/* Teachers Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Teacher</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEducators.length > 0 ? (
                filteredEducators.map((educator) => (
                  <tr key={educator.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            src={educator.profilePicture || `https://placehold.co/100x100/E0E7FF/4338CA?text=${educator.name?.charAt(0) || '?'}`}
                            alt={educator.name || 'Teacher Avatar'}
                            loader={loader}
                            width={40}
                            height={40}
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x100/E0E7FF/4338CA?text=${educator.name?.charAt(0) || '?'}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{educator.name}</div>
                          <div className="text-xs text-gray-500">{educator.bio?.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" /> {educator.email}
                      </div>
                      {educator.phone && (
                        <div className="flex items-center gap-1 mt-1">
                          <PhoneIcon className="h-4 w-4 text-gray-400" /> {educator.phone}
                        </div>
                      )}
                      {educator.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" /> {educator.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{educator.departmentName || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">Joined: {new Date(educator.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpenIcon className="h-4 w-4 text-gray-400" /> Courses: {educator.totalCoursesTaught}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <UsersIcon className="h-4 w-4 text-gray-400" /> Students: {educator.totalStudents}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ClockIcon className="h-4 w-4 text-gray-400" /> Classes: {educator.totalClassesScheduled}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400" /> Exams: {educator.totalExamsCreated}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingEducator(educator); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Teacher"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEducator(educator.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Teacher"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No teachers found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add a new teacher.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <EducatorFormModal
          educatorData={editingEducator}
          onClose={() => { setShowFormModal(false); setEditingEducator(null); }}
          onSave={handleSaveEducator}
          allDepartments={departments}
          isLoading={isLoading}
          companyId={companyId}
        />
      )}
    </div>
  );
}
