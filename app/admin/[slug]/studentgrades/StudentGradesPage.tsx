'use client';

import React, { useState } from 'react';
import {
  AcademicCapIcon, // For overall academic/grades
  CalendarDaysIcon, // For date
  ChartBarIcon, // For grades/performance
  BookOpenIcon, // For courses
  ClipboardDocumentCheckIcon, // For individual assignments
  TrophyIcon, // For top grades
  SparklesIcon, // For feedback
  EyeIcon, // For view details
  MagnifyingGlassIcon, // For search input
} from '@heroicons/react/24/outline';

// Sample Data for the Student's Grades Page
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

const studentOverallGPA = '3.85'; // Current GPA
const studentOverallAverage = '89.2%'; // Overall average percentage

const studentCourseGrades = [
  { id: 'CL101', name: 'Grade 7 Mathematics', teacher: 'Mr. John Doe', currentGrade: 'A-', averageScore: 91.5 },
  { id: 'CL102', name: 'Grade 8 English Language', teacher: 'Mrs. Jane Smith', currentGrade: 'B+', averageScore: 88.0 },
  { id: 'CL103', name: 'Grade 8 Science', teacher: 'Ms. Emily White', currentGrade: 'A', averageScore: 95.0 },
  { id: 'CL104', name: 'Grade 8 History', teacher: 'Mr. David Green', currentGrade: 'B', averageScore: 83.5 },
  { id: 'CL105', name: 'Physical Education (PE)', teacher: 'Coach Alex', currentGrade: 'A', averageScore: 98.0 },
];

const studentAssignmentGrades = [
  {
    id: 'ASG001',
    assignmentName: 'Algebra Homework Set 1',
    className: 'Grade 7 Mathematics',
    type: 'Homework',
    grade: 18,
    totalPoints: 20,
    feedback: 'Good work on solving linear equations.',
    gradedDate: '2025-06-20',
  },
  {
    id: 'ASG002',
    assignmentName: 'Literary Devices Quiz',
    className: 'Grade 8 English Language',
    type: 'Quiz',
    grade: 42,
    totalPoints: 50,
    feedback: 'Excellent understanding of metaphors and similes.',
    gradedDate: '2025-06-22',
  },
  {
    id: 'ASG003',
    assignmentName: 'Cell Structure Project',
    className: 'Grade 8 Science',
    type: 'Project',
    grade: 90,
    totalPoints: 100,
    feedback: 'Detailed and well-researched project. Great diagrams!',
    gradedDate: '2025-06-21',
  },
  {
    id: 'ASG004',
    assignmentName: 'Industrial Revolution Essay',
    className: 'Grade 8 History',
    type: 'Essay',
    grade: 75,
    totalPoints: 100,
    feedback: 'Solid analysis, but try to incorporate more primary sources next time.',
    gradedDate: '2025-06-19',
  },
  {
    id: 'ASG005',
    assignmentName: 'PE Fitness Test',
    className: 'Physical Education (PE)',
    type: 'Test',
    grade: 95,
    totalPoints: 100,
    feedback: 'Great effort and performance in all categories!',
    gradedDate: '2025-06-18',
  },
];

const gradeTypes = Array.from(new Set(studentAssignmentGrades.map(g => g.type)));

export default function StudentGradesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getGradeColor = (gradePercentage: number) => {
    if (gradePercentage >= 90) return 'bg-green-100 text-green-800';
    if (gradePercentage >= 80) return 'bg-blue-100 text-blue-800';
    if (gradePercentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculatePercentage = (grade: number, totalPoints: number): string => {
    if (totalPoints === 0) return 'N/A';
    return ((grade / totalPoints) * 100).toFixed(0) + '%';
  };

  const filteredAssignmentGrades = studentAssignmentGrades.filter(grade => {
    const matchesSearch = grade.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grade.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'All' || grade.className === filterCourse;
    const matchesType = filterType === 'All' || grade.type === filterType;
    return matchesSearch && matchesCourse && matchesType;
  }).sort((a, b) => new Date(b.gradedDate).getTime() - new Date(a.gradedDate).getTime()); // Sort by most recent graded date

  // --- Feedback Modal ---
  type FeedbackModalProps = {
    feedback: string;
    onClose: () => void;
  };

  const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback, onClose }) => {
    if (!feedback) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
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
        </div>
      </div>
    );
  };
  // --- End Feedback Modal ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Grades
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">💯</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track your academic progress, {studentName}.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overall Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall GPA</p>
              <h2 className="text-3xl font-bold text-gray-800">{studentOverallGPA}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{studentOverallAverage}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Enrolled Classes</p>
              <h2 className="text-3xl font-bold text-gray-800">{studentCourseGrades.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Grades by Course Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-indigo-500" /> Grades by Course
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentCourseGrades.map((course) => (
            <div
              key={course.id}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center text-center"
            >
              <h4 className="font-semibold text-gray-800 text-lg mb-2">{course.name}</h4>
              <p className="text-sm text-gray-600">Teacher: {course.teacher}</p>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Current Grade:</p>
                <span className={`px-4 py-2 rounded-full text-xl font-bold ${getGradeColor(course.averageScore)}`}>
                  {course.currentGrade} ({course.averageScore.toFixed(1)}%)
                </span>
              </div>
              <button
                onClick={() => alert(`Navigating to detailed grades for ${course.name}`)} // Placeholder
                className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                View Detailed Grades <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Graded Assignments Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
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
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Courses</option>
              {studentCourseGrades.map(course => (
                <option key={course.id} value={course.name}>{course.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {gradeTypes.map(type => (
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
                  <tr key={assignment.id}>
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No graded assignments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFeedbackModal && selectedFeedback && (
        <FeedbackModal feedback={selectedFeedback} onClose={() => setShowFeedbackModal(false)} />
      )}
    </div>
  );
}
