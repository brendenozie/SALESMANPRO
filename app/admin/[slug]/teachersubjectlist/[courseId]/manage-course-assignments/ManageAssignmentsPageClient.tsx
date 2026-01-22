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
  const isEdit = Boolean(editingAssignment);

  // Helper for consistent input styling
  const inputClass = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-offset-1 transition-all";

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-slate-50 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header: Simplified & Stronger */}
            <div className="bg-white px-8 py-6 flex justify-between items-center border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {isEdit ? 'Edit' : 'New'} Assignment
                </h2>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-tighter mt-1">Configure your workspace requirements</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-1 overflow-hidden">
              <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                
                {/* Section 1: Core Identity */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <span className="text-[11px] font-bold uppercase tracking-widest">General Information</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      required
                      placeholder="Assignment Title"
                      className="w-full px-6 py-5 bg-white border-none shadow-sm rounded-2xl focus:ring-2 text-xl font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                      rows={2}
                      placeholder="What is this assignment about?"
                      className="w-full px-6 py-4 bg-white border-none shadow-sm rounded-2xl focus:ring-2 text-slate-600 placeholder:text-slate-300 resize-none"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      value={form.description || ''}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </section>

                {/* Section 2: Logistics & Scoring */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timing & Deadlines Card */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Schedule & Grading</span>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Due Date</label>
                        <input type="date" className={inputClass} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 ml-1">Duration (Min)</label>
                          <input type="number" className={inputClass} placeholder="60" value={form.durationMinutes || ''} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-500 ml-1">Max Grade</label>
                          <input type="number" className={inputClass} value={form.maxGrade} onChange={e => setForm({ ...form, maxGrade: Number(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Type Card */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Delivery Details</span>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Assignment Type</label>
                        <select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                          <option value="HOMEWORK">Homework</option>
                          <option value="PROJECT">Project</option>
                          <option value="QUIZ">Quiz</option>
                          <option value="UNIT_TEST">Unit Test</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">Location / Link</label>
                        <input placeholder="Room 402 or Zoom Link" className={inputClass} value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Smart Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ToggleTile 
                    label="Online Exam" 
                    checked={form.isOnline} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, isOnline: e.target.checked})} 
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                  />
                  {form.isOnline && (
                    <ToggleTile 
                      label="Auto Grade" 
                      checked={form.autoGrade} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, autoGrade: e.target.checked})} 
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                  )}
                  {isEdit && (
                    <ToggleTile 
                      label="Publish Now" 
                      checked={form.isPublished} 
                      primaryColor="emerald"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, isPublished: e.target.checked})} 
                      icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                    />
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-8 bg-white flex items-center justify-between border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors px-4">
                  Discard Changes
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: primaryColor }}
                  className="px-12 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{editingAssignment ? 'Save Changes' : 'Launch Assignment'}</span>
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

// Clean helper for the checkboxes to make them look like buttons/tiles
const ToggleTile = ({ label, checked, onChange, icon, primaryColor = "indigo" }: { label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; primaryColor?: string }) => (
  <label className={`
    flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer
    ${checked ? `bg-${primaryColor}-50 border-${primaryColor}-500 text-${primaryColor}-700` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
  `}>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    <div className={`mb-2 ${checked ? `text-${primaryColor}-500` : 'text-slate-300'}`}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-tight text-center">{label}</span>
  </label>
);