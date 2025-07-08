// app/admin/[slug]/teacher-classes/course-reports/CourseReportsPageClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { CourseOption, CourseReportDetails, StudentReportData } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface CourseReportsPageClientProps {
  initialCourses: CourseOption[];
  educatorId: string;
  companyId: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function CourseReportsPageClient({
  initialCourses,
  educatorId,
  companyId,
}: CourseReportsPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [reportData, setReportData] = useState<CourseReportDetails | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally pre-select the first course if available
    if (initialCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(initialCourses[0].id);
    }
  }, [initialCourses, selectedCourseId]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const fetchReport = useCallback(async (courseId: string) => {
    if (!courseId) {
      setReportData(null);
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    setReportData(null); // Clear previous report

    try {
      const res = await fetch(
        `${apiUrl}/teacher/reports/course/${courseId}?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`
      );

      if (res.ok) {
        const data = (await res.json()) as CourseReportDetails;
        setReportData(data);
        showStatus('success', `Report generated for ${data.course.title}.`);
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to fetch report data.');
        setReportData(null);
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [educatorId, companyId, showStatus]);

  // Fetch report when selectedCourseId changes
  useEffect(() => {
    fetchReport(selectedCourseId);
  }, [selectedCourseId, fetchReport]);

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
            aria-label="Back"
            disabled={loading}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Course Reports
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Generate performance reports for your courses.
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

      {/* Course Selection */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <label htmlFor="course-select" className="block text-lg font-medium text-gray-700 mb-2">Select a Course:</label>
        <select
          id="course-select"
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] text-gray-900"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={loading || initialCourses.length === 0}
        >
          {initialCourses.length === 0 ? (
            <option value="">No courses available</option>
          ) : (
            <>
              <option value="">-- Select Course --</option>
              {initialCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.academicLevelName})
                </option>
              ))}
            </>
          )}
        </select>
      </motion.div>

      {/* Report Display Area */}
      {loading && selectedCourseId && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-4 text-xl text-gray-700">Generating report...</span>
        </div>
      )}

      {!loading && reportData && selectedCourseId && (
        <motion.div
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Report for <span style={{ color: primaryColor }}>{reportData.course.title}</span> ({reportData.course.academicLevelName})
          </h2>

          {reportData.studentReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No student data available for this course.</p>
              <p className="text-sm mt-2">Ensure students are enrolled and have associated data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Assignment Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance (P/A/T)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.studentReports.map((report: StudentReportData) => (
                    <motion.tr key={report.studentId} variants={itemVariants} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.studentName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{report.enrollmentProgress}%</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.enrollmentGrade !== null ? report.enrollmentGrade.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.assignmentSummary.submittedCount} / {report.assignmentSummary.totalAssignments}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.assignmentSummary.averageGrade !== null ? report.assignmentSummary.averageGrade.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.attendanceSummary.present}P / {report.attendanceSummary.absent}A / {report.attendanceSummary.tardy}T
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {!loading && !reportData && selectedCourseId && (
        <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200">
          <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Select a course from the dropdown above to generate a report.</p>
        </div>
      )}
    </div>
  );
}
