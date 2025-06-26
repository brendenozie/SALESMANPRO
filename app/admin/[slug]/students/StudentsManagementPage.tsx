'use client';

import React, { useState } from 'react';
import {
  UsersIcon,
  AcademicCapIcon, // For overall students
  ArrowRightCircleIcon, // For active students
  ChartBarIcon, // For grades breakdown
  UserPlusIcon, // For add student
  PencilIcon, // For edit
  ArrowLeftIcon, // For deactivate
  ArrowRightIcon, // For activate
  MagnifyingGlassIcon, // For search
  CalendarDaysIcon, // For date
} from '@heroicons/react/24/outline';

// Sample Student Data
const sampleStudents = [
  {
    id: 'S001',
    name: 'Jane Wanjiru',
    email: 'jane.w@school.com',
    grade: '8',
    status: 'Active',
    parentName: 'Mercy Wanjiru',
    parentPhone: '+254711223344',
    enrollmentDate: '2020-09-01',
  },
  {
    id: 'S002',
    name: 'Kevin Otieno',
    email: 'kevin.o@school.com',
    grade: '7',
    status: 'Active',
    parentName: 'David Otieno',
    parentPhone: '+254722334455',
    enrollmentDate: '2021-09-01',
  },
  {
    id: 'S003',
    name: 'Sarah Kimani',
    email: 'sarah.k@school.com',
    grade: '9',
    status: 'Active',
    parentName: 'Elizabeth Kimani',
    parentPhone: '+254733445566',
    enrollmentDate: '2019-09-01',
  },
  {
    id: 'S004',
    name: 'Michael Njoroge',
    email: 'michael.n@school.com',
    grade: '8',
    status: 'Inactive', // Example inactive student
    parentName: 'Ruth Njoroge',
    parentPhone: '+254744556677',
    enrollmentDate: '2020-09-01',
  },
  {
    id: 'S005',
    name: 'Fatuma Hassan',
    email: 'fatuma.h@school.com',
    grade: '7',
    status: 'Active',
    parentName: 'Ahmed Hassan',
    parentPhone: '+254755667788',
    enrollmentDate: '2021-09-01',
  },
  {
    id: 'S006',
    name: 'Daniel Maina',
    email: 'daniel.m@school.com',
    grade: '10',
    status: 'Active',
    parentName: 'Mary Maina',
    parentPhone: '+254766778899',
    enrollmentDate: '2018-09-01',
  },
];

// Helper function to get unique grade levels and count students per grade
type Student = {
  id: string;
  name: string;
  email: string;
  grade: string;
  status: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
};

const getGradeStats = (students: Student[]) => {
  const grades: { [grade: string]: number } = {};
  students.forEach(student => {
    if (grades[student.grade]) {
      grades[student.grade]++;
    } else {
      grades[student.grade] = 1;
    }
  });
  return Object.entries(grades).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
};

export default function StudentsManagementPage() {
  const [students, setStudents] = useState(sampleStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || student.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Active').length;
  const studentsByGrade = getGradeStats(students);

  // Placeholder functions for modal interactions
  const handleAddNewStudent = (newStudentData: Partial<Student>) => {
    // In a real app, you'd send this to a backend API
    const newId = `S${String(students.length + 1).padStart(3, '0')}`; // Simple ID generation
    setStudents([
      ...students,
      {
        id: newId,
        name: newStudentData.name ?? '',
        email: newStudentData.email ?? '',
        grade: newStudentData.grade ?? '',
        status: 'Active',
        parentName: newStudentData.parentName ?? '',
        parentPhone: newStudentData.parentPhone ?? '',
        enrollmentDate: newStudentData.enrollmentDate ?? '',
      }
    ]);
    setShowAddModal(false);
  };

  const handleEditStudent = (updatedStudentData: Student) => {
    // In a real app, you'd send this to a backend API
    setStudents(students.map(s => s.id === updatedStudentData.id ? updatedStudentData : s));
    setShowEditModal(false);
    setEditingStudent(null);
  };

  const toggleStudentStatus = (studentId: string) => {
    setStudents(students.map(s =>
      s.id === studentId ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
    ));
  };

  // --- Modal Components (Simplified for demonstration) ---
  const AddStudentModal = ({
    onClose,
    onSave,
  }: {
    onClose: () => void;
    onSave: (newStudentData: Partial<Student>) => void;
  }) => {
    const [formData, setFormData] = useState({
      name: '', email: '', grade: '', parentName: '', parentPhone: '', enrollmentDate: ''
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
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Student</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
              <input type="number" name="grade" id="grade" value={formData.grade} onChange={handleChange} required min="1" max="12"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
              <input type="text" name="parentName" id="parentName" value={formData.parentName} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">Parent Phone</label>
              <input type="text" name="parentPhone" id="parentPhone" value={formData.parentPhone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700">Enrollment Date</label>
              <input type="date" name="enrollmentDate" id="enrollmentDate" value={formData.enrollmentDate} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditStudentModal = ({
    student,
    onClose,
    onSave,
  }: {
    student: Student;
    onClose: () => void;
    onSave: (updatedStudentData: Student) => void;
  }) => {
    const [formData, setFormData] = useState(student);

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
          <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Student: {formData.name}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
              <input type="number" name="grade" id="grade" value={formData.grade} onChange={handleChange} required min="1" max="12"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
              <input type="text" name="parentName" id="parentName" value={formData.parentName} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">Parent Phone</label>
              <input type="text" name="parentPhone" id="parentPhone" value={formData.parentPhone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Transferred">Transferred</option>
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
            Students Management
            <span className="ml-2 text-blue-600 text-base sm:text-xl">🎓</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Efficiently manage all student records and information.</p>
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
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalStudents}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ArrowRightCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <h2 className="text-3xl font-bold text-gray-800">{activeStudents}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Students by Grade</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {studentsByGrade.map(([grade, count]) => (
                  <span key={grade} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    G{grade}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-500" /> All Students
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
              placeholder="Search by name, email, ID, or parent..."
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
              {studentsByGrade.map(([grade]) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name (ID)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Grade {student.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.parentName} ({student.parentPhone})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${student.status === 'Active' ? 'bg-green-100 text-green-800' :
                          student.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          student.status === 'Graduated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingStudent(student); setShowEditModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Student"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleStudentStatus(student.id)}
                          className={`flex items-center ${student.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={student.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {student.status === 'Active' ? <ArrowLeftIcon className="h-5 w-5" /> : <ArrowRightIcon className="h-5 w-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddStudentModal onClose={() => setShowAddModal(false)} onSave={handleAddNewStudent} />}
      {showEditModal && editingStudent && <EditStudentModal student={editingStudent} onClose={() => setShowEditModal(false)} onSave={handleEditStudent} />}
    </div>
  );
}
