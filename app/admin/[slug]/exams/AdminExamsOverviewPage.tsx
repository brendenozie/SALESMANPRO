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
      alert("Please fill all required fields: Title, Course, Date, Educator, Type, and Total Points.");
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
            alert("Start time must be before end time.");
            return;
        }
    }

    onSave(formData);
  };

  const isEdit = !!examData;

  return (
    <div className="fixed inset-0 bg-slate-900 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-xl relative max-h-[90vh] overflow-y-auto ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEdit ? 'Update Assessment Details' : 'Configure New Assessment'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Fill out the performance guidelines and schedules below.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={resetError} className="text-rose-500 hover:text-rose-800">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="title" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Exam Title <span className="text-rose-500">*</span></label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
              className="block w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors bg-slate-50/50" />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</label>
            <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2}
              className="block w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors bg-slate-50/50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="examCategoryId" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Exam Category</label>
              <select name="examCategoryId" id="examCategoryId" value={formData.examCategoryId || ''} onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-colors"
              >
                <option value="">Select Category</option>
                {allExamCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="courseId" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Course <span className="text-rose-500">*</span></label>
              <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-colors"
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
              <label htmlFor="createdByEducatorId" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned Educator <span className="text-rose-500">*</span></label>
              <select name="createdByEducatorId" id="createdByEducatorId" value={formData.createdByEducatorId} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-colors"
              >
                <option value="">Select Instructor</option>
                {allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="date" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Assessment Date <span className="text-rose-500">*</span></label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors" />
            </div>

            <div className="space-y-1">
              <label htmlFor="type" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Evaluation Profile <span className="text-rose-500">*</span></label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-colors"
              >
                <option value="QUIZ">Quiz</option>
                <option value="UNIT_TEST">Unit Test</option>
                <option value="MIDTERM">Midterm</option>
                <option value="FINAL">Final Examination</option>
                <option value="ASSIGNMENT_BASED">Assignment Based</option>
                <option value="PRACTICE">Practice Session</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor="startTime" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">Start (HH:MM)</label>
                <input type="text" name="startTime" id="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="09:00"
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
              </div>
              <div className="space-y-1">
                <label htmlFor="endTime" className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">End (HH:MM)</label>
                <input type="text" name="endTime" id="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="10:30"
                  className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="classroomId" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Target Classroom</label>
              <select name="classroomId" id="classroomId" value={formData.classroomId || ''} onChange={handleChange}
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-colors"
              >
                <option value="">Universal / Standalone</option>
                {allClassRooms.map(classRoom => (
                  <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="location" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Facility Venue</label>
              <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., Block B Hall / Remote"
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
            </div>

            <div className="space-y-1">
              <label htmlFor="totalPoints" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Max Points <span className="text-rose-500">*</span></label>
              <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
            </div>

            <div className="space-y-1">
              <label htmlFor="durationMinutes" className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Duration (Mins)</label>
              <input type="number" name="durationMinutes" id="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} min="1" placeholder="Untimed"
                className="block w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600" />
            </div>
          </div>

          <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="isOnline" className="text-sm font-medium text-slate-800">Deliver Electronically (Online Test)</label>
              <input type="checkbox" name="isOnline" id="isOnline" checked={formData.isOnline} onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600" />
            </div>

            {formData.isOnline && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 animate-in fade-in-40 duration-100">
                <label htmlFor="autoGrade" className="text-xs font-medium text-slate-600">Automate Submissions Matrix Grading</label>
                <input type="checkbox" name="autoGrade" id="autoGrade" checked={formData.autoGrade} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600" />
              </div>
            )}

            {isEdit && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <label htmlFor="isPublished" className="text-sm font-medium text-slate-800">Publish Transcripts to Students</label>
                <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange}
                  className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-sm font-medium text-white rounded-xl shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isEdit ? 'Apply Changes' : 'Create Exam'}
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
        setError(errorData.message || "Failed to fetch operational logs.");
      }
    } catch (err: any) {
      setError(err.message || "Network exception encountered.");
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
        setError(errorData.message || "Failed execution constraints.");
      }
    } catch (err: any) {
      setError(err.message || "Network layout disruption.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to completely erase this evaluation? All relative analytics metrics will be detached.")) {
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
        setError(errorData.message || "Failed deletion framework routine.");
      }
    } catch (err: any) {
      setError(err.message || "Operational exception occurred.");
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
        setError("Failed execution metrics publishing adjust.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50/60 dark:bg-slate-900 min-h-screen font-sans antialiased selection:bg-indigo-500/10">
      
      {/* Dynamic Command Navbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            <span>Academic Control Center</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Assessments</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 sm:text-3xl">
            Examination Registers
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-600">
            <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
            <span>{today}</span>
          </div>
          <button
            onClick={() => { setEditingExam(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all duration-150"
          >
            <PlusCircleIcon className="h-4 w-4" /> 
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* Analytics Matrix Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Evaluation Space', val: stats.total, color: 'text-blue-600', icon: ClipboardDocumentCheckIcon, bg: 'bg-blue-50/50' },
          { label: 'Upcoming Slates', val: stats.upcoming, color: 'text-amber-600', icon: ExclamationTriangleIcon, bg: 'bg-amber-50/50' },
          { label: 'Concluded Audits', val: stats.completed, color: 'text-emerald-600', icon: CheckCircleIcon, bg: 'bg-emerald-50/50' },
          { label: 'Baseline Target', val: stats.scoreAverage, color: 'text-purple-600', icon: TrophyIcon, bg: 'bg-purple-50/50' }
        ].map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm/50">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
              <h4 className="text-xl font-bold text-slate-900">{c.val}</h4>
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg} border border-transparent`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Operational List Dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Sub-header Filter Action Controls */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">Operational Aggregation Layout</h3>
          </div>

          {/* Clean Segment Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search index context..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>
            
            {[
              { val: filterExamCategory, set: setFilterExamCategory, opt: initialExamCategories, lbl: 'Categories' },
              { val: selectedYear || 'All', set: (v: string) => { setSelectedYear(v); }, opt: academicYearOptions, lbl: 'Years' },
              { val: filterCourse, set: setFilterCourse, opt: allCourses, lbl: 'Courses', useTitle: true },
              { val: filterClass, set: setFilterClass, opt: allClassRooms, lbl: 'Classrooms' },
              { val: filterEducator, set: setFilterEducator, opt: allEducators, lbl: 'Educators' }
            ].map((f, i) => (
              <select
                key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 text-slate-700"
              >
                <option value="All">All {f.lbl}</option>
                {f && f.opt && f.opt.map((o: any) => (
                  <option key={o.id} value={o.id}>{f.useTitle ? o.title : o.name}</option>
                ))}
              </select>
            ))}

            <select
              value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 text-slate-700"
            >
              <option value="All">All Frameworks</option>
              {uniqueExamTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Runtime Notifications Container */}
        {error && (
          <div className="m-5 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        )}

        {/* High-Performance Micro-Data Sheet Table Layout */}
        <div className="overflow-x-auto">
          {filteredExams.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FolderOpenIcon className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No matching assessments discovered within this sector scope.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Audit Registry Label</th>
                  <th className="px-5 py-3">Instructor Matrix</th>
                  <th className="px-5 py-3">Location Venue</th>
                  <th className="px-5 py-3">Schedule Slot</th>
                  <th className="px-5 py-3 text-center">Digital Delivery</th>
                  <th className="px-5 py-3 text-center">Quantities</th>
                  <th className="px-5 py-3">Publication</th>
                  <th className="px-5 py-3 text-right">Actions Panel Interface</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {filteredExams.map((exam) => {
                  const isConcluded = new Date(exam.date).getTime() < new Date().setHours(0,0,0,0);
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{exam.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                            {exam.type}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${isConcluded ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">{exam.courseTitle}</div>
                        <div className="text-slate-400 text-[10px]">{exam.createdByEducatorName}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{exam.location || exam.classroom?.name || 'Universal'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <ClockIcon className="h-3 w-3" />
                          <span>{exam.startTime ? `${exam.startTime} - ${exam.endTime}` : 'Variable Schedule'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        {exam.isOnline ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <GlobeAltIcon className="h-3 w-3" /> Online
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800">{exam.totalQuestions}</span>
                        <span className="text-slate-400"> Q</span>
                        <span className="mx-1 text-slate-300">|</span>
                        <span className="font-bold text-slate-800">{exam.totalSubmissions}</span>
                        <span className="text-slate-400"> S</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleResultsPublished(exam.id, exam.isPublished)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors
                            ${exam.isPublished 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {exam.isPublished ? 'Published' : 'Draft Access'}
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Module Route Hubs */}
                          {exam.isOnline && (
                            <div className="flex items-center gap-1 border-r border-slate-200/60 pr-1 mr-1">
                              <Link 
                                href={`/admin/${companyId}/exams/${exam.id}/questions`}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Configure Evaluation Tasks"
                              >
                                <BookOpenIcon className="h-4 w-4" />
                              </Link>
                              <Link 
                                href={`/admin/${companyId}/exams/${exam.id}/submissions`}
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Analyze Interactive Submissions"
                              >
                                <FolderOpenIcon className="h-4 w-4" />
                              </Link>
                            </div>
                          )}

                          <Link 
                            href={`/admin/${companyId}/exams/${exam.id}/grades?courseId=${exam.courseId}&classroomId=${exam.classroomId || ''}&educatorId=${exam.createdByEducatorId}&academicYearId=${exam.academicYearId}&termId=${exam.termId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                          >
                            <UsersIcon className="h-3.5 w-3.5 text-slate-500" />
                            <span>Grades Matrix</span>
                          </Link>

                          <button
                            onClick={() => { setEditingExam(exam); setShowFormModal(true); setError(null); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Core Metrics"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Erase Log"
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

      {/* Modular Form Dialog Overlay */}
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