'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon, // For viewing submission details
  CheckCircleIcon, // For graded status
  ClockIcon, // For pending status
  TrophyIcon, // For overall average
  ChartBarIcon, // Main icon for results
  UserCircleIcon, // For student
  ClipboardDocumentCheckIcon, // For exam
  BookOpenIcon, // For course
  BriefcaseIcon, // For educator
  XMarkIcon, // For closing modals/errors
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon, // For academic level
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with ExamSubmission GET for Admin Overview) ---
export type ExamSubmissionDataForAdmin = {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  examTotalPoints: number;
  examIsOnline: boolean;
  examDate: string; // YYYY-MM-DD
  examCourseId: string;
  examCourseTitle: string;
  examCourseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
  examCreatedByEducatorId: string;
  examCreatedByEducatorName: string;
  examCreatedByEducatorEmail: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAcademicLevel: string | null;
  submittedAt: string; // ISO string
  score: number | null;
  feedback: string | null;
  answers: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

export type ExamOption = {
  id: string;
  title: string;
  courseId: string;
  createdByEducatorId: string;
  type: string;
};

export type StudentOption = {
  id: string;
  name: string;
  email: string;
  academicLevel: { id: string; name: string } | null;
};

export type CourseOption = {
  id: string;
  title: string;
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};


interface AdminResultsOverviewPageProps {
  initialSubmissions: ExamSubmissionDataForAdmin[];
  allExams: ExamOption[];
  allStudents: StudentOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  companyId: string;
}

// --- Submission Details View Modal Component (Reused from StudentResultsPage) ---
interface SubmissionDetailsViewModalProps {
  submissionData: ExamSubmissionDataForAdmin;
  onClose: () => void;
  examTotalPoints: number;
  examIsOnline: boolean;
  examId: string; // Pass examId to fetch questions
}

const SubmissionDetailsViewModal: React.FC<SubmissionDetailsViewModalProps> = ({
  submissionData,
  onClose,
  examTotalPoints,
  examIsOnline,
  examId,
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionsForDisplay = async () => {
      setIsLoadingQuestions(true);
      setQuestionsError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/exam-questions?examId=${encodeURIComponent(examId)}`,{credentials: 'include'});
        if (res.ok) {
          const data = (await res.json()).data;
          console.log("[SubmissionDetailsViewModal] Fetched questions data:", data);
          setQuestions(data.sort((a: any, b: any) => a.order - b.order));
        } else {
          const errorData = await res.json();
          setQuestionsError(errorData.message || "Failed to load questions for review.");
        }
      } catch (err: any) {
        setQuestionsError(err.message || "Network error loading questions.");
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    if (examIsOnline) {
      fetchQuestionsForDisplay();
    }
  }, [examId, examIsOnline]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Submission Details for <span className="text-indigo-600">{submissionData.studentName}</span>
        </h2>
        <p className="text-sm text-gray-600 mb-6 border-b pb-4 border-gray-200">
          Exam: {submissionData.examTitle} | Submitted: {new Date(submissionData.submittedAt).toLocaleString()} | Score: {submissionData.score !== null ? `${submissionData.score.toFixed(1)} / ${examTotalPoints}` : 'Pending'}
        </p>

        {submissionData.feedback && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6">
            <p className="font-semibold flex items-center gap-2 mb-2"><ChatBubbleLeftRightIcon className="h-5 w-5" /> Educator Feedback:</p>
            <p>{submissionData.feedback}</p>
          </div>
        )}

        {isLoadingQuestions && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading questions...
          </div>
        )}
        {questionsError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4">
            <p>Error loading questions: {questionsError}</p>
          </div>
        )}

        {!examIsOnline ? (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-lg">
            This was an offline exam. Digital answers are not available for review here.
            Please refer to physical answer sheets or external records.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.length > 0 ? (
              questions.map((question, index) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <p className="font-semibold text-gray-800 mb-2">
                    {index + 1}. {question.questionText} <span className="text-sm text-gray-500">({question.points} pts)</span>
                  </p>
                  {question.imageUrl && (
                    <div className="my-2 flex justify-center">
                      <img src={question.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-md" onError={(e) => { e.currentTarget.src = `https://placehold.co/300x150/FF0000/FFFFFF?text=Image+Error`; }} />
                    </div>
                  )}
                  {question.videoUrl && (
                    <div className="my-2 flex justify-center">
                      <video controls src={question.videoUrl} className="max-w-full h-auto rounded-md">
                      Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Student's Answer:</p>
                    <div className="bg-white p-3 rounded-md border border-gray-300 text-gray-800 text-sm">
                      {submissionData.answers && submissionData.answers[question.id] ? (
                        Array.isArray(submissionData.answers[question.id])
                          ? submissionData.answers[question.id].join(', ')
                          : String(submissionData.answers[question.id])
                      ) : (
                        <span className="text-gray-500 italic">No answer provided.</span>
                      )}
                    </div>
                  </div>
                  {question.correctAnswer && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">Correct Answer:</p>
                      <p className="bg-green-100 text-green-800 p-2 rounded-md">{question.correctAnswer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              !isLoadingQuestions && <p className="text-gray-500">No questions or answers found for this online exam.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main AdminResultsOverviewPage Component ---
export default function AdminResultsOverviewPage({
  initialSubmissions,
  allExams,
  allStudents,
  allCourses,
  allEducators,
  companyId,
}: AdminResultsOverviewPageProps) {
  const [submissions, setSubmissions] = useState<ExamSubmissionDataForAdmin[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('All');
  const [filterStudent, setFilterStudent] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterEducator, setFilterEducator] = useState('All');
  const [filterGradingStatus, setFilterGradingStatus] = useState('All'); // 'All', 'Graded', 'Pending'
  const [filterExamType, setFilterExamType] = useState('All');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingSubmissionDetails, setViewingSubmissionDetails] = useState<ExamSubmissionDataForAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exam-submissions?companyId=${encodeURIComponent(companyId)}`, {
        credentials: 'include',
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data: any[] = (await res.json()).data.data;
        console.log("[AdminResultsOverviewPage] Fetched submissions data:", data);
        setSubmissions(data.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())); // Sort by most recent
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch submissions.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (initialSubmissions.length === 0 && !isLoading && !error) {
      fetchSubmissions();
    }
  }, [initialSubmissions, isLoading, error, fetchSubmissions]);


  const uniqueExamTypes = useMemo(() => Array.from(new Set(submissions.map(s => s.examType))).sort(), [submissions]);
  const uniqueGradingStatuses = useMemo(() => {
    const statuses = new Set<string>();
    submissions.forEach(s => statuses.add(s.score !== null ? 'Graded' : 'Pending'));
    return Array.from(statuses).sort();
  }, [submissions]);


  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = submission.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.examCourseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.examCreatedByEducatorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesExam = filterExam === 'All' || submission.examId === filterExam;
      const matchesStudent = filterStudent === 'All' || submission.studentId === filterStudent;
      const matchesCourse = filterCourse === 'All' || submission.examCourseId === filterCourse;
      const matchesEducator = filterEducator === 'All' || submission.examCreatedByEducatorId === filterEducator;
      const matchesExamType = filterExamType === 'All' || submission.examType === filterExamType;

      const submissionGradingStatus = submission.score !== null ? 'Graded' : 'Pending';
      const matchesGradingStatus = filterGradingStatus === 'All' || submissionGradingStatus === filterGradingStatus;

      return matchesSearch && matchesExam && matchesStudent && matchesCourse && matchesEducator && matchesGradingStatus && matchesExamType;
    });
  }, [submissions, searchTerm, filterExam, filterStudent, filterCourse, filterEducator, filterGradingStatus, filterExamType]);


  // Calculate overview stats
  const totalSubmissions = submissions.length;
  const gradedSubmissionsCount = submissions.filter(s => s.score !== null).length;
  const pendingSubmissionsCount = submissions.filter(s => s.score === null).length;

  const overallAverageScore = useMemo(() => {
    const gradedSubmissions = submissions.filter(s => s.score !== null && s.examTotalPoints > 0);
    if (gradedSubmissions.length === 0) return 'N/A';

    // Calculate average percentage across all graded submissions
    const totalPercentageSum = gradedSubmissions.reduce((sum, sub) => sum + ((sub.score! / sub.examTotalPoints) * 100), 0);
    return (totalPercentageSum / gradedSubmissions.length).toFixed(1) + '%';
  }, [submissions]);


  // Helper for score badge colors
  const getScoreColorClass = (score: number | null, totalPoints: number) => {
    if (score === null) return 'bg-yellow-100 text-yellow-800'; // Pending
    const percentage = (score / totalPoints) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Admin Results Overview
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📈</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Monitor and analyze all exam submissions across the school.</p>
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
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalSubmissions}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Graded Submissions</p>
              <h2 className="text-3xl font-bold text-gray-800">{gradedSubmissionsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Grading</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingSubmissionsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TrophyIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall School Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallAverageScore}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* All Submissions List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-500" /> Detailed Submission List
          </h3>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading results...
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
            <div>
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by exam/student/educator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Exams</option>
              {allExams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Students</option>
              {allStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Courses</option>
              {allCourses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterEducator}
              onChange={(e) => setFilterEducator(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Educators</option>
              {allEducators.map(educator => (
                <option key={educator.id} value={educator.id}>{educator.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterExamType}
              onChange={(e) => setFilterExamType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Exam Types</option>
              {uniqueExamTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterGradingStatus}
              onChange={(e) => setFilterGradingStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Grading Statuses</option>
              {uniqueGradingStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          {filteredSubmissions.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No exam submissions found matching your criteria.
            </div>
          )}
          {filteredSubmissions.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course (Educator)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          {submission.examTitle}
                          <br />
                          <span className={`px-1 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800`}>
                            {submission.examType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <div>
                          {submission.studentName} <br />
                          <span className="text-xs text-gray-500">{submission.studentEmail}</span>
                          {submission.studentAcademicLevel && (
                            <>
                              <br />
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <AcademicCapIcon className="h-3 w-3" /> {submission.studentAcademicLevel}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          {submission.examCourseTitle}
                          <br />
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <BriefcaseIcon className="h-3 w-3" /> {submission.examCreatedByEducatorName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.score !== null ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getScoreColorClass(submission.score, submission.examTotalPoints)}`}>
                          {submission.score.toFixed(1)} / {submission.examTotalPoints}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.score !== null ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Graded
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {submission.examIsOnline && submission.answers && (
                          <button
                            onClick={() => { setViewingSubmissionDetails(submission); setShowDetailsModal(true); }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Detailed Answers"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {/* Link to actual grading page if needed, or if this is the only place */}
                        <Link
                          href={`/admin/${companyId}/exams/${submission.examId}/submissions`}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                          title="Go to Exam Grading"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Submission Details View Modal */}
      {showDetailsModal && viewingSubmissionDetails && (
        <SubmissionDetailsViewModal
          submissionData={viewingSubmissionDetails}
          onClose={() => { setShowDetailsModal(false); setViewingSubmissionDetails(null); }}
          examTotalPoints={viewingSubmissionDetails.examTotalPoints}
          examIsOnline={viewingSubmissionDetails.examIsOnline}
          examId={viewingSubmissionDetails.examId}
        />
      )}
    </div>
  );
}
