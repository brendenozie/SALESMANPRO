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
  MapPinIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassRoomOption } from '../students/StudentFormModal';


const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Interfaces (Existing Logic Preserved) ---
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

interface Props {
  companyId: string;
  initialAssignments: AssignmentData[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: any[];
}

export default function AssignmentsPageClient({
  companyId,
  initialAssignments,
  allCourses,
  allEducators,
  allAcademicLevels,
  allClassRooms
}: Props) {
  const [assignments, setAssignments] = useState<AssignmentData[]>(initialAssignments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [filterClass, setFilterClass] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterEducator, setFilterEducator] = useState('All'); // Changed from filterTeacher
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentData | null>(null);

  // --- Logic & Fetching (Simplified for space, keep your original logic) ---
    
    const filteredAssignments = useMemo(() => {
      return assignments && assignments.length > 0 ? assignments.filter(assignment => {
        const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              assignment.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              assignment.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (assignment.location || '').toLowerCase().includes(searchTerm.toLowerCase());
  
        const matchesCourse = filterCourse === 'All' || assignment.courseId === filterCourse;
        const matchesClass = filterClass === 'All' || assignment.classroomId === filterClass;
        const matchesEducator = filterEducator === 'All' || assignment.createdById === filterEducator;
        const matchesType = filterType === 'All' || assignment.type === filterType;
  
        // Determine dynamic status for filtering
        const assignmentDate = new Date(assignment.dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const currentExamStatus = assignmentDate.getTime() < now.getTime() ? 'Completed' : 'Upcoming';
        const matchesStatus = filterStatus === 'All' || currentExamStatus === filterStatus;
  
        return matchesSearch && matchesCourse && matchesClass && matchesEducator && matchesType && matchesStatus;
      }).sort((a, b) => {
        // Sort upcoming exams first by date (ascending), then completed exams by date (descending)
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
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
    }, [assignments, searchTerm, filterCourse, filterClass, filterEducator, filterType, filterStatus]);
  
    
    const uniqueAssignmentsTypes = useMemo(() => Array.from(assignments && assignments.length > 0 ? new Set(assignments.map(e => e.type)) : []).sort(), [assignments]);
    const uniqueStatuses = useMemo(() => {
      const statuses = new Set<string>();
      // Determine status based on current date vs exam date
      assignments && assignments.length > 0 &&
        assignments.forEach(assignment => {
          const assignmentDate = new Date(assignment.dueDate);
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day
  
          if (assignmentDate.getTime() < now.getTime()) {
            statuses.add('Completed');
          } else {
            statuses.add('Upcoming');
          }
        }); 
      return Array.from(statuses).sort();
    }, [assignments]);

      const fetchAssignments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
          const res = await fetch(
            `${apiBaseUrl}/admin/assignments?companyId=${companyId}`,
            { credentials: 'include' }
          );

          if (!res.ok) throw new Error('Failed to load assignments');

          const data = await res.json();
          setAssignments(data);
        } catch (err: any) {
          setError(err.message || 'Error loading assignments');
        } finally {
          setIsLoading(false);
        }
      }, [companyId]);

    
  const handleSaveAssignment = async (
    assignmentData: Omit<AssignmentData, 'courseTitle' | 'courseAcademicLevels' | 'createdByName' | 'createdByEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>
  ) => {
    const isEdit = Boolean(assignmentData.id);

    const url = isEdit
      ? `${apiBaseUrl}/admin/assignments/${assignmentData.id}`
      : `${apiBaseUrl}/admin/assignments`;

    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      ...assignmentData,
      course: undefined,
      classroom: undefined,
    };

    await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    setEditingAssignment(null);
    fetchAssignments();
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete assignment?')) return;

    await fetch(`${apiBaseUrl}/admin/assignments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    fetchAssignments();
  };


  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans antialiased text-slate-900">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Academic Assessments</h1>
            <p className="text-slate-500 mt-1">Design, monitor, and manage school-wide assignments and exams.</p>
          </div>
          <button
            onClick={() => { setEditingAssignment(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            New Assignment
          </button>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={assignments.length} icon={DocumentDuplicateIcon} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Upcoming" value={assignments.filter(a => new Date(a.dueDate) > new Date()).length} icon={ClockIcon} color="text-amber-600" bg="bg-amber-50" />
          <StatCard label="Live/Published" value={assignments.filter(a => a.isPublished).length} icon={CheckBadgeIcon} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard label="Online" value={assignments.filter(a => a.isOnline).length} icon={GlobeAltIcon} color="text-purple-600" bg="bg-purple-50" />
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {uniqueAssignmentsTypes.map(type => (
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

        {/* Assignment Table/Cards */}
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-4">Assignment Info</th>
                        <th className="px-6 py-4">Course & Class</th>
                        <th className="px-6 py-4">Schedule</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAssignments.map((a) => (
                        <motion.tr 
                          layout
                          key={a.id} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base">{a.title}</span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <UserCircleIcon className="h-3 w-3" /> {a.courseInstructorName || 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <AcademicCapIcon className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-semibold text-slate-700">{a.courseTitle}</span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold uppercase tracking-tight">
                                {a.classroom?.name || 'No Room'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm">
                              <p className="font-bold text-slate-700">{new Date(a.dueDate).toLocaleDateString()}</p>
                              <p className="text-xs text-slate-400 font-medium">{a.startTime || 'TBD'} - {a.endTime || ''}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ring-1 ring-inset ${
                                a.isPublished ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-slate-100 text-slate-600 ring-slate-600/20'
                              }`}>
                                {a.isPublished ? 'Published' : 'Draft'}
                              </span>
                              {a.isOnline && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-sky-600 uppercase">
                                  <GlobeAltIcon className="h-3 w-3" /> Online
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex flex-col gap-1">
                                <button 
                                  onClick={() => {
                                    // navigator.clipboard.writeText(window.location.origin + `/admin/assignments/${a.id}/questions`);
                                    //navigate to questions page
                                    window.location.href = `/admin/${companyId}/assignments/${a.id}/questions`;
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                                >
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>

                                <button 
                                  onClick={() => {
                                    // navigator.clipboard.writeText(window.location.origin + `/admin/assignments/${a.id}/submissions`);
                                    //navigate to submissions page
                                    window.location.href = `/admin/${companyId}/assignments/${a.id}/submissions`;
                                  }}
                                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                                >
                                  <ClipboardDocumentListIcon className="h-5 w-5" />
                                </button>
                              </div>
                              <button 
                                onClick={() => { setEditingAssignment(a); setShowModal(true); }}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAssignment(a.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          ) : ( 
            <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AssignmentCalendar 
                  assignments={filteredAssignments} 
                  onEdit={(a) => {
                    setEditingAssignment(a);
                    setShowModal(true);
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      <AnimatePresence>
        {showModal && (
          <AssignmentFormModal
            assignmentData={editingAssignment}
            onClose={() => {
              setShowModal(false);
              setEditingAssignment(null);
            }}
            onSave={handleSaveAssignment}
            allCourses={allCourses}
            allEducators={allEducators}
            allClassRooms={allClassRooms}
            companyId={companyId}
            isLoading={isLoading}
            error={error}
            resetError={() => setError(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Supporting Components ---

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`${bg} ${color} p-3 rounded-xl`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}



// --- Exam Form Modal Component ---
type AssignmentFormModalProps = {
  assignmentData: AssignmentData | null; // Null for new assignment
  onClose: () => void;
  onSave: (data: Omit<AssignmentData, 'courseTitle' | 'courseAcademicLevels' | 'createdByName' | 'createdByEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>) => void;
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allClassRooms: ClassRoomOption[];
  companyId: string;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
};

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({ 
  assignmentData, onClose, onSave, allCourses, allEducators, allClassRooms, 
  companyId, isLoading, error, resetError 
}) => {
  const [formData, setFormData] = useState<Omit<AssignmentData, 'courseTitle' | 'courseAcademicLevels' | 'createdByName' | 'createdByEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>>(
    assignmentData ? {
      ...assignmentData,
      createdById: assignmentData.createdById || '',
      courseId: assignmentData.courseId || assignmentData.course.id,
      classroomId: assignmentData.classroomId || (assignmentData.classroom ? assignmentData.classroom.id : null),
    } : {
      id: '',
      title: '',
      description: null,
      courseId: '',
      dueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
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
      createdById: '',
      isOnline: false,
      durationMinutes: null,
      autoGrade: false,
      companyId: companyId,
      // createdByEmail: null,
      courseInstructorName: '',
      status: 'Upcoming',
      maxGrade: 100,
      // createdByName: null,
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
    if (!formData.title || !formData.courseId || !formData.date || !formData.createdById || !formData.type || formData.totalPoints === null) {
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

  const isEdit = !!assignmentData;

  // Modern Input Classes
  const labelClass = "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1";
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Admin Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-center ${isEdit ? 'bg-indigo-50/30' : 'bg-white'}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isEdit ? 'Revision Mode' : 'New Entry'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {isEdit ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            
            {/* 1. Core Identification */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className={`${inputClass} text-lg font-semibold`} placeholder="e.g. Q3 Mathematics Midterm" />
                </div>
                
                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={2} className={inputClass} placeholder="Assignment objectives..." />
                </div>

                <div>
                  <label className={labelClass}>Assign to Course <span className="text-red-500">*</span></label>
                  <select name="courseId" value={formData.courseId} onChange={handleChange} required className={inputClass}>
                    <option value="">Select Course</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Lead Educator <span className="text-red-500">*</span></label>
                  <select name="createdById" value={formData.createdById || ''} onChange={handleChange} required className={inputClass}>
                    <option value="">Select Educator</option>
                    {allEducators.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 2. Logistics Grid */}
            <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Logistics & Timing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="QUIZ">Quiz</option>
                    <option value="PROJECT">Project</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Location</label>
                  <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g. Room 204, Building A" className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Duration (minutes)</label>
                  <input type="number" name="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} placeholder="e.g. 90" className={inputClass} />
                </div>
                {/* <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={labelClass}>Start</label>
                    <input type="text" name="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="09:00" className={inputClass} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>End</label>
                    <input type="text" name="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="10:30" className={inputClass} />
                  </div>
                </div> */}
                <div className="md:col-span-2">
                  <label className={labelClass}>Classroom</label>
                  <select name="classroomId" value={formData.classroomId || ''} onChange={handleChange} className={inputClass}>
                    <option value="">Optional</option>
                    {allClassRooms.map(cr => <option key={cr.id} value={cr.id}>{cr.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* 3. Advanced Settings */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-700">Online Examination</p>
                  <p className="text-[10px] text-slate-400">Enable browser-based testing</p>
                </div>
                <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
              </div>

              {formData.isOnline && (
                <div className="p-4 border border-indigo-100 rounded-2xl flex items-center justify-between bg-indigo-50/30">
                  <div>
                    <p className="text-sm font-bold text-indigo-700">Auto-Grading</p>
                    <p className="text-[10px] text-indigo-400">Automate MCQ evaluation</p>
                  </div>
                  <input type="checkbox" name="autoGrade" checked={formData.autoGrade} onChange={handleChange} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" />
                </div>
              )}

              <div className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-white shadow-sm">
                 <div>
                    <p className="text-sm font-bold text-slate-700">Max Grade</p>
                    <p className="text-[10px] text-slate-400">Total points for grading</p>
                  </div>
                  <input type="number" name="maxGrade" value={formData.maxGrade} placeholder='100' onChange={handleChange} className="w-20 text-right font-bold text-indigo-600 bg-transparent outline-none" />
              </div>
            </section>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-8 mb-4">
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex justify-between items-center border border-red-100">
                  {error}
                  <button onClick={resetError}><XMarkIcon className="h-4 w-4" /></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="px-8 py-6 border-t bg-slate-50/50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Processing...' : (isEdit ? 'Update Record' : 'Create Assignment')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
// const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({ assignmentData, onClose, onSave, allCourses, allEducators, allClassRooms, companyId, isLoading, error, resetError }) => {
//   const [formData, setFormData] = useState<Omit<AssignmentData, 'courseTitle' | 'courseAcademicLevels' | 'createdByName' | 'createdByEmail' | 'totalQuestions' | 'totalSubmissions' | 'createdAt' | 'updatedAt'>>(
//     assignmentData ? {
//       ...assignmentData,
//       createdById: assignmentData.createdById || '',
//       courseId: assignmentData.courseId || assignmentData.course.id,
//       classroomId: assignmentData.classroomId || (assignmentData.classroom ? assignmentData.classroom.id : null),
//     } : {
//       id: '',
//       title: '',
//       description: null,
//       courseId: '',
//       dueDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
//       date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
//       course:{ id: '', title: '', academicLevels: [] },
//       classroomId: null,
//       classroom: null,
//       startTime: null,
//       endTime: null,
//       location: null,
//       notes: null,
//       type: 'UNIT_TEST',
//       totalPoints: 100,
//       isPublished: false,
//       createdById: '',
//       isOnline: false,
//       durationMinutes: null,
//       autoGrade: false,
//       companyId: companyId,
//       // createdByEmail: null,
//       courseInstructorName: '',
//       status: 'Upcoming',
//       maxGrade: 100,
//       // createdByName: null,
//     }
//   );

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value, type } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     resetError(); // Clear any previous errors

//     // Basic client-side validation for required fields
//     if (!formData.title || !formData.courseId || !formData.date || !formData.createdById || !formData.type || formData.totalPoints === null) {
//       alert("Please fill all required fields: Title, Course, Date, Created By Educator, Type, and Total Points.");
//       return;
//     }

//     // Validate time formats if provided
//     const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM (24-hour)
//     if (formData.startTime && !timeRegex.test(formData.startTime)) {
//         alert("Start Time must be in HH:MM (24-hour) format.");
//         return;
//     }
//     if (formData.endTime && !timeRegex.test(formData.endTime)) {
//         alert("End Time must be in HH:MM (24-hour) format.");
//         return;
//     }

//     // Validate start time before end time
//     if (formData.startTime && formData.endTime) {
//         const start = new Date(`1970-01-01T${formData.startTime}:00Z`);
//         const end = new Date(`1970-01-01T${formData.endTime}:00Z`);
//         if (start >= end) {
//             alert("Start time must be before end time.");
//             return;
//         }
//     }

//     onSave(formData);
//   };

//   const isEdit = !!assignmentData;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
//           title="Close"
//         >
//           <XMarkIcon className="h-6 w-6" />
//         </button>

//         <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
//           {isEdit ? `Edit Assignment: ${assignmentData?.title}` : 'Add New Assignment'}
//         </h2>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
//             <span className="block sm:inline">{error}</span>
//             <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
//               <XMarkIcon className="h-5 w-5" />
//             </button>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="md:col-span-2">
//               <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Assignment Title <span className="text-red-500">*</span></label>
//               <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div className="md:col-span-2">
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={2}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
//             </div>

//             <div>
//               <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
//               <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
//               >
//                 <option value="">-- Select Course --</option>
//                 {allCourses.map(course => (
//                   <option key={course.id} value={course.id}>
//                     {course.title} ({course.academicLevels.map(al => al.name).join(', ')})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="createdById" className="block text-sm font-medium text-gray-700 mb-1">Created By Educator <span className="text-red-500">*</span></label>
//               <select name="createdById" id="createdById" value={formData.createdById || ''} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
//               >
//                 <option value="">-- Select Educator --</option>
//                 {allEducators.length > 0 && allEducators.map(educator => (
//                   <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
//               <input type="date" name="dueDate" id="dueDate" value={formData.dueDate || ''} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div>
//               <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Exam Type <span className="text-red-500">*</span></label>
//               <select name="type" id="type" value={formData.type} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
//               >
//                 <option value="">-- Select Type --</option>
//                 <option value="HOMEWORK">Homework</option>
//                 <option value="PROJECT">Project</option>
//                 <option value="QUIZ">Quiz</option>
//                 <option value="UNIT_TEST">Unit Test</option>
//                 <option value="MIDTERM">Midterm</option>
//                 <option value="FINAL">Final</option>
//                 <option value="ASSIGNMENT_BASED">Assignment Based</option>
//                 <option value="PRACTICE">Practice</option>
//                 <option value="OTHER">Other</option>
//               </select>
//             </div>

//             <div>
//               <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM)</label>
//               <input type="text" name="startTime" id="startTime" value={formData.startTime || ''} onChange={handleChange} placeholder="e.g., 09:00"
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div>
//               <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM)</label>
//               <input type="text" name="endTime" id="endTime" value={formData.endTime || ''} onChange={handleChange} placeholder="e.g., 10:30"
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div className='md:col-span-2'>
//               <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700 mb-1">Class Room <span className="text-gray-500">(Optional)</span></label>
//               <select name="classroomId" id="classroomId" value={formData.classroomId || ''} onChange={handleChange} required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
//               >
//                 <option value="">-- Select Class Room --</option>
//                 {allClassRooms.length > 0 && allClassRooms.map(classRoom => (
//                   <option key={classRoom.id} value={classRoom.id}>{classRoom.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
//               <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g., School Hall A / Online"
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div>
//               <label htmlFor="totalPoints" className="block text-sm font-medium text-gray-700 mb-1">Total Points <span className="text-red-500">*</span></label>
//               <input type="number" name="totalPoints" id="totalPoints" value={formData.totalPoints} onChange={handleChange} min="0" required
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div className='md:col-span-2'>
//               <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
//               <input type="number" name="durationMinutes" id="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} min="1"
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
//             </div>

//             <div className="md:col-span-2">
//               <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Instructions for Students)</label>
//               <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={2}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
//             </div>

//             {/* Online Exam Specific Fields */}
//             <div className="md:col-span-2 flex items-center mt-4">
//               <input type="checkbox" name="isOnline" id="isOnline" checked={formData.isOnline} onChange={handleChange}
//                 className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
//               <label htmlFor="isOnline" className="ml-2 block text-base font-medium text-gray-700">Is Online Exam?</label>
//             </div>

//             {formData.isOnline && (
//               <>
//                 <div>
//                   <label htmlFor="autoGrade" className="block text-sm font-medium text-gray-700 mb-1">Auto-Grade?</label>
//                   <div className="flex items-center h-full">
//                     <input type="checkbox" name="autoGrade" id="autoGrade" checked={formData.autoGrade} onChange={handleChange}
//                       className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
//                     <label htmlFor="autoGrade" className="ml-2 block text-base font-medium text-gray-700">Enable Auto-Grading</label>
//                   </div>
//                 </div>
//               </>
//             )}

//             {isEdit && (
//               <div className="md:col-span-2 flex items-center mt-4">
//                 <input type="checkbox" name="isPublished" id="isPublished" checked={formData.isPublished} onChange={handleChange}
//                   className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500" />
//                 <label htmlFor="isPublished" className="ml-2 block text-base font-medium text-gray-700">Publish Results to Students</label>
//               </div>
//             )}

//           </div>

//           <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : (isEdit ? 'Save Changes' : 'Add Exam')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


function AssignmentCalendar({ assignments, onEdit }: { assignments: AssignmentData[], onEdit: (a: AssignmentData) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Logic to calculate days in the month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">{monthName} {year}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200"
          >
            ←
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200"
          >
            →
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {/* Empty cells for previous month padding */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-slate-100 bg-slate-50/20" />
        ))}

        {/* Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayAssignments = assignments.filter(a => a.dueDate.startsWith(dateStr));

          return (
            <div key={day} className="border-r border-b border-slate-100 p-2 hover:bg-slate-50/30 transition-colors overflow-y-auto">
              <span className="text-sm font-bold text-slate-400">{day}</span>
              <div className="mt-1 space-y-1">
                {dayAssignments.map(a => (
                  <div 
                    key={a.id}
                    onClick={() => onEdit(a)}
                    className={`text-[10px] p-1.5 rounded-md font-bold truncate cursor-pointer transition-transform hover:scale-105 ${
                      a.type === 'FINAL' ? 'bg-rose-100 text-rose-700' :
                      a.type === 'QUIZ' ? 'bg-amber-100 text-amber-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {a.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}