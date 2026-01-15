'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  XMarkIcon, // For course code
} from '@heroicons/react/24/outline';
import { useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TimetableGrid } from '@/app/admin/[slug]/lessons/TimetableGrid';
import { ClassroomOption } from '@/app/admin/[slug]/teachers/TeachersClient';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;

// --- Type Definitions (Aligned with ClassSchedule API) ---
export type TimetableEntry = {
  id: string;
  courseId: string;
  courseTitle: string; // Flattened from course relation
  courseCode: string; // NEW: Flattened from course relation
  academicLevelId: string;
  academicLevel: { id: string; name: string }; // NEW: Flattened from academicLevel relation
  // courseAcademicLevels: { id: string; name: string; sortOrder?: number }[]; // Flattened from course relation
  // courseClassrooms: { id: string; name: string; academicLevelId: string }[]; // NEW: Flattened from course relation
  classroomId: string;
  classroom: { id: string; name: string; academicLevelId: string } | null; // NEW: Flattened from course relation
  educatorId: string;
  educatorName: string; // Flattened from educator relation
  educatorEmail: string; // Flattened from educator relation
  dayOfWeek: string; // e.g., "Monday", "Tuesday"
  startTime: string; // ISO string for time (e.g., "1970-01-01T08:00:00.000Z")
  endTime: string; // ISO string for time
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
const generateSampleTimetableData = (academicLevelId: string, classId: string): {
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
      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}08:00:00.000Z`,
      endTime: `${dummyDate}08:45:00.000Z`,
      topic: 'Introduction to Linear Equations',
      meetingLink: 'https://zoom.us/j/algebra-001',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH002',
      courseId: 'CRS002',
      courseTitle: 'Literary Analysis',
      courseCode: 'ENG203',
      // courseAcademicLevels: [{ id: 'AL007', name: 'High School - Freshman' }],
      academicLevel: { id: 'AL007', name: 'High School - Freshman' },
      academicLevelId: 'AL007',
      // courseClassrooms: [{ id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' }],
      classroomId: 'CLS003',
      classroom: { id: 'CLS003', name: 'Lab A', academicLevelId: 'AL007' },
      educatorId: 'EDU002',
      educatorName: 'Ms. Jane Smith',
      educatorEmail: 'jane.smith@school.com',
      dayOfWeek: 'Tuesday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Analyzing Poetic Devices',
      meetingLink: '',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-02').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH003',
      courseId: 'CRS001',
      courseTitle: 'Algebra I',
      courseCode: 'MATH101',
      // courseAcademicLevels: [{ id: 'AL006', name: 'Grade 9' }],
      academicLevel: { id: 'AL006', name: 'Grade 9' },
      academicLevelId: 'AL006',
      // courseClassrooms: [{ id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' }],
      classroomId: 'CLS002',
      classroom: { id: 'CLS002', name: 'Room 102', academicLevelId: 'AL006' },
      educatorId: 'EDU001',
      educatorName: 'Mr. John Doe',
      educatorEmail: 'john.doe@school.com',
      dayOfWeek: 'Wednesday',
      startTime: `${dummyDate}10:00:00.000Z`,
      endTime: `${dummyDate}10:45:00.000Z`,
      topic: 'Solving Systems by Substitution',
      meetingLink: 'https://meet.google.com/algebra-002',
      companyId: `${academicLevelId}-${classId}`,
      createdAt: new Date('2023-01-03').toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'SCH004',
      courseId: 'CRS003',
      courseTitle: 'Elementary Math',
      courseCode: 'MATH100',
      // courseAcademicLevels: [{ id: 'AL003', name: 'Grade 1' }],
      academicLevel: { id: 'AL003', name: 'Grade 1' },
      academicLevelId: 'AL003',
      // courseClassrooms: [{ id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' }],
      classroomId: 'CLS001',
      classroom: { id: 'CLS001', name: 'Room 101', academicLevelId: 'AL003' },
      educatorId: 'EDU003',
      educatorName: 'Dr. Alex Lee',
      educatorEmail: 'alex.lee@school.com',
      dayOfWeek: 'Monday',
      startTime: `${dummyDate}09:00:00.000Z`,
      endTime: `${dummyDate}09:45:00.000Z`,
      topic: 'Counting and Number Recognition',
      meetingLink: '',
      companyId: `${academicLevelId}-${classId}`,
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
    return '08:00'; // Return a default valid time or handle error appropriately
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
  academicLevelId: string;
  classId: string;
}

const getUTCTimeString = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const checkConflict = (
  entries: TimetableEntry[],
  newLesson: { id?: string; educatorId: string; dayOfWeek: string; startTime: string; endTime: string }
) => {
  // Convert ISO strings to numeric timestamps for easier comparison
  const newStart = new Date(newLesson.startTime).getTime();
  const newEnd = new Date(newLesson.endTime).getTime();

  return entries.find((existing) => {
    // 1. Skip the lesson itself if we are editing an existing one
    if (existing.id === newLesson.id) return false;

    // 2. Check if it's the same educator on the same day
    if (existing.educatorId === newLesson.educatorId && existing.dayOfWeek === newLesson.dayOfWeek) {
      const existingStart = new Date(existing.startTime).getTime();
      const existingEnd = new Date(existing.endTime).getTime();

      // 3. Overlap check logic
      const isOverlapping = newStart < existingEnd && newEnd > existingStart;
      return isOverlapping;
    }
    return false;
  });
};

export default function WeeklyTimetable({ initialTimetable, allCourses, allEducators, allAcademicLevels, allClassrooms, academicLevelId, classId }: WeeklyTimetableProps) {
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
      const res = await fetch(`${apiBaseUrl}/admin/class-schedules?academicLevelId=${encodeURIComponent(academicLevelId)}&classId=${encodeURIComponent(classId)}`, {
        next: { revalidate: 60 },credentials: 'include',
      });
      if (res.ok) {
        const data: TimetableEntry[] = await res.json();
        setTimetable(data); // Data from API should already be flattened and include course/educator details
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch timetable.");
        // Fallback to sample data if API fails
        const { sampleTimetableEntries } = generateSampleTimetableData(academicLevelId, classId);
        setTimetable(sampleTimetableEntries);
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching timetable.");
      // Fallback to sample data on network error
      const { sampleTimetableEntries } = generateSampleTimetableData(academicLevelId, classId);
      setTimetable(sampleTimetableEntries);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, academicLevelId, classId]);

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
        entry.academicLevelId === selectedAcademicLevelId || entry.academicLevel.id === selectedAcademicLevelId;
      // Filter by classroom: check if any of the course's classrooms match the selected filter

      // const matchesClassroom = selectedClassroomId === 'All' ||
      //                          allClassrooms.find(cr => cr.id === selectedClassroomId && 
      //                            entry.courseClassrooms.some(cl => cl.id === cr.id));

      const matchesClassroom = selectedClassroomId === 'All' ||
                               (entry.classroom && entry.classroom.id === selectedClassroomId);

      return matchesCourse && matchesEducator && matchesAcademicLevel && matchesClassroom;
    }),
    [timetable, selectedCourseId, selectedEducatorId, selectedAcademicLevelId, selectedClassroomId]
  );

  // DnD Handlers
 
  // const handleDragEnd = async ({ active, over }: any) => {
  const handleDragEnd = async ({ active, over }: any) => {
  if (over && active.id !== over.id) {
    const draggedLesson = timetable.find(l => l.id === active.id);
    const targetDayOfWeek = over.data.current?.dayOfWeek; 
    const targetTime = over.data.current?.time;

    if (draggedLesson && targetDayOfWeek && targetTime) {
      // Calculate duration and new UTC dates
      const durationMs = new Date(draggedLesson.endTime).getTime() - new Date(draggedLesson.startTime).getTime();
      const [hours, minutes] = targetTime.split(':').map(Number);
      const newStartTotalMs = Date.UTC(1970, 0, 1, hours, minutes, 0, 0);
      
      const proposedStart = new Date(newStartTotalMs).toISOString();
      const proposedEnd = new Date(newStartTotalMs + durationMs).toISOString();

      // --- NEW CONFLICT CHECK ---
      const conflict = checkConflict(timetable, {
        id: draggedLesson.id,
        educatorId: draggedLesson.educatorId,
        dayOfWeek: targetDayOfWeek,
        startTime: proposedStart,
        endTime: proposedEnd
      });

      if (conflict) {
        alert(`Conflict! ${draggedLesson.educatorName} is already teaching "${conflict.courseTitle}" at this time.`);
        setActiveId(null);
        return; // Stop the execution
      }
      // --- END CONFLICT CHECK ---

      // ... proceed with API call as before
      const apiStartTime = getUTCTimeString(proposedStart);
      const apiEndTime = getUTCTimeString(proposedEnd);
      
      // (Your existing fetch logic here)
//     }
//   }
//   setActiveId(null);
// // };
//   if (over && active.id !== over.id) {
//     const draggedLesson = timetable.find(l => l.id === active.id);
//     const targetDayOfWeek = over.data.current?.dayOfWeek; 
//     const targetTime = over.data.current?.time; // e.g., "09:00"

//     if (draggedLesson && targetDayOfWeek && targetTime) {
//       // 1. Calculate the original duration in milliseconds
//       const start = new Date(draggedLesson.startTime).getTime();
//       const end = new Date(draggedLesson.endTime).getTime();
//       const durationMs = end - start;

//       // 2. Parse the target time (HH:mm)
//       const [hours, minutes] = targetTime.split(':').map(Number);

//       // 3. Create a new UTC Start Date using the 1970-01-01 base
//       // Use Date.UTC to ensure we are not affected by local timezone
//       const newStartTotalMs = Date.UTC(1970, 0, 1, hours, minutes, 0, 0);
//       const newStartDate = new Date(newStartTotalMs);

//       // 4. Calculate the new UTC End Date
//       const newEndDate = new Date(newStartDate.getTime() + durationMs);

      // 5. Format back to HH:mm for the API
      // const apiStartTime = getUTCTimeString(newStartDate.toISOString());
      // const apiEndTime = getUTCTimeString(newEndDate.toISOString());

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/class-schedules/${draggedLesson.id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: draggedLesson.courseId,
            educatorId: draggedLesson.educatorId,
            dayOfWeek: targetDayOfWeek,
            startTime: apiStartTime, // Now a clean "09:00" UTC string
            endTime: apiEndTime,     // Calculated based on duration
            companyId: `${academicLevelId}-${classId}`,
            // Preserve classroom if it exists
            classroomId: draggedLesson.classroomId || null,
          }),
        });

        if (res.ok) {
          await fetchTimetable(); 
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



  const activeLesson = activeId ? timetable.find(l => l.id === activeId) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}

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
          console.log("Editing entry:", entry);
          setEditingEntry(entry);
          setShowFormModal(true);
        }}
        onDeleteLesson={(id: string) => { }}
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

     
    </div>
  );
}
