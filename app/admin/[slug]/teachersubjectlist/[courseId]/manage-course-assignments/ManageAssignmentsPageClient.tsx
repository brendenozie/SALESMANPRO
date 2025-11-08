// app/admin/[slug]/teacher-classes/[courseId]/manage-assignments/ManageAssignmentsPageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { AssignmentData, CourseAssignmentInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

// Define assignment status types to match ExamType (or a subset you use for assignments)
type AssignmentStatus = 'HOMEWORK' | 'PROJECT' | 'QUIZ' | 'OTHER'; // Corresponds to ExamType

interface ManageAssignmentsPageClientProps {
  course: CourseAssignmentInfo;
  initialAssignments: AssignmentData[];
  educatorId: string;
  companyId: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ManageAssignmentsPageClient({
  course,
  initialAssignments,
  educatorId,
  companyId,
}: ManageAssignmentsPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context

  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null); // Null for add, object for edit
  const [loading, setLoading] = useState(false);

  // Form states for assignment modal
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>('HOMEWORK'); // Default to HOMEWORK

  // Update assignments state when initialAssignments prop changes
  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.status.toLowerCase().includes(searchTerm.toLowerCase()) // Filter by ExamType string
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, searchTerm]);

  const resetForm = useCallback(() => {
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentMaxPoints('');
    setAssignmentStatus('HOMEWORK'); // Reset to default
    setEditingAssignment(null);
  }, []);

  const handleOpenModal = useCallback((assignmentToEdit: AssignmentData | null = null) => {
    if (assignmentToEdit) {
      setEditingAssignment(assignmentToEdit);
      setAssignmentTitle(assignmentToEdit.title);
      setAssignmentDescription(assignmentToEdit.description || '');
      setAssignmentDueDate(assignmentToEdit.dueDate);
      setAssignmentMaxPoints(String(assignmentToEdit.maxPoints));
      setAssignmentStatus(assignmentToEdit.status as AssignmentStatus); // Cast to AssignmentStatus
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSaveAssignment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatusMessage(null);

    const payload = {
      id: editingAssignment?.id || undefined, // Include ID for update
      title: assignmentTitle,
      description: assignmentDescription,
      dueDate: assignmentDueDate,
      maxPoints: assignmentMaxPoints ? parseInt(assignmentMaxPoints) : 0,
      status: assignmentStatus, // This will be ExamType
      courseId: course.id,
      educatorId: educatorId,
      companyId: companyId,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/teacher/assignments`, {
        method: 'POST', // POST for upsert
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedAssignment: AssignmentData = await res.json();
        setAssignments(prevAssignments => {
          if (editingAssignment) {
            // Update existing
            return prevAssignments.map(assign =>
              assign.id === savedAssignment.id ? savedAssignment : assign
            );
          } else {
            // Add new
            return [...prevAssignments, savedAssignment];
          }
        });
        showStatus('success', `Assignment "${savedAssignment.title}" ${editingAssignment ? 'updated' : 'created'} successfully!`);
        handleCloseModal();
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to save assignment.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [editingAssignment, assignmentTitle, assignmentDescription, assignmentDueDate, assignmentMaxPoints, assignmentStatus, course.id, educatorId, companyId, handleCloseModal, showStatus, loading]);

  const handleDeleteAssignment = useCallback(async (assignmentId: string, assignmentTitle: string) => {
    if (loading) return;

    if (window.confirm(`Are you sure you want to delete assignment "${assignmentTitle}"? This action cannot be undone.`)) {
      setLoading(true);
      setStatusMessage(null);
      try {
        const res = await fetch(`${apiBaseUrl}/teacher/assignments/${assignmentId}?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setAssignments(prevAssignments => prevAssignments.filter(assign => assign.id !== assignmentId));
          showStatus('success', `Assignment "${assignmentTitle}" deleted successfully!`);
        } else {
          const errorData = await res.json();
          showStatus('error', errorData.message || 'Failed to delete assignment.');
        }
      } catch (err: any) {
        showStatus('error', `Network error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, [educatorId, companyId, showStatus, loading]);


  const handleCollectSubmissions = useCallback((assignmentId: string, assignmentTitle: string) => {
    console.log(`Navigating to submissions for: ${assignmentTitle} (ID: ${assignmentId})`);
    // In a real app, this would navigate to a page to view/grade submissions for this assignment
    router.push(`/admin/${companyId}/teacher-classes/${course.id}/assignments/${assignmentId}/submissions`);
  }, [companyId, course.id, router]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
            disabled={loading}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Manage Assignments <span style={{ color: primaryColor }}>{course.title}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, edit, and track assignments for {course.academicLevelName} - {course.title}.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <button
            onClick={() => handleOpenModal()}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-[${primaryColor}] text-white rounded-md shadow-md
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Assignment
          </button>
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

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-700">Loading assignments...</span>
        </div>
      )}

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search assignments by title or status..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Assignments List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment: AssignmentData) => (
            <motion.div
              key={assignment.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${assignment.displayStatus === 'Published' ? 'bg-green-100 text-green-800' :
                                      assignment.displayStatus === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'}`}>
                    {assignment.displayStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-5 w-5 text-gray-500" />
                    <span>Max Points: {assignment.maxPoints === 0 ? 'N/A' : assignment.maxPoints}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowUpTrayIcon className="h-5 w-5 text-gray-500" />
                    <span>Submissions: {assignment.submissionCount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 flex gap-3">
                <button
                  onClick={() => handleCollectSubmissions(assignment.id, assignment.title)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[${accentColor}] text-gray-900 rounded-md text-sm font-medium
                              hover:bg-[${accentColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  <ArrowUpTrayIcon className="h-4 w-4" /> Submissions
                </button>
                <button
                  onClick={() => handleOpenModal(assignment)}
                  className={`flex-shrink-0 p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Edit Assignment"
                  disabled={loading}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  className={`flex-shrink-0 p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Delete Assignment"
                  disabled={loading}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No assignments found for this class or matching your search.</p>
            <p className="text-sm mt-2">Click "Add New Assignment" to get started!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Assignment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal} // Close on overlay click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg"
              onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent click from closing modal
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <form onSubmit={handleSaveAssignment} className="space-y-5">
                <div>
                  <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                  <input
                    type="text"
                    id="assignment-title"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="assignment-description"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] resize-y"
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                    disabled={loading}
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assignment-due-date" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      id="assignment-due-date"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={assignmentDueDate}
                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="assignment-max-points" className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                    <input
                      type="number"
                      id="assignment-max-points"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={assignmentMaxPoints}
                      onChange={(e) => setAssignmentMaxPoints(e.target.value)}
                      placeholder="e.g., 100 (0 for non-graded)"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assignment-status" className="block text-sm font-medium text-gray-700 mb-1">Type/Status</label>
                  <select
                    id="assignment-status"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={assignmentStatus}
                    onChange={(e) => setAssignmentStatus(e.target.value as AssignmentStatus)}
                    disabled={loading}
                  >
                    <option value="HOMEWORK">Homework</option>
                    <option value="PROJECT">Project</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (editingAssignment ? 'Save Changes' : 'Create Assignment')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
