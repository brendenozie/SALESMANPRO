'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon, // For date
  UsersIcon, // For students list
  MagnifyingGlassIcon, // For search
  EyeIcon, // For view details
  PaperAirplaneIcon, // For message parent/student
  AcademicCapIcon, // For student's grade
} from '@heroicons/react/24/outline';

// Types for class roster and student
type Student = {
  id: string;
  name: string;
  email: string;
  parentName: string;
  parentPhone: string;
  status: string;
  gradeLevel: string;
};

type ClassRoster = {
  name: string;
  teacher: string;
  students: Student[];
};

type ClassId = 'CL101' | 'CL102' | 'CL103';

const sampleClassRosters: Record<ClassId, ClassRoster> = {
  'CL101': {
    name: 'Grade 7 Mathematics',
    teacher: 'Mr. John Doe',
    students: [
      { id: 'S001', name: 'Alice Smith', email: 'alice.s@school.com', parentName: 'Mr. Alex Smith', parentPhone: '+254711111111', status: 'Active', gradeLevel: '7' },
      { id: 'S005', name: 'Fatuma Hassan', email: 'fatuma.h@school.com', parentName: 'Ahmed Hassan', parentPhone: '+254722222222', status: 'Active', gradeLevel: '7' },
      { id: 'S011', name: 'George Kinyanjui', email: 'george.k@school.com', parentName: 'Mary Kinyanjui', parentPhone: '+254733333333', status: 'Active', gradeLevel: '7' },
      { id: 'S012', name: 'Hannah Wambui', email: 'hannah.w@school.com', parentName: 'Peter Wambui', parentPhone: '+254744444444', status: 'Active', gradeLevel: '7' },
      { id: 'S013', name: 'Isaac Kipchoge', email: 'isaac.k@school.com', parentName: 'Sarah Kipchoge', parentPhone: '+254755555555', status: 'Inactive', gradeLevel: '7' }, // Example inactive student
    ],
  },
  'CL102': {
    name: 'Grade 8 English Language',
    teacher: 'Mrs. Jane Smith',
    students: [
      { id: 'S002', name: 'Kevin Otieno', email: 'kevin.o@school.com', parentName: 'David Otieno', parentPhone: '+254766666666', status: 'Active', gradeLevel: '8' },
      { id: 'S004', name: 'Michael Njoroge', email: 'michael.n@school.com', parentName: 'Ruth Njoroge', parentPhone: '+254777777777', status: 'Active', gradeLevel: '8' },
      { id: 'S014', name: 'Naomi Chebet', email: 'naomi.c@school.com', parentName: 'Ben Chebet', parentPhone: '+254788888888', status: 'Active', gradeLevel: '8' },
      { id: 'S015', name: 'Paul Omondi', email: 'paul.o@school.com', parentName: 'Grace Omondi', parentPhone: '+254799999999', status: 'Active', gradeLevel: '8' },
    ],
  },
  'CL103': {
    name: 'Grade 9 Algebra',
    teacher: 'Mr. John Doe',
    students: [
        { id: 'S003', name: 'Sarah Kimani', email: 'sarah.k@school.com', parentName: 'Elizabeth Kimani', parentPhone: '+254710101010', status: 'Active', gradeLevel: '9' },
        { id: 'S016', name: 'Quentin Onyango', email: 'quentin.o@school.com', parentName: 'Rose Onyango', parentPhone: '+254711223344', status: 'Active', gradeLevel: '9' },
    ]
  }
};

// For demonstration, let's pick a default class ID
const defaultClassId = 'CL101'; // This would come from routing in a real app

export default function TeachersStudentListPage() {
  
  const [currentClassId, setCurrentClassId] = useState<ClassId>(defaultClassId);
  const currentClass = sampleClassRosters[currentClassId];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Class Roster</h1>
        <p className="text-gray-600">Please select a valid class to view its student list.</p>
        {/* Simple dropdown to pick a class for demo purposes */}
        <select
          value={currentClassId}
          onChange={(e) => setCurrentClassId(e.target.value as ClassId)}
          className="mt-6 block mx-auto py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select a Class --</option>
          {Object.keys(sampleClassRosters).map(id => (
            <option key={id} value={id}>{sampleClassRosters[id as ClassId].name}</option>
          ))}
        </select>
      </div>
    );
  }

  const filteredStudents = currentClass.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      case 'Transferred': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Placeholder functions for actions
  const handleViewStudentProfile = (studentId: string) => {
    // console.log(`Viewing profile for student ID: ${studentId}`);
    alert(`Redirecting to student profile for: ${studentId}`);
    // In a real app, route to student profile page: Router.push(`/student/${studentId}/profile`);
  };

  const handleMessageParent = (parentId: string, studentName: string) => {
    // console.log(`Messaging parent of ${studentName} (Parent ID: ${parentId})`);
    alert(`Opening message composer for parent of ${studentName}`);
    // In a real app, open a messaging interface
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Student Roster: {currentClass.name}
            <span className="ml-2 text-blue-600 text-base sm:text-xl">👥</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Managed by {currentClass.teacher}. Total Students: {currentClass.students.length}</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-500" /> Students in Class
          </h3>
          {/* For demo: Class selection dropdown for easy switching */}
          <select
            value={currentClassId}
            onChange={(e) => setCurrentClassId(e.target.value as ClassId)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.keys(sampleClassRosters).map(id => (
              <option key={id} value={id}>{sampleClassRosters[id as ClassId].name}</option>
            ))}
          </select>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search student by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade Level</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name} <span className="text-gray-500 text-xs">({student.id})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <AcademicCapIcon className="h-4 w-4 inline-block mr-1 text-gray-500" /> {student.gradeLevel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentName} <br /> <span className="text-xs">{student.parentPhone}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewStudentProfile(student.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="View Student Profile"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMessageParent(student.parentPhone, student.name)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Message Parent"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students found in this class matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
