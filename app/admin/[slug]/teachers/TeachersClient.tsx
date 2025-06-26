'use client';

import React, { useState } from 'react';
import {
  UsersIcon,
  AcademicCapIcon, // For overall teachers
  BriefcaseIcon, // For departments
  UserPlusIcon, // For add teacher
  PencilIcon, // For edit
  EyeIcon, // For view details
  ArrowLeftIcon, // For deactivate
  ArrowRightIcon, // For activate (replacing ToggleRightIcon)
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
  CubeTransparentIcon, // For status color
} from '@heroicons/react/24/outline';

// Sample Teacher Data
const sampleTeachers = [
  {
    id: 'T001',
    name: 'Mr. John Doe',
    email: 'john.doe@school.com',
    department: 'Mathematics',
    classesTaught: ['Grade 7 Math', 'Grade 8 Math'],
    status: 'Active',
    phone: '+254712345678',
    hireDate: '2015-08-01',
  },
  {
    id: 'T002',
    name: 'Mrs. Jane Smith',
    email: 'jane.smith@school.com',
    department: 'English',
    classesTaught: ['Grade 7 English', 'Grade 8 English'],
    status: 'Active',
    phone: '+254723456789',
    hireDate: '2018-09-01',
  },
  {
    id: 'T003',
    name: 'Ms. Emily White',
    email: 'emily.white@school.com',
    department: 'Science',
    classesTaught: ['Grade 8 Science', 'Grade 9 Biology'],
    status: 'Inactive', // Example inactive teacher
    phone: '+254734567890',
    hireDate: '2020-01-15',
  },
  {
    id: 'T004',
    name: 'Mr. David Green',
    email: 'david.green@school.com',
    department: 'History',
    classesTaught: ['Grade 8 History', 'Grade 10 History'],
    status: 'Active',
    phone: '+254745678901',
    hireDate: '2017-03-10',
  },
  {
    id: 'T005',
    name: 'Ms. Sarah Brown',
    email: 'sarah.brown@school.com',
    department: 'Art',
    classesTaught: ['Grade 7 Art', 'Grade 8 Art'],
    status: 'Active',
    phone: '+254756789012',
    hireDate: '2022-02-20',
  },
];

// Helper function to get unique departments
const uniqueDepartments = Array.from(new Set(sampleTeachers.map(teacher => teacher.department)));

export default function TeachersManagementPage() {
  const [teachers, setTeachers] = useState(sampleTeachers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  type Teacher = {
    id: string;
    name: string;
    email: string;
    department: string;
    classesTaught: string[];
    status: string;
    phone: string;
    hireDate: string;
  };
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || teacher.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const totalTeachers = teachers.length;
  const activeTeachers = teachers.filter(t => t.status === 'Active').length;
  const totalDepartments = uniqueDepartments.length;

  // Placeholder functions for modal interactions
  const handleAddNewTeacher = (newTeacherData: Omit<Teacher, 'id' | 'status' | 'classesTaught'>) => {
    // In a real app, you'd send this to a backend API
    const newId = `T${String(teachers.length + 1).padStart(3, '0')}`; // Simple ID generation
    setTeachers([...teachers, { id: newId, ...newTeacherData, status: 'Active', classesTaught: [] }]);
    setShowAddModal(false);
  };

  const handleEditTeacher = (updatedTeacherData: Teacher) => {
    // In a real app, you'd send this to a backend API
    setTeachers(teachers.map(t => t.id === updatedTeacherData.id ? updatedTeacherData : t));
    setShowEditModal(false);
    setEditingTeacher(null);
  };

  const toggleTeacherStatus = (teacherId: string) => {
    setTeachers(teachers.map(t =>
      t.id === teacherId ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
    ));
  };

  // --- Modal Components (Simplified for demonstration) ---
  const AddTeacherModal = ({
    onClose,
    onSave,
  }: {
    onClose: () => void;
    onSave: (newTeacherData: {
      name: string;
      email: string;
      department: string;
      phone: string;
      hireDate: string;
    }) => void;
  }) => {
    const [formData, setFormData] = useState({
      name: '', email: '', department: '', phone: '', hireDate: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Teacher</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700">Hire Date</label>
              <input type="date" name="hireDate" id="hireDate" value={formData.hireDate} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditTeacherModal = ({
    teacher,
    onClose,
    onSave,
  }: {
    teacher: Teacher;
    onClose: () => void;
    onSave: (updatedTeacherData: Teacher) => void;
  }) => {
    const [formData, setFormData] = useState<Teacher>(teacher);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    if (!formData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Teacher: {formData.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Save Changes
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
            Teachers Management
            <span className="ml-2 text-purple-600 text-base sm:text-xl">🧑‍🏫</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Efficiently manage all teaching staff information.</p>
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
              <UsersIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Teachers</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalTeachers}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Teachers</p>
              <h2 className="text-3xl font-bold text-gray-800">{activeTeachers}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BriefcaseIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalDepartments}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-500" /> All Teachers
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.classesTaught.join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${teacher.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingTeacher(teacher); setShowEditModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Teacher"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleTeacherStatus(teacher.id)}
                          className={`flex items-center ${teacher.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={teacher.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {teacher.status === 'Active' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
                        </button>
                        {/* Could add a 'View Details' button here too */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No teachers found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddTeacherModal onClose={() => setShowAddModal(false)} onSave={handleAddNewTeacher} />}
      {showEditModal && editingTeacher && <EditTeacherModal teacher={editingTeacher} onClose={() => setShowEditModal(false)} onSave={handleEditTeacher} />}
    </div>
  );
}
