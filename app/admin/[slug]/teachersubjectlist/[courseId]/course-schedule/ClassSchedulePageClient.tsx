// app/admin/[slug]/teacher-classes/[courseId]/class-schedule/ClassSchedulePageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LinkIcon, // Added for meeting links
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { ClassScheduleData, EventData, CourseScheduleInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface ClassSchedulePageClientProps {
  course: CourseScheduleInfo;
  initialSchedule: ClassScheduleData[];
  initialEvents: EventData[];
  educatorId: string; // Not directly used on this page, but good to pass down
  companyId:  string;  // Not directly used on this page, but good to pass down
}

export default function ClassSchedulePageClient({
  course,
  initialSchedule,
  initialEvents,
  educatorId,
  companyId,
}: ClassSchedulePageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context

  const [schedule, setSchedule] = useState<ClassScheduleData[]>(initialSchedule);
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date()); // State to manage the start of the displayed week

  // Update state when initial props change
  useEffect(() => {
    setSchedule(initialSchedule);
    setEvents(initialEvents);
  }, [initialSchedule, initialEvents]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  // Helper to get the start of the week (Monday)
  const getStartOfWeek = useCallback((date: Date) => {
    const day = date.getDay();
    // Adjust for Sunday (0) to be last day of prev week, Monday (1) is 0 diff
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(date);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0); // Normalize to start of day
    return start;
  }, []);

  // Generate days of the current week (Monday to Friday)
  const weekDays = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date(currentWeekStart));
    const days = [];
    for (let i = 0; i < 5; i++) { // Monday (0) to Friday (4) for diff
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart, getStartOfWeek]);

  // Generate time slots (e.g., every 45 minutes from 8 AM to 4 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 16; hour++) { // 8 AM to 4 PM
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < 16) {
        slots.push(`${String(hour).padStart(2, '0')}:45`);
      }
    }
    return slots;
  }, []);

  // Map schedule and events to the weekly grid
  const scheduleGrid = useMemo(() => {
    const grid: { [day: string]: { [time: string]: any[] } } = {}; // dayName -> timeSlot -> items array

    weekDays.forEach(day => {
      const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = day.toISOString().split('T')[0]; // YYYY-MM-DD
      grid[dayName] = {};

      timeSlots.forEach(time => {
        grid[dayName][time] = [];
      });

      // Add recurring schedule items
      schedule.forEach((lesson: ClassScheduleData) => {
        if (lesson.day === dayName) {
          // Check if the lesson's start time matches a slot
          if (grid[dayName][lesson.startTime]) {
            grid[dayName][lesson.startTime].push({
              type: 'lesson',
              title: course.title, // Use course title as subject
              topic: lesson.topic,
              time: `${lesson.startTime}-${lesson.endTime}`,
              room: lesson.room, // This will be undefined if not in schema, handled gracefully below
              meetingLink: lesson.meetingLink, // New
            });
          }
        }
      });

      // Add specific events for this date
      events.forEach((event: EventData) => {
        if (event.date === dateString) {
          // Check if the event's start time matches a slot
          if (grid[dayName][event.startTime]) {
            grid[dayName][event.startTime].push({
              type: 'event',
              title: event.title,
              description: event.description,
              time: `${event.startTime}-${event.endTime}`,
              location: event.location,
              onlineMeetingLink: event.onlineMeetingLink, // New
              eventType: event.type,
            });
          }
        }
      });
    });
    return grid;
  }, [schedule, events, weekDays, timeSlots, course.title]);

  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  }, []);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Class Schedule <span style={{ color: primaryColor }}>{course.title}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View the weekly timetable and upcoming events for {course.academicLevelName} - {course.title}.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week Navigation */}
      <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={handlePreviousWeek}
          className={`p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
          aria-label="Previous Week"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -{' '}
          {weekDays[4].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </h2>
        <button
          onClick={handleNextWeek}
          className={`p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
          aria-label="Next Week"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Schedule Table */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24">
                Time
              </th>
              {weekDays.map((day, index) => (
                <th key={index} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map((timeSlot, timeIndex) => (
              <tr key={timeIndex} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  {timeSlot}
                </td>
                {weekDays.map((day, dayIndex) => {
                  const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
                  const items = scheduleGrid[dayName]?.[timeSlot] || [];
                  return (
                    <td key={dayIndex} className="px-4 py-3 align-top border-l border-gray-100">
                      <div className="space-y-2">
                        {items.length > 0 ? (
                          items.map((item: any, itemIdx: number) => (
                            <div
                              key={itemIdx}
                              className={`p-2 rounded-lg text-xs ${
                                item.type === 'lesson' ? `bg-[${primaryColor}10] text-[${primaryColor}]` : // Lighter primary color bg
                                `bg-[${accentColor}10] text-[${accentColor}]` // Lighter accent color bg for events
                              } font-medium shadow-sm border border-transparent`}
                              style={{ borderColor: item.type === 'lesson' ? primaryColor : accentColor }}
                            >
                              <p className="font-semibold">{item.title}</p>
                              <p className="text-gray-700">{item.time}</p>
                              {item.type === 'lesson' && item.room && ( // Only display room if it exists
                                <p className="text-gray-600 flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" /> {item.room}
                                </p>
                              )}
                              {item.type === 'lesson' && item.meetingLink && ( // Display meeting link for lessons
                                <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                  <LinkIcon className="h-3 w-3" /> Join Online
                                </a>
                              )}
                              {item.type === 'event' && (
                                <>
                                  <p className="text-gray-600 flex items-center gap-1">
                                    <SparklesIcon className="h-3 w-3" /> {item.eventType}
                                  </p>
                                  {item.location && (
                                    <p className="text-gray-600 flex items-center gap-1">
                                      <MapPinIcon className="h-3 w-3" /> {item.location}
                                    </p>
                                  )}
                                  {item.onlineMeetingLink && ( // Display online meeting link for events
                                    <a href={item.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                      <LinkIcon className="h-3 w-3" /> Join Online
                                    </a>
                                  )}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-xs italic"></div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {(schedule.length === 0 && events.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No schedule or events found for this class.</p>
            <p className="text-sm mt-2">Please contact your administrator or add events via the class management menu.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
