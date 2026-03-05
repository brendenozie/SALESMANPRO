'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CalendarDaysIcon, // For date
  ClipboardDocumentCheckIcon, // Main icon for exams
  MagnifyingGlassIcon, // For search
  UsersIcon, // For teachers/students count
  BookOpenIcon, // For class icon
  ChartBarIcon, // For results/progress
  ExclamationTriangleIcon, // For upcoming/due soon
  PencilIcon, // For edit
  TrashIcon, // For delete
  PlusCircleIcon, // For add exam
  TrophyIcon, // For average score
  ClockIcon, // For time
  MapPinIcon, // For location
  CheckCircleIcon, // For published results
  GlobeAltIcon, // For online exams
  XMarkIcon,
  FolderOpenIcon, // For closing modals/errors
} from '@heroicons/react/24/outline';
import Link from 'next/link'; // For linking to exam questions page
import { ClassRoomOption } from '../students/StudentsClient';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with Exam API Response) ---
export type ExamData = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  courseTitle: string;
  examCategoryId: string | null;
  course:{ id: string; title: string; academicLevels: { id: string; name: string; sortOrder?: number }[] };
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
  classroomId: string | null;
  classroom: { id: string; name: string; academicLevelId: string } | null;
  date: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  location: string | null;
  notes: string | null;
  type: 'QUIZ' | 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT_BASED' | 'PRACTICE' | 'OTHER'; // Enum type
  totalPoints: number;
  isPublished: boolean;
  createdByEducatorId: string;
  createdByEducatorName: string;
  createdByEducatorEmail: string;
  isOnline: boolean;
  durationMinutes: number | null;
  autoGrade: boolean;
  totalQuestions: number; // From _count.questions
  totalSubmissions: number; // From _count.submissions
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  academicLevels: { id: string; name: string; sortOrder?: number }[];
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

interface AdminExamsOverviewPageProps {
  initialExamCategories: { id: string; name: string; description: string; companyId: string }[];
  initialExams: ExamData[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[]; // Passed but not directly used in this component's logic, mainly for CourseOption types
  allClassRooms: ClassRoomOption[];
  companyId: string;
}

// --- Exam Form Modal Component ---
type ExamFormModalProps = {
  examData: ExamData | null; // Null for new exam
  onClose: () => void;
  onSave: (data: Omit<ExamData, 'courseTitle' | 'courseAcademicLevels' | 'createdByEducatorName' | 'createdByEducatorEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>) => void;
  allExamCategories: { id: string; name: string; description: string; companyId: string }[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allClassRooms: ClassRoomOption[];
  companyId: string;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
};

const ExamFormModal: React.FC<ExamFormModalProps> = ({ examData, onClose, onSave, allExamCategories, allCourses, allEducators, allClassRooms, companyId, isLoading, error, resetError }) => {
  const [formData, setFormData] = useState<Omit<ExamData, 'courseTitle' | 'courseAcademicLevels' | 'createdByEducatorName' | 'createdByEducatorEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>>(
    examData ? {
      ...examData,
      examCategoryId: examData.examCategoryId || null,
      courseId: examData.courseId || examData.course.id,
      classroomId: examData.classroomId || (examData.classroom ? examData.classroom.id : null),
    } : {
      id: '',
      title: '',
      description: null,
      courseId: '',
      examCategoryId: null,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      course:{ id: '', title: '', academicLevels: [] },
      classroomId: null,
      classroom: null,
      startTime: null,
      endTime: null,
      location: null,
      notes: null,
      type: 'UNIT_TEST',
      totalPoints: 100,
      isPublished: false,
      createdByEducatorId: '',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      companyId: companyId,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError(); // Clear any previous errors

    // Basic client-side validation for required fields
    if (!formData.title || !formData.courseId || !formData.date || !formData.createdByEducatorId || !formData.type || formData.totalPoints === null) {
      alert("Please fill all required fields: Title, Course, Date, Created By Educator, Type, and Total Points.");
      return;
    }

    // Validate time formats if provided
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM (24-hour)
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
        alert("Start Time must be in HH:MM (24-hour) format.");
        return;
    }
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
        alert("End Time must be in HH:MM (24-hour) format.");
        return;
    }

    // Validate start time before end time
    if (formData.startTime && formData.endTime) {
        const start = new Date(`1970-01-01T${formData.startTime}:00Z`);
        const end = new Date(`1970-01-01T${formData.endTime}:00Z`);
        if (start >= end) {
            alert("Start time must be before end time.");
            return;
        }
    }

    onSave(formData);
  };

  const isEdit = !!examData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {isEdit ? `Edit Exam: ${examData?.title}` : 'Add New Exam'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Exam Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>

            <div>
              <label htmlFor="examCategoryId" className="block text-sm font-medium text-gray-700 mb-1">Exam Category</label>
              <select name="examCategoryId" id="examCategoryId" value={formData.examCategoryId || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Exam Category --</option>
                {allExamCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
              <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Course --</option>
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.academicLevels.map(al => al.name).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="createdByEducatorId" className="block text-sm font-medium text-gray-700 mb-1">Created By Educator <span className="text-red-500">*</span></label>
              <select name="createdByEducatorId" id="createdByEducatorId" value={formData.createdByEducatorId} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Educator --</option>
                {allEducators.length > 0 && allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Exam Type <span className="text-red-500">*</span></label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Type --</option>
                <option value="QUIZ">Quiz</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final</option>
                <option value="ASSIGNMENT_BASED">Assignment Based</option>
                <option value="PRACTICE">Practice</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM)</label>
              <input type="text" name="startTime" id="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="e.g., 09:00"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM)</label>
              <input type="text" name="endTime" id="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="e.g., 10:30"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700 mb-1">Class Room <span className="text-gray-500">(Optional)</span></label>
              <select name="classroomId" id="classroomId" value={formData.classroomId || ''} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Class Room --</option>
                {allClassRooms.length > 0 && allClassRooms.map(classRoom => (
                  <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., School Hall A / Online"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">Total Points <span className="text-red-500">*</span></label>
              <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" name="durationMinutes" id="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} min="1"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Instructions for Students)</label>
              <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={2}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>

            {/* Online Exam Specific Fields */}
            <div className="md:col-span-2 flex items-center mt-4">
              <input type="checkbox" name="isOnline" id="isOnline" checked={formData.isOnline} onChange={handleChange}
                className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="isOnline" className="ml-2 block text-base font-medium text-gray-700">Is Online Exam?</label>
            </div>

            {formData.isOnline && (
              <>
                <div>
                  <label htmlFor="autoGrade" className="block text-sm font-medium text-gray-700 mb-1">Auto-Grade?</label>
                  <div className="flex items-center h-full">
                    <input type="checkbox" name="autoGrade" id="autoGrade" checked={formData.autoGrade} onChange={handleChange}
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    <label htmlFor="autoGrade" className="ml-2 block text-base font-medium text-gray-700">Enable Auto-Grading</label>
                  </div>
                </div>
              </>
            )}

            {isEdit && (
              <div className="md:col-span-2 flex items-center mt-4">
                <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange}
                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <label htmlFor="isPublished" className="ml-2 block text-base font-medium text-gray-700">Publish Results to Students</label>
              </div>
            )}
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
              ) : (isEdit ? 'Save Changes' : 'Add Exam')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main AdminExamsOverviewPage Component ---
export default function AdminExamsOverviewPage({ initialExamCategories, initialExams, allCourses, allEducators, allClassRooms, companyId }: AdminExamsOverviewPageProps) {
  const [exams, setExams] = useState<ExamData[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamCategory, setFilterExamCategory] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All'); // Changed from filterClass
  const [filterClass, setFilterClass] = useState('All');
  const [filterEducator, setFilterEducator] = useState('All'); // Changed from filterTeacher
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); // Upcoming, Completed
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch exams from API
  const fetchExams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exams?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
        credentials: 'include', 
      });
      if (res.ok) {
        const data: ExamData[] = await res.json();
        setExams(data);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch exams.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching exams.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // useEffect(() => {
  //   // Only fetch if initial data is empty (meaning server fetch failed or was empty)
  //   if (initialExams.length === 0 && !isLoading && !error) {
  //     fetchExams();
  //   }
  // }, [initialExams, isLoading, error, fetchExams]);


  const uniqueExamTypes = useMemo(() => Array.from(exams && exams.length > 0 ? new Set(exams.map(e => e.type)) : []).sort(), [exams]);
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    // Determine status based on current date vs exam date
    exams && exams.length > 0 &&
      exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day

        if (examDate.getTime() < now.getTime()) {
          statuses.add('Completed');
        } else {
          statuses.add('Upcoming');
        }
      }); 
    return Array.from(statuses).sort();
  }, [exams]);


  const filteredExams = useMemo(() => {
    return exams && exams.length > 0 ? exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.createdByEducatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exam.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = filterCourse === 'All' || exam.courseId === filterCourse;
      const matchesClass = filterClass === 'All' || exam.classroomId === filterClass;
      const matchesEducator = filterEducator === 'All' || exam.createdByEducatorId === filterEducator;
      const matchesType = filterType === 'All' || exam.type === filterType;
      const matchesCategory = filterExamCategory === 'All' || exam.examCategoryId === filterExamCategory;

      // Determine dynamic status for filtering
      const examDate = new Date(exam.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const currentExamStatus = examDate.getTime() < now.getTime() ? 'Completed' : 'Upcoming';
      const matchesStatus = filterStatus === 'All' || currentExamStatus === filterStatus;

      return matchesSearch && matchesCourse && matchesClass && matchesEducator && matchesType && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      // Sort upcoming exams first by date (ascending), then completed exams by date (descending)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const now = new Date().setHours(0,0,0,0);

      const statusA = dateA < now ? 'Completed' : 'Upcoming';
      const statusB = dateB < now ? 'Completed' : 'Upcoming';

      if (statusA === 'Upcoming' && statusB !== 'Upcoming') return -1;
      if (statusA !== 'Upcoming' && statusB === 'Upcoming') return 1;

      // If both are upcoming, sort ascending by date
      if (statusA === 'Upcoming' && statusB === 'Upcoming') {
        return dateA - dateB;
      }
      // If both are completed, sort descending by date
      if (statusA === 'Completed' && statusB === 'Completed') {
        return dateB - dateA;
      }
      return 0; // Should not reach here if logic is sound
    }) : [];
  }, [exams, searchTerm, filterCourse, filterClass, filterEducator, filterType, filterExamCategory, filterStatus]);


  // Calculate overview stats
  const totalExams = exams && exams.length > 0 ? exams.length : 0;
  const upcomingExamsCount = exams && exams.length > 0 ? exams.filter(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0)).length : 0;
  const completedExamsCount = exams && exams.length > 0 ? exams.filter(e => new Date(e.date).getTime() < new Date().setHours(0,0,0,0)).length : 0;
  const resultsPublishedCount = exams && exams.length > 0 ? exams.filter(e => e.isPublished).length : 0;

  // Calculate overall average score for completed exams where results are published
  // NOTE: This average score is a placeholder. In a real app, you'd fetch actual student scores
  // from ExamSubmission records and calculate the average.
  const overallSchoolExamAverage = useMemo(() => {
    const gradedExamsWithScores = exams && exams.length > 0 ? exams.filter(e => new Date(e.date).getTime() < new Date().setHours(0,0,0,0) && e.totalSubmissions > 0) : [];
    if (gradedExamsWithScores.length === 0) return 'N/A';

    // This is a simplified average. A true average would sum up all student scores
    // and divide by total students across all exams.
    // For now, we'll just average the `totalPoints` as a proxy for "average performance potential"
    // or you'd need `averageScore` field in ExamData from API if pre-calculated.
    const totalPossiblePoints = gradedExamsWithScores.reduce((sum, exam) => sum + exam.totalPoints, 0);
    return totalPossiblePoints > 0 ? (totalPossiblePoints / gradedExamsWithScores.length).toFixed(1) + ' pts (avg. potential)' : 'N/A';
  }, [exams]);


  // Helper for status badge colors (dynamic based on current date)
  const getExamStatusColor = (examDateString: string) => {
    const examDate = new Date(examDateString);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day

    if (examDate.getTime() < now.getTime()) {
      return 'bg-green-100 text-green-800'; // Completed
    } else {
      return 'bg-blue-100 text-blue-800'; // Upcoming
    }
  };

  // Helper for grade color based on average score (if available)
  const getGradeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-800';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-blue-100 text-blue-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // API Call handlers
  const handleSaveExam = async (examData: Omit<ExamData, 'courseTitle' | 'courseAcademicLevels' | 'createdByEducatorName' | 'createdByEducatorEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const isEdit = !!examData.id;
    const method = isEdit ? 'PATCH' : 'POST';
    const url = isEdit ? `${apiBaseUrl}/admin/exams/${examData.id}` : `${apiBaseUrl}/admin/exams`;

    try {
      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData),
      });

      if (res.ok) {
        await fetchExams(); // Re-fetch all exams to update the list
        setShowFormModal(false);
        setEditingExam(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} exam.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${isEdit ? 'updating' : 'adding'} exam.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exams/${examId}`, {
        credentials: 'include',
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchExams();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete exam.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting exam.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleResultsPublished = async (examId: string, currentStatus: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/exams/${examId}`, {
        method: 'PATCH',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (res.ok) {
        await fetchExams();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update publish status.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating publish status.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Exams Management
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📊</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Oversee and manage all school examinations.</p>
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
              <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
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
              <ChartBarIcon className="h-7 w-7 text-green-600" />
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
              <TrophyIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Average</p>
              <h2 className="text-3xl font-bold text-gray-800">{overallSchoolExamAverage}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* All Exams List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" /> All School Exams
          </h3>
          <button
            onClick={() => { setEditingExam(null); setShowFormModal(true); setError(null); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Exam
          </button>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading exams...
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
              placeholder="Search by exam name, course, or educator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterExamCategory}
              onChange={(e) => setFilterExamCategory(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Categories</option>
              {initialExamCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
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
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {allClassRooms.map(classRoom => (
                <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterEducator}
              onChange={(e) => setFilterEducator(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Educators</option>
              {allEducators.length > 0 && allEducators.map(educator => (
                <option key={educator.id} value={educator.id}>{educator.name}</option>
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
              {uniqueExamTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-x-auto">
          {filteredExams.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No exams found matching your criteria.
            </div>
          )}
          {filteredExams.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course (Educator)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classroom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Online</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ques. / Sub.</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Results</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.courseTitle} <br />
                      <span className="text-xs text-gray-400">({exam.createdByEducatorName})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.classroom ? exam.classroom.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.date).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-400">
                        {exam.startTime && exam.endTime ? `${exam.startTime} - ${exam.endTime}` : (exam.startTime || 'N/A')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" /> {exam.location || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800`}>
                            {exam.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {exam.isOnline ? <GlobeAltIcon className="h-5 w-5 text-green-500 mx-auto" title="Online Exam" /> : <span className="text-gray-400">--</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold">{exam.totalQuestions}</span> Q / <span className="font-semibold">{exam.totalSubmissions}</span> S
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                            onClick={() => toggleResultsPublished(exam.id, exam.isPublished)}
                            className={`flex items-center gap-1 text-xs font-medium
                                ${exam.isPublished ? 'text-green-600 hover:text-green-800' : 'text-gray-500 hover:text-gray-700'}`}
                            title={exam.isPublished ? 'Results Published' : 'Publish Results'}
                        >
                            {exam.isPublished ? <CheckCircleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                            {exam.isPublished ? 'Published' : 'Unpublished'}
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {exam.isOnline && (
                          <div className="flex flex-col items-center">
                            <Link href={`/admin/${companyId}/exams/${exam.id}/questions`}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Manage Questions"
                            >
                                <BookOpenIcon className="h-4 w-4" />
                            </Link>
                            <Link href={`/admin/${companyId}/exams/${exam.id}/submissions`}
                                className="text-teal-600 hover:text-teal-900 flex items-center mt-1"
                                title="View Submissions"
                            >
                                <FolderOpenIcon className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                        <Link 
                          href={`/admin/${companyId}/exams/${exam.id}/grades?courseId=${exam.courseId}&classroomId=${exam.classroomId || ''}`}
                          className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <UsersIcon className="h-5 w-5" />
                          <span>Manage Grades</span>
                        </Link>
                        <button
                          onClick={() => { setEditingExam(exam); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Exam"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Exam"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Exam Form Modal */}
      {showFormModal && (
        <ExamFormModal
          examData={editingExam}
          onClose={() => { setShowFormModal(false); setEditingExam(null); setError(null); }}
          onSave={handleSaveExam}
          allExamCategories={initialExamCategories}
          allCourses={allCourses}
          allClassRooms={allClassRooms}
          allEducators={allEducators}
          companyId={companyId}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
        />
      )}
    </div>
  );
}
