'use client';

import React, { useState } from 'react';
import {
  AcademicCapIcon, // General for classes/education
  CalendarDaysIcon, // For date
  BookOpenIcon, // For courses/classes
  PlusCircleIcon, // For add class
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  UsersIcon, // For students enrolled
  BriefcaseIcon, // For departments (if classes tied to departments)
  ArrowLeftIcon, // For deactivate
  ArrowRightIcon, // For activate
} from '@heroicons/react/24/outline';

// Types
interface ClassData {
  id?: string;
  name: string;
  teacher: string;
  grade: string;
  studentsEnrolled: number | string;
  schedule: string;
  room: string;
  status: string;
}

// Sample Class Data
const sampleClasses: ClassData[] = [
  {
    id: 'CL101',
    name: 'Grade 7 Mathematics',
    teacher: 'Mr. John Doe', // Could be teacher ID in a real system
    grade: '7',
    studentsEnrolled: 32,
    schedule: 'Mon, Wed, Fri (9:00 AM - 9:45 AM)',
    room: 'Room 101',
    status: 'Active',
  },
  {
    id: 'CL102',
    name: 'Grade 8 English Language',
    teacher: 'Mrs. Jane Smith',
    grade: '8',
    studentsEnrolled: 28,
    schedule: 'Tue, Thu (10:30 AM - 11:15 AM)',
    room: 'Room 102',
    status: 'Active',
  },
  {
    id: 'CL103',
    name: 'Grade 9 Biology',
    teacher: 'Ms. Emily White',
    grade: '9',
    studentsEnrolled: 25,
    schedule: 'Mon, Wed (1:00 PM - 1:45 PM)',
    room: 'Lab 1',
    status: 'Active',
  },
  {
    id: 'CL104',
    name: 'Grade 10 History',
    teacher: 'Mr. David Green',
    grade: '10',
    studentsEnrolled: 20,
    schedule: 'Tue, Thu (2:00 PM - 2:45 PM)',
    room: 'Room 203',
    status: 'Active',
  },
  {
    id: 'CL105',
    name: 'Grade 7 Art & Design',
    teacher: 'Ms. Sarah Brown',
    grade: '7',
    studentsEnrolled: 30,
    schedule: 'Wed (11:00 AM - 11:45 AM)',
    room: 'Art Studio',
    status: 'Active',
  },
  {
    id: 'CL106',
    name: 'Grade 11 Advanced Physics',
    teacher: 'Dr. Anne Ndugu',
    grade: '11',
    studentsEnrolled: 15,
    schedule: 'Mon, Fri (10:00 AM - 11:30 AM)',
    room: 'Physics Lab',
    status: 'Inactive', // Example inactive class
  },
];

// Helper functions for stats and filters
const getUniqueGrades = (classes: Array<{ grade: string }>) => {
  const grades = Array.from(new Set(classes.map(cls => cls.grade)));
  return grades.sort((a, b) => parseInt(a) - parseInt(b));
};

const getUniqueTeachers = (classes: Array<{ teacher: string }>) => {
    return Array.from(new Set(classes.map(cls => cls.teacher))).sort();
};

export default function ClassesManagementPage() {
  const [classes, setClasses] = useState(sampleClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [filterTeacher, setFilterTeacher] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cls.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || cls.grade === filterGrade;
    const matchesTeacher = filterTeacher === 'All' || cls.teacher === filterTeacher;
    return matchesSearch && matchesGrade && matchesTeacher;
  });

  const handleAddNewClass = (newClassData: ClassData) => {
    const newId = `CL${String(classes.length + 1).padStart(3, '0')}`; // Simple ID generation
    setClasses([...classes, { id: newId, ...newClassData, status: 'Active' }]);
    setShowAddModal(false);
  };

  const totalClasses = classes.length;
  const activeClasses = classes.filter(cls => cls.status === 'Active').length;
  const uniqueGrades = getUniqueGrades(classes);
  const uniqueTeachers = getUniqueTeachers(classes);

  const handleEditClass = (updatedClassData: ClassData) => {
    setClasses(classes.map(cls => cls.id === updatedClassData.id ? updatedClassData : cls));
    setShowEditModal(false);
    setEditingClass(null);
  };

  const toggleClassStatus = (classId: string) => {
    setClasses(classes.map(cls =>
      cls.id === classId ? { ...cls, status: cls.status === 'Active' ? 'Inactive' : 'Active' } : cls
    ));
  };

  // --- Modal Components (Simplified for demonstration) ---
  interface ClassFormModalProps {
    classData?: ClassData;
    onClose: () => void;
    onSave: (data: ClassData) => void;
    isEdit?: boolean;
  }

  const ClassFormModal: React.FC<ClassFormModalProps> = ({ classData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState<ClassData>(classData || {
      name: '', teacher: '', grade: '', studentsEnrolled: '', schedule: '', room: '', status: 'Active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Class: ${formData.name}` : 'Add New Class'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Class Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="teacher" className="block text-sm font-medium text-gray-700">Assigned Teacher</label>
              <input type="text" name="teacher" id="teacher" value={formData.teacher} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade Level</label>
              <input type="number" name="grade" id="grade" value={formData.grade} onChange={handleChange} required min="1" max="12"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="studentsEnrolled" className="block text-sm font-medium text-gray-700">Students Enrolled</label>
              <input type="number" name="studentsEnrolled" id="studentsEnrolled" value={formData.studentsEnrolled} onChange={handleChange} min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">Schedule</label>
              <input type="text" name="schedule" id="schedule" value={formData.schedule} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700">Room</label>
              <input type="text" name="room" id="room" value={formData.room} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            {isEdit && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Add Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Components ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Classes Management
            <span className="ml-2 text-teal-600 text-base sm:text-xl">🏫</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage and organize all school classes and courses.</p>
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
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{activeClasses}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UsersIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Grades Taught</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {uniqueGrades.map((grade) => (
                  <span key={grade} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    Grade {grade}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500" /> All Classes
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Class
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
              placeholder="Search by class name, teacher, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Grades</option>
              {uniqueGrades.map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
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
        </div>

        {/* Classes Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cls.name} <span className="text-gray-500 text-xs">({cls.id})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.teacher}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade {cls.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.studentsEnrolled}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.schedule} ({cls.room})</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${cls.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {cls.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingClass(cls); setShowEditModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Class"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleClassStatus(cls.id!)}
                          className={`flex items-center ${cls.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={cls.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {cls.status === 'Active' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No classes found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <ClassFormModal onClose={() => setShowAddModal(false)} onSave={handleAddNewClass} />}
      {showEditModal && editingClass && <ClassFormModal classData={editingClass} onClose={() => setShowEditModal(false)} onSave={handleEditClass} isEdit={true} />}
    </div>
  );
}
