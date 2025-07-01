'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon, // For course level
  UsersIcon, // For educator
  LinkIcon, // For meeting link
  ClockIcon, // For time display
  XMarkIcon, // For error close button
  TagIcon, // For academic levels
} from '@heroicons/react/24/outline';
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Type Definitions (Aligned with ClassSchedule API) ---
export type TimetableEntry = {
  id: string;
  courseId: string;
  courseTitle: string; // Flattened from course relation
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[]; // Flattened from course relation
  educatorId: string;
  educatorName: string; // Flattened from educator relation
  educatorEmail: string; // Flattened from educator relation
  dayOfWeek: string; // e.g., "Monday", "Tuesday"
  startTime: string; // ISO string for time (e.g., "1970-01-01T08:00:00.000Z")
  endTime: string;   // ISO string for time
  topic?: string | null;
  meetingLink?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  academicLevels: { id: string; name: string; sortOrder?: number }[];
  instructorName?: string; // Optional, if courses have a default instructor
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


// --- Styling Constants ---
const FONT = 'font-inter'; // Using 'Inter' as requested for React apps
const LESSON_COLORS = {
  // These could be dynamic based on course type, department, etc.
  // For now, simple consistent colors.
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  highlight: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const daysOfWeekOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const defaultTimeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']; // Using 24-hour format for consistency with Date objects

// --- Sample Data (Aligned with TimetableEntry) ---
const generateSampleTimetableData = (companyId: string): {
  sampleTimetableEntries: TimetableEntry[];
  sampleCourses: CourseOption[];
  sampleEducators: EducatorOption[];
  sampleAcademicLevels: AcademicLevelOption[];
} => {
  const academicLevels: AcademicLevelOption[] = [
    { id: 'AL001', name: 'Playgroup', sortOrder: 1 },
    { id: 'AL002', name: 'Kindergarten', sortOrder: 2 },
    { id: 'AL003', name: 'Grade 1', sortOrder: 3 },
    { id: 'AL006', name: 'Grade 9', sortOrder: 9 },
    { id: 'AL007', name: 'High School - Freshman', sortOrder: 10 },
  ];

  const educators: EducatorOption[] = [
    { id: 'EDU001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
    { id: 'EDU002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'EDU003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com' },
  ];

  const courses: CourseOption[] = [
    { id: 'CRS001', title: 'Algebra I', instructorName: 'Mr. John Doe', academicLevels: [{ id: 'AL006', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'Literary Analysis', instructorName: 'Ms. Jane Smith', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS003', title: 'Elementary Math', instructorName: 'Dr. Alex Lee', academicLevels: [{ id: 'AL003', name: 'Grade 1' }] },
  ];

  const dummyDate = '1970-01-01T'; // For storing time components as Date objects

  const timetableEntries: TimetableEntry[] = [
    {
      id: 'SCH001',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}08:00:00.000Z`,
      endTime: `${dummyDate}08:45:00.000Z`,
      topic: 'Introduction to Linear Equations',
      meetingLink: 'https://zoom.us/j/algebra-001',
      companyId: companyId,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      educatorId: 'EDU002',
      educatorName: 'Ms. Jane Smith',
      educatorEmail: 'jane.smith@school.com',
      dayOfWeek: 'Tuesday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Analyzing Poetic Devices',
      meetingLink: '',
      companyId: companyId,
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH003',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Wednesday',
      startTime: `${dummyDate}10:00:00.000Z`,
      endTime: `${dummyDate}10:45:00.000Z`,
      topic: 'Solving Systems by Substitution',
      meetingLink: 'https://meet.google.com/algebra-002',
      companyId: companyId,
      createdAt: new Date('2023-01-03').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH004',
      courseId: 'CRS003',
      courseTitle: 'Elementary Math',
      courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
      educatorId: 'EDU003',
      educatorName: 'Dr. Alex Lee',
      educatorEmail: 'alex.lee@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Counting and Number Recognition',
      meetingLink: '',
      companyId: companyId,
      createdAt: new Date('2023-01-04').toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleTimetableEntries: timetableEntries, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels };
};


// --- Sortable Lesson Card Component ---
interface SortableLessonCardProps {
  entry: TimetableEntry;
  onClick: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

const SortableLessonCard: React.FC<SortableLessonCardProps> = ({ entry, onClick, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1, // Bring dragged item to front
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0px 8px 20px rgba(0, 0, 0, 0.2)' : '0px 2px 5px rgba(0, 0, 0, 0.05)',
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-3 rounded-lg border flex flex-col justify-between h-full
                  ${LESSON_COLORS.default} ${FONT} cursor-grab active:cursor-grabbing
                  hover:shadow-md transition-shadow duration-200 ease-in-out`}
    >
      <div className="flex-grow">
        <p className="font-bold text-base truncate">{entry.courseTitle}</p>
        <p className="text-xs text-gray-700 flex items-center mt-0.5">
          <UsersIcon className="h-3 w-3 mr-1" /> {entry.educatorName || 'N/A'}
        </p>
        {entry.courseAcademicLevels && entry.courseAcademicLevels.length > 0 && (
          <p className="text-xs text-gray-700 flex items-center mt-0.5">
            <AcademicCapIcon className="h-3 w-3 mr-1" /> {entry.courseAcademicLevels.map(al => al.name).join(', ')}
          </p>
        )}
        {entry.topic && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">Topic: {entry.topic}</p>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-700 mt-2 pt-2 border-t border-gray-200">
        <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
        <div className="flex items-center gap-1">
          {entry.meetingLink && (
            <a href={entry.meetingLink} target="_blank" rel="noopener noreferrer" className="p-1 rounded-full hover:bg-gray-100 text-blue-700" title="Join Meeting">
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(entry); }}
            className="p-1 rounded-full hover:bg-indigo-50 text-indigo-600"
            title="Edit Entry"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            className="p-1 rounded-full hover:bg-red-50 text-red-600"
            title="Delete Entry"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Lesson Form Modal ---
type LessonFormModalProps = {
  entryData?: TimetableEntry | null;
  onClose: () => void;
  onSave: (data: Omit<TimetableEntry, 'courseTitle' | 'courseAcademicLevels' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean; // From parent component
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  companyId: string; // Pass companyId to the modal for new entries
  selectedDayOfWeek?: string; // Pre-fill day if coming from grid cell
  selectedTimeSlot?: string; // Pre-fill time if coming from grid cell
};

const LessonFormModal: React.FC<LessonFormModalProps> = ({ entryData, onClose, onSave, isLoading, allCourses, allEducators, companyId, selectedDayOfWeek, selectedTimeSlot }) => {
  const [formData, setFormData] = useState({
    id: entryData?.id || '',
    courseId: entryData?.courseId || '',
    educatorId: entryData?.educatorId || '',
    dayOfWeek: entryData?.dayOfWeek || selectedDayOfWeek || '',
    startTime: entryData?.startTime ? new Date(entryData.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : (selectedTimeSlot || ''), // Convert ISO to HH:MM for input
    endTime: entryData?.endTime ? new Date(entryData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    topic: entryData?.topic || '',
    meetingLink: entryData?.meetingLink || '',
    companyId: entryData?.companyId || companyId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.courseId || !formData.educatorId || !formData.dayOfWeek || !formData.startTime || !formData.endTime || !formData.companyId) {
      alert("Please fill all required fields: Course, Educator, Day, Start Time, End Time.");
      return;
    }

    // Ensure times are valid HH:MM format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      alert("Time format must be HH:MM (24-hour).");
      return;
    }

    // Convert HH:MM back to dummy ISO string for API
    const dummyDate = '1970-01-01T';
    const startTimeISO = `${dummyDate}${formData.startTime}:00.000Z`;
    const endTimeISO = `${dummyDate}${formData.endTime}:00.000Z`;

    onSave({
      id: formData.id,
      courseId: formData.courseId,
      educatorId: formData.educatorId,
      dayOfWeek: formData.dayOfWeek,
      startTime: startTimeISO,
      endTime: endTimeISO,
      topic: formData.topic,
      meetingLink: formData.meetingLink,
      companyId: formData.companyId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {entryData ? `Edit Schedule for: ${entryData.courseTitle}` : 'Add New Timetable Entry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-indigo-500" /> Schedule Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
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
                <label htmlFor="educatorId" className="block text-sm font-medium text-gray-700 mb-1">Educator <span className="text-red-500">*</span></label>
                <select name="educatorId" id="educatorId" value={formData.educatorId} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
                >
                  <option value="">-- Select Educator --</option>
                  {allEducators.map(educator => (
                    <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">Day of Week <span className="text-red-500">*</span></label>
                <select name="dayOfWeek" id="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
                >
                  <option value="">-- Select Day --</option>
                  {daysOfWeekOrder.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM) <span className="text-red-500">*</span></label>
                  <input type="text" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} placeholder="e.g., 09:00" required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM) <span className="text-red-500">*</span></label>
                  <input type="text" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} placeholder="e.g., 10:30" required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">Topic (Optional)</label>
                <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Optional)</label>
                <input type="url" name="meetingLink" id="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://zoom.us/j/..."
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
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
              ) : (entryData ? 'Save Changes' : 'Add Entry')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main WeeklyTimetable Component ---
interface WeeklyTimetableProps {
  initialTimetable: TimetableEntry[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[]; // Corrected: Added here
  companyId: string; // Pass companyId for API calls
}

export default function WeeklyTimetable({ initialTimetable, allCourses, allEducators, allAcademicLevels, companyId }: WeeklyTimetableProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  
  const [selectedClassId, setSelectedClassId] = useState(allAcademicLevels[0]?.id || 'All'); // Default to first class or 'All'
  const [selectedCourseId, setSelectedCourseId] = useState('All'); // Renamed from selectedClassId
  const [selectedEducatorId, setSelectedEducatorId] = useState('All'); // New filter for educator
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // --- Data Fetching and Management (API Integration) ---
  const fetchTimetable = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass companyId to the API
      const res = await fetch(`${apiUrl}/class-schedules?companyId=${encodeURIComponent(companyId)}`);
      if (res.ok) {
        const data: TimetableEntry[] = await res.json();
        setTimetable(data); // Data from API should already be flattened and include course/educator details
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch timetable.");
        // Fallback to sample data if API fails
        const { sampleTimetableEntries } = generateSampleTimetableData(companyId);
        setTimetable(sampleTimetableEntries);
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching timetable.");
      // Fallback to sample data on network error
      const { sampleTimetableEntries } = generateSampleTimetableData(companyId);
      setTimetable(sampleTimetableEntries);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId]);

  useEffect(() => {
    // Initial fetch if no data provided from server or if sample data is needed
    if (initialTimetable.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allAcademicLevels.length === 0) {
      fetchTimetable();
    } else {
      setTimetable(initialTimetable);
    }
  }, [fetchTimetable, initialTimetable, allCourses, allEducators, allAcademicLevels]);


  // DnD State
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const filteredLessons = useMemo(
    () => timetable.filter(entry => {
      const matchesCourse = selectedCourseId === 'All' || entry.courseId === selectedCourseId;
      const matchesEducator = selectedEducatorId === 'All' || entry.educatorId === selectedEducatorId;
      return matchesCourse && matchesEducator;
    }),
    [timetable, selectedCourseId, selectedEducatorId]
  );

  // DnD Handlers
  const handleDragStart = ({ active }: any) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      const draggedLesson = timetable.find(l => l.id === active.id);
      const targetDayOfWeek = over.data.current?.dayOfWeek; // Get dayOfWeek from drop target
      const targetTime = over.data.current?.time; // Get time from drop target

      if (draggedLesson && targetDayOfWeek && targetTime) {
        // Calculate new end time based on new start time and original duration
        const originalStartTimeObj = new Date(draggedLesson.startTime);
        const originalEndTimeObj = new Date(draggedLesson.endTime);
        const originalDurationMs = originalEndTimeObj.getTime() - originalStartTimeObj.getTime();

        const [hours, minutes] = targetTime.split(':').map(Number);
        const newStartDate = new Date('1970-01-01T00:00:00Z');
        newStartDate.setUTCHours(hours, minutes, 0, 0);

        const newEndTimeObj = new Date(newStartDate.getTime() + originalDurationMs);

        const updatedLesson = {
          ...draggedLesson,
          dayOfWeek: targetDayOfWeek, // Update the day of week
          startTime: newStartDate.toISOString(), // Store as ISO string
          endTime: newEndTimeObj.toISOString(),   // Store as ISO string
        };

        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${apiUrl}/class-schedules/${updatedLesson.id}`, {
            method: 'PATCH', // Use PATCH for updates
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: updatedLesson.courseId,
              educatorId: updatedLesson.educatorId,
              dayOfWeek: updatedLesson.dayOfWeek,
              // Send HH:MM strings to the API
              startTime: new Date(updatedLesson.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: new Date(updatedLesson.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              topic: updatedLesson.topic,
              meetingLink: updatedLesson.meetingLink,
              companyId: updatedLesson.companyId,
            }),
          });

          if (res.ok) {
            await fetchTimetable(); // Re-fetch to update UI with actual data
          } else {
            const errorData = await res.json();
            setError(errorData.message || "Failed to move timetable entry.");
          }
        } catch (err: any) {
          setError(err.message || "Network error moving timetable entry.");
        } finally {
          setIsLoading(false);
        }
      }
    }
    setActiveId(null);
  };

  // Generate dates for the current week (Monday to Friday)
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday of current week
    const monday = new Date(today.setDate(diff));

    return daysOfWeekOrder.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    });
  }, []); // Recalculate only once or when a "week" navigation is added
  

  // Modal Save Handler (for Add/Edit)
  const handleSave = async (lessonData: Omit<TimetableEntry, 'courseTitle' | 'courseAcademicLevels' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = lessonData.id ? 'PATCH' : 'POST'; // Use PATCH for existing, POST for new

    try {
      const url = lessonData.id ? `${apiUrl}/class-schedules/${lessonData.id}` : `${apiUrl}/class-schedules`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        // Ensure times are sent as HH:MM strings to the API
        body: JSON.stringify({
          ...lessonData,
          startTime: new Date(lessonData.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: new Date(lessonData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        }),
      });

      if (res.ok) {
        await fetchTimetable(); // Re-fetch to update UI with actual data
        setShowFormModal(false);
        setEditingEntry(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} timetable entry.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} timetable entry.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this timetable entry? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/class-schedules/${entryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTimetable();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete timetable entry.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting timetable entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeLesson = activeId ? timetable.find(l => l.id === activeId) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Weekly Timetable
            <span className="ml-2 text-purple-600 text-base sm:text-xl">🗓️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">View and manage recurring class schedules.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Classes</option>
            {allAcademicLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {/* <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Courses</option>
            {allCourses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.academicLevels.map(al => al.name).join(', ')})
              </option>
            ))}
          </select> */}
          <select
            value={selectedEducatorId}
            onChange={e => setSelectedEducatorId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Educators</option>
            {allEducators.map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
          </select>
          <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading timetable...
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

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${daysOfWeekOrder.length}, minmax(150px, 1fr))` }}>
            {/* Corner Cell */}
            <div className="p-2 border-b border-r border-gray-200 bg-gray-50 rounded-tl-lg"></div>
            {/* Day Headers */}
            
            {daysOfWeekOrder.map((day, index) => (
              // <div key={day} className="p-2 text-center font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">
              //   {day}
              // </div>
               <div key={day} className="bg-gray-50 border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
               {day} <br />
               <span className="text-xs font-normal text-gray-500">{new Date(currentWeekDays[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
             </div>
            ))}

            {/* Time Slots and Lesson Cells */}
            {defaultTimeSlots.map(timeSlot => (
              <React.Fragment key={timeSlot}>
                {/* Time Slot Header */}
                <div className="p-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 flex items-center justify-end rounded-bl-lg">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-500" /> {timeSlot}
                </div>
                {/* Lesson Cells */}
                {daysOfWeekOrder.map(dayOfWeek => {
                  const lessonsInCell = filteredLessons.filter(
                    l => l.dayOfWeek === dayOfWeek &&
                         new Date(l.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === timeSlot
                  );
                  const cellId = `${dayOfWeek}-${timeSlot}`; // Unique ID for drop target

                  return (
                    <div
                      key={cellId}
                      className="p-1 min-h-[100px] border border-gray-200 rounded-md overflow-hidden relative"
                      data-dayOfWeek={dayOfWeek} // Pass dayOfWeek for drop target
                      data-time={timeSlot} // Pass time for drop target
                    >
                      <SortableContext items={lessonsInCell.map(l => l.id)} strategy={rectSortingStrategy}>
                        <div className="flex flex-col gap-1 h-full">
                          {lessonsInCell.length > 0 ? (
                            lessonsInCell.map(lesson => (
                              <SortableLessonCard
                                key={lesson.id}
                                entry={lesson}
                                onClick={(entry) => { setEditingEntry(entry); setShowFormModal(true); }}
                                onDelete={handleDelete}
                              />
                            ))
                          ) : (
                            <div
                              className="h-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-200
                                         hover:bg-gray-100 transition-colors duration-150 cursor-pointer group"
                              onClick={() => {
                                setEditingEntry(null); // Ensure it's a new entry
                                setShowFormModal(true);
                                // Pre-fill modal with day and time
                                setEditingEntry({
                                  id: '',
                                  courseId: selectedCourseId === 'All' ? '' : selectedCourseId,
                                  courseTitle: '', // Will be populated on save
                                  courseAcademicLevels: [], // Will be populated on save
                                  educatorId: selectedEducatorId === 'All' ? '' : selectedEducatorId,
                                  educatorName: '', // Will be populated on save
                                  educatorEmail: '', // Will be populated on save
                                  dayOfWeek: dayOfWeek,
                                  startTime: `1970-01-01T${timeSlot}:00Z`, // Send as ISO string
                                  endTime: '', // User will fill
                                  topic: null,
                                  meetingLink: null,
                                  companyId: companyId,
                                  createdAt: '',
                                  updatedAt: '',
                                });
                              }}
                            >
                              <PlusCircleIcon className="h-6 w-6 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <DragOverlay>
            {activeLesson ? (
              <SortableLessonCard
                entry={activeLesson}
                onClick={() => {}} // No-op for overlay
                onDelete={() => {}} // No-op for overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {showFormModal && (
        <LessonFormModal
          entryData={editingEntry}
          onClose={() => { setShowFormModal(false); setEditingEntry(null); }}
          onSave={handleSave}
          isLoading={isLoading}
          allCourses={allCourses}
          allEducators={allEducators}
          companyId={companyId}
          selectedDayOfWeek={editingEntry?.dayOfWeek || (editingEntry === null ? (activeId ? (timetable.find(l => l.id === activeId)?.dayOfWeek || '') : '') : '')} // Pass day from clicked cell or dragged item
          selectedTimeSlot={editingEntry?.startTime ? new Date(editingEntry.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : (editingEntry === null ? (activeId ? (new Date(timetable.find(l => l.id === activeId)?.startTime || '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) || '') : '') : '')} // Pass time from clicked cell or dragged item
        />
      )}
    </div>
  );
}
