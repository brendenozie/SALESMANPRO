'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  PhotoIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with ExamQuestion API Response) ---
export type ExamQuestionData = {
  id: string;
  examId: string;
  examTitle: string;
  examCourseTitle: string;
  questionText: string;
  imageUrl: string | null;
  videoUrl: string | null;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'FILL_IN_THE_BLANK' | 'MATCHING' | 'NUMERIC';
  options: string[]; // Array of strings for MCQs, etc.
  correctAnswer: string | null; // Stores correct answer for auto-grading
  points: number;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ExamDetailsForQuestions = {
  id: string;
  title: string;
  courseTitle: string;
  isOnline: boolean;
  durationMinutes: number | null;
  autoGrade: boolean;
  companyId: string;
};

interface ExamQuestionsManagerPageProps {
  examDetails: ExamDetailsForQuestions;
  initialQuestions: ExamQuestionData[];
  companyId: string;
}

// --- Question Card Component ---
interface QuestionCardProps {
  question: ExamQuestionData;
  onEdit: (question: ExamQuestionData) => void;
  onDelete: (id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onEdit, onDelete }) => {
  const getQuestionTypeIcon = (type: ExamQuestionData['questionType']) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <ListBulletIcon className="h-4 w-4 text-blue-500" />;
      case 'TRUE_FALSE': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'SHORT_ANSWER': return <DocumentTextIcon className="h-4 w-4 text-purple-500" />;
      case 'ESSAY': return <DocumentTextIcon className="h-4 w-4 text-red-500" />;
      case 'FILL_IN_THE_BLANK': return <ClipboardDocumentCheckIcon className="h-4 w-4 text-yellow-500" />;
      case 'MATCHING': return <ListBulletIcon className="h-4 w-4 text-orange-500" />;
      case 'NUMERIC': return <ClockIcon className="h-4 w-4 text-pink-500" />; // Using ClockIcon as a generic number icon
      default: return <QuestionMarkCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className="text-gray-500">#{question.order}</span>
          {getQuestionTypeIcon(question.questionType)}
          <span>{question.questionType.replace(/_/g, ' ')}</span>
          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
            {question.points} Points
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(question)}
            className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Edit Question"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-1 rounded-full text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Question"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className="text-gray-900 text-base font-medium">{question.questionText}</p>

      {question.imageUrl && (
        <div className="flex justify-center">
          <img src={question.imageUrl} alt="Question Image" className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" onError={(e) => { e.currentTarget.src = `https://placehold.co/400x200/FF0000/FFFFFF?text=Image+Load+Error`; }} />
        </div>
      )}
      {question.videoUrl && (
        <div className="flex justify-center">
          <video controls src={question.videoUrl} className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200">
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {question.options && question.options.length > 0 && (
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-semibold">Options:</p>
          <ul className="list-disc list-inside ml-4">
            {question.options.map((option, index) => (
              <li key={index} className={option === question.correctAnswer ? 'text-green-600 font-medium' : ''}>
                {option} {option === question.correctAnswer && <span className="text-xs">(Correct)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.correctAnswer && question.questionType !== 'MULTIPLE_CHOICE' && (
        <div className="text-sm text-gray-700">
          <p className="font-semibold">Correct Answer:</p>
          <p className="px-3 py-1 bg-green-50 rounded-md text-green-800 text-sm">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
};

// --- Question Form Modal Component ---
type QuestionFormModalProps = {
  examId: string;
  questionData: ExamQuestionData | null; // Null for new question
  onClose: () => void;
  onSave: (data: Omit<ExamQuestionData, 'examTitle' | 'examCourseTitle' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  nextOrder: number; // For pre-filling order for new questions
};

const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({ examId, questionData, onClose, onSave, isLoading, error, resetError, nextOrder }) => {
  const [formData, setFormData] = useState<Omit<ExamQuestionData, 'examTitle' | 'examCourseTitle' | 'createdAt' | 'updatedAt'>>(
    questionData || {
      id: '',
      examId: examId,
      questionText: '',
      imageUrl: null,
      videoUrl: null,
      questionType: 'MULTIPLE_CHOICE', // Default type
      options: [],
      correctAnswer: null,
      points: 1,
      order: nextOrder,
    }
  );
  const [newOption, setNewOption] = useState(''); // For adding new options to MCQ

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData(prev => ({ ...prev, options: [...prev.options, newOption.trim()] }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt !== optionToRemove),
      correctAnswer: prev.correctAnswer === optionToRemove ? null : prev.correctAnswer, // Clear correct answer if option is removed
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();

    // Client-side validation
    if (!formData.questionText || !formData.questionType || formData.points === null || formData.order === null) {
      alert("Please fill all required fields: Question Text, Question Type, Points, and Order.");
      return;
    }

    if (formData.questionType === 'MULTIPLE_CHOICE') {
      if (formData.options.length === 0) {
        alert("Multiple Choice questions require at least one option.");
        return;
      }
      if (!formData.correctAnswer) {
        alert("Please select a correct answer for Multiple Choice questions.");
        return;
      }
    } else if (formData.questionType === 'TRUE_FALSE' && !formData.correctAnswer) {
        alert("Please select True or False for the correct answer.");
        return;
    } else if (['SHORT_ANSWER', 'ESSAY', 'FILL_IN_THE_BLANK', 'NUMERIC', 'MATCHING'].includes(formData.questionType) && !formData.correctAnswer) {
        // For these types, a correct answer is generally expected for auto-grading or reference
        // You might make this optional based on whether autoGrade is true for the exam
        // For now, let's make it required for simplicity, or add a note.
        // alert("Please provide a correct answer for this question type.");
        // return;
    }

    onSave(formData);
  };

  const isEdit = !!questionData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {isEdit ? `Edit Question #${questionData?.order}` : 'Add New Question'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">Question Text <span className="text-red-500">*</span></label>
              <textarea name="questionText" id="questionText" value={formData.questionText} onChange={handleChange} rows={3} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>

            <div>
              <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">Question Type <span className="text-red-500">*</span></label>
              <select name="questionType" id="questionType" value={formData.questionType} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                {VALID_QUESTION_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">Points <span className="text-red-500">*</span></label>
              <input type="number" name="points" id="points" value={formData.points} onChange={handleChange} min="0" required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Order <span className="text-red-500">*</span></label>
              <input type="number" name="order" id="order" value={formData.order} onChange={handleChange} min="1" required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
              <input type="url" name="videoUrl" id="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} placeholder="https://example.com/video.mp4"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>
          </div>

          {/* Conditional Fields based on Question Type */}
          {formData.questionType === 'MULTIPLE_CHOICE' && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Options & Correct Answer</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add new option"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                />
                <button type="button" onClick={handleAddOption}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <label className="flex items-center text-gray-700">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={option}
                        checked={formData.correctAnswer === option}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-3 text-base">{option}</span>
                    </label>
                    <button type="button" onClick={() => handleRemoveOption(option)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {formData.options.length === 0 && <p className="text-sm text-gray-500">No options added yet.</p>}
              </div>
            </div>
          )}

          {formData.questionType === 'TRUE_FALSE' && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Correct Answer</h3>
              <div className="flex space-x-4">
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="True"
                    checked={formData.correctAnswer === 'True'}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 text-base">True</span>
                </label>
                <label className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="correctAnswer"
                    value="False"
                    checked={formData.correctAnswer === 'False'}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-base">False</span>
                </label>
              </div>
            </div>
          )}

          {['SHORT_ANSWER', 'ESSAY', 'FILL_IN_THE_BLANK', 'NUMERIC', 'MATCHING'].includes(formData.questionType) && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Correct Answer</h3>
              <p className="text-sm text-gray-600">
                Provide the expected correct answer. For essay/short answer, this can be a reference point.
                For fill-in-the-blank/matching, consider exact phrasing or comma-separated values.
              </p>
              <textarea name="correctAnswer" id="correctAnswer" value={formData.correctAnswer || ''} onChange={handleChange} rows={2}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>
          )}


          {/* Action Buttons */}
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
              ) : (isEdit ? 'Save Changes' : 'Add Question')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main ExamQuestionsManagerPage Component ---
export default function ExamQuestionsManagerPage({ examDetails, initialQuestions, companyId }: ExamQuestionsManagerPageProps) {
  const [questions, setQuestions] = useState<ExamQuestionData[]>(initialQuestions);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine the next available order number for new questions
  const nextQuestionOrder = useMemo(() => {
    if (questions.length === 0) return 1;
    const maxOrder = Math.max(...questions.map(q => q.order));
    return maxOrder + 1;
  }, [questions]);

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exam-questions?examId=${encodeURIComponent(examDetails.id)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data: ExamQuestionData[] = await res.json();
        setQuestions(data.sort((a,b) => a.order - b.order)); // Ensure questions are sorted by order
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch exam questions.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching exam questions.");
    } finally {
      setIsLoading(false);
    }
  }, [examDetails.id]);

  useEffect(() => {
    // Only fetch if initial data is empty (meaning server fetch failed or was empty)
    if (initialQuestions.length === 0 && !isLoading && !error) {
      fetchQuestions();
    }
  }, [initialQuestions, isLoading, error, fetchQuestions]);


  // API Call handlers
  const handleSaveQuestion = async (questionData: Omit<ExamQuestionData, 'examTitle' | 'examCourseTitle' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = questionData.id ? 'PATCH' : 'POST';
    const url = questionData.id ? `${apiBaseUrl}/admin/exam-questions/${questionData.id}` : `${apiBaseUrl}/admin/exam-questions`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });

      if (res.ok) {
        await fetchQuestions(); // Re-fetch all questions to update the list
        setShowFormModal(false);
        setEditingQuestion(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} question.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} question.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exam-questions/${questionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchQuestions();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete question.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting question.");
    } finally {
      setIsLoading(false);
    }
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
            Questions for: <span className="text-purple-700">{examDetails.title}</span>
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📝</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Course: {examDetails.courseTitle} | {examDetails.isOnline ? `Online Exam (${examDetails.durationMinutes || 'N/A'} mins)` : 'Offline Exam'} | Auto-Grade: {examDetails.autoGrade ? 'Yes' : 'No'}
          </p>
        </div>
        <button
          onClick={() => { setEditingQuestion(null); setShowFormModal(true); setError(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                     hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircleIcon className="h-5 w-5" /> Add New Question
        </button>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading questions...
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

      {/* Questions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.length === 0 && !isLoading && (
          <div className="md:col-span-full text-center py-10 text-gray-500">
            No questions added to this exam yet. Click "Add New Question" to get started!
          </div>
        )}
        {questions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            onEdit={(q) => { setEditingQuestion(q); setShowFormModal(true); setError(null); }}
            onDelete={handleDeleteQuestion}
          />
        ))}
      </div>

      {/* Question Form Modal */}
      {showFormModal && (
        <QuestionFormModal
          examId={examDetails.id}
          questionData={editingQuestion}
          onClose={() => { setShowFormModal(false); setEditingQuestion(null); setError(null); }}
          onSave={handleSaveQuestion}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          nextOrder={nextQuestionOrder}
        />
      )}
    </div>
  );
}
