'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InboxArrowDownIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type { AssignmentData, CourseAssignmentInfo } from './page';

type AssignmentStatus = 'HOMEWORK' | 'PROJECT' | 'QUIZ' | 'OTHER';

interface ManageCourseAssignmentsPageClientProps {
  course: CourseAssignmentInfo;
  initialAssignments: AssignmentData[];
  educatorId: string;
  courseId: string;
  classroomId: string;
  scheduleId: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ManageCourseAssignmentsPageClient({
  course,
  initialAssignments,
  educatorId,
  courseId,
  classroomId,
  scheduleId
}: ManageCourseAssignmentsPageClientProps) {
  const router = useRouter();
  
  // Theme constants
  const primaryColor = "#4F46E5"; 

  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [form, setForm] = useState<AssignmentData>({
    title: '',
    description: '',
    dueDate: '',
    maxGrade: 100,
    status: 'HOMEWORK' as AssignmentStatus,
    id: '',
    courseInstructorName: '',
    courseId: courseId,
    courseTitle: course.title,
    course: null,
    courseAcademicLevels: [],
    type: 'OTHER',
    totalPoints: 0,
    isPublished: false,
    createdById: educatorId,
    createdByEmail: null,
    createdByName: null,
    durationMinutes: null,
    companyId: null,
    autoGrade: false,
    isOnline: false,
    instructions: null,
    totalQuestions: 0,
    totalSubmissions: 0,
    createdAt: null,
    updatedAt: null,
    date: null,
    startTime: null,
    endTime: null,
    location: null,
    notes: null,
    classroomId: classroomId || '',
    classroom: null,
  });

  useEffect(() => { setAssignments(initialAssignments); }, [initialAssignments]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.status.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, searchTerm]);

  const handleOpenModal = (assignment: AssignmentData | null = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setForm({
        title: assignment.title,
        description: assignment.description || '',
        dueDate: assignment.dueDate,
        maxGrade: assignment.maxGrade,
        status: assignment.status as AssignmentStatus,
        id: assignment.id,
        courseInstructorName: assignment.courseInstructorName,
        courseId: assignment.courseId || courseId,
        courseTitle: assignment.courseTitle,
        course: assignment.course,
        courseAcademicLevels: assignment.courseAcademicLevels,
        instructions: assignment.instructions || '',
        durationMinutes: assignment.durationMinutes || null,
        type: assignment.type,
        totalPoints: assignment.totalPoints,
        isPublished: assignment.isPublished,
        createdById: assignment.createdById || educatorId,
        createdByEmail: assignment.createdByEmail,
        createdByName: assignment.createdByName,
        companyId: assignment.companyId,
        autoGrade: assignment.autoGrade,
        isOnline: assignment.isOnline,
        totalQuestions: assignment.totalQuestions,
        totalSubmissions: assignment.totalSubmissions,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        date: assignment.date,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        location: assignment.location,
        notes: assignment.notes,
        classroomId: assignment.classroomId || classroomId || '',
        classroom: assignment.classroom,
      });
    } else {
      setEditingAssignment(null);
      setForm({ 
                title: '', 
                description: '', 
                dueDate: '', 
                maxGrade: 100, 
                status: 'HOMEWORK',
                instructions: '',
                durationMinutes: null,
                id: '',
                courseInstructorName: '',
                courseId: courseId,
                courseTitle: '',
                course: null,
                courseAcademicLevels: [],
                type: 'OTHER',
                totalPoints: 0,
                isPublished: false,
                createdById: educatorId,
                createdByEmail: null,
                createdByName: null,
                companyId: null,
                autoGrade: false,
                isOnline: false,
                totalQuestions: 0,
                totalSubmissions: 0,
                createdAt: null,
                updatedAt: null,
                date: null,
                startTime: null,
                endTime: null,
                location: null,
                notes: null,
                classroomId: classroomId || '',
                classroom: null,
               });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/teacher/courses/${course.id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: editingAssignment?.id,
          maxGrade: form.maxGrade || 0,
          courseId: course.id,
          classroomId: form.classroomId || null,
          educatorId,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setAssignments(prev => editingAssignment 
          ? prev.map(a => a.id === saved.id ? saved : a) 
          : [...prev, saved]
        );
        showStatus('success', `Assignment ${editingAssignment ? 'updated' : 'created'}`);
        setIsModalOpen(false);
      }
    } catch (err) {
      showStatus('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 pb-20">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
            </button>
            <div>
              <nav className="text-xs font-medium text-slate-500 mb-0.5 flex gap-2">
                <span>Courses</span> 
                <span>/</span>
                <span className="text-slate-400">{course.academicLevelName}</span>
              </nav>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {course.title} <span className="text-slate-400 font-normal">Assignments</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Find an assignment..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              style={{ backgroundColor: primaryColor }}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              New Assignment
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        {/* Alerts */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 overflow-hidden`}
            >
              <div className={`p-4 rounded-xl flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {statusMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationTriangleIcon className="h-5 w-5" />}
                <p className="text-sm font-medium">{statusMessage.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => (
            <motion.div
              layout
              key={assignment.id}
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                  assignment.status === 'QUIZ' ? 'bg-amber-100 text-amber-700' : 
                  assignment.status === 'PROJECT' ? 'bg-purple-100 text-purple-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {assignment.status}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(assignment)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => {/* Delete logic */}} className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-1 leading-snug">{assignment.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">
                {assignment.description || "No description provided."}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium">{assignment.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <AcademicCapIcon className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium">{assignment.maxGrade} pts</span>
                </div>
              </div>

              <div className='mt-6 flex flex-col gap-3'>
                <button 
                  onClick={() => router.push(`/admin/teachersubjectlist/${courseId}/manage-course-assignments/${assignment.id}/questions`)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                  Manage Questions
                </button>
                <button
                  onClick={() => router.push(`/admin/teachersubjectlist/${courseId}/manage-course-assignments/${assignment.id}/submissions`)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <InboxArrowDownIcon className="h-4 w-4" />
                  View Submissions
                  <span className="ml-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                    {assignment.totalSubmissions}
                  </span>
                </button>
              </div>
            </motion.div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-semibold text-slate-900">No assignments found</h3>
               <p className="text-slate-500">Try adjusting your search or create a new one.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal - Modern Centered */}
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingAssignment={editingAssignment}
        handleSave={handleSave}
        form={form}
        setForm={setForm}
        title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}
        primaryColor={primaryColor}
        loading={loading}
      />
    </div>
  );
}

//Modal component 
interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  editingAssignment: AssignmentData | null;
  handleSave: (e: React.FormEvent) => void;
  form: AssignmentData;
  setForm: React.Dispatch<React.SetStateAction<AssignmentData>>;
  title: string;
  // children: React.ReactNode;
  primaryColor: string;
  loading: boolean;
}

const Modal: React.FC<ModalProps> = ({ isModalOpen, setIsModalOpen, editingAssignment, handleSave, form, setForm, primaryColor, loading }) => {
  return (
    <AnimatePresence> 
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Clean Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100"
          >
            {/* Elegant Header */}
            <div className="px-8 pt-8 pb-2 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {editingAssignment ? 'Edit' : 'Create'} 
                  <span style={{ color: primaryColor }} className="ml-2 underline decoration-2 underline-offset-4">
                    Assignment
                  </span>
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Fill in the workspace details.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Title Section */}
                <div className="col-span-full space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">General Info</label>
                  <input 
                    required
                    placeholder="Assignment Title"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none text-slate-800 placeholder:text-slate-300 font-semibold text-lg"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                  <textarea 
                    rows={2}
                    placeholder="Brief description..."
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none text-slate-600 placeholder:text-slate-300 resize-none text-sm"
                    value={form.description || ''}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                {/* Deadlines Card */}
                <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Deadline</span>
                  </div>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={form.dueDate}
                    onChange={e => setForm({...form, dueDate: e.target.value})}
                  />
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-slate-400 mr-3">MAX GRADE</span>
                    <input 
                      type="number"
                      className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-700 text-sm"
                      value={form.maxGrade}
                      onChange={e => setForm({...form, maxGrade: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Logistics Card */}
                <div className="bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Logistics</span>
                  </div>
                  <select 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none"
                    value={form.status}
                    onChange={e => setForm({...form, status: e.target.value as any})}
                  >
                    <option value="HOMEWORK">Homework</option>
                    <option value="PROJECT">Project</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                  <input 
                    placeholder="Location / Link"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none"
                    value={form.location || ''}
                    onChange={e => setForm({...form, location: e.target.value})}
                  />
                </div>

                {/* Sub-details (Time & Instructions) */}
                <div className="col-span-full grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                      <div className="relative">
                        <input 
                          type="number"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                          placeholder="60"
                          onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})}
                        />
                        <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-300">MINS</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type</label>
                      <div className="flex items-center justify-center h-[46px] bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-500">
                        {form.status}
                      </div>
                   </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                
                <motion.button 
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: primaryColor }}
                  className="px-10 py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-100 flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{editingAssignment ? 'Update Assignment' : 'Create Assignment'}</span>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Modalv1: React.FC<ModalProps> = ({ isModalOpen, setIsModalOpen, editingAssignment, handleSave, form, setForm, title, primaryColor, loading }) => {
  return (
    <AnimatePresence> 
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with stronger blur */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
          >
            {/* Header with Gradient Accent */}
            <div className="relative px-8 pt-8 pb-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {editingAssignment ? 'Refine' : 'Craft'} <span className="text-indigo-600">Assignment</span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Fill in the details below to set expectations.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-8 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Main Info Section */}
                <div className="space-y-5 col-span-full">
                  <div className="relative group">
                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 block ml-1">Assignment Title</label>
                    <input 
                      required
                      placeholder="e.g. Midterm Research Paper"
                      className="w-full px-5 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none text-lg font-medium"
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Detailed Description</label>
                    <textarea 
                      rows={3}
                      placeholder="What should students focus on?"
                      className="w-full px-5 py-4 bg-slate-100/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none resize-none"
                      value={form.description || ''}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                  </div>
                </div>

                {/* Logistics Card */}
                <div className="p-5 bg-slate-50 rounded-3xl space-y-4 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Schedule & Grading
                  </h3>
                  <div className="space-y-4">
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                      value={form.dueDate}
                      onChange={e => setForm({...form, dueDate: e.target.value})}
                    />
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm">
                      <span className="text-sm font-bold text-slate-400">PTS</span>
                      <input 
                        type="number"
                        placeholder="Max Grade"
                        className="w-full border-none p-0 focus:ring-0 font-bold text-slate-700"
                        value={form.maxGrade}
                        onChange={e => setForm({...form, maxGrade: Number(e.target.value)})}
                      />
                    </div>
                    <select 
                      className="w-full px-4 py-3 bg-white rounded-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none font-medium text-slate-600"
                      value={form.status}
                      onChange={e => setForm({...form, status: e.target.value})}
                    >
                      <option value="HOMEWORK">📝 Homework</option>
                      <option value="PROJECT">🚀 Project</option>
                      <option value="QUIZ">⚡ Quiz</option>
                      <option value="OTHER">📁 Other</option>
                    </select>
                  </div>
                </div>

                {/* Location & Time Card */}
                <div className="p-5 bg-indigo-50/50 rounded-3xl space-y-4 border border-indigo-100/50">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-tighter flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Environment
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="time" className="px-3 py-3 bg-white rounded-xl border-none shadow-sm text-sm" onChange={e => setForm({...form, startTime: e.target.value})} />
                    <input type="time" className="px-3 py-3 bg-white rounded-xl border-none shadow-sm text-sm" onChange={e => setForm({...form, endTime: e.target.value})} />
                    <input 
                      placeholder="Room / URL"
                      className="col-span-2 px-4 py-3 bg-white rounded-xl border-none shadow-sm text-sm focus:ring-2 focus:ring-indigo-500" 
                      onChange={e => setForm({...form, location: e.target.value})}
                    />
                    <div className="col-span-2 relative">
                      <input 
                        placeholder="Duration (Mins)"
                        className="w-full px-4 py-3 bg-white rounded-xl border-none shadow-sm text-sm pr-12" 
                        onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})}
                      />
                      <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-300">MINS</span>
                    </div>
                  </div>
                </div>

                {/* Full Width Instructions */}
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Special Instructions</label>
                  <textarea
                    rows={2}
                    placeholder="Any specific tools or rules?"
                    className="w-full px-5 py-3 bg-slate-50 border-2 border-dashed border-slate-200 focus:border-indigo-400 focus:bg-white rounded-2xl transition-all outline-none resize-none text-sm"
                    onChange={e => setForm({...form, instructions: e.target.value})}
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-8 flex items-center justify-between">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors px-4"
                >
                  Discard Changes
                </button>
                
                <div className="flex gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>{editingAssignment ? 'Save Improvements' : 'Launch Assignment'}</>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};