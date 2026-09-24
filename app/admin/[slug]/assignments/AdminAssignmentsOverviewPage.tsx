'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  FunnelIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  CalendarIcon,
  Bars3BottomLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// =======================================================================
// Interfaces & Schemas
// =======================================================================
export interface AssignmentData {
  id: string;
  title: string;
  description: string | null;
  courseInstructorName: string;
  dueDate: string;
  status: string;
  maxGrade: number;
  courseId: string;
  courseTitle: string;
  course: { id: string; title: string; academicLevels: { id: string; name: string }[] };
  courseAcademicLevels: { id: string; name: string }[];
  classroomId: string | null;
  classroom: { id: string; name: string; academicLevelId: string } | null;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  type: 'QUIZ' | 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT_BASED' | 'PRACTICE' | 'OTHER';
  totalPoints: number;
  isPublished: boolean;
  academicYearId: string | null;
  termId: string | null;
  createdById: string | null;
  createdByEmail: string | null;
  createdByName: string | null;
  durationMinutes: number | null;
  companyId: string | null;
  autoGrade: boolean;
  isOnline: boolean;
  totalQuestions: number;
  totalSubmissions: number;
  createdAt: string | null;
  updatedAt: string | null;
}

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

export interface AcademicYear {
  id: string;
  name: string;
  terms: { id: string; name: string }[];
}

interface Props {
  companyId: string;
  initialAssignments: AssignmentData[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: any[];
  academicYears: AcademicYear[];
  activeAcademicYearId: string | null;
  activeTermId: string | null;
}

// Map key types to semantic UX configurations
const ASSESSMENT_TYPE_CONFIG: Record<AssignmentData['type'], { label: string; bg: string; text: string; ring: string }> = {
  FINAL: { label: 'Final Exam', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
  MIDTERM: { label: 'Midterm', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' },
  UNIT_TEST: { label: 'Unit Test', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
  QUIZ: { label: 'Quiz', bg: 'bg-violet-50', text: 'text-violet-700', ring: 'ring-violet-600/20' },
  ASSIGNMENT_BASED: { label: 'Assignment', bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-600/20' },
  PRACTICE: { label: 'Practice', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
  OTHER: { label: 'Other', bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-600/20' },
};

// =======================================================================
// Main Presentation Workspace View Container
// =======================================================================
export default function AssignmentsPageClient({
  companyId,
  initialAssignments,
  allCourses,
  allEducators,
  allAcademicLevels,
  allClassRooms,
  academicYears,
  activeAcademicYearId,
  activeTermId,
}: Props) {
  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  // Filtering matrix state
  const [filterClass, setFilterClass] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterEducator, setFilterEducator] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedYear, setSelectedYear] = useState<string | null>('All');
  const [selectedTerm, setSelectedTerm] = useState<string | null>('All');
  
  const [academicYearOptions, setAcademicYearOptions] = useState(academicYears);

  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);

  // Normalizes matching context queries across dates and properties
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    return assignments
      .filter((assignment) => {
        const matchesSearch =
          assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assignment.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (assignment.location || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCourse = filterCourse === 'All' || assignment.courseId === filterCourse;
        const matchesClass = filterClass === 'All' || assignment.classroomId === filterClass;
        const matchesEducator = filterEducator === 'All' || assignment.createdById === filterEducator;
        const matchesType = filterType === 'All' || assignment.type === filterType;
        const matchesYear = selectedYear === 'All' || !selectedYear || !assignment.academicYearId || assignment.academicYearId === selectedYear;
        const matchesTerm = selectedTerm === 'All' || !selectedTerm || !assignment.termId || assignment.termId === selectedTerm;

        const assignmentDate = new Date(assignment.dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const currentExamStatus = assignmentDate.getTime() < now.getTime() ? 'Completed' : 'Upcoming';
        const matchesStatus = filterStatus === 'All' || currentExamStatus === filterStatus;

        return matchesSearch && matchesCourse && matchesClass && matchesEducator && matchesType && matchesStatus && matchesYear && matchesTerm;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        const now = new Date().setHours(0, 0, 0, 0);

        const statusA = dateA < now ? 'Completed' : 'Upcoming';
        const statusB = dateB < now ? 'Completed' : 'Upcoming';

        if (statusA === 'Upcoming' && statusB !== 'Upcoming') return -1;
        if (statusA !== 'Upcoming' && statusB === 'Upcoming') return 1;

        return statusA === 'Upcoming' ? dateA - dateB : dateB - dateA;
      });
  }, [assignments, searchTerm, filterCourse, filterClass, filterEducator, filterType, filterStatus, selectedYear, selectedTerm]);

  const uniqueAssignmentsTypes = useMemo(() => {
    return Array.from(new Set(assignments?.map((e) => e.type) || [])).sort();
  }, [assignments]);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/course-assignments?companyId=${companyId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Could not load assignments. Please try again.');
      const payload = await res.json();
      setAssignments(payload.data || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while loading assignments.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const handleSaveAssignment = async (formDataPayload: any) => {
    setIsLoading(true);
    const isEdit = Boolean(formDataPayload.id);
    const url = isEdit
      ? `${apiBaseUrl}/admin/course-assignments/${formDataPayload.id}`
      : `${apiBaseUrl}/admin/course-assignments`;

    const method = isEdit ? 'PATCH' : 'POST';
    const payload = {
      ...formDataPayload,
      course: undefined,
      classroom: undefined,
      academicYearId: selectedYear || activeAcademicYearId,
      termId: selectedTerm || activeTermId,
    };

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save the assignment.');
      }

      setShowModal(false);
      setEditingAssignment(null);
      await fetchAssignments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${apiBaseUrl}/admin/course-assignments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Could not delete the assignment because it is linked to other records.');
      await fetchAssignments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased text-slate-900 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1.5">
              <AcademicCapIcon className="h-4 w-4" /> Academic Setup
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Assignments & Exams</h1>
            <p className="text-slate-500 text-sm mt-1">Create, track, and manage all your student assignments and exams in one place.</p>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/40 shadow-inner">
              <button
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bars3BottomLeftIcon className="h-4 w-4 stroke-[2.5]" /> List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="h-4 w-4 stroke-[2.5]" /> Calendar
              </button>
            </div>

            <button
              onClick={() => { setEditingAssignment(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-95"
            >
              <PlusIcon className="h-5 w-5 stroke-[3px]" /> New Assignment
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard label="Total Assignments" value={assignments.length} icon={DocumentDuplicateIcon} color="text-indigo-600" bg="bg-indigo-50" ring="ring-indigo-600/10" />
          <StatCard label="Upcoming" value={assignments.filter((a) => new Date(a.dueDate) >= new Date(new Date().setHours(0,0,0,0))).length} icon={ClockIcon} color="text-amber-600" bg="bg-amber-50" ring="ring-amber-600/10" />
          <StatCard label="Published" value={assignments.filter((a) => a.isPublished).length} icon={CheckBadgeIcon} color="text-emerald-600" bg="bg-emerald-50" ring="ring-emerald-600/10" />
          <StatCard label="Online Tests" value={assignments.filter((a) => a.isOnline).length} icon={GlobeAltIcon} color="text-sky-600" bg="bg-sky-50" ring="ring-sky-600/10" />
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-sm font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-600" />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <FunnelIcon className="h-4 w-4 text-slate-500" /> Filters
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-4">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                placeholder="Search assignments by title, course, or teacher..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <SelectFilter value={selectedYear || 'All'} label="Academic Year" onChange={(v) => { setSelectedYear(v === 'All' ? null : v); setSelectedTerm('All'); }}>
              <option value="All">All Years</option>
              {academicYearOptions.map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
            </SelectFilter>

            <SelectFilter value={selectedTerm || 'All'} label="Term" disabled={!selectedYear} onChange={(v) => setSelectedTerm(v)}>
              <option value="All">All Terms</option>
              {academicYearOptions.find((y) => y.id === selectedYear)?.terms.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </SelectFilter>

            <SelectFilter value={filterCourse} label="Course" onChange={setFilterCourse}>
              <option value="All">All Courses</option>
              {allCourses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </SelectFilter>

            <SelectFilter value={filterClass} label="Classroom" onChange={setFilterClass}>
              <option value="All">All Classrooms</option>
              {allClassRooms?.map((cr) => <option key={cr.id} value={cr.id}>{cr.name}</option>)}
            </SelectFilter>

            <SelectFilter value={filterEducator} label="Teacher" onChange={setFilterEducator}>
              <option value="All">All Teachers</option>
              {allEducators?.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </SelectFilter>

            <SelectFilter value={filterType} label="Type" onChange={setFilterType}>
              <option value="All">All Types</option>
              {uniqueAssignmentsTypes.map((t) => (
                <option key={t} value={t}>{ASSESSMENT_TYPE_CONFIG[t]?.label || t}</option>
              ))}
            </SelectFilter>

            <SelectFilter value={filterStatus} label="Status" onChange={setFilterStatus}>
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </SelectFilter>
          </div>
        </div>

        {/* Content View */}
        <main>
          <AnimatePresence mode="wait">
            {viewMode === 'table' ? (
              <motion.div key="table" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Assignment Details</th>
                        <th className="px-6 py-4">Course & Classroom</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Status & Type</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssignments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                            No assignments match your current filters.
                          </td>
                        </tr>
                      ) : (
                        filteredAssignments.map((a) => {
                          const config = ASSESSMENT_TYPE_CONFIG[a.type] || ASSESSMENT_TYPE_CONFIG.OTHER;
                          return (
                            <motion.tr layout key={a.id} className="hover:bg-slate-50/70 transition-colors group">
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-slate-800 text-sm md:text-base tracking-tight">{a.title}</span>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                    <UserCircleIcon className="h-4 w-4 text-slate-400" /> {a.courseInstructorName || 'Unassigned Teacher'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                                    <AcademicCapIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                                    <span>{a.courseTitle}</span>
                                  </div>
                                  <span className="w-fit text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded">
                                    {a.classroom?.name || 'No Classroom'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-col gap-1 text-sm">
                                  <span className="font-bold text-slate-700">{new Date(a.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                  <span className="text-xs text-slate-400 font-medium tracking-tight flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3" /> {a.startTime || 'TBD'} — {a.endTime || 'Closing'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4.5">
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}>
                                    {config.label}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset ${
                                    a.isPublished ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-slate-600/20'
                                  }`}>
                                    {a.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                  {a.isOnline && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 uppercase tracking-tight bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
                                      <GlobeAltIcon className="h-3 w-3" /> Online Test
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="flex items-center border-r border-slate-300 pr-3 gap-2">
                                    <ActionButton title="Questions" onClick={() => window.location.href = `/admin/${companyId}/assignments/${a.id}/questions`}>
                                      <DocumentDuplicateIcon className="h-4 w-4 text-gray-700" />
                                    </ActionButton>
                                    <ActionButton title="Submissions" onClick={() => window.location.href = `/admin/${companyId}/assignments/${a.id}/submissions`}>
                                      <ClipboardDocumentListIcon className="h-4 w-4 text-gray-700" />
                                    </ActionButton>
                                  </div>
                                  
                                  <Link 
                                    href={`/admin/${companyId}/assignments/${a.id}/grades?courseId=${a.courseId}&classroomId=${a.classroomId || ''}`}
                                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors"
                                  >
                                    <UsersIcon className="h-4 w-4 text-gray-700" /> <span>Grades</span>
                                  </Link>

                                  <ActionButton title="Edit" variant="primary" onClick={() => { setEditingAssignment(a); setShowModal(true); }}>
                                    <PencilSquareIcon className="h-4 w-4 text-gray-700" />
                                  </ActionButton>
                                  <ActionButton title="Delete" variant="danger" onClick={() => handleDeleteAssignment(a.id)}>
                                    <TrashIcon className="h-4 w-4 text-gray-700" />
                                  </ActionButton>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div key="calendar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                <AssignmentCalendar assignments={filteredAssignments} onEdit={(a) => { setEditingAssignment(a); setShowModal(true); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Assignment Form Modal */}
      <AnimatePresence>
        {showModal && (
          <AssignmentFormModal
            assignmentData={editingAssignment}
            onClose={() => { setShowModal(false); setEditingAssignment(null); }}
            onSave={handleSaveAssignment}
            allCourses={allCourses}
            allEducators={allEducators}
            allClassRooms={allClassRooms}
            companyId={companyId}
            isLoading={isLoading}
            activeAcademicYearId={activeAcademicYearId}
            termId={activeTermId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =======================================================================
// Atomic Components
// =======================================================================
function StatCard({ label, value, icon: Icon, color, bg, ring }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
      <div className={`${bg} ${color} p-3 rounded-xl ring-1 ${ring} transition-transform group-hover:scale-105`}>
        <Icon className="h-6 w-6 stroke-[2]" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function SelectFilter({ value, label, onChange, children, disabled = false }: { value: string; label: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 outline-none transition-all disabled:opacity-50 cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

function ActionButton({ children, onClick, title, variant = 'secondary' }: { children: React.ReactNode; onClick: () => void; title: string; variant?: 'primary' | 'secondary' | 'danger' }) {
  const themes = {
    primary: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    secondary: 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200',
    danger: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200',
  };
  return (
    <button onClick={onClick} title={title} className={`p-2 rounded-lg border transition-all hover:shadow-sm active:scale-95 ${themes[variant]}`}>
      {children}
    </button>
  );
}

// =======================================================================
// Assignment Form Modal Component
// =======================================================================
type AssignmentFormModalProps = {
  assignmentData: AssignmentData | null;
  onClose: () => void;
  onSave: (data: any) => void;
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allClassRooms: any[];
  companyId: string;
  isLoading: boolean;
  activeAcademicYearId: string | null;
  termId: string | null;
};

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  assignmentData, onClose, onSave, allCourses, allEducators, allClassRooms, companyId, isLoading, activeAcademicYearId, termId
}) => {
  const [formData, setFormData] = useState<any>({
    id: '', title: '', description: '', courseId: '', createdById: '',
    dueDate: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0],
    classroomId: '', startTime: '09:00', endTime: '10:30', location: '', notes: '',
    type: 'UNIT_TEST', totalPoints: 100, maxGrade: 100, isPublished: false, isOnline: false,
    durationMinutes: 90, autoGrade: false, companyId: companyId,
  });

  useEffect(() => {
    if (assignmentData) {
      setFormData({
        ...assignmentData,
        description: assignmentData.description || '',
        createdById: assignmentData.createdById || '',
        courseId: assignmentData.courseId || '',
        classroomId: assignmentData.classroomId || '',
        startTime: assignmentData.startTime || '09:00',
        endTime: assignmentData.endTime || '10:30',
        location: assignmentData.location || '',
        notes: assignmentData.notes || '',
        dueDate: assignmentData.dueDate ? new Date(assignmentData.dueDate).toISOString().split('T')[0] : '',
        date: assignmentData.date ? new Date(assignmentData.date).toISOString().split('T')[0] : '',
      });
    }
  }, [assignmentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.createdById) {
      alert('Please fill out all required fields marked with an asterisk (*).');
      return;
    }
    onSave(formData);
  };

  const isEdit = !!assignmentData;
  const labelClass = "text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono";
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none font-medium";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        <header className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex justify-between items-center">
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${isEdit ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
              {isEdit ? 'Editing' : 'New'}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">{isEdit ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200/60 rounded-xl text-slate-400 transition-colors"><XMarkIcon className="h-5 w-5" /></button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">1. Basic Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Title <span className="text-rose-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className={`${inputClass} text-base font-bold`} placeholder="e.g., Chapter 3 History Quiz" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description & Instructions</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className={inputClass} placeholder="What is this assignment about? Add basic instructions here..." />
              </div>
              <div>
                <label className={labelClass}>Course <span className="text-rose-500">*</span></label>
                <select name="courseId" value={formData.courseId} onChange={handleChange} required className={inputClass}>
                  <option value="">Select Course</option>
                  {allCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Teacher <span className="text-rose-500">*</span></label>
                <select name="createdById" value={formData.createdById} onChange={handleChange} required className={inputClass}>
                  <option value="">Select Teacher</option>
                  {allEducators.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Logistics */}
          <section className="space-y-4 bg-slate-50/70 p-5 rounded-xl border border-slate-200/60">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-200 pb-2">2. Schedule & Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Date Assigned</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Assignment Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                  {Object.keys(ASSESSMENT_TYPE_CONFIG).map((key) => (
                    <option key={key} value={key}>{ASSESSMENT_TYPE_CONFIG[key as AssignmentData['type']].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Classroom</label>
                <select name="classroomId" value={formData.classroomId} onChange={handleChange} className={inputClass}>
                  <option value="">No specific classroom</option>
                  {allClassRooms.map((cr) => <option key={cr.id} value={cr.id}>{cr.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location (if outside classroom)</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Auditorium B" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Duration (Minutes)</label>
                <input type="number" name="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} placeholder="90" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Start Time</label>
                <input type="text" name="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="HH:MM" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input type="text" name="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="HH:MM" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Section 3: Grading Strategy */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">3. Grading & Points</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-slate-300 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800">Total Points</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum points available</p>
                </div>
                <input type="number" name="totalPoints" value={formData.totalPoints} onChange={handleChange} className="w-20 text-right font-mono font-bold text-sm text-indigo-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg" />
              </div>

              <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm hover:border-slate-300 transition-colors">
                <div>
                  <p className="text-xs font-bold text-slate-800">Max Grade Value</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">e.g., scale to 100%</p>
                </div>
                <input type="number" name="maxGrade" value={formData.maxGrade} onChange={handleChange} className="w-20 text-right font-mono font-bold text-sm text-indigo-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg" />
              </div>

              <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm">
                <div>
                  <p className="text-xs font-bold text-slate-800">Online Test</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Students take this test on their devices</p>
                </div>
                <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
              </div>

              {formData.isOnline && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-4 border border-indigo-100 rounded-xl flex items-center justify-between bg-indigo-50/40 shadow-inner">
                  <div>
                    <p className="text-xs font-bold text-indigo-900">Auto-Grade (Multiple Choice)</p>
                    <p className="text-[10px] text-indigo-500 mt-0.5">System grades it automatically</p>
                  </div>
                  <input type="checkbox" name="autoGrade" checked={formData.autoGrade} onChange={handleChange} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" />
                </motion.div>
              )}

              {isEdit && (
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-white shadow-sm md:col-span-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Publish Immediately</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Make this visible to students right away</p>
                  </div>
                  <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Extra notes */}
          <section className="space-y-3">
            <label className={labelClass}>4. Extra Notes (Visible to students)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass} placeholder="List required textbook readings, allowed calculators, etc..." />
          </section>

        </form>

        <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex justify-end gap-3 items-center">
          <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Assignment'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

// =======================================================================
// Calendar Component
// =======================================================================
function AssignmentCalendar({ assignments, onEdit }: { assignments: AssignmentData[]; onEdit: (a: AssignmentData) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      {/* Calendar Header Control Bar */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-black tracking-tight text-slate-800">{monthName} <span className="text-slate-400 font-medium font-mono">{year}</span></h2>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"><ChevronLeftIcon className="h-4 w-4 stroke-[2.5]" /></button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-colors"><ChevronRightIcon className="h-4 w-4 stroke-[2.5]" /></button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-[130px] divide-x divide-y divide-slate-100">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`padding-cell-${i}`} className="bg-slate-50/30 border-t-0 first:border-l-0" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const targetDayInteger = i + 1;
          
          const dayAssignments = assignments.filter((assignment) => {
            if (!assignment.dueDate) return false;
            const assignmentDateNode = new Date(assignment.dueDate);
            return (
              assignmentDateNode.getFullYear() === currentDate.getFullYear() &&
              assignmentDateNode.getMonth() === currentDate.getMonth() &&
              assignmentDateNode.getDate() === targetDayInteger
            );
          });

          return (
            <div key={`active-day-${targetDayInteger}`} className="p-2 bg-white flex flex-col gap-1 hover:bg-slate-50/40 transition-colors overflow-hidden group">
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors font-mono">{targetDayInteger}</span>
              <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                {dayAssignments.map((a) => {
                  const typeStyles = ASSESSMENT_TYPE_CONFIG[a.type] || ASSESSMENT_TYPE_CONFIG.OTHER;
                  return (
                    <div
                      key={a.id}
                      onClick={() => onEdit(a)}
                      className={`text-[10px] p-1.5 rounded-lg font-bold border truncate cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm ${typeStyles.bg} ${typeStyles.text} ${typeStyles.ring}`}
                      title={`${a.title} (${a.startTime || 'No Time Logged'})`}
                    >
                      {a.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}