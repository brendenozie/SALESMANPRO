'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image'; // For profile pictures
import {
  UsersIcon,
  AcademicCapIcon, // For overall students
  ChartBarIcon, // For grades breakdown / progress
  UserPlusIcon, // For add student
  PencilIcon, // For edit
  TrashIcon, // For delete
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
  PhoneIcon, // For phone
  EnvelopeIcon, // For email
  MapPinIcon, // For address
  BookOpenIcon, // For total courses
  TrophyIcon, // For certificates
  CheckCircleIcon, // For completed courses
  KeyIcon, // For login code
  UserGroupIcon,
  XMarkIcon, // For parent icon
} from '@heroicons/react/24/outline';

import StudentFormModal from './StudentFormModal'; // Import the new modal component

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (matching API response) ---
export type StudentType = {
  id: string;
  userId: string;
  loginCode?: string; // Admission number
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId?: string; // Optional as per Prisma model
  studentGrade?: string;
  parentId?: string; // NEW: Parent ID
  parentName?: string; // NEW: Flattened parent name
  parentEmail?: string; // NEW: Flattened parent email
  parentPhone?: string; // NEW: Flattened parent phone
  totalCourses: number; // From _count.enrolledCourses
  completedCourses: number; // Directly from model
  certificatesEarned: number; // Directly from model
  averageProgress: number; // Directly from model
  totalSubmissions: number; // From _count.submissions
  totalAttendanceRecords: number; // From _count.AttendanceRecord
  totalExamSubmissions: number; // From _count.ExamSubmission
  createdAt: string;
  updatedAt: string;
};

export type ParentOption = {
  id: string;
  name: string;
  email?: string; // Include email and phone for better parent selection display
  phone?: string;
  loginCode?: string; // Also include loginCode for display if needed
};


interface StudentsClientProps {
  initialStudents: StudentType[];
  allParents: ParentOption[]; // NEW: Pass allParents to the client component
  companyId: string;
  apiUrl: string;
}

export default function StudentsClient({ initialStudents, allParents, companyId, apiUrl }: StudentsClientProps) {
  const [students, setStudents] = useState<StudentType[]>(initialStudents);
  const [parents, setParents] = useState<ParentOption[]>(allParents); // State for parents
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management ---
  const fetchStudentsAndParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const studentsRes = await fetch(`${apiUrl}/students?companyId=${encodeURIComponent(companyId)}`);
      const parentsRes = await fetch(`${apiUrl}/parents?companyId=${encodeURIComponent(companyId)}`);

      if (studentsRes.ok) {
        const studentsData: StudentType[] = await studentsRes.json();
        setStudents(studentsData);
      } else {
        const errorData = await studentsRes.json();
        setError(errorData.message || "Failed to fetch students.");
        setStudents(initialStudents);
      }

      if (parentsRes.ok) {
        const parentsData: ParentOption[] = await parentsRes.json();
        setParents(parentsData);
      } else {
        const errorData = await parentsRes.json();
        setError(errorData.message || "Failed to fetch parents.");
        setParents(allParents); // Fallback to initial data
      }

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
      setStudents(initialStudents);
      setParents(allParents);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialStudents, allParents]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialStudents.length === 0 || allParents.length === 0) {
      fetchStudentsAndParents();
    }
  }, [fetchStudentsAndParents, initialStudents, allParents]);


  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.loginCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.address?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.bio?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (student.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || // Search by parent name
                            (student.parentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || '') || // Search by parent email
                            (student.parentPhone?.toLowerCase().includes(searchTerm.toLowerCase()) || ''); // Search by parent phone

      const matchesGrade = filterGrade === 'All' || student.studentGrade === filterGrade;
      return matchesSearch && matchesGrade;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort alphabetically by name
  }, [students, searchTerm, filterGrade]);

  // Helper function to get unique grade levels and count students per grade
  const getGradeStats = useMemo(() => {
    const grades: { [grade: string]: number } = {};
    students.forEach(student => {
      if (student.studentGrade) {
        if (grades[student.studentGrade]) {
          grades[student.studentGrade]++;
        } else {
          grades[student.studentGrade] = 1;
        }
      }
    });
    // Sort grades numerically if they are numbers, otherwise alphabetically
    return Object.entries(grades).sort((a, b) => {
      const gradeA = parseInt(a[0]);
      const gradeB = parseInt(b[0]);
      if (!isNaN(gradeA) && !isNaN(gradeB)) {
        return gradeA - gradeB;
      }
      return a[0].localeCompare(b[0]);
    });
  }, [students]);

  // --- API Interaction Functions ---
  const handleSaveStudent = async (studentData: Omit<StudentType, 'id' | 'userId' | 'loginCode' | 'totalCourses' | 'completedCourses' | 'certificatesEarned' | 'averageProgress' | 'totalSubmissions' | 'totalAttendanceRecords' | 'totalExamSubmissions' | 'createdAt' | 'updatedAt' | 'parentName' | 'parentEmail' | 'parentPhone'> & { id?: string; userId?: string; parentId?: string | null }) => {
    setIsLoading(true);
    setError(null);
    const method = studentData.id ? 'PATCH' : 'POST';
    
    try {

      const url = studentData.id ? `${apiUrl}/students/${studentData.id}` : `${apiUrl}/students`;

      const payload = {
        ...studentData,
        companyId: companyId, // Ensure companyId is always included for new students
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchStudentsAndParents(); // Re-fetch to get the latest data with calculated counts and parent info
        setShowFormModal(false);
        setEditingStudent(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} student.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} student.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone and may affect linked records.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/students/${studentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchStudentsAndParents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete student.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting student.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalStudents = students.length;
  const totalGrades = getGradeStats.length; // Number of unique grades
  const avgCoursesPerStudent = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.totalCourses, 0) / totalStudents).toFixed(1) : '0';
  const avgProgressPerStudent = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.averageProgress, 0) / totalStudents).toFixed(1) : '0';
  const avgCertificatesPerStudent = totalStudents > 0 ? (students.reduce((sum, s) => sum + s.certificatesEarned, 0) / totalStudents).toFixed(1) : '0';


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <AcademicCapIcon className="h-10 w-10 text-blue-600" />
            Students Management
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Efficiently manage all student records, academic progress, and contact information.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <UsersIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalStudents}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <BookOpenIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Courses/Student</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgCoursesPerStudent}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <ChartBarIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgProgressPerStudent}%</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <TrophyIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Avg. Certificates</p>
            <h2 className="text-3xl font-bold text-gray-800">{avgCertificatesPerStudent}</h2>
          </div>
        </div>
      </div>

      {/* Students List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-indigo-500" /> All Students
          </h3>
          <button
            onClick={() => { setEditingStudent(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <UserPlusIcon className="h-5 w-5" /> Add New Student
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
              placeholder="Search by name, email, admission #, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Grades</option>
              {getGradeStats.map(([grade]) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission #</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th> {/* Updated column header */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            src={student.profilePicture || `https://placehold.co/100x100/E0F2F7/0288D1?text=${student.name?.charAt(0) || '?'}`}
                            alt={student.name || 'Student Avatar'}
                            width={40}
                            loader={loader}
                            height={40}
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = `https://placehold.co/100x100/E0F2F7/0288D1?text=${student.name?.charAt(0) || '?'}`;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                      <div className="flex items-center gap-1">
                        <KeyIcon className="h-4 w-4 text-blue-500" /> {student.loginCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">Grade {student.studentGrade || 'N/A'}</div>
                      <div className="text-xs text-gray-500 mt-1">Enrolled: {new Date(student.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentName ? (
                        <>
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="h-4 w-4 text-gray-400" /> {student.parentName}
                          </div>
                          {student.parentPhone && (
                            <div className="flex items-center gap-1 mt-1">
                              <PhoneIcon className="h-4 w-4 text-gray-400" /> {student.parentPhone}
                            </div>
                          )}
                          {student.parentEmail && (
                            <div className="flex items-center gap-1 mt-1">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400" /> {student.parentEmail}
                            </div>
                          )}
                        </>
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <BookOpenIcon className="h-4 w-4 text-gray-400" /> Courses: {student.totalCourses}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircleIcon className="h-4 w-4 text-gray-400" /> Completed: {student.completedCourses}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrophyIcon className="h-4 w-4 text-gray-400" /> Certificates: {student.certificatesEarned}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ChartBarIcon className="h-4 w-4 text-gray-400" /> Avg. Progress: {student.averageProgress}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingStudent(student); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Student"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Student"
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
                    <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No students found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add a new student.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <StudentFormModal
          studentData={editingStudent}
          onClose={() => { setShowFormModal(false); setEditingStudent(null); }}
          onSave={handleSaveStudent}
          isLoading={isLoading}
          companyId={companyId}
          allParents={parents} // NEW: Pass allParents to the modal
        />
      )}
    </div>
  );
}
