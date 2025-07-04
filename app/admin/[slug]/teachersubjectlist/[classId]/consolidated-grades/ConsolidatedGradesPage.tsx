'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  TableCellsIcon, // For grades table
  UserCircleIcon, // For student avatar placeholder
  DocumentArrowDownIcon, // For export button
  PencilIcon, // For editing individual grades
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon, // For overall grades/reports
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with student data and mock grade records
      {
        id: '6863daeef4ad17d957b92403',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        schedule: 'Mon, Wed, Fri | 9:00 AM - 9:45 AM',
        room: 'Room 101',
        students: [
          { studentId: 'S001', name: 'Alice Smith', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=AS' },
          { studentId: 'S002', name: 'Bob Johnson', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=BJ' },
          { studentId: 'S003', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100/28A745/FFFFFF?text=CB' },
          { studentId: 'S004', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100/007BFF/FFFFFF?text=DP' },
          { studentId: 'S005', name: 'Ethan Hunt', avatarUrl: 'https://placehold.co/100x100/8A2BE2/FFFFFF?text=EH' },
          { studentId: 'S006', name: 'Fiona Gallagher', avatarUrl: 'https://placehold.co/100x100/DDA0DD/FFFFFF?text=FG' },
          { studentId: 'S007', name: 'George Costanza', avatarUrl: 'https://placehold.co/100x100/4169E1/FFFFFF?text=GC' },
          { studentId: 'S008', name: 'Hannah Montana', avatarUrl: 'https://placehold.co/100x100/FF4500/FFFFFF?text=HM' },
        ],
        grades: { // Student ID as key, then assessment name as key
          'S001': {
            'Quiz 1 (Algebra)': 85,
            'Homework 1': 92,
            'Midterm Exam': 78,
            'Project: Geometry Basics': 95,
          },
          'S002': {
            'Quiz 1 (Algebra)': 70,
            'Homework 1': 88,
            'Midterm Exam': null, // Missing grade
            'Project: Geometry Basics': 82,
          },
          'S003': {
            'Quiz 1 (Algebra)': 90,
            'Homework 1': 95,
            'Midterm Exam': 85,
            'Project: Geometry Basics': 90,
          },
          'S004': {
            'Quiz 1 (Algebra)': 75,
            'Homework 1': 80,
            'Midterm Exam': 65,
            'Project: Geometry Basics': 70,
          },
          'S005': {
            'Quiz 1 (Algebra)': 88,
            'Homework 1': 90,
            'Midterm Exam': 80,
            'Project: Geometry Basics': 92,
          },
          'S006': {
            'Quiz 1 (Algebra)': 60,
            'Homework 1': 70,
            'Midterm Exam': 55,
            'Project: Geometry Basics': 65,
          },
          'S007': {
            'Quiz 1 (Algebra)': 92,
            'Homework 1': 98,
            'Midterm Exam': 90,
            'Project: Geometry Basics': 96,
          },
          'S008': {
            'Quiz 1 (Algebra)': 80,
            'Homework 1': 85,
            'Midterm Exam': 72,
            'Project: Geometry Basics': 78,
          },
        },
        assessments: [ // Define the assessments for this class
          { id: 'Quiz 1 (Algebra)', name: 'Quiz 1 (Algebra)', type: 'Quiz', weight: 0.1 },
          { id: 'Homework 1', name: 'Homework 1', type: 'Homework', weight: 0.05 },
          { id: 'Midterm Exam', name: 'Midterm Exam', type: 'Exam', weight: 0.3 },
          { id: 'Project: Geometry Basics', name: 'Project: Geometry Basics', type: 'Project', weight: 0.2 },
          // Add more assessments as needed
        ]
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        schedule: 'Tue, Thu | 10:30 AM - 11:15 AM',
        room: 'Room 102',
        students: [
          { studentId: 'S009', name: 'Isabelle Lightwood', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=IL' },
          { studentId: 'S010', name: 'Jacob Black', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=JB' },
        ],
        grades: {
          'S009': {
            'Essay 1': 88,
            'Grammar Quiz': 92,
          },
          'S010': {
            'Essay 1': 75,
            'Grammar Quiz': 80,
          },
        },
        assessments: [
          { id: 'Essay 1', name: 'Essay 1', type: 'Essay', weight: 0.4 },
          { id: 'Grammar Quiz', name: 'Grammar Quiz', type: 'Quiz', weight: 0.2 },
        ]
      },
    ]
  },
});

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface ConsolidatedGradesPageProps {
  classId: string; // The ID of the class for which to display grades
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function ConsolidatedGradesPage({ classId }: ConsolidatedGradesPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; assessmentId: string; currentGrade: any } | null>(null);
  const [newGradeValue, setNewGradeValue] = useState('');

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const filteredStudents = useMemo(() => {
    return currentClass?.students?.filter((student: any) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [currentClass, searchTerm]);

  const assessments = currentClass?.assessments || [];

  // Function to calculate average grade (simple average for now, can be weighted)
  const calculateAverage = (studentId: string) => {
    const studentGrades = currentClass?.grades?.[studentId] || {};
    let total = 0;
    let count = 0;
    assessments.forEach((assessment: any) => {
      const grade = studentGrades[assessment.id];
      if (typeof grade === 'number') { // Only average numerical grades
        total += grade;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(2) : 'N/A';
  };

  const handleExportGrades = () => {
    if (!currentClass) {
      showStatus('error', 'No class data to export.');
      return;
    }

    // Basic CSV export
    let csvContent = `Student Name,Student ID,${assessments.map((a: any) => a.name).join(',')},Average Grade\n`;

    filteredStudents.forEach((student: any) => {
      const studentGrades = currentClass.grades?.[student.studentId] || {};
      const gradesRow = assessments.map((a: any) => {
        const grade = studentGrades[a.id];
        return grade !== null && grade !== undefined ? grade : 'N/A';
      }).join(',');
      csvContent += `${student.name},${student.studentId},${gradesRow},${calculateAverage(student.studentId)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${currentClass.name}_Grades_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showStatus('success', `Grades exported successfully for ${currentClass.name}!`);
  };

  const handleEditGradeClick = (studentId: string, assessmentId: string, currentGrade: any) => {
    setEditingGrade({ studentId, assessmentId, currentGrade });
    setNewGradeValue(currentGrade !== null && currentGrade !== undefined ? String(currentGrade) : '');
  };

  const handleSaveEditedGrade = () => {
    if (!editingGrade || !currentClass) return;

    const { studentId, assessmentId } = editingGrade;
    const updatedGrades = { ...currentClass.grades };
    if (!updatedGrades[studentId]) {
      updatedGrades[studentId] = {};
    }
    updatedGrades[studentId][assessmentId] = newGradeValue === '' ? null : parseFloat(newGradeValue) || newGradeValue; // Handle number or string grades

    // In a real app, you'd send this update to your backend
    // For mock, we'll update the currentClass state (this is a simplified in-memory update)
    setCurrentClass((prevClass: any) => ({
      ...prevClass,
      grades: updatedGrades,
    }));

    showStatus('success', `Grade for ${editingGrade.assessmentId} updated for ${filteredStudents.find((s:any) => s.studentId === studentId)?.name}.`);
    setEditingGrade(null); // Close modal/editing state
    setNewGradeValue('');
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
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
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for grades.</p>
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
              Consolidated Grades <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of student performance across all assessments.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <button
            onClick={handleExportGrades}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-md shadow-sm border border-gray-200
                        hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
          >
            <DocumentArrowDownIcon className="h-5 w-5" /> Export Grades
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
          placeholder="Search student by name or ID..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                     text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Grades Table */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredStudents.length > 0 && assessments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Student Name
                </th>
                {assessments.map((assessment: any) => (
                  <th key={assessment.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {assessment.name}
                    <p className="font-normal text-gray-400 normal-case">({assessment.type})</p>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student: any) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      {student.avatarUrl ? (
                        <img
                          src={customLoader({ src: student.avatarUrl, width: 40 })}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-100"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/40x40/${primaryColor.replace('#', '')}/FFFFFF?text=${student.name.split(' ').map((n: string) => n[0]).join('')}`;
                          }}
                        />
                      ) : (
                        <UserCircleIcon className="w-8 h-8 text-gray-300 mr-3" />
                      )}
                      {student.name}
                    </div>
                  </td>
                  {assessments.map((assessment: any) => {
                    const grade = currentClass.grades?.[student.studentId]?.[assessment.id];
                    const displayGrade = (grade !== null && grade !== undefined) ? grade : '-';
                    const gradeColor = typeof grade === 'number' ?
                      (grade >= 90 ? 'text-green-600' : grade >= 70 ? 'text-blue-600' : grade >= 50 ? 'text-orange-600' : 'text-red-600')
                      : 'text-gray-500'; // For N/A or letter grades

                    return (
                      <td key={assessment.id} className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-semibold ${gradeColor}`}>
                            {displayGrade}
                          </span>
                          <button
                            onClick={() => handleEditGradeClick(student.studentId, assessment.id, grade)}
                            className={`p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[${accentColor}] transition-colors`}
                            aria-label={`Edit grade for ${student.name} in ${assessment.name}`}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900">
                    {calculateAverage(student.studentId)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <TableCellsIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No grades or students found for this class.</p>
            <p className="text-sm mt-2">Ensure students are enrolled and assessments have been added.</p>
          </div>
        )}
      </motion.div>

      {/* Edit Grade Modal/Popup */}
      <AnimatePresence>
        {editingGrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingGrade(null)} // Close on overlay click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
              onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent click from closing modal
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Edit Grade</h3>
              <div className="space-y-4">
                <p className="text-gray-700">
                  <span className="font-semibold">Student:</span> {filteredStudents.find((s:any) => s.studentId === editingGrade.studentId)?.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Assessment:</span> {editingGrade.assessmentId}
                </p>
                <div>
                  <label htmlFor="new-grade" className="block text-sm font-medium text-gray-700 mb-1">New Grade</label>
                  <input
                    type="text" // Use text to allow for numerical or letter grades
                    id="new-grade"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={newGradeValue}
                    onChange={(e) => setNewGradeValue(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedGrade}
                  className={`px-6 py-2 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                              hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
                >
                  Save Grade
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
