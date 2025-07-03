'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon, // For Add New Assignment
  PencilSquareIcon, // For Edit Assignment
  TrashIcon, // For Delete Assignment
  ClipboardDocumentListIcon, // Main icon for assignments
  CalendarDaysIcon, // For due date
  AcademicCapIcon, // For max points
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
  ArrowUpTrayIcon, // For collect submissions
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with mock assignments
      {
        id: '6863daeef4ad17d957b92403',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        assignments: [
          {
            id: 'A001',
            title: 'Algebra Worksheet 1',
            description: 'Complete questions 1-10 from Chapter 3 worksheet.',
            dueDate: '2025-07-10',
            maxPoints: 100,
            status: 'Published', // 'Draft', 'Published', 'Graded'
            submissionCount: 28,
          },
          {
            id: 'A002',
            title: 'Geometry Project: Shapes in Nature',
            description: 'Find and photograph geometric shapes in your environment. Submit a short report.',
            dueDate: '2025-07-25',
            maxPoints: 150,
            status: 'Published',
            submissionCount: 15,
          },
          {
            id: 'A003',
            title: 'Quiz Review Sheet',
            description: 'Optional review sheet for upcoming Chapter 4 quiz.',
            dueDate: '2025-07-08',
            maxPoints: 0,
            status: 'Draft',
            submissionCount: 0,
          },
        ],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        assignments: [
          {
            id: 'E001',
            title: 'Literary Analysis Essay',
            description: 'Write a 500-word essay analyzing themes in "The Outsiders".',
            dueDate: '2025-07-18',
            maxPoints: 200,
            status: 'Published',
            submissionCount: 25,
          },
        ],
      },
    ]
  },
});

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface ManageAssignmentsPageProps {
  classId: string; // The ID of the class for which to manage assignments
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function ManageAssignmentsPage({ classId }: ManageAssignmentsPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null); // Null for add, object for edit

  // Form states for assignment modal
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState<'Draft' | 'Published' | 'Graded'>('Draft');

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const filteredAssignments = useMemo(() => {
    return currentClass?.assignments?.filter((assignment: any) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.status.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];
  }, [currentClass, searchTerm]);

  const resetForm = () => {
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentMaxPoints('');
    setAssignmentStatus('Draft');
    setEditingAssignment(null);
  };

  const handleOpenModal = (assignmentToEdit: any | null = null) => {
    if (assignmentToEdit) {
      setEditingAssignment(assignmentToEdit);
      setAssignmentTitle(assignmentToEdit.title);
      setAssignmentDescription(assignmentToEdit.description);
      setAssignmentDueDate(assignmentToEdit.dueDate);
      setAssignmentMaxPoints(assignmentToEdit.maxPoints !== 0 ? String(assignmentToEdit.maxPoints) : '');
      setAssignmentStatus(assignmentToEdit.status);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentClass) {
      showStatus('error', 'Class not loaded.');
      return;
    }

    const newAssignmentData = {
      title: assignmentTitle,
      description: assignmentDescription,
      dueDate: assignmentDueDate,
      maxPoints: assignmentMaxPoints ? parseInt(assignmentMaxPoints) : 0,
      status: assignmentStatus,
    };

    let updatedAssignments;
    if (editingAssignment) {
      // Edit existing assignment
      updatedAssignments = currentClass.assignments.map((assign: any) =>
        assign.id === editingAssignment.id ? { ...assign, ...newAssignmentData } : assign
      );
      showStatus('success', `Assignment "${newAssignmentData.title}" updated successfully!`);
    } else {
      // Add new assignment
      const newId = `A${Date.now()}`; // Simple unique ID
      updatedAssignments = [...currentClass.assignments, { id: newId, ...newAssignmentData, submissionCount: 0 }];
      showStatus('success', `Assignment "${newAssignmentData.title}" created successfully!`);
    }

    // In a real app, send this to your backend and then refetch/update state
    setCurrentClass((prevClass: any) => ({
      ...prevClass,
      assignments: updatedAssignments,
    }));

    handleCloseModal();
  };

  const handleDeleteAssignment = (assignmentId: string, assignmentTitle: string) => {
    if (window.confirm(`Are you sure you want to delete assignment "${assignmentTitle}"? This action cannot be undone.`)) {
      if (!currentClass) return;

      const updatedAssignments = currentClass.assignments.filter((assign: any) => assign.id !== assignmentId);

      // In a real app, send delete request to backend
      setCurrentClass((prevClass: any) => ({
        ...prevClass,
        assignments: updatedAssignments,
      }));
      showStatus('success', `Assignment "${assignmentTitle}" deleted successfully!`);
    }
  };

  const handleCollectSubmissions = (assignmentId: string, assignmentTitle: string) => {
    console.log(`Collecting submissions for: ${assignmentTitle} (ID: ${assignmentId})`);
    // In a real app, this would navigate to a page to view/grade submissions
    alert(`Functionality: Collect Submissions for "${assignmentTitle}"`);
  };

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

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for assignments.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back to Class List
        </button>
      </div>
    );
  }

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
            onClick={() => window.history.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Manage Assignments <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, edit, and track assignments for this class.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <button
            onClick={() => handleOpenModal()}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-[${primaryColor}] text-white rounded-md shadow-md
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
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
          filteredAssignments.map((assignment: any) => (
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
                                    ${assignment.status === 'Published' ? 'bg-green-100 text-green-800' :
                                      assignment.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'}`}>
                    {assignment.status}
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
                              hover:bg-[${accentColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
                >
                  <ArrowUpTrayIcon className="h-4 w-4" /> Submissions
                </button>
                <button
                  onClick={() => handleOpenModal(assignment)}
                  className={`flex-shrink-0 p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                  aria-label="Edit Assignment"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  className={`flex-shrink-0 p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400`}
                  aria-label="Delete Assignment"
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
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assignment-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="assignment-status"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={assignmentStatus}
                    onChange={(e) => setAssignmentStatus(e.target.value as 'Draft' | 'Published' | 'Graded')}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Graded">Graded</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                  >
                    {editingAssignment ? 'Save Changes' : 'Create Assignment'}
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
