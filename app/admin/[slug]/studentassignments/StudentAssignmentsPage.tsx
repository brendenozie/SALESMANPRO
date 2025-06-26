'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon, // For assignments
  ClockIcon, // For due dates / overdue
  CheckCircleIcon, // For completed
  XCircleIcon, // For not submitted
  ChartBarIcon, // For grades
  EyeIcon, // For view details
  ArrowUpTrayIcon, // For upload submission
  UsersIcon, // For teacher/class
  ExclamationCircleIcon, // For overdue/alert
  LinkIcon, // For submission link
  MagnifyingGlassIcon, // For search input
} from '@heroicons/react/24/outline';

// Sample Data for the Student's Assignments Page
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

const sampleStudentAssignments = [
  {
    id: 'SA001',
    name: 'Algebra Homework Set 2',
    classId: 'CL101',
    className: 'Grade 7 Mathematics', // Corrected class for Jane
    teacher: 'Mr. John Doe',
    dueDate: '2025-07-01',
    status: 'Pending Submission', // Options: Pending Submission, Submitted, Graded, Overdue, Not Submitted
    type: 'Homework',
    totalPoints: 20,
    grade: null,
    feedback: null,
    submissionUrl: null, // Placeholder for student's submission URL
    description: 'Complete the assigned algebra problems from chapter 2 in your textbook.',
  },
  {
    id: 'SA002',
    name: 'Literary Analysis Essay Draft',
    classId: 'CL102',
    className: 'Grade 8 English Language',
    teacher: 'Mrs. Jane Smith',
    dueDate: '2025-07-05',
    status: 'Pending Submission',
    type: 'Essay',
    totalPoints: 50,
    grade: null,
    feedback: null,
    submissionUrl: null,
    description: 'Write a draft essay analyzing the main themes in the assigned novel.',
  },
  {
    id: 'SA003',
    name: 'Science Lab Report',
    classId: 'CL103',
    className: 'Grade 8 Science', // Corrected class for Jane
    teacher: 'Ms. Emily White',
    dueDate: '2025-06-25', // Past date
    status: 'Overdue',
    type: 'Lab Report',
    totalPoints: 30,
    grade: null,
    feedback: null,
    submissionUrl: null,
    description: 'Document your findings from the recent chemistry lab experiment.',
  },
  {
    id: 'SA004',
    name: 'History Research Project',
    classId: 'CL104',
    className: 'Grade 8 History', // Corrected class for Jane
    teacher: 'Mr. David Green',
    dueDate: '2025-06-20', // Past date, graded
    status: 'Graded',
    type: 'Project',
    totalPoints: 100,
    grade: 88,
    feedback: 'Good research, consider strengthening your conclusion.',
    submissionUrl: '/submissions/jane_history_project.pdf',
    description: 'Research and present on a significant event in African history.',
  },
  {
    id: 'SA005',
    name: 'Math Quiz 1',
    classId: 'CL101',
    className: 'Grade 7 Mathematics',
    teacher: 'Mr. John Doe',
    dueDate: '2025-06-15', // Past date, submitted but not graded
    status: 'Submitted',
    type: 'Quiz',
    totalPoints: 10,
    grade: null,
    feedback: null,
    submissionUrl: '/submissions/jane_math_quiz1.pdf',
    description: 'First quiz covering topics from the first two weeks of class.',
  },
];

const sampleClassesForFilter = [
  { id: 'CL101', name: 'Grade 7 Mathematics' },
  { id: 'CL102', name: 'Grade 8 English Language' },
  { id: 'CL103', name: 'Grade 8 Science' },
  { id: 'CL104', name: 'Grade 8 History' },
];


export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState(sampleStudentAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Submission': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-purple-100 text-purple-800';
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Not Submitted': return 'bg-red-100 text-red-800'; // Treat same as overdue for visual urgency
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Submission': return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'Submitted': return <ArrowUpTrayIcon className="h-4 w-4 text-purple-600" />;
      case 'Graded': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Overdue': return <ExclamationCircleIcon className="h-4 w-4 text-red-600" />;
      case 'Not Submitted': return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          assignment.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || assignment.classId === filterClass;
    const matchesStatus = filterStatus === 'All' || assignment.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort by due date

  const totalAssignments = assignments.length;
  const upcomingAssignments = assignments.filter(a => a.status === 'Pending Submission' && new Date(a.dueDate) >= new Date()).length;
  const overdueAssignments = assignments.filter(a => a.status === 'Overdue' || (a.status === 'Pending Submission' && new Date(a.dueDate) < new Date())).length;
  const gradedAssignments = assignments.filter(a => a.status === 'Graded').length;

  type Assignment = typeof sampleStudentAssignments[number];

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  };

  // Placeholder for submission logic
  const handleSubmitAssignment = (assignmentId: string) => {
    alert(`Simulating submission for Assignment ID: ${assignmentId}`);
    // In a real app, this would open a file upload/text input modal
    // On successful upload, update assignment status to 'Submitted'
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'Submitted', submissionUrl: '/dummy-submitted-file.pdf' } : a));
  };

  // --- Assignment Detail Modal ---
  const AssignmentDetailModal = ({ assignment, onClose }: { assignment: Assignment; onClose: () => void }) => {
    if (!assignment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{assignment.name}</h2>
          <div className="space-y-3 text-gray-700 mb-6">
            <p><span className="font-semibold">Class:</span> {assignment.className}</p>
            <p><span className="font-semibold">Teacher:</span> {assignment.teacher}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Type:</span> {assignment.type}</p>
            <p><span className="font-semibold">Max Points:</span> {assignment.totalPoints}</p>
            <p><span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                {getStatusIcon(assignment.status)} {assignment.status}
              </span>
            </p>
            <p className="border-t pt-3 mt-3"><span className="font-semibold">Description:</span> {assignment.description}</p>
            
            {assignment.status === 'Graded' && (
              <>
                <p><span className="font-semibold">Your Grade:</span> <span className="font-bold text-lg">{assignment.grade}/{assignment.totalPoints}</span></p>
                <p><span className="font-semibold">Feedback:</span> {assignment.feedback || 'No feedback provided.'}</p>
              </>
            )}

            {assignment.submissionUrl && (
              <p>
                <span className="font-semibold">Your Submission:</span> <a href={assignment.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" /> View Submitted File
                </a>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {(assignment.status === 'Pending Submission' || assignment.status === 'Overdue') && (
                 <button
                    onClick={() => { handleSubmitAssignment(assignment.id); onClose(); }} // Close modal after action
                    className="px-6 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition"
                >
                    <ArrowUpTrayIcon className="h-5 w-5 inline-block mr-2" /> Submit Assignment
                </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
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
          <p className="text-sm text-gray-600 mt-1">Track all your assignments and deadlines, {studentName}.</p>
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
              <ClockIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <h2 className="text-3xl font-bold text-gray-800">{upcomingAssignments}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationCircleIcon className="h-7 w-7 text-red-600" />
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
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Graded Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{gradedAssignments}</h2>
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
          {/* Add quick actions like "View Calendar" or "Contact Teacher" here if desired */}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by assignment name or class..."
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
              {sampleClassesForFilter.map(cls => (
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
              <option value="Pending Submission">Pending Submission</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
              <option value="Overdue">Overdue</option>
              {/* Note: 'Not Submitted' is a specific overdue state, might combine visually */}
            </select>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class (Teacher)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Grade</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.className} <br />
                      <span className="text-xs text-gray-400">({assignment.teacher})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.grade !== null ? (
                        <span className="font-bold text-gray-900">{assignment.grade}/{assignment.totalPoints}</span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)} {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(assignment)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {(assignment.status === 'Pending Submission' || assignment.status === 'Overdue') && (
                          <button
                            onClick={() => handleSubmitAssignment(assignment.id)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Submit Assignment"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedAssignment && (
        <AssignmentDetailModal assignment={selectedAssignment} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}
