'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChartBarIcon, // Main icon for reports
  CalendarDaysIcon, // For date range
  UserCircleIcon, // For student selector
  ClipboardDocumentListIcon, // For assignments
  AcademicCapIcon, // For assessments
  DocumentTextIcon, // For generated report display
  CheckCircleIcon, // Success message icon
  ExclamationCircleIcon, // Error message icon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with comprehensive mock data for reporting
      {
        id: '695d464281c6cb6762d961e9',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        students: [
          { studentId: 'S001', name: 'Alice Smith', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=AS' },
          { studentId: 'S002', name: 'Bob Johnson', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=BJ' },
          { studentId: 'S003', name: 'Charlie Brown', avatarUrl: 'https://placehold.co/100x100/28A745/FFFFFF?text=CB' },
          { studentId: 'S004', name: 'Diana Prince', avatarUrl: 'https://placehold.co/100x100/007BFF/FFFFFF?text=DP' },
        ],
        attendanceRecords: { // Date as key, then studentId: status
          '2025-07-01': { 'S001': 'Present', 'S002': 'Absent', 'S003': 'Late', 'S004': 'Present' },
          '2025-07-03': { 'S001': 'Present', 'S002': 'Present', 'S003': 'Present', 'S004': 'Absent' },
          '2025-07-05': { 'S001': 'Present', 'S002': 'Present', 'S003': 'Excused', 'S004': 'Present' },
        },
        grades: { // Student ID as key, then assessment ID as key
          'S001': { 'Q1': 85, 'HW1': 92, 'ME': 78, 'P1': 95 },
          'S002': { 'Q1': 70, 'HW1': 88, 'ME': null, 'P1': 82 },
          'S003': { 'Q1': 90, 'HW1': 95, 'ME': 85, 'P1': 90 },
          'S004': { 'Q1': 75, 'HW1': 80, 'ME': 65, 'P1': 70 },
        },
        assessments: [ // Define the assessments for this class
          { id: 'Q1', name: 'Quiz 1 (Algebra)', type: 'Quiz', weight: 0.1 },
          { id: 'HW1', name: 'Homework 1', type: 'Homework', weight: 0.05 },
          { id: 'ME', name: 'Midterm Exam', type: 'Exam', weight: 0.3 },
          { id: 'P1', name: 'Project: Geometry Basics', type: 'Project', weight: 0.2 },
        ],
        assignments: [ // Mock assignments with submission status
          { id: 'A001', title: 'Algebra Worksheet 1', dueDate: '2025-07-10', status: 'Published', submissions: { 'S001': true, 'S002': true, 'S003': true, 'S004': false } },
          { id: 'A002', title: 'Geometry Project', dueDate: '2025-07-25', status: 'Published', submissions: { 'S001': true, 'S002': false, 'S003': true, 'S004': false } },
        ],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        students: [
          { studentId: 'S009', name: 'Isabelle Lightwood', avatarUrl: 'https://placehold.co/100x100/FFC107/FFFFFF?text=IL' },
          { studentId: 'S010', name: 'Jacob Black', avatarUrl: 'https://placehold.co/100x100/fd2121/FFFFFF?text=JB' },
        ],
        attendanceRecords: {
          '2025-07-02': { 'S009': 'Present', 'S010': 'Present' },
        },
        grades: {
          'S009': { 'E1': 88, 'GQ': 92 },
          'S010': { 'E1': 75, 'GQ': 80 },
        },
        assessments: [
          { id: 'E1', name: 'Essay 1', type: 'Essay', weight: 0.4 },
          { id: 'GQ', name: 'Grammar Quiz', type: 'Quiz', weight: 0.2 },
        ],
        assignments: [
          { id: 'A003', title: 'Literary Analysis', dueDate: '2025-07-18', status: 'Published', submissions: { 'S009': true, 'S010': false } },
        ],
      },
    ]
  },
});

interface GenerateReportsPageProps {
  classId: string; // The ID of the class for which to generate reports
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function GenerateReportsPage({ classId }: GenerateReportsPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Report parameters state
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const reportTypes = [
    { id: '', name: 'Select Report Type' },
    { id: 'class_attendance_summary', name: 'Class Attendance Summary' },
    { id: 'individual_student_attendance', name: 'Individual Student Attendance' },
    { id: 'grade_distribution', name: 'Grade Distribution Report' },
    { id: 'missing_assignments', name: 'Missing Assignments Report' },
    { id: 'student_progress_report', name: 'Individual Student Progress Report' },
  ];

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const students = currentClass?.students || [];
  const assessments = currentClass?.assessments || [];
  const assignments = currentClass?.assignments || [];

  const generateReportContent = () => {
    if (!currentClass) return "Error: Class data not loaded.";

    let content = `Report for Class: ${currentClass.name}\n\n`;

    switch (reportType) {
      case 'class_attendance_summary':
        content += `Class Attendance Summary (${startDate} to ${endDate})\n`;
        content += "----------------------------------------\n";
        const attendanceSummary: { [status: string]: number } = { 'Present': 0, 'Absent': 0, 'Late': 0, 'Excused': 0 };
        const datesInPeriod = Object.keys(currentClass.attendanceRecords || {}).filter(date =>
          date >= startDate && date <= endDate
        );
        datesInPeriod.forEach(date => {
          Object.values(currentClass.attendanceRecords[date]).forEach((status: any) => {
            attendanceSummary[status] = (attendanceSummary[status] || 0) + 1;
          });
        });
        for (const status in attendanceSummary) {
          content += `${status}: ${attendanceSummary[status]} instances\n`;
        }
        break;

      case 'individual_student_attendance':
        if (!selectedStudentId) return "Please select a student.";
        const student = students.find((s: any) => s.studentId === selectedStudentId);
        if (!student) return "Student not found.";
        content += `Individual Attendance for: ${student.name} (${startDate} to ${endDate})\n`;
        content += "----------------------------------------\n";
        Object.keys(currentClass.attendanceRecords || {}).filter(date =>
          date >= startDate && date <= endDate
        ).forEach(date => {
          const status = currentClass.attendanceRecords[date][selectedStudentId] || 'N/A';
          content += `${date}: ${status}\n`;
        });
        break;

      case 'grade_distribution':
        if (!selectedAssessmentId) return "Please select an assessment.";
        const assessment = assessments.find((a: any) => a.id === selectedAssessmentId);
        if (!assessment) return "Assessment not found.";
        content += `Grade Distribution for: ${assessment.name}\n`;
        content += "----------------------------------------\n";
        const gradesForAssessment = students.map((s: any) => currentClass.grades?.[s.studentId]?.[assessment.id]).filter((g: any) => typeof g === 'number');
        if (gradesForAssessment.length === 0) {
          content += "No numerical grades recorded for this assessment.\n";
        } else {
          const avg = gradesForAssessment.reduce((sum: number, g: number) => sum + g, 0) / gradesForAssessment.length;
          const max = Math.max(...gradesForAssessment);
          const min = Math.min(...gradesForAssessment);
          content += `Average Grade: ${avg.toFixed(2)}\n`;
          content += `Highest Grade: ${max}\n`;
          content += `Lowest Grade: ${min}\n`;
          // Could add more sophisticated distribution (e.g., A, B, C counts)
        }
        break;

      case 'missing_assignments':
        content += `Missing Assignments Report\n`;
        content += "----------------------------------------\n";
        let hasMissing = false;
        students.forEach((student: any) => {
          const missingForStudent: string[] = [];
          assignments.forEach((assignment: any) => {
            if (assignment.status === 'Published' && assignment.submissions?.[student.studentId] === false) {
              missingForStudent.push(assignment.title);
            }
          });
          if (missingForStudent.length > 0) {
            content += `${student.name}: ${missingForStudent.join(', ')}\n`;
            hasMissing = true;
          }
        });
        if (!hasMissing) {
          content += "No missing assignments found for any student.\n";
        }
        break;

      case 'student_progress_report':
        if (!selectedStudentId) return "Please select a student.";
        const studentProgress = students.find((s: any) => s.studentId === selectedStudentId);
        if (!studentProgress) return "Student not found.";
        content += `Student Progress Report for: ${studentProgress.name}\n`;
        content += "----------------------------------------\n";
        content += `Student ID: ${studentProgress.studentId}\n\n`;

        // Attendance Summary
        let totalDays = 0;
        let presentDays = 0;
        Object.keys(currentClass.attendanceRecords || {}).filter(date =>
          date >= startDate && date <= endDate
        ).forEach(date => {
          totalDays++;
          if (currentClass.attendanceRecords[date][selectedStudentId] === 'Present') {
            presentDays++;
          }
        });
        content += `Attendance (${startDate} to ${endDate}): ${presentDays} / ${totalDays} days Present\n\n`;

        // Grades Overview
        content += "Grades Overview:\n";
        const studentGrades = currentClass.grades?.[selectedStudentId] || {};
        if (Object.keys(studentGrades).length > 0) {
          assessments.forEach((assessment: any) => {
            const grade = studentGrades[assessment.id];
            content += `- ${assessment.name}: ${grade !== null && grade !== undefined ? grade : 'N/A'}\n`;
          });
          content += `Overall Average: ${calculateAverage(selectedStudentId)}\n\n`;
        } else {
          content += "No grades recorded.\n\n";
        }

        // Missing Assignments
        content += "Missing Assignments:\n";
        const missingAssignmentsForStudent: string[] = [];
        assignments.forEach((assignment: any) => {
          if (assignment.status === 'Published' && assignment.submissions?.[selectedStudentId] === false) {
            missingAssignmentsForStudent.push(assignment.title);
          }
        });
        if (missingAssignmentsForStudent.length > 0) {
          content += `- ${missingAssignmentsForStudent.join(', ')}\n`;
        } else {
          content += "- None\n";
        }
        break;

      default:
        return "Please select a report type to generate.";
    }
    return content;
  };

  const calculateAverage = (studentId: string) => {
    const studentGrades = currentClass?.grades?.[studentId] || {};
    let total = 0;
    let count = 0;
    assessments.forEach((assessment: any) => {
      const grade = studentGrades[assessment.id];
      if (typeof grade === 'number') {
        total += grade;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(2) : 'N/A';
  };

  const handleGenerateReport = () => {
    const reportContent = generateReportContent();
    setGeneratedReport(reportContent);
    if (reportContent.startsWith("Error") || reportContent.startsWith("Please")) {
      showStatus('error', reportContent.split(':')[0].trim());
    } else {
      showStatus('success', 'Report generated successfully!');
    }
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
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for reports.</p>
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
              Generate Reports <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create insightful reports on attendance, grades, and student progress.
            </p>
          </div>
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

      {/* Report Selection and Parameters */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6"
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Type Selector */}
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">Select Report Type</label>
            <select
              id="report-type"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setGeneratedReport(null); // Clear previous report when type changes
              }}
            >
              {reportTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Conditional Parameters */}
          {['class_attendance_summary', 'individual_student_attendance', 'student_progress_report'].includes(reportType) && (
            <>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    id="start-date"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    id="end-date"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {['individual_student_attendance', 'student_progress_report'].includes(reportType) && (
            <div>
              <label htmlFor="select-student" className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
              <select
                id="select-student"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">All Students</option>
                {students.map((student: any) => (
                  <option key={student.studentId} value={student.studentId}>{student.name}</option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'grade_distribution' && (
            <div>
              <label htmlFor="select-assessment" className="block text-sm font-medium text-gray-700 mb-1">Select Assessment</label>
              <select
                id="select-assessment"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
              >
                <option value="">Overall Grades</option>
                {assessments.map((assessment: any) => (
                  <option key={assessment.id} value={assessment.id}>{assessment.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleGenerateReport}
            className={`px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
          >
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Generated Report Display */}
      <AnimatePresence mode="wait">
        {generatedReport && (
          <motion.div
            key="generated-report-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className={`h-6 w-6 text-[${accentColor}]`} /> Generated Report
            </h2>
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-4 rounded-md border border-gray-200 overflow-x-auto">
              {generatedReport}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
