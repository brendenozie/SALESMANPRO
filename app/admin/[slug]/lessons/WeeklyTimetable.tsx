'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon, // For course level
  UsersIcon, // For educator
  LinkIcon, // For meeting link
  ClockIcon, // For time display
} from '@heroicons/react/24/outline';
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Type Definitions (Aligned with ClassScheduleEntry) ---
export type TimetableEntry = {
  id: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    level?: string;
  };
  educatorId: string;
  educator: {
    id: string;
    name?: string;
    email: string;
  };
  date: string; // YYYY-MM-DD
  startTime: string; // e.g., "09:00 AM"
  endTime: string;   // e.g., "10:30 AM"
  topic?: string;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  level?: string;
  instructorId?: string; // Optional, if courses have a default instructor
};

export type EducatorOption = {
  id: string;
  name?: string;
  email: string;
};

// --- Styling Constants ---
const FONT = 'font-inter'; // Using 'Inter' as requested for React apps
const LESSON_COLORS = {
  // These could be dynamic based on course type, department, etc.
  // For now, simple consistent colors.
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  highlight: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const defaultTimeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

// --- Sample Data (Aligned with TimetableEntry) ---
const sampleCourses: CourseOption[] = [
  { id: 'C001', title: 'Grade 7 Mathematics', level: 'Grade 7' },
  { id: 'C002', title: 'Grade 8 Science', level: 'Grade 8' },
  { id: 'C003', title: 'Grade 9 Algebra', level: 'Grade 9' },
  { id: 'C004', title: 'Grade 10 English', level: 'Grade 10' },
];

const sampleEducators: EducatorOption[] = [
  { id: 'E001', name: 'Mr. John Doe', email: 'john.doe@school.com' },
  { id: 'E002', name: 'Ms. Jane Smith', email: 'jane.smith@school.com' },
  { id: 'E003', name: 'Dr. Alex Lee', email: 'alex.lee@school.com' },
];

const sampleTimetableEntries: TimetableEntry[] = [
  {
    id: 'TTE001',
    courseId: 'C003',
    course: sampleCourses.find(c => c.id === 'C003')!,
    educatorId: 'E001',
    educator: sampleEducators.find(e => e.id === 'E001')!,
    date: '2025-07-07', // Monday
    startTime: '08:00 AM',
    endTime: '08:45 AM',
    topic: 'Introduction to Linear Equations',
    meetingLink: 'https://zoom.us/j/algebra-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TTE002',
    courseId: 'C001',
    course: sampleCourses.find(c => c.id === 'C001')!,
    educatorId: 'E002',
    educator: sampleEducators.find(e => e.id === 'E002')!,
    date: '2025-07-08', // Tuesday
    startTime: '09:00 AM',
    endTime: '09:45 AM',
    topic: 'Fractions and Decimals Review',
    meetingLink: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TTE003',
    courseId: 'C003',
    course: sampleCourses.find(c => c.id === 'C003')!,
    educatorId: 'E001',
    educator: sampleEducators.find(e => e.id === 'E001')!,
    date: '2025-07-09', // Wednesday
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    topic: 'Solving Systems by Substitution',
    meetingLink: 'https://meet.google.com/algebra-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TTE004',
    courseId: 'C002',
    course: sampleCourses.find(c => c.id === 'C002')!,
    educatorId: 'E003',
    educator: sampleEducators.find(e => e.id === 'E003')!,
    date: '2025-07-07', // Monday
    startTime: '09:00 AM',
    endTime: '09:45 AM',
    topic: 'Cell Biology',
    meetingLink: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'TTE005',
    courseId: 'C004',
    course: sampleCourses.find(c => c.id === 'C004')!,
    educatorId: 'E002',
    educator: sampleEducators.find(e => e.id === 'E002')!,
    date: '2025-07-07', // Monday
    startTime: '10:00 AM',
    endTime: '10:45 AM',
    topic: 'Literary Analysis',
    meetingLink: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


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
        <p className="font-bold text-base truncate">{entry.course.title}</p>
        <p className="text-xs text-gray-700 flex items-center mt-0.5">
          <UsersIcon className="h-3 w-3 mr-1" /> {entry.educator.name || 'N/A'}
        </p>
        <p className="text-xs text-gray-700 flex items-center mt-0.5">
          <AcademicCapIcon className="h-3 w-3 mr-1" /> {entry.course.level || 'N/A'}
        </p>
        {entry.topic && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">Topic: {entry.topic}</p>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-700 mt-2 pt-2 border-t border-gray-200">
        <span>{entry.startTime} - {entry.endTime}</span>
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
  onSave: (data: Omit<TimetableEntry, 'course' | 'educator' | 'createdAt' | 'updatedAt'>) => void;
  isEdit?: boolean;
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  isLoading: boolean; // From parent component
};

const LessonFormModal: React.FC<LessonFormModalProps> = ({ entryData, onClose, onSave, isEdit = false, allCourses, allEducators, isLoading }) => {
  const [formData, setFormData] = useState({
    id: entryData?.id || '',
    courseId: entryData?.courseId || '',
    educatorId: entryData?.educatorId || '',
    date: entryData?.date || '', // Date is selected via grid cell, but allow manual input if not from grid
    startTime: entryData?.startTime || '',
    endTime: entryData?.endTime || '',
    topic: entryData?.topic || '',
    meetingLink: entryData?.meetingLink || '',
  });

  // Set default date if not provided (e.g., when clicking "Add New Entry" button)
  useEffect(() => {
    if (!formData.date) {
      setFormData(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [formData.date]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Schedule for: ${entryData?.course.title || 'Entry'}` : 'Add New Timetable Entry'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course</label>
            <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="">-- Select Course --</option>
              {allCourses.map(course => (
                <option key={course.id} value={course.id}>{course.title} ({course.level})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="educatorId" className="block text-sm font-medium text-gray-700">Educator</label>
            <select name="educatorId" id="educatorId" value={formData.educatorId} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            >
              <option value="">-- Select Educator --</option>
              {allEducators.map(educator => (
                <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="text" name="startTime" id="startTime" value={formData.startTime} onChange={handleChange} placeholder="e.g., 09:00 AM" required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
            <input type="text" name="endTime" id="endTime" value={formData.endTime} onChange={handleChange} placeholder="e.g., 10:30 AM"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic (Optional)</label>
            <input type="text" name="topic" id="topic" value={formData.topic} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">Meeting Link (Optional)</label>
            <input type="url" name="meetingLink" id="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="e.g., https://zoom.us/j/..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Entry')}
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
}

export default function WeeklyTimetable({ initialTimetable, allCourses, allEducators }: WeeklyTimetableProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);
  const [selectedClassId, setSelectedClassId] = useState(sampleCourses[0]?.id || 'All'); // Default to first class or 'All'
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
  const fetchTimetable = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/timetables`); // Your API endpoint
      if (res.ok) {
        const data: TimetableEntry[] = await res.json();
        // Ensure nested objects are correctly populated from API response if they are not by default
        const processedData = data.map(entry => ({
          ...entry,
          course: allCourses.find(c => c.id === entry.courseId) || entry.course,
          educator: allEducators.find(e => e.id === entry.educatorId) || entry.educator,
        }));
        setTimetable(processedData);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch timetable.");
        setTimetable(sampleTimetableEntries); // Fallback to sample data on API error
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching timetable.");
      setTimetable(sampleTimetableEntries); // Fallback to sample data on network error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTimetable.length === 0 && sampleTimetableEntries.length === 0) { // Only fetch if no initial data and no sample fallback
      fetchTimetable();
    } else if (initialTimetable.length > 0) {
      // If initial data is provided, process it to ensure course/educator objects are complete
      const processedInitialData = initialTimetable.map(entry => ({
        ...entry,
        course: allCourses.find(c => c.id === entry.courseId) || entry.course,
        educator: allEducators.find(e => e.id === entry.educatorId) || entry.educator,
      }));
      setTimetable(processedInitialData);
    } else {
      setTimetable(sampleTimetableEntries); // Use sample if no initial data but sample exists
    }
  }, [initialTimetable, allCourses, allEducators]);


  // DnD State
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const lessonsForSelectedClass = useMemo(
    () => timetable.filter(l => selectedClassId === 'All' || l.courseId === selectedClassId),
    [timetable, selectedClassId]
  );

  // DnD Handlers
  const handleDragStart = ({ active }: any) => setActiveId(active.id);

  const handleDragEnd = async ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      const draggedLesson = timetable.find(l => l.id === active.id);
      const targetDay = over.data.current?.day;
      const targetTime = over.data.current?.time;
      const targetDate = over.data.current?.date; // This will be the YYYY-MM-DD for the target cell

      if (draggedLesson && targetDay && targetTime && targetDate) {
        const updatedLesson = {
          ...draggedLesson,
          date: targetDate, // Update the date
          startTime: targetTime, // Update the time
          // endTime might need to be adjusted based on duration, or kept as is
        };

        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${apiUrl}/timetables/${updatedLesson.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: updatedLesson.courseId,
              educatorId: updatedLesson.educatorId,
              date: updatedLesson.date,
              startTime: updatedLesson.startTime,
              endTime: updatedLesson.endTime,
              topic: updatedLesson.topic,
              meetingLink: updatedLesson.meetingLink,
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

  // Modal Save Handler (for Add/Edit)
  const handleSave = async (lessonData: Omit<TimetableEntry, 'course' | 'educator' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    
    const method = lessonData.id ? 'PUT' : 'POST';
    
    try {
      const url = lessonData.id ? `${apiUrl}/timetables/${lessonData.id}` : `${apiUrl}/timetables`;

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
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
      const res = await fetch(`${apiUrl}/timetables/${entryId}`, {
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


  // Generate dates for the current week (Monday to Friday)
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday of current week
    const monday = new Date(today.setDate(diff));

    return daysOfWeek.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    });
  }, []); // Recalculate only once or when a "week" navigation is added


  // Render cell content
  const renderCellContent = useCallback((dayDate: string, timeSlot: string) => {
    const lesson = lessonsForSelectedClass.find(l => l.date === dayDate && l.startTime === timeSlot);

    if (!lesson) {
      // Empty slot: clickable to add new lesson
      return (
        <div
          data-day={daysOfWeek[new Date(dayDate).getDay() - 1]} // Pass day name for reference
          data-time={timeSlot}
          data-date={dayDate} // Pass full date for form pre-fill
          className="h-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-200
                     hover:bg-gray-100 transition-colors duration-150 cursor-pointer group"
          onClick={() => {
            setEditingEntry({
              id: '', // New entry
              courseId: selectedClassId === 'All' ? '' : selectedClassId, // Pre-fill if class is selected
              course: { id: '', title: '', level: '' }, // Placeholder, will be filled on save
              educatorId: '',
              educator: { id: '', name: '', email: '' }, // Placeholder
              date: dayDate,
              startTime: timeSlot,
              endTime: '', // User will fill
              topic: '',
              meetingLink: '',
              createdAt: '', // Will be filled on save
              updatedAt: '', // Will be filled on save
            });
            setShowFormModal(true);
          }}
        >
          <PlusCircleIcon className="h-6 w-6 text-gray-300 group-hover:text-indigo-400 transition-colors" />
        </div>
      );
    }

    return (
      <SortableContext items={[lesson.id]} strategy={rectSortingStrategy}>
        <SortableLessonCard
          key={lesson.id}
          entry={lesson}
          onClick={(entry) => { setEditingEntry(entry); setShowFormModal(true); }}
          onDelete={handleDelete}
        />
      </SortableContext>
    );
  }, [lessonsForSelectedClass, selectedClassId, handleDelete]);


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
          <p className="text-sm text-gray-600 mt-1">View and manage class schedules for the week.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All Classes</option>
            {allCourses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
          </select>
          <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onClick={() => setError(null)}><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4 text-gray-600">Loading timetable...</div>
      )}

      {/* DnD Context & Grid */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="grid grid-cols-[100px_repeat(5,1fr)] border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
          {/* Time Header */}
          <div className="bg-gray-50 border-b border-r border-gray-200 p-3 flex items-center justify-center text-sm font-semibold text-gray-700">Time</div>
          {/* Days Header */}
          {daysOfWeek.map((day, index) => (
            <div key={day} className="bg-gray-50 border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700">
              {day} <br />
              <span className="text-xs font-normal text-gray-500">{new Date(currentWeekDays[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          ))}

          {/* Timetable Rows */}
          {defaultTimeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="border-r border-gray-200 p-3 bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-center">
                {time}
              </div>
              {currentWeekDays.map((dayDate, dayIndex) => (
                <SortableContext key={`${dayDate}-${time}`} items={lessonsForSelectedClass.map(l => l.id)} strategy={rectSortingStrategy}>
                  <div
                    key={`${dayDate}-${time}`}
                    className="border-t border-gray-200 h-32 p-2 relative" // Increased height for better content display
                    data-day={daysOfWeek[dayIndex]} // For reference, though date is primary
                    data-time={time}
                    data-date={dayDate} // Crucial for DnD target
                  >
                    {renderCellContent(dayDate, time)}
                  </div>
                </SortableContext>
              ))}
            </React.Fragment>
          ))}
        </div>

        <DragOverlay>
          {activeId && activeLesson ? (
            <div className={`p-3 rounded-lg border ${LESSON_COLORS.highlight} ${FONT} shadow-xl`}>
              <p className="font-bold text-base">{activeLesson.course.title}</p>
              <p className="text-xs text-gray-700">{activeLesson.educator.name || 'N/A'}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Lesson Form Modal */}
      {showFormModal && (
        <LessonFormModal
          entryData={editingEntry}
          onClose={() => { setShowFormModal(false); setEditingEntry(null); }}
          onSave={handleSave}
          isEdit={!!editingEntry}
          allCourses={allCourses}
          allEducators={allEducators}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
