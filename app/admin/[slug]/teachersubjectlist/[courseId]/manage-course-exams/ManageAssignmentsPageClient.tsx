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

interface ManageAssignmentsPageClientProps {
  course: CourseAssignmentInfo;
  initialAssignments: AssignmentData[];
  educatorId: string;
  companyId: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function ManageAssignmentsPageClient({
  course,
  initialAssignments,
  educatorId,
  companyId,
}: ManageAssignmentsPageClientProps) {
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
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxPoints: '',
    status: 'HOMEWORK' as AssignmentStatus
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
        maxPoints: String(assignment.maxPoints),
        status: assignment.status as AssignmentStatus
      });
    } else {
      setEditingAssignment(null);
      setForm({ title: '', description: '', dueDate: '', maxPoints: '', status: 'HOMEWORK' });
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
          maxPoints: parseInt(form.maxPoints) || 0,
          courseId: course.id,
          educatorId,
          companyId
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
                  <span className="text-xs font-medium">{assignment.maxPoints} pts</span>
                </div>
              </div>

              <div className='mt-6 flex flex-col gap-3'>    
                <button 
                  onClick={() => router.push(`/admin/${companyId}/teacher-classes/${course.id}/assignments/${assignment.id}/edit`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <EllipsisVerticalIcon className="h-4 w-4" />
                  Manage Examination
                </button>

                <button
                  onClick={() => router.push(`/admin/${companyId}/teacher-classes/${course.id}/assignments/${assignment.id}/submissions`)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <InboxArrowDownIcon className="h-4 w-4" />
                  View Submissions
                  <span className="ml-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">
                    {assignment.submissionCount}
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
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">{editingAssignment ? 'Edit' : 'New'} Assignment</h2>
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Due Date</label>
                    <input 
                      type="date" required
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={form.dueDate}
                      onChange={e => setForm({...form, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Max Points</label>
                    <input 
                      type="number"
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={form.maxPoints}
                      onChange={e => setForm({...form, maxPoints: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: primaryColor }}
                    className="px-8 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}