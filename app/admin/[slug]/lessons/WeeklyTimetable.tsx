'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  XMarkIcon, // For course code
} from '@heroicons/react/24/outline';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import LessonFormModal from './LessonFormModal';
import { TimetableGrid } from './TimetableGrid';
import TimetableHeader from './Header';
import { ClassroomOption } from '../teachers/page';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

// --- Type Definitions (Aligned with ClassSchedule API) ---
export type TimetableEntry = {
  id: string;
  courseId: string;
  courseTitle: string; // Flattened from course relation
  courseCode: string; // NEW: Flattened from course relation
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[]; // Flattened from course relation
  courseClassrooms: { id: string; name: string; academicLevelId: string }[]; // NEW: Flattened from course relation
  educatorId: string;
  educatorName: string; // Flattened from educator relation
  educatorEmail: string; // Flattened from educator relation
  dayOfWeek: string; // e.g., "Monday", "Tuesday"
  startTime: string; // ISO string for time (e.g., "1970-01-01T08:00:00.000Z")
  endTime: string;   // ISO string for time
  topic?: string | null;
  meetingLink?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  code: string; // NEW: Course code
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
  sampleClassrooms: ClassroomOption[];
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
    { id: 'CRS001', title: 'Algebra I', code: 'MATH101', academicLevels: [{ id: 'AL006', name: 'Grade 9' }] },
    { id: 'CRS002', title: 'Literary Analysis', code: 'ENG203', academicLevels: [{ id: 'AL007', name: 'High School - Freshman' }] },
    { id: 'CRS003', title: 'Elementary Math', code: 'MATH100', academicLevels: [{ id: 'AL003', name: 'Grade 1' }] },
  ];

  const classRooms: ClassroomOption[] = [
    { id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' },
    { id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' },
    { id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' },
  ];

  const dummyDate = '1970-01-01T'; // For storing time components as Date objects

  const timetableEntries: TimetableEntry[] = [
    {
      id: 'SCH001',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseCode: 'MATH101',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      courseClassrooms: [{ id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' }],
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
      courseCode: 'ENG203',
      courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      courseClassrooms: [{ id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' }],
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
      courseCode: 'MATH101',
      courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      courseClassrooms: [{ id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' }],
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
      courseCode: 'MATH100',
      courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
      courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' }],
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

  return { sampleTimetableEntries: timetableEntries, sampleCourses: courses, sampleEducators: educators, sampleAcademicLevels: academicLevels, sampleClassrooms: classRooms };
};


// Helper to format Date object to HH:MM string (UTC)
const formatTimeToHHMM = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn("Invalid date string passed to formatTimeToHHMM:", isoString);
    return '00:00'; // Return a default valid time or handle error appropriately
  }
  // Use UTC methods to ensure no timezone conversion
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// --- Main WeeklyTimetable Component ---
interface WeeklyTimetableProps {
  initialTimetable: TimetableEntry[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassroomOption[];
  companyId: string; // Pass companyId for API calls
}

export default function WeeklyTimetable({ initialTimetable, allCourses, allEducators, allAcademicLevels, allClassrooms, companyId }: WeeklyTimetableProps) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>(initialTimetable);

  // Renamed selectedClassId to selectedAcademicLevelId for clarity
  const [selectedAcademicLevelId, setSelectedAcademicLevelId] = useState('All'); // allAcademicLevels[0]?.id ||
  const [selectedClassroomId, setSelectedClassroomId] = useState('All');// allClassrooms[0]?.id || 
  const [selectedCourseId, setSelectedCourseId] = useState('All');
  const [selectedEducatorId, setSelectedEducatorId] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  // New state variables to hold the day and time for a new lesson being added
  const [newLessonDay, setNewLessonDay] = useState<string>('');
  const [newLessonTime, setNewLessonTime] = useState<string>('');

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
      const res = await fetch(`${apiBaseUrl}/admin/class-schedules?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },credentials: 'include',
      });
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
  }, [apiBaseUrl, companyId]);

  useEffect(() => {
    // Initial fetch if no data provided from server or if sample data is needed
    if (initialTimetable.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allAcademicLevels.length === 0 || allClassrooms.length === 0) {
      fetchTimetable();
    } else {
      setTimetable(initialTimetable);
    }
  }, [fetchTimetable, initialTimetable, allCourses, allEducators, allAcademicLevels, allClassrooms]);


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
      // Filter by academic level: check if any of the course's academic levels match the selected filter
      const matchesAcademicLevel = selectedAcademicLevelId === 'All' ||
                                   entry.courseAcademicLevels.some(al => al.id === selectedAcademicLevelId);

      const matchesClassroom = selectedClassroomId === 'All' ||
                               allClassrooms.find(cr => cr.id === selectedClassroomId && 
                                 entry.courseClassrooms.some(cl => cl.id === cr.id));

      return matchesCourse && matchesEducator && matchesAcademicLevel && matchesClassroom;
    }),
    [timetable, selectedCourseId, selectedEducatorId, selectedAcademicLevelId, selectedClassroomId]
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

        // Ensure targetTime is in HH:MM format for new Date() constructor with dummy date
        const [hours, minutes] = targetTime.split(':').map(Number);
        const newStartDate = new Date('1970-01-01T00:00:00Z'); // Use UTC to avoid timezone issues
        newStartDate.setUTCHours(hours, minutes, 0, 0);

        const newEndTimeObj = new Date(newStartDate.getTime() + originalDurationMs);

        // API expects HH:MM strings for startTime and endTime
        const apiStartTime = newStartDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const apiEndTime = newEndTimeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

        setIsLoading(true);
        setError(null);
        try {
          const res = await fetch(`${apiBaseUrl}/admin/class-schedules/${draggedLesson.id}`, { // Corrected API path
            method: 'PATCH', // Use PATCH for updates
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: draggedLesson.courseId,
              educatorId: draggedLesson.educatorId,
              classroomId: draggedLesson.courseClassrooms[0]?.id || null, // Assuming first classroom for simplicity
              dayOfWeek: targetDayOfWeek,
              startTime: apiStartTime, // Send HH:MM string
              endTime: apiEndTime,  // Send HH:MM string
              topic: draggedLesson.topic,
              meetingLink: draggedLesson.meetingLink,
              companyId: draggedLesson.companyId, // Ensure companyId is sent for validation
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
  const handleSave = async (lessonData: Omit<TimetableEntry, 'courseTitle' | 'courseCode' | 'courseAcademicLevels' | 'courseClassrooms' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = lessonData.id ? 'PATCH' : 'POST'; // Use PATCH for existing, POST for new

    try {
      const url = lessonData.id ? `${apiBaseUrl}/admin/class-schedules/${lessonData.id}` : `${apiBaseUrl}/admin/class-schedules`; // Corrected API path

      // Ensure times are sent as HH:MM strings to the API
      const apiStartTime = formatTimeToHHMM(lessonData.startTime);
      const apiEndTime = formatTimeToHHMM(lessonData.endTime);


      const res = await fetch(url, {
        credentials: 'include',
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonData,
          startTime: apiStartTime,
          endTime: apiEndTime,
          companyId: companyId, // Ensure companyId is always sent
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
      const res = await fetch(`${apiBaseUrl}/admin/class-schedules/${entryId}`, { // Corrected API path
        method: 'DELETE',
        credentials: 'include',
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

      <TimetableHeader
        today={today}
        selectedAcademicLevelId={selectedAcademicLevelId} // Renamed prop
        selectedClassroomId={selectedClassroomId} // Added classroom filter
        selectedCourseId={selectedCourseId} // Added course filter
        selectedEducatorId={selectedEducatorId}
        onChangeAcademicLevel={setSelectedAcademicLevelId} // Renamed handler
        onChangeClassroom={setSelectedClassroomId} // Added handler
        onChangeCourse={setSelectedCourseId} // Added handler
        onChangeEducator={setSelectedEducatorId}
        allAcademicLevels={allAcademicLevels}
        allClassrooms={allClassrooms}
        allCourses={allCourses} // Pass all courses
        allEducators={allEducators}
        onAddLesson={() => {
          setEditingEntry(null);
          // When "Add Lesson" button is clicked, set default day and time for new lesson
          setNewLessonDay('Monday'); // Or current day, depending on desired default
          setNewLessonTime('08:00'); // Or current time
          setShowFormModal(true);
        }}
      />


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
      <TimetableGrid
        timetable={timetable}
        daysOfWeek={daysOfWeekOrder}
        timeSlots={defaultTimeSlots}
        onClickLesson={(entry: TimetableEntry) => {
          setEditingEntry(entry);
          setShowFormModal(true);
        }}
        onDeleteLesson={(id: string) => {
          handleDelete(id);
        }}
        onAddLesson={(dayOfWeek: string, time: string) => {
          // When an empty cell is clicked, set the day and time for the new lesson
          setNewLessonDay(dayOfWeek);
          setNewLessonTime(time);
          setEditingEntry(null); // Ensure no existing entry is being edited
          setShowFormModal(true);
        }}
        activeId={activeId}
        setActiveId={setActiveId}
        onDragEnd={handleDragEnd}
        filteredLessons={filteredLessons} // Pass filtered lessons to the grid
      />

      {/* Modals */}
      {showFormModal && (
        <LessonFormModal
          isOpen={showFormModal} // Pass isOpen prop
          entryData={editingEntry}
          onClose={() => { setShowFormModal(false); setEditingEntry(null); }}
          onSave={handleSave}
          isLoading={isLoading}
          allCourses={allCourses}
          allClassrooms={allClassrooms}
          allEducators={allEducators}
          companyId={companyId}
          selectedDayOfWeek={editingEntry?.dayOfWeek || newLessonDay} // Use newLessonDay for new entries
          selectedTimeSlot={
            editingEntry?.startTime
              ? formatTimeToHHMM(editingEntry.startTime)
              : newLessonTime // Use newLessonTime for new entries
          }
        />
      )}
    </div>
  );
}
