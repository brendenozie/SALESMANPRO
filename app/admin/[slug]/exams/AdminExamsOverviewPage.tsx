'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  TrophyIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  XMarkIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ClassRoomOption } from '../students/StudentsClient';
import { AcademicYear } from '../academic-years/page';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions ---
export type ExamData = {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  courseTitle: string;
  examCategoryId: string | null;
  course: { id: string; title: string; academicLevels: { id: string; name: string; sortOrder?: number }[] };
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
  classroomId: string | null;
  classroom: { id: string; name: string; academicLevelId: string } | null;
  academicYearId: string | null;
  termId: string | null;
  date: string; 
  startTime: string | null; 
  endTime: string | null; 
  location: string | null;
  notes: string | null;
  type: 'QUIZ' | 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT_BASED' | 'PRACTICE' | 'OTHER'; 
  totalPoints: number;
  isPublished: boolean;
  createdByEducatorId: string;
  createdByEducatorName: string;
  createdByEducatorEmail: string;
  isOnline: boolean;
  durationMinutes: number | null;
  autoGrade: boolean;
  totalQuestions: number; 
  totalSubmissions: number; 
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
  allAcademicLevels: AcademicLevelOption[]; 
  allClassRooms: ClassRoomOption[];
  companyId: string;
  activeAcademicYearId: string | null;
  activeTermId: string | null;
  academicYears: AcademicYear[];
}

type ExamFormModalProps = {
  examData: ExamData | null;
  onClose: () => void;
  onSave: (data: Omit<ExamData, 'courseTitle' | 'courseAcademicLevels' | 'createdByEducatorName' | 'createdByEducatorEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>) => void;
  allExamCategories: { id: string; name: string; description: string; companyId: string }[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allClassRooms: ClassRoomOption[];
  companyId: string;
  academicYears: AcademicYear[];
  activeAcademicYearId: string | null;
  activeTermId: string | null;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
};

const ExamFormModal: React.FC<ExamFormModalProps> = ({ 
  examData, onClose, onSave, allExamCategories, allCourses, allEducators, 
  allClassRooms, companyId, isLoading, error, resetError, activeAcademicYearId, activeTermId 
}) => {
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
      date: new Date().toISOString().split('T')[0],
      course: { id: '', title: '', academicLevels: [] },
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
      academicYearId: activeAcademicYearId,
      termId: activeTermId,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();

    if (!formData.title || !formData.courseId || !formData.date || !formData.createdByEducatorId || !formData.type || formData.totalPoints === null) {
      alert("Please fill out all required fields: Title, Course, Date, Instructor, Exam Type, and Max Points.");
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
        alert("Start Time must be in HH:MM format.");
        return;
    }
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
        alert("End Time must be in HH:MM format.");
        return;
    }

    if (formData.startTime && formData.endTime) {
        const start = new Date(`1970-01-01T${formData.startTime}:00Z`);
        const end = new Date(`1970-01-01T${formData.endTime}:00Z`);
        if (start >= end) {
            alert("The start time must be before the end time.");
            return;
        }
    }

    onSave(formData);
  };

  const isEdit = !!examData;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Edit Exam' : 'Create a New Exam'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fill out the basic details and schedule for this exam below.</p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl mb-6 flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={resetError} className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-200">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="title" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Exam Title <span className="text-rose-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
              className="block w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800 dark:text-white" />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2}
              className="block w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800 dark:text-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="examCategoryId" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
              <select name="examCategoryId" id="examCategoryId" value={formData.examCategoryId || ''} onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              >
                <option value="">Select Category</option>
                {allExamCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="courseId" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Course <span className="text-rose-500">*</span></label>
              <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              >
                <option value="">Select Course</option>
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.academicLevels.map(al => al.name).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="createdByEducatorId" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Instructor <span className="text-rose-500">*</span></label>
              <select name="createdByEducatorId" id="createdByEducatorId" value={formData.createdByEducatorId} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              >
                <option value="">Select Instructor</option>
                {allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="date" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date <span className="text-rose-500">*</span></label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors dark:bg-slate-800 dark:text-white text-slate-900" />
            </div>

            <div className="space-y-1">
              <label htmlFor="type" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Exam Type <span className="text-rose-500">*</span></label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              >
                <option value="QUIZ">Quiz</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final Exam</option>
                <option value="ASSIGNMENT_BASED">Assignment</option>
                <option value="PRACTICE">Practice</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="startTime" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Start Time</label>
                <input type="text" name="startTime" id="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="09:00"
                  className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 dark:bg-slate-800 dark:text-white" />
              </div>
              <div className="space-y-1">
                <label htmlFor="endTime" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">End Time</label>
                <input type="text" name="endTime" id="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="10:30"
                  className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 dark:bg-slate-800 dark:text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="classroomId" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Classroom (Optional)</label>
              <select name="classroomId" id="classroomId" value={formData.classroomId || ''} onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white transition-colors"
              >
                <option value="">Applies to everyone</option>
                {allClassRooms.map(classRoom => (
                  <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location / Room</label>
              <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., Room 101 or Online"
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 dark:bg-slate-800 dark:text-white" />
            </div>

            <div className="space-y-1">
              <label htmlFor="totalPoints" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Max Points <span className="text-rose-500">*</span></label>
              <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 dark:bg-slate-800 dark:text-white" />
            </div>

            <div className="space-y-1">
              <label htmlFor="durationMinutes" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Duration (Minutes)</label>
              <input type="number" name="durationMinutes" id="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} min="1" placeholder="Untimed"
                className="block w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 dark:focus:border-indigo-500 dark:bg-slate-800 dark:text-white" />
            </div>
          </div>

          <div className="space-y-3 bg-slate-50/70 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label htmlFor="isOnline" className="text-sm font-medium text-slate-800 dark:text-slate-200">This is an online exam</label>
              <input type="checkbox" name="isOnline" id="isOnline" checked={formData.isOnline} onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-slate-700" />
            </div>

            {formData.isOnline && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 animate-in fade-in-40 duration-100">
                <label htmlFor="autoGrade" className="text-xs font-medium text-slate-600 dark:text-slate-400">Grade automatically when submitted</label>
                <input type="checkbox" name="autoGrade" id="autoGrade" checked={formData.autoGrade} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-600 dark:focus:ring-indigo-500 dark:bg-slate-700" />
              </div>
            )}

            {isEdit && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-800 dark:text-slate-200">Show results to students</label>
                <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 border-slate-300 dark:border-slate-600 rounded focus:ring-emerald-500 dark:bg-slate-700" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-sm font-medium text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main AdminExamsOverviewPage Component ---
export default function AdminExamsOverviewPage({ 
  initialExamCategories, initialExams, allCourses, allEducators, allClassRooms, 
  companyId, activeAcademicYearId, activeTermId, academicYears 
}: AdminExamsOverviewPageProps) {
  const [exams, setExams] = useState<ExamData[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamCategory, setFilterExamCategory] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All'); 
  const [filterClass, setFilterClass] = useState('All');
  const [filterEducator, setFilterEducator] = useState('All'); 
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All'); 
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState(activeAcademicYearId);
  const [selectedTerm, setSelectedTerm] = useState(activeTermId);
  const [academicYearOptions] = useState(academicYears);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

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
        setError(errorData.message || "Failed to load exams.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const uniqueExamTypes = useMemo(() => Array.from(exams?.length > 0 ? new Set(exams.map(e => e.type)) : []).sort(), [exams]);
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    if (exams?.length > 0) {
      exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        statuses.add(examDate.getTime() < now.getTime() ? 'Completed' : 'Upcoming');
      });
    }
    return Array.from(statuses).sort();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams?.length > 0 ? exams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.createdByEducatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (exam.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse = filterCourse === 'All' || exam.courseId === filterCourse;
      const matchesClass = filterClass === 'All' || exam.classroomId === filterClass;
      const matchesEducator = filterEducator === 'All' || exam.createdByEducatorId === filterEducator;
      const matchesType = filterType === 'All' || exam.type === filterType;
      const matchesCategory = filterExamCategory === 'All' || exam.examCategoryId === filterExamCategory;
      const matchesYear = !selectedYear || selectedYear === 'All' || exam.academicYearId === selectedYear;
      const matchesTerm = !selectedTerm || selectedTerm === 'All' || exam.termId === selectedTerm;

      const examDate = new Date(exam.date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const currentExamStatus = examDate.getTime() < now.getTime() ? 'Completed' : 'Upcoming';
      const matchesStatus = filterStatus === 'All' || currentExamStatus === filterStatus;

      return matchesSearch && matchesCourse && matchesClass && matchesEducator && matchesType && matchesCategory && matchesStatus && matchesYear && matchesTerm;
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const now = new Date().setHours(0,0,0,0);

      const statusA = dateA < now ? 'Completed' : 'Upcoming';
      const statusB = dateB < now ? 'Completed' : 'Upcoming';

      if (statusA === 'Upcoming' && statusB !== 'Upcoming') return -1;
      if (statusA !== 'Upcoming' && statusB === 'Upcoming') return 1;
      return statusA === 'Upcoming' ? dateA - dateB : dateB - dateA;
    }) : [];
  }, [exams, searchTerm, filterCourse, filterClass, filterEducator, filterType, filterExamCategory, filterStatus, selectedYear, selectedTerm]);

  const stats = useMemo(() => {
    const total = exams?.length || 0;
    const now = new Date().setHours(0,0,0,0);
    const upcoming = exams?.filter(e => new Date(e.date).getTime() >= now).length || 0;
    const completed = exams?.filter(e => new Date(e.date).getTime() < now).length || 0;
    
    const gradedExams = exams?.filter(e => new Date(e.date).getTime() < now && e.totalSubmissions > 0) || [];
    let scoreAverage = 'N/A';
    if (gradedExams.length > 0) {
      const totalPoints = gradedExams.reduce((sum, exam) => sum + exam.totalPoints, 0);
      scoreAverage = `${(totalPoints / gradedExams.length).toFixed(0)} pts`;
    }

    return { total, upcoming, completed, scoreAverage };
  }, [exams]);

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
        await fetchExams();
        setShowFormModal(false);
        setEditingExam(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to save the exam.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam? This action cannot be undone and will remove all student grades for it.")) {
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
        setError(errorData.message || "Failed to delete the exam.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
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
        setError("Failed to update the exam publication status.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans antialiased selection:bg-indigo-500/10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <span>School Admin</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>Exams & Tests</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 sm:text-3xl">
            Exam Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
            <span>{today}</span>
          </div>
          <button
            onClick={() => { setEditingExam(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all duration-150"
          >
            <PlusCircleIcon className="h-4 w-4" /> 
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', val: stats.total, color: 'text-blue-600 dark:text-blue-400', icon: ClipboardDocumentCheckIcon, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Upcoming Exams', val: stats.upcoming, color: 'text-amber-600 dark:text-amber-400', icon: ExclamationTriangleIcon, bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Completed Exams', val: stats.completed, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Average Score', val: stats.scoreAverage, color: 'text-purple-600 dark:text-purple-400', icon: TrophyIcon, bg: 'bg-purple-50 dark:bg-purple-900/20' }
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm/50">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{c.label}</span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{c.val}</h4>
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg} border border-transparent`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main List Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search & Filters */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Search & Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            
            {[
              { val: filterExamCategory, set: setFilterExamCategory, opt: initialExamCategories, lbl: 'Categories' },
              { val: selectedYear || 'All', set: (v: string) => { setSelectedYear(v); }, opt: academicYearOptions, lbl: 'Years' },
              { val: filterCourse, set: setFilterCourse, opt: allCourses, lbl: 'Courses', useTitle: true },
              { val: filterClass, set: setFilterClass, opt: allClassRooms, lbl: 'Classrooms' },
              { val: filterEducator, set: setFilterEducator, opt: allEducators, lbl: 'Instructors' }
            ].map((f, i) => (
              <select
                key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300"
              >
                <option value="All">All {f.lbl}</option>
                {f && f.opt && f.opt.map((o: any) => (
                  <option key={o.id} value={o.id}>{f.useTitle ? o.title : o.name}</option>
                ))}
              </select>
            ))}

            <select
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Exam Types</option>
              {uniqueExamTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="m-5 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredExams.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <FolderOpenIcon className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">No exams found matching your search.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3">Exam Name</th>
                  <th className="px-5 py-3">Instructor</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3 text-center">Online?</th>
                  <th className="px-5 py-3 text-center">Questions / Subs</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {filteredExams.map((exam) => {
                  const isConcluded = new Date(exam.date).getTime() < new Date().setHours(0,0,0,0);
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{exam.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {exam.type}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isConcluded ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{exam.courseTitle}</div>
                        <div className="text-slate-400 dark:text-slate-500 text-[10px]">{exam.createdByEducatorName}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-400">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{exam.location || exam.classroom?.name || 'Everyone'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <ClockIcon className="h-3 w-3" />
                          <span>{exam.startTime ? `${exam.startTime} - ${exam.endTime}` : 'No set time'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {exam.isOnline ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                            <GlobeAltIcon className="h-3 w-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{exam.totalQuestions}</span>
                        <span className="text-slate-400 dark:text-slate-500"> Qs</span>
                        <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{exam.totalSubmissions}</span>
                        <span className="text-slate-400 dark:text-slate-500"> Subs</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleResultsPublished(exam.id, exam.isPublished)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors
                            ${exam.isPublished 
                              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent'}`}
                        >
                          {exam.isPublished ? 'Published' : 'Hidden'}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Links to inner pages */}
                          {exam.isOnline && (
                            <div className="flex items-center gap-1 border-r border-slate-200/60 dark:border-slate-700 pr-1 mr-1">
                              <Link 
                                href={`/admin/${companyId}/exams/${exam.id}/questions`}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Questions"
                              >
                                <BookOpenIcon className="h-4 w-4" />
                              </Link>
                              <Link 
                                href={`/admin/${companyId}/exams/${exam.id}/submissions`}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="View Submissions"
                              >
                                <FolderOpenIcon className="h-4 w-4" />
                              </Link>
                            </div>
                          )}

                          <Link 
                            href={`/admin/${companyId}/exams/${exam.id}/grades?courseId=${exam.courseId}&classroomId=${exam.classroomId || ''}&educatorId=${exam.createdByEducatorId}&academicYearId=${exam.academicYearId}&termId=${exam.termId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <UsersIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Grades</span>
                          </Link>

                          <button
                            onClick={() => { setEditingExam(exam); setShowFormModal(true); setError(null); }}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Exam Info"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title="Delete Exam"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pop-up form */}
      {showFormModal && (
        <ExamFormModal
          examData={editingExam}
          onClose={() => { setShowFormModal(false); setEditingExam(null); setError(null); }}
          onSave={handleSaveExam}
          allExamCategories={initialExamCategories}
          allCourses={allCourses}
          allClassRooms={allClassRooms}
          allEducators={allEducators}
          academicYears={academicYearOptions}
          activeAcademicYearId={activeAcademicYearId}
          activeTermId={activeTermId}
          companyId={companyId}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
        />
      )}
    </div>
  );
}