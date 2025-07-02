'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon, // For viewing submission details
  CheckCircleIcon, // For graded status
  ClockIcon, // For pending status
  UserCircleIcon, // For student icon
  ChatBubbleLeftRightIcon, // For feedback
  XMarkIcon, // For closing modals/errors
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with ExamSubmission API Response) ---
export type ExamSubmissionData = {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string; // ISO string
  score: number | null; // Null if not yet graded
  feedback: string | null;
  answers: Record<string, any> | null; // JSON object for online exam answers
  createdAt: string;
  updatedAt: string;
};

export type ExamDetailsForSubmissions = {
  id: string;
  title: string;
  courseTitle: string;
  isOnline: boolean;
  autoGrade: boolean;
  totalPoints: number;
  companyId: string;
};

interface ExamSubmissionsManagerPageProps {
  examDetails: ExamDetailsForSubmissions;
  initialSubmissions: ExamSubmissionData[];
  companyId: string;
}

// --- Submission Score/Feedback Modal Component ---
interface SubmissionFormModalProps {
  submissionData: ExamSubmissionData;
  onClose: () => void;
  onSave: (id: string, score: number | null, feedback: string | null) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  examTotalPoints: number;
}

const SubmissionFormModal: React.FC<SubmissionFormModalProps> = ({
  submissionData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  examTotalPoints,
}) => {
  const [score, setScore] = useState<number | string>(submissionData.score ?? '');
  const [feedback, setFeedback] = useState<string>(submissionData.feedback ?? '');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();

    let parsedScore: number | null = null;
    if (typeof score === 'string' && score.trim() !== '') {
      parsedScore = parseFloat(score);
      if (isNaN(parsedScore)) {
        alert("Invalid score. Please enter a number.");
        return;
      }
      if (parsedScore < 0 || parsedScore > examTotalPoints) {
          alert(`Score must be between 0 and ${examTotalPoints}.`);
          return;
      }
    }

    onSave(submissionData.id, parsedScore, feedback.trim() === '' ? null : feedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          Grade Submission: <span className="text-indigo-600">{submissionData.studentName}</span>
        </h2>
        <p className="text-sm text-gray-600 mb-4">Exam: {submissionData.examTitle}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">Score (out of {examTotalPoints})</label>
            <input
              type="number"
              name="score"
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max={examTotalPoints}
              step="0.1"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
            <textarea
              name="feedback"
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Grade & Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Submission Details View Modal Component (Placeholder) ---
interface SubmissionDetailsViewModalProps {
  submissionData: ExamSubmissionData;
  onClose: () => void;
  examDetails: ExamDetailsForSubmissions;
}

const SubmissionDetailsViewModal: React.FC<SubmissionDetailsViewModalProps> = ({ submissionData, onClose, examDetails }) => {
  // This component would ideally fetch the questions for the exam and then
  // display the student's answers (submissionData.answers) against each question.
  // For now, it's a placeholder.

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionsForDisplay = async () => {
      setIsLoadingQuestions(true);
      setQuestionsError(null);
      try {
        const res = await fetch(`${apiUrl}/exam-questions?examId=${encodeURIComponent(examDetails.id)}`);
        if (res.ok) {
          const data = await res.json();
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

    if (examDetails.isOnline) {
      fetchQuestionsForDisplay();
    }
  }, [examDetails.id, examDetails.isOnline]);


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
          Exam: {examDetails.title} | Submitted: {new Date(submissionData.submittedAt).toLocaleString()}
        </p>

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

        {!examDetails.isOnline ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
            This is an offline exam. Answers are not stored digitally here.
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
                    <div className="my-2">
                      <img src={question.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-md" onError={(e) => { e.currentTarget.src = `https://placehold.co/300x150/FF0000/FFFFFF?text=Image+Error`; }} />
                    </div>
                  )}
                  {question.videoUrl && (
                    <div className="my-2">
                      <video controls src={question.videoUrl} className="max-w-full h-auto rounded-md">
                      Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Your Answer:</p>
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
              !isLoadingQuestions && <p className="text-gray-500">No questions found for this exam.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main ExamSubmissionsManagerPage Component ---
export default function ExamSubmissionsManagerPage({ examDetails, initialSubmissions, companyId }: ExamSubmissionsManagerPageProps) {
  const [submissions, setSubmissions] = useState<ExamSubmissionData[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGradedStatus, setFilterGradedStatus] = useState('All'); // 'All', 'Graded', 'Pending'
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<ExamSubmissionData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingSubmissionDetails, setViewingSubmissionDetails] = useState<ExamSubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/exam-submissions?examId=${encodeURIComponent(examDetails.id)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: ExamSubmissionData[] = await res.json();
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
  }, [examDetails.id]);

  useEffect(() => {
    // Only fetch if initial data is empty (meaning server fetch failed or was empty)
    if (initialSubmissions.length === 0 && !isLoading && !error) {
      fetchSubmissions();
    }
  }, [initialSubmissions, isLoading, error, fetchSubmissions]);


  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            submission.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (submission.feedback || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isGraded = submission.score !== null;
      const matchesGradedStatus = filterGradedStatus === 'All' ||
                                  (filterGradedStatus === 'Graded' && isGraded) ||
                                  (filterGradedStatus === 'Pending' && !isGraded);

      return matchesSearch && matchesGradedStatus;
    });
  }, [submissions, searchTerm, filterGradedStatus]);


  // API Call handlers
  const handleSaveScoreAndFeedback = async (id: string, score: number | null, feedback: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/exam-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, feedback }),
      });

      if (res.ok) {
        await fetchSubmissions(); // Re-fetch all submissions to update the list
        setShowFormModal(false);
        setEditingSubmission(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to update submission.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error updating submission.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this submission? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/exam-submissions/${submissionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchSubmissions();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete submission.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    const percentage = (score / examDetails.totalPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link href={`/admin/${companyId}/exams`} className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-2">
            <ChevronLeftIcon className="h-5 w-5 mr-1" /> Back to Exams
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Submissions for: <span className="text-purple-700">{examDetails.title}</span>
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📝</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Course: {examDetails.courseTitle} | Total Points: {examDetails.totalPoints} | Online Exam: {examDetails.isOnline ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading submissions...
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={filterGradedStatus}
            onChange={(e) => setFilterGradedStatus(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Graded">Graded</option>
            <option value="Pending">Pending Grading</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        {filteredSubmissions.length === 0 && !isLoading && (
          <div className="text-center py-10 text-gray-500">
            No submissions found for this exam or matching your criteria.
          </div>
        )}
        {filteredSubmissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2" />
                        <div>
                          {submission.studentName} <br />
                          <span className="text-xs text-gray-500">{submission.studentEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {submission.score !== null ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getScoreColor(submission.score)}`}>
                          {submission.score.toFixed(1)} / {examDetails.totalPoints}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <ClockIcon className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {submission.feedback || <span className="italic text-gray-400">No feedback yet.</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {examDetails.isOnline && submission.answers && (
                          <button
                            onClick={() => { setViewingSubmissionDetails(submission); setShowDetailsModal(true); }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Answers"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingSubmission(submission); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Score & Feedback"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Submission"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submission Form Modal (Edit Score/Feedback) */}
      {showFormModal && editingSubmission && (
        <SubmissionFormModal
          submissionData={editingSubmission}
          onClose={() => { setShowFormModal(false); setEditingSubmission(null); setError(null); }}
          onSave={handleSaveScoreAndFeedback}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          examTotalPoints={examDetails.totalPoints}
        />
      )}

      {/* Submission Details View Modal (View Answers) */}
      {showDetailsModal && viewingSubmissionDetails && (
        <SubmissionDetailsViewModal
          submissionData={viewingSubmissionDetails}
          onClose={() => { setShowDetailsModal(false); setViewingSubmissionDetails(null); }}
          examDetails={examDetails}
        />
      )}
    </div>
  );
}
