// app/student/[slug]/my-grades/StudentGradesPageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon, // For overall academic/grades
  CalendarDaysIcon, // For date
  ChartBarIcon, // For grades/performance
  BookOpenIcon, // For courses
  ClipboardDocumentCheckIcon, // For individual assignments
  SparklesIcon, // For feedback
  EyeIcon, // For view details
  MagnifyingGlassIcon, // For search input
  ArrowLeftIcon, // For back button
  CheckCircleIcon, // Success message icon
  ExclamationCircleIcon, // Error message icon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { CourseGradeData, AssignmentGradeData, CourseInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface StudentGradesPageClientProps {
  studentName: string;
  studentGradeLevel: string;
  overallGPA: string;
  overallAverage: string;
  initialCourseGrades: CourseGradeData[];
  initialAssignmentGrades: AssignmentGradeData[];
  studentId: string;
  companyId: string;
  courseInfo?: CourseInfo; // Optional: if filtering by a specific course
}

export default function StudentGradesPageClient({
  studentName,
  studentGradeLevel,
  overallGPA,
  overallAverage,
  initialCourseGrades,
  initialAssignmentGrades,
  studentId,
  companyId,
  courseInfo,
}: StudentGradesPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings();

  const [courseGrades, setCourseGrades] = useState<CourseGradeData[]>(initialCourseGrades);
  const [assignmentGrades, setAssignmentGrades] = useState<AssignmentGradeData[]>(initialAssignmentGrades);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState(courseInfo?.id || 'All'); // Pre-select if courseId is provided
  const [filterType, setFilterType] = useState('All');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update states when initial props change
  useEffect(() => {
    setCourseGrades(initialCourseGrades);
    setAssignmentGrades(initialAssignmentGrades);
    if (courseInfo?.id) {
      setFilterCourse(courseInfo.id); // Ensure filter is set if coming from a course-specific link
    }
  }, [initialCourseGrades, initialAssignmentGrades, courseInfo]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const getGradeColor = useCallback((gradePercentage: number) => {
    if (gradePercentage >= 90) return 'bg-green-100 text-green-800';
    if (gradePercentage >= 80) return 'bg-blue-100 text-blue-800';
    if (gradePercentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }, []);

  const allClassesForFilter = useMemo(() => {
    const classes = new Map<string, string>(); // Map<courseId, courseName>
    courseGrades.forEach(course => {
      classes.set(course.id, course.name);
    });
    return Array.from(classes.entries()).map(([id, name]) => ({ id, name }));
  }, [courseGrades]);

  const allAssignmentTypesForFilter = useMemo(() => {
    const types = new Set<string>();
    assignmentGrades.forEach(grade => {
      types.add(grade.type);
    });
    return Array.from(types);
  }, [assignmentGrades]);

  const filteredAssignmentGrades = useMemo(() => {
    return assignmentGrades.filter(grade => {
      const matchesSearch = grade.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            grade.className.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'All' || grade.classId === filterCourse;
      const matchesType = filterType === 'All' || grade.type === filterType;
      return matchesSearch && matchesCourse && matchesType;
    }).sort((a, b) => new Date(b.gradedDate).getTime() - new Date(a.gradedDate).getTime()); // Sort by most recent graded date
  }, [assignmentGrades, searchTerm, filterCourse, filterType]);


  // --- Feedback Modal Component ---
  const FeedbackModal = ({ feedback, onClose }: { feedback: string; onClose: () => void }) => {
    if (!feedback) return null;
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
          <h2 className="text-xl font-bold mb-4 text-gray-800">Feedback</h2>
          <p className="text-gray-700 leading-relaxed">{feedback}</p>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };
  // --- End Feedback Modal ---

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
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Grades {courseInfo ? `for ${courseInfo.title}` : ''}
              <span className="ml-2 text-indigo-600 text-base sm:text-xl">💯</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Track your academic progress, {studentName}.</p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
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

      {/* Overall Performance Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall GPA</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallGPA}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallAverage}</h2>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Enrolled Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{courseGrades.length}</h2>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Grades by Course Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-indigo-500" /> Grades by Course
        </h3>
        {courseGrades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseGrades.map((course) => (
              <motion.div
                key={course.id}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center text-center"
                variants={itemVariants}
              >
                <h4 className="font-semibold text-gray-800 text-lg mb-2">{course.name}</h4>
                <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Current Grade:</p>
                  <span className={`px-4 py-2 rounded-full text-xl font-bold ${getGradeColor(course.averageScore || 0)}`}>
                    {course.currentGrade} {course.averageScore !== null && `(${course.averageScore.toFixed(1)}%)`}
                  </span>
                </div>
                <button
                  onClick={() => router.push(`/student/${companyId}/my-grades/${course.id}`)}
                  className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Detailed Grades <EyeIcon className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No course grades available yet.</p>
            <p className="text-sm mt-2">Enroll in courses to see your progress here.</p>
          </div>
        )}
      </motion.div>

      {/* All Graded Assignments Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-5">
          <ClipboardDocumentCheckIcon className="h-5 w-5 text-teal-500" /> All Graded Assignments
        </h3>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by assignment or class name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                          focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
            />
          </div>
          {!courseInfo && ( // Only show course filter if not already filtered by course
            <div className="flex-shrink-0">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
              >
                <option value="All">All Courses</option>
                {allClassesForFilter.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[${accentColor}] focus:border-[${accentColor}] sm:text-sm"
            >
              <option value="All">All Types</option>
              {allAssignmentTypesForFilter.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments Grades Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graded On</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssignmentGrades.length > 0 ? (
                filteredAssignmentGrades.map((assignment) => (
                  <motion.tr key={assignment.id} variants={itemVariants}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.assignmentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const percent = assignment.totalPoints === 0 ? 0 : (assignment.grade / assignment.totalPoints) * 100;
                        return (
                          <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getGradeColor(percent)}`}>
                            {assignment.grade}/{assignment.totalPoints} ({percent.toFixed(0)}%)
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(assignment.gradedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {assignment.feedback && (
                        <button
                          onClick={() => { setSelectedFeedback(assignment.feedback); setShowFeedbackModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                          title="View Feedback"
                        >
                          <SparklesIcon className="h-4 w-4 mr-1" /> Feedback
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No graded assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showFeedbackModal && selectedFeedback && (
          <FeedbackModal feedback={selectedFeedback} onClose={() => setShowFeedbackModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
