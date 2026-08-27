'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentListIcon, // For assignments list
  PlusCircleIcon, // For add assignment
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  ClockIcon, // For upcoming/due dates
  CheckCircleIcon, // For completed
  ExclamationCircleIcon, // For pending
  ChartBarIcon, // For grades (optional, linking to grade entry)
} from '@heroicons/react/24/outline';

// Sample Data for the Teacher's Assignment Page
const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name
const teacherRole = "Mathematics Teacher";

const sampleClassesForAssignments = [ // Simplified list of classes for filtering
    { id: 'CL101', name: 'Grade 7 Mathematics', studentsEnrolled: 35 },
    { id: 'CL102', name: 'Grade 8 English Language', studentsEnrolled: 30 },
    { id: 'CL103', name: 'Grade 9 Algebra', studentsEnrolled: 28 },
    { id: 'CL104', name: 'Grade 10 Geometry', studentsEnrolled: 22 },
];

const sampleAssignments = [
  {
    id: 'A001',
    name: 'Algebra Homework Set 2',
    classId: 'CL103', // Linked to sampleClassesForAssignments
    className: 'Grade 9 Algebra',
    dueDate: '2025-07-01',
    status: 'Pending Marking', // Options: Assigned, Pending Marking, Graded, Overdue
    type: 'Homework',
    totalPoints: 20,
    description: 'Complete exercises 1-10 from Chapter 3.',
    submissions: 25, // Number of students who submitted
    totalStudents: 28, // Total students in class
  },
  {
    id: 'A002',
    name: 'Literary Analysis Essay Draft',
    classId: 'CL102',
    className: 'Grade 8 English Language',
    dueDate: '2025-07-05',
    status: 'Assigned',
    type: 'Essay',
    totalPoints: 50,
    description: 'First draft of the "Themes in Literature" essay.',
    submissions: 10,
    totalStudents: 30,
  },
  {
    id: 'A003',
    name: 'Geometry Midterm Review',
    classId: 'CL104',
    className: 'Grade 10 Geometry',
    dueDate: '2025-06-25', // Past date
    status: 'Overdue',
    type: 'Review',
    totalPoints: 0, // Could be non-graded
    description: 'Self-study review sheet for midterm exam.',
    submissions: 18,
    totalStudents: 22,
  },
  {
    id: 'A004',
    name: 'Grade 7 Math Quiz 1',
    classId: 'CL101',
    className: 'Grade 7 Mathematics',
    dueDate: '2025-06-20', // Past date, graded
    status: 'Graded',
    type: 'Quiz',
    totalPoints: 10,
    description: 'Quiz on fractions and decimals.',
    submissions: 35,
    totalStudents: 35,
  },
];

type Assignment = {
  id: string;
  name: string;
  classId: string;
  className: string;
  dueDate: string;
  status: string;
  type: string;
  totalPoints: number;
  description: string;
  submissions: number;
  totalStudents: number;
};

type AssignmentFormData = Omit<Assignment, 'id' | 'submissions' | 'totalStudents'>;

export default function TeachersAssignmentPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(sampleAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-100 text-blue-800';
      case 'Pending Marking': return 'bg-yellow-100 text-yellow-800';
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Marking': return <ExclamationCircleIcon className="h-4 w-4 text-yellow-600" />;
      case 'Graded': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Overdue': return <ClockIcon className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const handleAddNewAssignment = (newAssignmentData: AssignmentFormData) => {
    const newId = `A${String(assignments.length + 1).padStart(3, '0')}`; // Simple ID generation
    setAssignments([
      ...assignments,
      {
        id: newId,
        ...newAssignmentData,
        submissions: 0,
        totalStudents: sampleClassesForAssignments.find(c => c.id === newAssignmentData.classId)?.studentsEnrolled || 0
      }
    ]);
    setShowAddModal(false);
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Search filter
    const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || assignment.classId === filterClass;
    const matchesStatus = filterStatus === 'All' || assignment.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort by due date


  const totalAssignments = assignments.length;
  const pendingMarking = assignments.filter(a => a.status === 'Pending Marking').length;
  const overdueAssignments = assignments.filter(a => a.status === 'Overdue').length;
  const upcomingDeadlines = assignments.filter(a => a.status === 'Assigned' && new Date(a.dueDate) > new Date()).length;



  const handleEditAssignment = (updatedAssignmentData: Assignment) => {
    setAssignments(assignments.map(a => a.id === updatedAssignmentData.id ? updatedAssignmentData : a));
    setShowEditModal(false);
    setEditingAssignment(null);
  };

  const handleGradeSubmissions = (assignmentId: string) => {
    // console.log(`Navigating to grading interface for assignment: ${assignmentId}`);
    alert(`Redirecting to grade submissions for Assignment ID: ${assignmentId}`);
    // In a real app, this would route to a specific grading page:
    // Router.push(`/teacher/assignments/${assignmentId}/grade`);
  };

  // --- Modal Component (Reusable for Add/Edit) ---
  type AssignmentFormModalProps = {
    assignmentData?: Partial<Assignment>;
    onClose: () => void;
    onSave: (data: any) => void;
    isEdit?: boolean;
  };

  const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({ assignmentData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(assignmentData || {
      name: '',
      classId: sampleClassesForAssignments[0]?.id || '', // Default to first class
      dueDate: '',
      type: 'Homework',
      totalPoints: 100,
      description: '',
      status: 'Assigned', // Default status for new assignments
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Add class name to formData before saving
      const selectedClass = sampleClassesForAssignments.find(c => c.id === formData.classId);
      onSave({ ...formData, className: selectedClass ? selectedClass.name : '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Assignment: ${formData.name}` : 'Create New Assignment'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Assignment Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class</label>
              <select name="classId" id="classId" value={formData.classId} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                {sampleClassesForAssignments.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="Homework">Homework</option>
                <option value="Quiz">Quiz</option>
                <option value="Project">Project</option>
                <option value="Essay">Essay</option>
                <option value="Exam">Exam</option>
                <option value="Review">Review</option>
              </select>
            </div>
            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700">Total Points</label>
              <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            {isEdit && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                  <option value="Assigned">Assigned</option>
                  <option value="Pending Marking">Pending Marking</option>
                  <option value="Graded">Graded</option>
                  <option value="Overdue">Overdue</option>
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
                {isEdit ? 'Save Changes' : 'Create Assignment'}
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
            My Assignments
            <span className="ml-2 text-purple-600 text-base sm:text-xl">📝</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track all your class assignments.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationCircleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Marking</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingMarking}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{overdueAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CalendarDaysIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <h2 className="text-3xl font-bold text-gray-800">{upcomingDeadlines}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> All Assignments
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Assignment
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
              placeholder="Search by assignment name, class, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {sampleClassesForAssignments.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Pending Marking">Pending Marking</option>
              <option value="Graded">Graded</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.totalPoints}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.submissions}/{assignment.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)} {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingAssignment(assignment); setShowEditModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Assignment"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {(assignment.status === 'Pending Marking' || assignment.status === 'Overdue') && (
                          <button
                            onClick={() => handleGradeSubmissions(assignment.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Grade Submissions"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AssignmentFormModal onClose={() => setShowAddModal(false)} onSave={handleAddNewAssignment} />}
      {showEditModal && editingAssignment && <AssignmentFormModal assignmentData={editingAssignment} onClose={() => setShowEditModal(false)} onSave={handleEditAssignment} isEdit={true} />}
    </div>
  );
}
