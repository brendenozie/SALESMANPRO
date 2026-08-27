'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentCheckIcon, // Main icon for exams
  BookOpenIcon, // For course
  UsersIcon, // For teacher
  ClockIcon, // For time
  MapPinIcon, // For location
  ChartBarIcon, // For results/grades
  EyeIcon, // For view details
  MagnifyingGlassIcon, // For search
  TrophyIcon, // For good grades
  ExclamationCircleIcon, // For upcoming/due soon
} from '@heroicons/react/24/outline';

// Sample Data for the Student's Exams Page
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

const sampleStudentExams = [
  {
    id: 'EX001',
    name: 'Mathematics Midterm Exam',
    className: 'Grade 7 Mathematics',
    teacher: 'Mr. John Doe',
    date: '2025-07-07',
    time: '9:00 AM - 10:30 AM',
    location: 'School Hall A',
    notes: 'Covers Chapters 1-5. Bring pencils and calculator.',
    status: 'Upcoming', // Upcoming, Completed
    score: null,
    totalPoints: 100,
    feedback: null,
  },
  {
    id: 'EX002',
    name: 'English Essay Final Draft Submission',
    className: 'Grade 8 English Language',
    teacher: 'Mrs. Jane Smith',
    date: '2025-07-05',
    time: '4:00 PM', // Due time for submission
    location: 'Online Submission',
    notes: 'Submit via LMS. Refer to rubric for grading criteria.',
    status: 'Upcoming',
    score: null,
    totalPoints: 50,
    feedback: null,
  },
  {
    id: 'EX003',
    name: 'Science Unit 2 Test',
    className: 'Grade 8 Science',
    teacher: 'Ms. Emily White',
    date: '2025-06-25', // Past date
    time: '11:00 AM - 12:00 PM',
    location: 'Lab 2',
    notes: 'Covering cell biology and photosynthesis.',
    status: 'Completed',
    score: 85,
    totalPoints: 100,
    feedback: 'Good understanding of concepts, review cellular respiration.',
  },
  {
    id: 'EX004',
    name: 'History Pop Quiz - WWI',
    className: 'Grade 8 History',
    teacher: 'Mr. David Green',
    date: '2025-06-20', // Past date
    time: 'During Class',
    location: 'Room 203',
    notes: 'Short quiz on causes of WWI.',
    status: 'Completed',
    score: 9,
    totalPoints: 10,
    feedback: 'Excellent recall of key events!',
  },
  {
    id: 'EX005',
    name: 'Physical Education Midterm Practical',
    className: 'Physical Education (PE)',
    teacher: 'Coach Alex',
    date: '2025-07-12',
    time: '1:00 PM - 2:00 PM',
    location: 'Gymnasium',
    notes: 'Practical assessment of fitness and skills.',
    status: 'Upcoming',
    score: null,
    totalPoints: 100,
    feedback: null,
  },
];

const sampleClassesForFilter = [
  { id: 'CL101', name: 'Grade 7 Mathematics' },
  { id: 'CL102', name: 'Grade 8 English Language' },
  { id: 'CL103', name: 'Grade 8 Science' },
  { id: 'CL104', name: 'Grade 8 History' },
  { id: 'CL105', name: 'Physical Education (PE)' },
];

export default function StudentExamsPage() {
  const [exams, setExams] = useState(sampleStudentExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<typeof sampleStudentExams[number] | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (gradePercentage: number | null) => {
    if (gradePercentage === null || isNaN(gradePercentage)) return 'bg-gray-100 text-gray-800';
    if (gradePercentage >= 90) return 'bg-green-100 text-green-800';
    if (gradePercentage >= 80) return 'bg-blue-100 text-blue-800';
    if (gradePercentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calculatePercentage = (grade: number | null, totalPoints: number): string => {
    if (grade === null || totalPoints === 0) return 'N/A';
    return ((grade / totalPoints) * 100).toFixed(0);
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || exam.className === filterClass;
    const matchesStatus = filterStatus === 'All' || exam.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => {
    // Sort upcoming exams first by date (ascending), then completed exams by date (descending)
    if (a.status === 'Upcoming' && b.status !== 'Upcoming') return -1;
    if (a.status !== 'Upcoming' && b.status === 'Upcoming') return 1;
    if (a.status === 'Upcoming' && b.status === 'Upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalExams = exams.length;
  const upcomingExamsCount = exams.filter(e => e.status === 'Upcoming').length;
  const completedExamsCount = exams.filter(e => e.status === 'Completed').length;

  // Calculate overall exam average for completed exams
  const completedExamScores = exams.filter(e => e.status === 'Completed' && e.score !== null && e.totalPoints > 0);
  const overallExamAverage = useMemo(() => {
    if (completedExamScores.length === 0) return 'N/A';
    const totalScoreSum = completedExamScores.reduce((sum, exam) => sum + (exam.score ?? 0), 0);
    const totalPointsSum = completedExamScores.reduce((sum, exam) => sum + exam.totalPoints, 0);
    return ((totalScoreSum / totalPointsSum) * 100).toFixed(1) + '%';
  }, [completedExamScores]);


  const handleViewDetails = (exam: typeof sampleStudentExams[number]) => {
    setSelectedExam(exam);
    setShowDetailModal(true);
  };

  // --- Exam Detail Modal ---
  const ExamDetailModal = ({
    exam,
    onClose,
  }: {
    exam: typeof sampleStudentExams[number] | null;
    onClose: () => void;
  }) => {
    if (!exam) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{exam.name}</h2>
          <div className="space-y-3 text-gray-700 mb-6">
            <p><span className="font-semibold">Class:</span> {exam.className}</p>
            <p><span className="font-semibold">Teacher:</span> {exam.teacher}</p>
            <p><span className="font-semibold">Date:</span> {new Date(exam.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Time:</span> {exam.time}</p>
            <p><span className="font-semibold">Location:</span> {exam.location}</p>
            <p><span className="font-semibold">Notes:</span> {exam.notes || 'N/A'}</p>
            <p><span className="font-semibold">Status:</span>
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                {exam.status}
              </span>
            </p>

            {exam.status === 'Completed' && (
              <>
                <p><span className="font-semibold">Your Score:</span> <span className="font-bold text-lg">{exam.score}/{exam.totalPoints} ({calculatePercentage(exam.score, exam.totalPoints)}%)</span></p>
                <p><span className="font-semibold">Feedback:</span> {exam.feedback || 'No feedback provided.'}</p>
              </>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
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
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Exams
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">📝</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Keep track of your upcoming tests and past results, {studentName}.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClipboardDocumentCheckIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalExams}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationCircleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{upcomingExamsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TrophyIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Exams</p>
              <h2 className="text-3xl font-bold text-gray-800">{completedExamsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ChartBarIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Exam Avg.</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallExamAverage}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" /> All Exams
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
              placeholder="Search by exam name, class, or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {sampleClassesForFilter.map(cls => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class (Teacher)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.className} <br />
                      <span className="text-xs text-gray-400">({exam.teacher})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.date).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-400">({exam.time})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.status === 'Completed' ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getGradeColor(
                          exam.score !== null && exam.totalPoints > 0
                            ? (exam.score / exam.totalPoints) * 100
                            : null
                        )}`}>
                          {exam.score}/{exam.totalPoints} ({calculatePercentage(exam.score, exam.totalPoints)}%)
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(exam)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No exams found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedExam && (
        <ExamDetailModal exam={selectedExam} onClose={() => setShowDetailModal(false)} />
      )}
    </div>
  );
}
