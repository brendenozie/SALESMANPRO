// app/admin/[slug]/teacher-classes/[courseId]/consolidated-grades/ConsolidatedGradesPageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  TableCellsIcon,
  UserCircleIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { StudentGradeData, AssessmentData, GradeRecord, CourseGradesInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

type GradeStatus = 'PASSED' | 'FAILED' | 'PENDING'; // Match Prisma enum

interface ConsolidatedGradesPageClientProps {
  course: CourseGradesInfo;
  students: StudentGradeData[];
  assessments: AssessmentData[];
  initialGrades: { [studentId: string]: { [examId: string]: GradeRecord } };
  educatorId: string;
  companyId: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ConsolidatedGradesPageClient({
  course,
  students,
  assessments,
  initialGrades,
  educatorId,
  companyId,
}: ConsolidatedGradesPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context

  const [studentGrades, setStudentGrades] = useState<{ [studentId: string]: { [examId: string]: GradeRecord } }>(initialGrades);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingGrade, setEditingGrade] = useState<{ studentId: string; assessmentId: string; currentRecord: GradeRecord | null } | null>(null);
  const [newGradeValue, setNewGradeValue] = useState<string>('');
  const [newGradeStatus, setNewGradeStatus] = useState<GradeStatus | ''>('');
  const [newGradeComments, setNewGradeComments] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Update studentGrades when initialGrades prop changes (e.g., on initial load or re-fetch)
  useEffect(() => {
    setStudentGrades(initialGrades);
  }, [initialGrades]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Function to calculate average grade (simple average for now, can be weighted)
  const calculateAverage = useCallback((studentId: string) => {
    const gradesForStudent = studentGrades[studentId];
    if (!gradesForStudent) return 'N/A';

    let totalScore = 0;
    let count = 0;

    assessments.forEach(assessment => {
      const gradeRecord = gradesForStudent[assessment.id];
      if (gradeRecord && typeof gradeRecord.score === 'number') {
        totalScore += gradeRecord.score;
        count++;
      }
    });

    return count > 0 ? (totalScore / count).toFixed(2) : 'N/A';
  }, [studentGrades, assessments]);

  const handleExportGrades = useCallback(() => {
    if (students.length === 0 || assessments.length === 0) {
      showStatus('error', 'No grade data to export.');
      return;
    }

    let csvContent = `Student Name,Student ID,${assessments.map(a => a.name).join(',')},Average Grade\n`;

    filteredStudents.forEach(student => {
      const studentRow = [student.name, student.studentId];
      assessments.forEach(assessment => {
        const gradeRecord = studentGrades[student.studentId]?.[assessment.id];
        studentRow.push(gradeRecord && typeof gradeRecord.score === 'number' ? String(gradeRecord.score) : 'N/A');
      });
      studentRow.push(calculateAverage(student.studentId));
      csvContent += studentRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${course.title}_Grades_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showStatus('success', `Grades exported successfully for ${course.title}!`);
  }, [students, assessments, studentGrades, calculateAverage, course.title, showStatus, filteredStudents]);


  const handleEditGradeClick = useCallback((studentId: string, assessmentId: string, currentRecord: GradeRecord | null) => {
    setEditingGrade({ studentId, assessmentId, currentRecord });
    setNewGradeValue(currentRecord?.score !== null && currentRecord?.score !== undefined ? String(currentRecord.score) : '');
    setNewGradeStatus(currentRecord?.gradeStatus as GradeStatus || '');
    setNewGradeComments(currentRecord?.comments || '');
  }, []);

  const handleSaveEditedGrade = useCallback(async () => {
    if (!editingGrade || loading) return;

    setLoading(true);
    setStatusMessage(null);

    const { studentId, assessmentId, currentRecord } = editingGrade;
    const parsedScore = parseFloat(newGradeValue);

    if (isNaN(parsedScore)) {
      showStatus('error', 'Grade must be a valid number.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        studentId: studentId,
        courseId: course.id,
        examId: assessmentId, // This is the exam ID
        score: parsedScore,
        gradeValue: newGradeValue, // Keep as string for display if needed
        gradeStatus: newGradeStatus,
        comments: newGradeComments,
        recordedById: educatorId,
        companyId: companyId,
        academicLevelAtTimeOfGradeId: course.academicLevelId, // Crucial for historical context
      };

      const res = await fetch(`${apiUrl}/teacher/grades`, {
        method: 'POST', // Use POST for upsert
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedGradeRecord = await res.json();
        // Update local state with the new/updated grade
        setStudentGrades(prevGrades => ({
          ...prevGrades,
          [studentId]: {
            ...prevGrades[studentId],
            [assessmentId]: {
              gradeId: updatedGradeRecord.id, // Ensure to get the actual grade ID from backend
              score: updatedGradeRecord.score,
              gradeValue: updatedGradeRecord.gradeValue,
              gradeStatus: updatedGradeRecord.gradeStatus,
              comments: updatedGradeRecord.comments,
              academicLevelAtTimeOfGradeId: updatedGradeRecord.academicLevelAtTimeOfGradeId,
            },
          },
        }));
        showStatus('success', `Grade for ${assessments.find(a => a.id === assessmentId)?.name || assessmentId} updated successfully!`);
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to save grade.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
      setEditingGrade(null); // Close modal/editing state
      setNewGradeValue('');
      setNewGradeStatus('');
      setNewGradeComments('');
    }
  }, [editingGrade, newGradeValue, newGradeStatus, newGradeComments, course.id, course.academicLevelId, educatorId, companyId, assessments, showStatus, loading]);


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
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Consolidated Grades <span style={{ color: primaryColor }}>{course.title}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of student performance across all assessments for {course.academicLevelName}.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <button
            onClick={handleExportGrades}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-800 rounded-md shadow-sm border border-gray-200
                        hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            disabled={loading}
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

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-700">Loading grades...</span>
        </div>
      )}

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
          disabled={loading}
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
                {assessments.map((assessment: AssessmentData) => (
                  <th key={assessment.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {assessment.name}
                    <p className="font-normal text-gray-400 normal-case">({assessment.type})</p>
                    <p className="font-normal text-gray-400 normal-case">(Max: {assessment.maxScore})</p>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student: StudentGradeData) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div className="flex items-center">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
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
                  {assessments.map((assessment: AssessmentData) => {
                    const gradeRecord = studentGrades[student.studentId]?.[assessment.id];
                    const displayScore = (gradeRecord && typeof gradeRecord.score === 'number') ? gradeRecord.score : '-';
                    const gradeColor = typeof displayScore === 'number' ?
                      (displayScore >= (assessment.maxScore * 0.9) ? 'text-green-600' : displayScore >= (assessment.maxScore * 0.7) ? 'text-blue-600' : displayScore >= (assessment.maxScore * 0.5) ? 'text-orange-600' : 'text-red-600')
                      : 'text-gray-500';

                    return (
                      <td key={assessment.id} className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`font-semibold ${gradeColor}`}>
                            {displayScore}
                          </span>
                          <button
                            onClick={() => handleEditGradeClick(student.studentId, assessment.id, gradeRecord || null)}
                            className={`p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-[${accentColor}] transition-colors`}
                            aria-label={`Edit grade for ${student.name} in ${assessment.name}`}
                            disabled={loading}
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
                  <span className="font-semibold">Assessment:</span> {assessments.find(a => a.id === editingGrade.assessmentId)?.name}
                </p>
                <div>
                  <label htmlFor="new-grade" className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                  <input
                    type="number" // Use number type for score
                    id="new-grade"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={newGradeValue}
                    onChange={(e) => setNewGradeValue(e.target.value)}
                    autoFocus
                    step="0.01" // Allow decimal grades
                  />
                </div>
                <div>
                  <label htmlFor="grade-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="grade-status"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={newGradeStatus}
                    onChange={(e) => setNewGradeStatus(e.target.value as GradeStatus)}
                  >
                    <option value="">Select Status</option>
                    <option value="PASSED">PASSED</option>
                    <option value="FAILED">FAILED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="grade-comments" className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    id="grade-comments"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={newGradeComments}
                    onChange={(e) => setNewGradeComments(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedGrade}
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
                  ) : 'Save Grade'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
