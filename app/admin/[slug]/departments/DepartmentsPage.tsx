'use client';

import React, { useState, useMemo } from 'react';
import {
  BriefcaseIcon, // Main icon for departments
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add department
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  UsersIcon, // For teacher count
  AcademicCapIcon, // For class count
} from '@heroicons/react/24/outline';

// Sample Data (leveraging previously used data structures where possible)
const sampleDepartmentsData = [
  {
    id: 'D001',
    name: 'Mathematics Department',
    head: 'Mr. John Doe', // Assuming John Doe is Head of Math
    description: 'Responsible for all mathematics curriculum and instruction from Grade 7 to 12.',
  },
  {
    id: 'D002',
    name: 'English Department',
    head: 'Mrs. Jane Smith',
    description: 'Focuses on language arts, literature, and communication skills.',
  },
  {
    id: 'D003',
    name: 'Science Department',
    head: 'Ms. Emily White',
    description: 'Covers Biology, Chemistry, and Physics curricula.',
  },
  {
    id: 'D004',
    name: 'Social Studies Department',
    head: 'Mr. David Green',
    description: 'Educates students on history, geography, civics, and economics.',
  },
  {
    id: 'D005',
    name: 'Arts Department',
    head: 'Ms. Sarah Brown',
    description: 'Includes visual arts, performing arts, and music education.',
  },
];

// Re-using simplified sample data from other pages for dynamic counts
const allTeachers = [
  { id: 'T001', name: 'Mr. John Doe', department: 'Mathematics' },
  { id: 'T002', name: 'Mrs. Jane Smith', department: 'English' },
  { id: 'T003', name: 'Ms. Emily White', department: 'Science' },
  { id: 'T004', name: 'Mr. David Green', department: 'Social Studies' },
  { id: 'T005', name: 'Ms. Sarah Brown', department: 'Arts' },
  { id: 'T006', name: 'Dr. Anne Ndugu', department: 'Science' }, // Additional teacher
];

const allClasses = [
  { id: 'CL101', name: 'Grade 7 Mathematics', teacher: 'Mr. John Doe', grade: '7' },
  { id: 'CL102', name: 'Grade 8 English Language', teacher: 'Mrs. Jane Smith', grade: '8' },
  { id: 'CL103', name: 'Grade 9 Algebra', teacher: 'Mr. John Doe', grade: '9' },
  { id: 'CL104', name: 'Grade 10 Geometry', teacher: 'Mr. John Doe', grade: '10' },
  { id: 'CL105', name: 'Grade 9 Biology', teacher: 'Ms. Emily White', grade: '9' },
  { id: 'CL106', name: 'World History I', teacher: 'Mr. David Green', grade: '10' },
  { id: 'CL107', name: 'Art Fundamentals', teacher: 'Ms. Sarah Brown', grade: '7' },
  { id: 'CL108', name: 'Advanced Physics', teacher: 'Dr. Anne Ndugu', grade: '11' },
];


export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(sampleDepartmentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic data for each department
  const departmentsWithCounts = useMemo(() => {
    return departments.map(dept => {
      const teacherCount = allTeachers.filter(t => t.department === dept.name.replace(' Department', '')).length;
      // This is a simplification: linking classes to departments via teacher's department
      const classCount = allClasses.filter(cls => {
          const teacher = allTeachers.find(t => t.name === cls.teacher);
          return teacher && teacher.department === dept.name.replace(' Department', '');
      }).length;
      return { ...dept, teacherCount, classCount };
    });
  }, [departments]); // Recalculate if departments state changes

  const filteredDepartments = departmentsWithCounts.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const totalDepartments = departments.length;
  const totalTeachersAcrossDepartments = allTeachers.length;
  const totalClassesAcrossDepartments = allClasses.length;


  // Event handlers
  const handleAddNewDepartment = (newDeptData) => {
    const newId = `D${String(departments.length + 1).padStart(3, '0')}`; // Simple ID generation
    setDepartments([...departments, { id: newId, ...newDeptData }]);
    setShowFormModal(false);
  };

  const handleEditDepartment = (updatedDeptData) => {
    setDepartments(departments.map(dept => dept.id === updatedDeptData.id ? updatedDeptData : dept));
    setShowFormModal(false);
    setEditingDepartment(null);
  };

  const handleDeleteDepartment = (deptId) => {
    if (confirm("Are you sure you want to delete this department? This action cannot be undone and may affect associated teachers and classes.")) { // Use custom modal in real app
      setDepartments(departments.filter(dept => dept.id !== deptId));
    }
  };

  // --- Department Form Modal ---
  const DepartmentFormModal = ({ departmentData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(departmentData || {
      name: '', head: '', description: ''
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Department: ${formData.name}` : 'Add New Department'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Department Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="head" className="block text-sm font-medium text-gray-700">Head of Department (Optional)</label>
              <input type="text" name="head" id="head" value={formData.head} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Add Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Departments Management
            <span className="ml-2 text-purple-600 text-base sm:text-xl">🏢</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Organize and manage the school's academic and administrative departments.</p>
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
              <BriefcaseIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalDepartments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UsersIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalTeachersAcrossDepartments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalClassesAcrossDepartments}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Departments List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-indigo-500" /> All Departments
          </h3>
          <button
            onClick={() => { setEditingDepartment(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Department
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by department name, head, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Departments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Head of Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <tr key={dept.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.head || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.teacherCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.classCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingDepartment(dept); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Department"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Department"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No departments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <DepartmentFormModal departmentData={editingDepartment} onClose={() => setShowFormModal(false)} onSave={editingDepartment ? handleEditDepartment : handleAddNewDepartment} isEdit={!!editingDepartment} />}
    </div>
  );
}
