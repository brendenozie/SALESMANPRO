
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  UsersIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  BookOpenIcon,
  TrophyIcon,
  CheckCircleIcon,
  KeyIcon,
  UserGroupIcon,
  TagIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

import StudentFormModal from './StudentFormModal'; // Import the new modal component
import PromoteStudentModal from './PromoteStudentModal';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions (matching API response) ---
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type ClassRoomOption = {
  id: string;
  name: string;
  academicLevelId: string;
};

// NEW: Type for StudentLevelStatus
export type StudentLevelStatusOption = {
  value: 'JUNIOR' | 'SENIOR'; // Adjust if you have more levels
  label: string;
};

export type StudentType = {
  id: string;
  userId: string;
  loginCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  admissionNumber?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId?: string;
  parentId?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  academicRecords: {
    academicLevelId: string;
    academicLevelName: string;
    classRoomId?: string | null;
    classRoomName?: string | null;
    year?: string | null;
    term?: string | null;
    session?: string | null;
    levelStatus?: 'JUNIOR' | 'SENIOR' | null;
  }[];
  // academicLevels: AcademicLevelOption[];
  // classRooms: ClassRoomOption[];
  // levelStatus?: 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN' |null; // ADDED: levelStatus field
  totalCourses: number;
  completedCourses: number;
  certificatesEarned: number;
  averageProgress: number;
  totalAssignmentSubmissions: number;
  totalAttendanceRecords: number;
  totalExamSubmissions: number;
  createdAt: string;
  updatedAt: string;
};

export type ParentOption = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loginCode?: string;
};

interface StudentsClientProps {
  initialStudents: StudentType[];
  allParents: ParentOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: ClassRoomOption[];
  allStudentLevelStatusOptions: StudentLevelStatusOption[]; // NEW PROP
  companyId: string;
  apiBaseUrl: string;
}

export default function StudentsClient({ initialStudents, allParents, allAcademicLevels, allClassRooms, allStudentLevelStatusOptions, companyId, apiBaseUrl }: StudentsClientProps) {
  const [students, setStudents] = useState<StudentType[]>(initialStudents);
  const [parents, setParents] = useState<ParentOption[]>(allParents);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [classRooms, setClassRooms] = useState<ClassRoomOption[]>(allClassRooms || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcademicLevel, setFilterAcademicLevel] = useState('All'); // Filter by academic level ID
  const [filterClassRoom, setFilterClassRoom] = useState('All'); // NEW: Filter by classroom ID
  const [filterLevelStatus, setFilterLevelStatus] = useState('All'); // NEW: Filter by Junior/Senior status
  const [showFormModal, setShowFormModal] = useState(false);
  // const [showPromoteStudentModal, setShowPromoteStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentType | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);


  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getCurrentAcademicRecord = (student: StudentType) => {
    if (!student.academicRecords?.length) return null;

    return [...student.academicRecords]
      .sort((a, b) => {
        if (!a.year || !b.year) return 0;
        return Number(b.year) - Number(a.year);
      })[0];
  };


  // --- Data Fetching and Management ---
  const fetchStudentsAndParentsAndAcademicLevels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const studentsRes = await fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(companyId)}`,{credentials: 'include'});
      const parentsRes = await fetch(`${apiBaseUrl}/admin/parents?companyId=${encodeURIComponent(companyId)}`, {credentials: 'include'});
      const academicLevelsRes = await fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`, {credentials: 'include'});
      const classRoomsRes = await fetch(`${apiBaseUrl}/admin/classrooms?companyId=${encodeURIComponent(companyId)}`, {credentials: 'include'});

      if (studentsRes.ok) {
        const studentsData: StudentType[] = (await studentsRes.json()).data;
        setStudents(studentsData);
      } else {
        const errorData = await studentsRes.json();
        setError(errorData.message || "Failed to fetch students.");
        // Fallback to initial data if fetch fails
        setStudents(initialStudents);
      }

      if (parentsRes.ok) {
        const parentsData: ParentOption[] = (await parentsRes.json()).data;
        setParents(parentsData);
      } else {
        const errorData = await parentsRes.json();
        setError(errorData.message || "Failed to fetch parents.");
        // Fallback to initial data if fetch fails
        setParents(allParents);
      }

      if (academicLevelsRes.ok) {
        const academicLevelsData: AcademicLevelOption[] = (await academicLevelsRes.json()).data;
        setAcademicLevels(academicLevelsData);
      } else {
        const errorData = await academicLevelsRes.json();
        setError(errorData.message || "Failed to fetch academic levels.");
        // Fallback to initial data if fetch fails
        setAcademicLevels(allAcademicLevels);
      }

      if (classRoomsRes.ok) {
        const classRoomsData: ClassRoomOption[] = (await classRoomsRes.json()).data;
        setClassRooms(classRoomsData);
      } else {
        const errorData = await classRoomsRes.json();
        setError(errorData.message || "Failed to fetch classrooms.");
        // Fallback to initial data if fetch fails
        setClassRooms(allClassRooms || []);
      }

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
      // Ensure state is reset to initial if network error occurs
      setStudents(initialStudents);
      setParents(allParents);
      setAcademicLevels(allAcademicLevels);
      setClassRooms(allClassRooms || []);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId, initialStudents, allParents, allAcademicLevels, allClassRooms]);
  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialStudents.length === 0 || allParents.length === 0 || allAcademicLevels.length === 0 || allClassRooms.length === 0) {
      fetchStudentsAndParentsAndAcademicLevels();
    }
  }, [fetchStudentsAndParentsAndAcademicLevels, initialStudents, allParents, allAcademicLevels, allClassRooms]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const current = getCurrentAcademicRecord(student);

      const matchesSearch =
        (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (student.loginCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

      const matchesAcademicLevel =
        filterAcademicLevel === 'All' ||
        current?.academicLevelId === filterAcademicLevel;

      const matchesClassRoom =
        filterClassRoom === 'All' ||
        current?.classRoomId === filterClassRoom;

      const matchesLevelStatus =
        filterLevelStatus === 'All' ||
        current?.levelStatus === filterLevelStatus;

      return (
        matchesSearch &&
        matchesAcademicLevel &&
        matchesClassRoom &&
        matchesLevelStatus
      );
    });
  }, [students, searchTerm, filterAcademicLevel, filterClassRoom, filterLevelStatus]);

  const handlePromoteStudent = async (payload: {
  studentId: string;
  academicLevelId: string;
  classRoomId?: string | null;
  year: string;
  term?: string | null;
  session?: string | null;
  action: 'PROMOTED' | 'RETAINED';
  levelStatus?: 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN' | null | undefined;
}) => {
  try {
    setIsPromoting(true);

    const res = await fetch(`${apiBaseUrl}/admin/students/${payload.studentId}/promote`, {
      method: 'POST',//'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData =( await res.json()).data;
      throw new Error(errorData.message || 'Failed to promote student');
    }

    // Refresh data using your existing refresh function
    await fetchStudentsAndParentsAndAcademicLevels();

    // Close modal
    setIsPromoteOpen(false);
    setSelectedStudent(null);
  } catch (error: any) {
    console.error(error);
    alert(error.message || 'Failed to promote student');
  } finally {
    setIsPromoting(false);
  }
};


  // const filteredStudents = useMemo(() => {
  //   return students.filter(student => {
  //     const matchesSearch =
  //       (student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.loginCode?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.address?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.bio?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.parentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
  //       (student.parentPhone?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

  //     // Check if any of the student's academic levels match the filter
  //     const matchesAcademicLevel = filterAcademicLevel === 'All' ||  student.academicLevels?.some(al => al.id === filterAcademicLevel);

  //     const matchesClassRoom = filterClassRoom === 'All' || student.classRooms?.some(cr => cr.id === filterClassRoom);

  //     // NEW: Check if student's levelStatus matches the filter
  //     const matchesLevelStatus = filterLevelStatus === 'All' || student.levelStatus === filterLevelStatus;

  //     return matchesSearch && matchesAcademicLevel && matchesLevelStatus; // Combine all filters
  //   }).sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort alphabetically by name
  // }, [students, searchTerm, filterAcademicLevel, filterLevelStatus]); // Add filterLevelStatus to dependencies

  // Helper function to get unique academic levels and count students per level (unchanged logic)
  // const getAcademicLevelStats = useMemo(() => {
  //   const levels: { [levelId: string]: { name: string; count: number } } = {};
  //   students.forEach(student => {
  //     student.academicLevels.forEach(al => {
  //       if (levels[al.id]) {
  //         levels[al.id].count++;
  //       } else {
  //         levels[al.id] = { name: al.name, count: 1 };
  //       }
  //     });
  //   });
  //   return Object.entries(levels)
  //     .map(([id, data]) => ({ id, name: data.name, count: data.count }))
  //     .sort((a, b) => {
  //       const levelA = academicLevels.find(al => al.id === a.id);
  //       const levelB = academicLevels.find(al => al.id === b.id);
  //       return (levelA?.sortOrder || 0) - (levelB?.sortOrder || 0);
  //     });
  // }, [students, academicLevels]);

  // --- API Interaction Functions ---
  const handleSaveStudent = async (studentData: Omit<StudentType, 'id' | 'userId' | 'loginCode' | 'totalCourses' | 'completedCourses' | 'certificatesEarned' | 'averageProgress' | 'totalAssignmentSubmissions' | 'totalAttendanceRecords' | 'totalExamSubmissions' | 'createdAt' | 'updatedAt' | 'parentName' | 'parentEmail' | 'parentPhone' | 'academicLevels' | 'classRooms'> & { id?: string; userId?: string; parentId?: string | null; academicLevelId?: string | null }) => {
    setIsLoading(true);
    setError(null);

    const method = studentData.id ? 'PATCH' : 'POST';

    try {
      const url = studentData.id ? `${apiBaseUrl}/admin/students/${studentData.id}` : `${apiBaseUrl}/admin/students`;

      const payload = {
        ...studentData,
        companyId: companyId,
        // academicLevelId is now part of the payload for POST/PATCH
        // It's used to create the StudentAcademicLevel junction entry on the backend
      };

      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Re-fetch all data to ensure the table is updated with the new academic levels
        await fetchStudentsAndParentsAndAcademicLevels();
        setShowFormModal(false);
        setEditingStudent(null);
      } else {
        const errorData = (await res.json()).data || {} ;
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
      const res = await fetch(`${apiBaseUrl}/admin/students/${studentId}`, {
        credentials: 'include',
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchStudentsAndParentsAndAcademicLevels();
      } else {
        const errorData = ( await res.json()).data || {} ;
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
              value={filterAcademicLevel}
              onChange={(e) => setFilterAcademicLevel(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Academic Levels</option>
              {/* Categorize options here for filtering */}
              {academicLevels.filter(level => level.name.toLowerCase().includes('junior') || level.name.toLowerCase().includes('playgroup') || level.name.toLowerCase().includes('kindergarten'))
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                  <option key={level.id} value={level.id}>✨ Junior: {level.name}</option>
                ))}
              {academicLevels.filter(level => level.name.toLowerCase().includes('senior') || level.name.toLowerCase().includes('grade'))
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                  <option key={level.id} value={level.id}>🚀 Senior: {level.name}</option>
                ))}
              {/* Add any other levels not explicitly categorized */}
              {academicLevels.filter(level =>
                  !(level.name.toLowerCase().includes('junior') || level.name.toLowerCase().includes('playgroup') || level.name.toLowerCase().includes('kindergarten') ||
                    level.name.toLowerCase().includes('senior') || level.name.toLowerCase().includes('grade'))
                ).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-shrink-0">
            <select
              value={filterClassRoom}
              onChange={(e) => setFilterClassRoom(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Classrooms</option>
              {classRooms.filter(cr => cr.academicLevelId === filterAcademicLevel || filterAcademicLevel === 'All').map(cr => (
                <option key={cr.id} value={cr.id}>{cr.name}</option>
              ))}
            </select>
          </div>

          {/* NEW: Filter by Level Status */}
          <div className="flex-shrink-0">
            <select
              value={filterLevelStatus}
              onChange={(e) => setFilterLevelStatus(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Student Levels</option>
              {allStudentLevelStatusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Level(s)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th> {/* NEW COLUMN */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Level</th> {/* NEW COLUMN */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
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
                            src={student.profilePicture || `https://placehold.co/100x100/E0F2F7/0288D1?text=${student.firstName?.charAt(0) || '?'}`}
                            alt={student.firstName || 'Student Avatar'}
                            width={40}
                            height={40}
                            loader={loader}
                            onError={(e) => {
                              const img = (e.currentTarget || e.target) as HTMLImageElement;
                              try {
                                img.onerror = null;
                                img.src = `https://placehold.co/100x100/E0F2F7/0288D1?text=${student.firstName?.charAt(0) || '?'}`;
                              } catch {
                                /* noop */
                              }
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-700">
                      <div className="flex items-center gap-1">
                        <KeyIcon className="h-4 w-4 text-blue-500" /> {student.admissionNumber || 'N/A'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium flex items-center gap-1">
                        <TagIcon className="h-4 w-4 text-gray-500" />
                        {student.academicRecords && student.academicRecords.length > 0
                          ? (() => {
                              const current = getCurrentAcademicRecord(student);
                              return current ? (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                                  {current.academicLevelName} ({current.year})
                                </span>
                              ) : (
                                'N/A'
                              );
                            })()
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Enrolled: {new Date(student.createdAt).toLocaleDateString()}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium flex items-center gap-1">
                        <BookOpenIcon className="h-4 w-4 text-gray-500" />
                        {student.academicRecords && student.academicRecords.length > 0
                          ? (() => {
                              const current = getCurrentAcademicRecord(student);
                              return current?.classRoomName ? (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                  {current.classRoomName}
                                </span>
                              ) : (
                                'N/A'
                              );
                            })()
                          : 'N/A'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.academicRecords && student.academicRecords.length > 0 ? (
                        (() => {
                          const current = getCurrentAcademicRecord(student);
                          return current?.levelStatus ? (
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                current.levelStatus === 'JUNIOR' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {current.levelStatus}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          );
                        })()
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
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
                        <span className="text-gray-500">No parent assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="relative w-24 h-2 bg-gray-200 rounded-full">
                          <div
                            className="absolute h-full rounded-full bg-indigo-500"
                            style={{ width: `${student.averageProgress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-700">{student.averageProgress.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Courses: {student.completedCourses}/{student.totalCourses}</div>
                      <div className="text-xs text-gray-500">Certificates: {student.certificatesEarned}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => { setEditingStudent(student); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full hover:bg-indigo-100 transition-colors duration-200"
                          title="Edit Student"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setIsPromoteOpen(true); }}
                          className="text-emerald-600 bg-emerald-50 p-2 rounded-full hover:bg-emerald-100"
                          title="Promote Student"
                        >
                          <AcademicCapIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setIsPromoteOpen(true); }}
                          className="text-amber-600 bg-amber-50 p-2 rounded-full hover:bg-amber-100"
                          title="Repeat / Retain Student"
                        >
                          <ArrowPathIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new student or adjusting your filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Form Modal */}
      {showFormModal && (
        <StudentFormModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setEditingStudent(null); }}
          onSave={handleSaveStudent}
          initialData={editingStudent}
          allParents={parents}
          allAcademicLevels={academicLevels}
          allClassRooms={classRooms}
          allStudentLevelStatusOptions={allStudentLevelStatusOptions} // Pass to modal
          companyId={companyId}
          isLoading={isLoading}
          // error={error}
        />
      )}

      {isPromoteOpen &&(
        <PromoteStudentModal
          isOpen={isPromoteOpen}
          student={selectedStudent}
          onClose={() => {
            setIsPromoteOpen(false);
            setSelectedStudent(null);
          }}
          onPromote={handlePromoteStudent}
          allAcademicLevels={allAcademicLevels}
          allClassRooms={allClassRooms}
          isLoading={isPromoting}
        />

        )}
    </div>
  );
}