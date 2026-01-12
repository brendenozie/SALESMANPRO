'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  XMarkIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  LinkIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

import {
  TimetableEntry,
  CourseOption,
  EducatorOption,
  AcademicLevelOption,
} from './WeeklyTimetable';
import { ClassroomOption } from '../teachers/page';

/* ------------------------------------------------------------------ */
/* Types & Helpers                                                    */
/* ------------------------------------------------------------------ */

interface LessonFormModalProps {
  isOpen: boolean;
  entryData: TimetableEntry | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  allCourses: CourseOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassroomOption[];
  allEducators: EducatorOption[];
  companyId: string;
  selectedDayOfWeek: string;
  selectedTimeSlot: string;
  allEntries: TimetableEntry[];
}

type ScheduleConflict =
  | { kind: 'CLASSROOM'; classroomName: string; courseTitle: string }
  | { kind: 'EDUCATOR'; educatorName: string; courseTitle: string };

const toMinutes = (iso: string) => {
  const d = new Date(iso);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
};

const formatTimeToHHMM = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '08:00';
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function LessonFormModal({
  isOpen,
  entryData,
  onClose,
  onSave,
  isLoading,
  allCourses,
  allAcademicLevels,
  allClassrooms,
  allEducators,
  companyId,
  selectedDayOfWeek,
  selectedTimeSlot,
  allEntries,
}: LessonFormModalProps) {
  
  const [formData, setFormData] = useState({
    id: '',
    courseId: '',
    educatorId: '',
    academicLevelId: '',
    classroomId: '',
    dayOfWeek: selectedDayOfWeek || 'Monday',
    startTime: selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z',
    endTime: '1970-01-01T08:45:00Z',
    topic: '',
    meetingLink: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Sync state on open/data change
  useEffect(() => {
    if (!isOpen) return;
    if (entryData) {
      setFormData({
        id: entryData.id,
        courseId: entryData.courseId,
        educatorId: entryData.educatorId,
        academicLevelId: entryData.courseAcademicLevels?.[0]?.id || '',
        classroomId: entryData.courseClassrooms?.[0]?.id || '',
        dayOfWeek: entryData.dayOfWeek,
        startTime: entryData.startTime,
        endTime: entryData.endTime,
        topic: entryData.topic || '',
        meetingLink: entryData.meetingLink || '',
      });
    } else {
      setFormData(prev => ({
        ...prev,
        id: '',
        courseId: '',
        educatorId: '',
        academicLevelId: '',
        classroomId: '',
        dayOfWeek: selectedDayOfWeek || 'Monday',
        startTime: selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z',
        endTime: '1970-01-01T08:45:00Z',
        topic: '',
        meetingLink: '',
      }));
    }
    setError(null);
  }, [isOpen, entryData, selectedDayOfWeek, selectedTimeSlot]);

  /* --- Cascading Filters --- */
  const filteredClassrooms = useMemo(() => 
    allClassrooms.filter(c => c.academicLevelId === formData.academicLevelId),
    [formData.academicLevelId, allClassrooms]
  );

  const filteredCourses = useMemo(() => {
    if (!formData.academicLevelId) return [];
    return allCourses.filter(course =>
      course.academicLevels?.some(l => l.id === formData.academicLevelId)
    );
  }, [formData.academicLevelId, allCourses]);

  const handleLevelChange = (levelId: string) => {
    setFormData(prev => ({ ...prev, academicLevelId: levelId, classroomId: '', courseId: '', educatorId: '' }));
  };

  /* --- Conflict Detection (Original Logic) --- */
  const conflict = useMemo<ScheduleConflict | null>(() => {
    if (!formData.startTime || !formData.endTime) return null;

    const start = toMinutes(formData.startTime);
    const end = toMinutes(formData.endTime);

    const conflictingEntry = allEntries.find(entry => {
      if (entry.id === formData.id) return false;
      if (entry.dayOfWeek !== formData.dayOfWeek) return false;

      const eStart = toMinutes(entry.startTime);
      const eEnd = toMinutes(entry.endTime);
      const overlaps = start < eEnd && end > eStart;
      if (!overlaps) return false;

      const classroomConflict = formData.classroomId && entry.courseClassrooms?.some(c => c.id === formData.classroomId);
      const educatorConflict = formData.educatorId && entry.educatorId === formData.educatorId;

      return classroomConflict || educatorConflict;
    });

    if (!conflictingEntry) return null;

    if (formData.classroomId && conflictingEntry.courseClassrooms?.some(c => c.id === formData.classroomId)) {
      return {
        kind: 'CLASSROOM',
        classroomName: conflictingEntry.courseClassrooms[0]?.name ?? 'Classroom',
        courseTitle: conflictingEntry.courseTitle,
      };
    }
    if (formData.educatorId && conflictingEntry.educatorId === formData.educatorId) {
      return {
        kind: 'EDUCATOR',
        educatorName: conflictingEntry.educatorName,
        courseTitle: conflictingEntry.courseTitle,
      };
    }
    return null;
  }, [formData, allEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (toMinutes(formData.endTime) <= toMinutes(formData.startTime)) {
      setError('Lesson cannot end before it starts.');
      return;
    }
    if (conflict) return;

    const selectedClass = allClassrooms.find(c => c.id === formData.classroomId);
    await onSave({
      ...formData,
      companyId,
      courseClassrooms: selectedClass ? [selectedClass] : [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white">
        
        {/* SIDE RAIL: LIVE FEEDBACK */}
        <div className="md:w-72 bg-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-8">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-4">
              {formData.id ? 'Refine Lesson' : 'New Lesson'}
            </h2>
            <p className="text-slate-400 text-sm">Fill in the details to schedule this academic session.</p>
          </div>

          <div className="space-y-4">
            {conflict ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-pulse">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mb-2" />
                <p className="text-xs font-medium text-red-200 uppercase tracking-tighter">Conflict Detected</p>
                <p className="text-[11px] text-red-300/80 mt-1">
                  {conflict.kind === 'CLASSROOM' 
                    ? `${conflict.classroomName} is busy with ${conflict.courseTitle}`
                    : `${conflict.educatorName} is already teaching ${conflict.courseTitle}`}
                </p>
              </div>
            ) : formData.classroomId && formData.educatorId ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircleIcon className="h-5 w-5 text-emerald-400 mb-2" />
                <p className="text-xs font-medium text-emerald-200 uppercase tracking-tighter">Slot Available</p>
                <p className="text-[11px] text-emerald-300/80 mt-1">No scheduling conflicts found for this timeframe.</p>
              </div>
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <InformationCircleIcon className="h-5 w-5 text-slate-400 mb-2" />
                <p className="text-xs text-slate-400">Conflict check will update as you select a classroom and educator.</p>
              </div>
            )}
          </div>
        </div>

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <nav className="flex gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="text-indigo-600">Scheduler</span>
              <span>/</span>
              <span>Session Details</span>
            </nav>
            <button onClick={onClose} type="button" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-10">
            {/* Step 1: Core Info */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <FormLabel icon={<AcademicCapIcon className="w-4 h-4"/>} label="Academic Level" required />
                <select 
                  value={formData.academicLevelId} 
                  onChange={e => handleLevelChange(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none font-medium text-slate-700 appearance-none"
                  required
                >
                  <option value="">Select Level</option>
                  {allAcademicLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <FormLabel icon={<BuildingLibraryIcon className="w-4 h-4"/>} label="Classroom" required />
                <select 
                  value={formData.classroomId} 
                  onChange={e => setFormData(p => ({ ...p, classroomId: e.target.value }))}
                  disabled={!formData.academicLevelId}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none font-medium text-slate-700 disabled:opacity-50"
                  required
                >
                  <option value="">Select Classroom</option>
                  {filteredClassrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </section>

            {/* Step 2: Course/Teacher */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <FormLabel icon={<BookOpenIcon className="w-4 h-4"/>} label="Course" required />
                <select 
                  value={formData.courseId} 
                  onChange={e => setFormData(p => ({ ...p, courseId: e.target.value }))}
                  disabled={!formData.academicLevelId}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none font-medium text-slate-700"
                  required
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <FormLabel icon={<UsersIcon className="w-4 h-4"/>} label="Educator" required />
                <select 
                  value={formData.educatorId} 
                  onChange={e => setFormData(p => ({ ...p, educatorId: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none font-medium text-slate-700"
                  required
                >
                  <option value="">Select Educator</option>
                  {allEducators.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </section>

            {/* Step 3: Timing (Full Days Included) */}
            <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Schedule & Timing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  value={formData.dayOfWeek} 
                  onChange={e => setFormData(p => ({ ...p, dayOfWeek: e.target.value }))}
                  className="bg-white border-none rounded-xl py-3 px-4 font-bold text-indigo-600 shadow-sm ring-1 ring-slate-200"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <input 
                  type="time" 
                  value={formatTimeToHHMM(formData.startTime)}
                  onChange={e => setFormData(p => ({ ...p, startTime: `1970-01-01T${e.target.value}:00Z` }))}
                  className="bg-white border-none rounded-xl py-3 px-4 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200" 
                />
                <input 
                  type="time" 
                  value={formatTimeToHHMM(formData.endTime)}
                  onChange={e => setFormData(p => ({ ...p, endTime: `1970-01-01T${e.target.value}:00Z` }))}
                  className="bg-white border-none rounded-xl py-3 px-4 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200" 
                />
              </div>
              {error && <p className="mt-4 text-[11px] text-red-500 font-bold flex items-center gap-1 animate-bounce">
                <ExclamationTriangleIcon className="w-3 h-3" /> {error}
              </p>}
            </section>

            {/* Step 4: Metadata */}
            <section className="space-y-6">
              <div className="space-y-2">
                <FormLabel icon={<DocumentTextIcon className="w-4 h-4"/>} label="Topic Description" />
                <textarea 
                  value={formData.topic}
                  onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-50 border-2 border-dashed border-slate-200 focus:border-indigo-400 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none text-slate-600 italic"
                  placeholder="e.g. Introduction to Quantum Mechanics..."
                />
              </div>
              <div className="space-y-2">
                <FormLabel icon={<LinkIcon className="w-4 h-4"/>} label="Virtual Meeting Link" />
                <input 
                  type="url"
                  value={formData.meetingLink}
                  onChange={e => setFormData(p => ({ ...p, meetingLink: e.target.value }))}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 px-5 transition-all outline-none text-indigo-600 underline"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            </section>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
              >
                Discard Changes
              </button>
              <button 
                type="submit"
                disabled={isLoading || !!conflict}
                className={`flex-[2] py-4 px-6 rounded-2xl font-bold text-white shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] 
                  ${conflict ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isLoading ? 'Saving Session...' : conflict ? 'Resolve Conflicts' : 'Confirm & Schedule'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormLabel({ icon, label, required }: { icon: React.ReactNode; label: string; required?: boolean }) {
  return (
    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <span className="text-slate-300">{icon}</span>
      {label}
      {required && <span className="text-red-400 font-bold">*</span>}
    </label>
  );
}