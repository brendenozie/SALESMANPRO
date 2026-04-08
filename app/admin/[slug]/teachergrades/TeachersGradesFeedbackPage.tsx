'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentCheckIcon, // For grading page
  ChartBarIcon, // For grades
  PencilIcon, // For edit/input
  CheckCircleIcon, // For graded status
  ExclamationCircleIcon, // For pending
  UsersIcon, // For student count
  AcademicCapIcon, // For class/subject
  PaperAirplaneIcon, // For publish
   // For save draft (might need to define as it's not in outline by default)
} from '@heroicons/react/24/outline'; // Check if SaveIcon exists or use something else

// Custom icon for Save if needed, or use a combination like DiskIcon + ArrowDownOnSquareIcon
// For now, let's assume it's available or we'll use a text label for 'Save Draft' button.

// Sample Data
const sampleAssignments = [
  {
    id: 'A001',
    name: 'Algebra Homework Set 2',
    classId: 'CL103',
    className: 'Grade 9 Algebra',
    dueDate: '2025-07-01',
    totalPoints: 20,
  },
  {
    id: 'A002',
    name: 'Literary Analysis Essay Draft',
    classId: 'CL102',
    className: 'Grade 8 English Language',
    dueDate: '2025-07-05',
    totalPoints: 50,
  },
  {
    id: 'A003',
    name: 'Geometry Midterm Review',
    classId: 'CL104',
    className: 'Grade 10 Geometry',
    dueDate: '2025-06-25',
    totalPoints: 0,
  },
];

type Student = {
  id: string;
  name: string;
  status: string;
  grade: number | null;
  feedback: string;
};

type AssignmentId = 'A001' | 'A002' | 'A003';

const sampleStudentsForAssignment: Record<AssignmentId, Student[]> = {
  'A001': [ // Students for Algebra Homework Set 2 (CL103)
    { id: 'S003', name: 'Sarah Kimani', status: 'Submitted', grade: null, feedback: '' },
    { id: 'S016', name: 'Quentin Onyango', status: 'Submitted', grade: null, feedback: '' },
    { id: 'S017', name: 'Rachael Moraa', status: 'Not Submitted', grade: null, feedback: '' },
    { id: 'S018', name: 'Steve Mwangangi', status: 'Submitted', grade: 18, feedback: 'Well done! Clear steps.' },
    { id: 'S019', name: 'Tina Nyokabi', status: 'Submitted', grade: null, feedback: '' },
  ],
  'A002': [ // Students for Literary Analysis Essay Draft (CL102)
    { id: 'S002', name: 'Kevin Otieno', status: 'Submitted', grade: null, feedback: '' },
    { id: 'S004', name: 'Michael Njoroge', status: 'Not Submitted', grade: null, feedback: '' },
    { id: 'S014', name: 'Naomi Chebet', status: 'Submitted', grade: null, feedback: '' },
    { id: 'S015', name: 'Paul Omondi', status: 'Submitted', grade: 45, feedback: 'Good ideas, but check grammar.' },
  ],
  'A003': [],
};


export default function TeachersGradesFeedbackPage() {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(sampleAssignments[0].id); // Default to first assignment
  const [studentsWithGrades, setStudentsWithGrades] = useState<Student[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const currentAssignment = sampleAssignments.find(a => a.id === selectedAssignmentId);

  useEffect(() => {
    if (selectedAssignmentId) {
      // Deep copy students data to allow local edits
      setStudentsWithGrades(JSON.parse(JSON.stringify(sampleStudentsForAssignment[selectedAssignmentId as AssignmentId] || [])));
    }
  }, [selectedAssignmentId]);

  const handleGradeChange = (studentId: string, value: string) => {
    setStudentsWithGrades(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, grade: value === '' ? null : Number(value) } : student
      )
    );
  };

  const handleFeedbackChange = (studentId: string, value: string) => {
    setStudentsWithGrades(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, feedback: value } : student
      )
    );
  };

  const calculateGradingProgress = () => {
    if (studentsWithGrades.length === 0) return 0;
    const gradedCount = studentsWithGrades.filter(s => s.grade !== null).length;
    return (gradedCount / studentsWithGrades.length) * 100;
  };

  const calculateAverageScore = () => {
    const gradedScores = studentsWithGrades
      .filter(s => s.grade !== null)
      .map(s => s.grade);
    if (gradedScores.length === 0) return 'N/A';
    const sum = gradedScores.reduce((acc: number, score) => acc + (score ?? 0), 0);
    return gradedScores.length > 0 ? (sum / gradedScores.length).toFixed(1) : 'N/A';
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    // Simulate API call to save drafts
    setTimeout(() => {
      // console.log('Drafts saved:', studentsWithGrades);
      alert('Grades and feedback saved as draft!');
      setIsSaving(false);
      // In a real app, you'd update your backend here.
    }, 1500);
  };

  const handlePublishGrades = () => {
    if (!confirm("Are you sure you want to publish these grades? Students and parents will be able to view them.")) {
        return; // Use custom modal in real app
    }
    setIsPublishing(true);
    // Simulate API call to publish grades
    setTimeout(() => {
      // console.log('Grades published:', studentsWithGrades);
      alert('Grades and feedback published successfully!');
      setIsPublishing(false);
      // In a real app, update backend and potentially set status to 'Graded' for the assignment
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Grades & Feedback
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Input and manage grades and feedback for assignments.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Assignment Selector & Overview */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex-grow">
            <label htmlFor="assignment-select" className="block text-sm font-medium text-gray-700 mb-2">Select Assignment:</label>
            <select
              id="assignment-select"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              className="block w-full md:w-fit py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {sampleAssignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.name} ({assignment.className}) - Due {new Date(assignment.dueDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          {currentAssignment && (
            <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-800 flex items-center gap-2 text-sm font-medium">
                <AcademicCapIcon className="h-5 w-5" /> {currentAssignment.className}
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-800 flex items-center gap-2 text-sm font-medium">
                <ChartBarIcon className="h-5 w-5" /> Max Points: {currentAssignment.totalPoints}
              </div>
            </div>
          )}
        </div>

        {currentAssignment && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-purple-100 rounded-full">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <h2 className="text-2xl font-bold text-gray-800">{studentsWithGrades.length}</h2>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-yellow-100 rounded-full">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Grading Progress</p>
                <h2 className="text-2xl font-bold text-gray-800">{calculateGradingProgress().toFixed(0)}%</h2>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${calculateGradingProgress()}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="p-2 bg-green-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <h2 className="text-2xl font-bold text-gray-800">{calculateAverageScore()}</h2>
                <p className="text-xs text-gray-500">out of {currentAssignment.totalPoints}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Grading Table */}
      {currentAssignment && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <PencilIcon className="h-5 w-5 text-blue-500" /> Enter Grades & Feedback
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm
                           hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublishGrades}
                disabled={isSaving || isPublishing || studentsWithGrades.filter(s => s.status === 'Submitted' && s.grade === null).length > 0} // Disable if submitted are not all graded
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                           hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Grades'} <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade ({currentAssignment.totalPoints} pts)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsWithGrades.length > 0 ? (
                  studentsWithGrades.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${student.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            student.status === 'Not Submitted' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}
                        `}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          value={student.grade === null ? '' : student.grade}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          max={currentAssignment.totalPoints}
                          min="0"
                          disabled={student.status === 'Not Submitted'} // Cannot grade if not submitted
                          className="w-20 border border-gray-300 rounded-md shadow-sm p-1.5 text-center
                                     focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-gray-100"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <textarea
                          value={student.feedback}
                          onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md shadow-sm p-1.5 text-sm
                                     focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                          placeholder="Provide feedback..."
                          disabled={student.status === 'Not Submitted'} // Cannot give feedback if not submitted
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Actions for individual students if needed, e.g., 'View Submission' */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students found for this assignment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
