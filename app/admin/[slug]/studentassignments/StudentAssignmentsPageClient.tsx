// app/student/[slug]/my-classes/[courseId]/assignments/StudentAssignmentsPageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowLeftIcon, // For back button
  DocumentTextIcon, // For text submission content
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { AssignmentData, CourseInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface StudentAssignmentsPageClientProps {
  studentName: string;
  studentGradeLevel: string;
  initialAssignments: AssignmentData[];
  studentId: string;
  companyId: string;
  courseInfo?: CourseInfo; // Optional: if filtering by a specific course
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function StudentAssignmentsPageClient({
  studentName,
  studentGradeLevel,
  initialAssignments,
  studentId,
  companyId,
  courseInfo,
}: StudentAssignmentsPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings();

  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState(courseInfo?.id || 'All'); // Pre-select if courseId is provided
  const [filterStatus, setFilterStatus] = useState('All');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionUrlInput, setSubmissionUrlInput] = useState('');
  const [submissionContentInput, setSubmissionContentInput] = useState(''); // Updated from submissionTextInput
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);


  // Update assignments state when initialAssignments prop changes
  useEffect(() => {
    setAssignments(initialAssignments);
    if (courseInfo?.id) {
      setFilterClass(courseInfo.id); // Ensure filter is set if coming from a course-specific link
    }
  }, [initialAssignments, courseInfo]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Pending Submission': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-purple-100 text-purple-800';
      case 'Graded': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Not Submitted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'Pending Submission': return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'Submitted': return <ArrowUpTrayIcon className="h-4 w-4 text-purple-600" />;
      case 'Graded': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Overdue': return <ExclamationCircleIcon className="h-4 w-4 text-red-600" />;
      case 'Not Submitted': return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  }, []);

  const allClassesForFilter = useMemo(() => {
    const classes = new Map<string, string>(); // Map<classId, className>
    initialAssignments.forEach(assignment => { // Use initialAssignments to get all classes
      classes.set(assignment.classId, assignment.className);
    });
    return Array.from(classes.entries()).map(([id, name]) => ({ id, name }));
  }, [initialAssignments]);


  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assignment.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            assignment.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = filterClass === 'All' || assignment.classId === filterClass;
      const matchesStatus = filterStatus === 'All' || assignment.status === filterStatus;
      return matchesSearch && matchesClass && matchesStatus;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort by due date
  }, [assignments, searchTerm, filterClass, filterStatus]);

  const totalAssignments = assignments.length;
  const upcomingAssignmentsCount = assignments.filter(a => a.status === 'Pending Submission' && new Date(a.dueDate) >= new Date()).length;
  const overdueAssignmentsCount = assignments.filter(a => a.status === 'Overdue' || (a.status === 'Not Submitted' && new Date(a.dueDate) < new Date())).length;
  const gradedAssignmentsCount = assignments.filter(a => a.status === 'Graded').length;

  const handleViewDetails = useCallback((assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setShowDetailModal(true);
  }, []);

  const handleOpenSubmissionModal = useCallback((assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setSubmissionUrlInput(assignment.submissionUrl || '');
    setSubmissionContentInput(assignment.submissionContent || ''); // Initialize with existing content
    setShowSubmissionModal(true);
    setShowDetailModal(false); // Close detail modal if open
  }, []);

  const handleSubmitAssignment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !selectedAssignment) return;

    setLoading(true);
    setStatusMessage(null);

    const payload = {
      studentId: studentId,
      assignmentId: selectedAssignment.id,
      submissionUrl: submissionUrlInput.trim() || null,
      submissionContent: submissionContentInput.trim() || null, // Updated field name
      companyId: companyId,
    };

    if (!payload.submissionUrl && !payload.submissionContent) {
      showStatus('error', 'Please provide either a URL or text for your submission.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${apiBaseUrl}/student/submit-assignment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json(); // Get the full response data
        const submittedAssignment = responseData.submission; // Access the submission object

        setAssignments(prev => prev.map(a =>
          a.id === selectedAssignment.id ? {
            ...a,
            status: 'Submitted', // Update status to 'Submitted'
            submissionUrl: submittedAssignment.submissionUrl,
            submissionContent: submittedAssignment.submissionContent, // Update with new content
            submittedAt: submittedAssignment.submittedAt,
            // Keep grade and feedback as they are not updated on submission
          } : a
        ));
        showStatus('success', `Assignment "${selectedAssignment.name}" submitted successfully!`);
        setShowSubmissionModal(false);
        setSelectedAssignment(null);
        setSubmissionUrlInput('');
        setSubmissionContentInput(''); // Clear content input
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to submit assignment.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [loading, selectedAssignment, studentId, companyId, submissionUrlInput, submissionContentInput, showStatus]);


  // --- Assignment Detail Modal Component ---
  const AssignmentDetailModal = ({ assignment, onClose }: { assignment: AssignmentData; onClose: () => void }) => {
    if (!assignment) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{assignment.name}</h2>
          <div className="space-y-3 text-gray-700 mb-6">
            <p><span className="font-semibold">Class:</span> {assignment.className}</p>
            <p><span className="font-semibold">Teacher:</span> {assignment.teacher}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(assignment.dueDate).toLocaleDateString()} at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p><span className="font-semibold">Type:</span> {assignment.type}</p>
            <p><span className="font-semibold">Max Points:</span> {assignment.totalPoints}</p>
            <p><span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                {getStatusIcon(assignment.status)} {assignment.status}
              </span>
            </p>
            {assignment.submittedAt && (
              <p><span className="font-semibold">Submitted At:</span> {new Date(assignment.submittedAt).toLocaleString()}</p>
            )}
            <p className="border-t pt-3 mt-3"><span className="font-semibold">Description:</span> {assignment.description || 'No description provided.'}</p>

            {assignment.status === 'Graded' && (
              <>
                <p><span className="font-semibold">Your Grade:</span> <span className="font-bold text-lg">{assignment.grade}/{assignment.totalPoints}</span></p>
                <p><span className="font-semibold">Feedback:</span> {assignment.feedback || 'No feedback provided.'}</p>
              </>
            )}

            {assignment.submissionUrl && (
              <p>
                <span className="font-semibold">Your Submission URL:</span> <a href={assignment.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" /> View Submitted File
                </a>
              </p>
            )}
            {assignment.submissionContent && (
              <p>
                <span className="font-semibold">Your Text Submission:</span>
                <span className="block mt-1 p-2 bg-gray-50 rounded-md border border-gray-200 text-sm whitespace-pre-wrap">
                  {assignment.submissionContent}
                </span>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {(assignment.status === 'Pending Submission' || assignment.status === 'Overdue' || assignment.status === 'Not Submitted') && (
                <button
                  onClick={() => handleOpenSubmissionModal(assignment)}
                  className={`px-6 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
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
        </motion.div>
      </motion.div>
    );
  };
  // --- End Assignment Detail Modal Component ---

  // --- Submission Modal Component ---
  const SubmissionModal = ({ assignment, onClose }: { assignment: AssignmentData; onClose: () => void }) => {
    if (!assignment) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Submit: {assignment.name}</h2>
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div>
              <label htmlFor="submission-url" className="block text-sm font-medium text-gray-700 mb-1">Submission URL (e.g., Google Drive link)</label>
              <input
                type="url"
                id="submission-url"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                value={submissionUrlInput}
                onChange={(e) => setSubmissionUrlInput(e.target.value)}
                placeholder="https://your-submission-link.com"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="submission-content" className="block text-sm font-medium text-gray-700 mb-1">Or Text Submission (Optional)</label>
              <textarea
                id="submission-content" // Updated ID
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] resize-y"
                value={submissionContentInput} // Updated state variable
                onChange={(e) => setSubmissionContentInput(e.target.value)} // Updated setter
                placeholder="Type your submission directly here..."
                disabled={loading}
              ></textarea>
            </div>
            {(submissionUrlInput.trim() === '' && submissionContentInput.trim() === '') && ( // Updated check
                <p className="text-red-500 text-sm">Please provide either a URL or text for your submission.</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-[${primaryColor}] text-white rounded-md shadow-sm hover:bg-[${primaryColor}D0] transition
                                 ${loading || (submissionUrlInput.trim() === '' && submissionContentInput.trim() === '') ? 'opacity-50 cursor-not-allowed' : ''}`} // Updated check
                disabled={loading || (submissionUrlInput.trim() === '' && submissionContentInput.trim() === '')} // Updated check
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Submit'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };
  // --- End Submission Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        // variants={containerVariants}
      >
        <motion.div 
        // variants={itemVariants} 
        className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Assignments {courseInfo ? `for ${courseInfo.title}` : ''}
              <span className="ml-2 text-purple-600 text-base sm:text-xl">📝</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Track all your assignments and deadlines, {studentName}.</p>
          </div>
        </motion.div>
        <motion.div 
        // variants={itemVariants} 
        className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        // variants={containerVariants}
      >
        <motion.div 
        // variants={itemVariants} 
        className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentListIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalAssignments}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div 
        // variants={itemVariants} 
        className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
              <h2 className="text-3xl font-bold text-gray-800">{upcomingAssignmentsCount}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div 
        // variants={itemVariants} 
        className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationCircleIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{overdueAssignmentsCount}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div 
        // variants={itemVariants} 
        className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Graded Assignments</p>
              <h2 className="text-3xl font-bold text-gray-800">{gradedAssignmentsCount}</h2>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Assignments List Section */}
      <motion.div 
      // variants={itemVariants} 
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-indigo-500" /> All Assignments
          </h3>
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
                          focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
            />
          </div>
          {!courseInfo && (
            <div className="flex-shrink-0">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
              >
                <option value="All">All Classes</option>
                {allClassesForFilter.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Submission">Pending Submission</option>
              <option value="Submitted">Submitted</option>
              <option value="Graded">Graded</option>
              <option value="Overdue">Overdue</option>
              <option value="Not Submitted">Not Submitted</option>
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
                  <motion.tr key={assignment.id} 
                  // variants={itemVariants}
                  >
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
                        {(assignment.status === 'Pending Submission' || assignment.status === 'Overdue' || assignment.status === 'Not Submitted') && (
                          <button
                            onClick={() => handleOpenSubmissionModal(assignment)}
                            className="text-green-600 hover:text-green-900 flex items-center"
                            title="Submit Assignment"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetailModal && selectedAssignment && (
          <AssignmentDetailModal assignment={selectedAssignment} onClose={() => setShowDetailModal(false)} />
        )}
        {showSubmissionModal && selectedAssignment && (
          <SubmissionModal assignment={selectedAssignment} onClose={() => setShowSubmissionModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}