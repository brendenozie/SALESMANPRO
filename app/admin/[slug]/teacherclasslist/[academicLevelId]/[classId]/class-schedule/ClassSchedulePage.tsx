'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarDaysIcon, // For overall calendar view
  ClockIcon, // For time slots
  MapPinIcon, // For event location
  ChevronLeftIcon, // For previous week
  ChevronRightIcon, // For next week
  BookOpenIcon, // For general lesson icon
  SparklesIcon, // For special events
  CheckCircleIcon, // Success message icon
  ExclamationCircleIcon, // Error message icon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with detailed schedule and events
      {
        id: '6863daeef4ad17d957b92403',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        schedule: [ // Daily recurring schedule
          { day: 'Monday', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', topic: 'Algebra Basics', room: 'Room 101' },
          { day: 'Monday', startTime: '10:00', endTime: '10:45', subject: 'Science', topic: 'Ecosystems', room: 'Lab 1' },
          { day: 'Tuesday', startTime: '11:00', endTime: '11:45', subject: 'English', topic: 'Grammar & Composition', room: 'Room 102' },
          { day: 'Wednesday', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', topic: 'Geometry Introduction', room: 'Room 101' },
          { day: 'Wednesday', startTime: '01:00', endTime: '01:45', subject: 'History', topic: 'Ancient Civilizations', room: 'Room 103' },
          { day: 'Thursday', startTime: '10:30', endTime: '11:15', subject: 'Art', topic: 'Drawing Fundamentals', room: 'Art Studio' },
          { day: 'Friday', startTime: '09:00', endTime: '09:45', subject: 'Mathematics', topic: 'Problem Solving', room: 'Room 101' },
          { day: 'Friday', startTime: '02:00', endTime: '02:45', subject: 'Physical Education', topic: 'Team Sports', room: 'Gym' },
        ],
        events: [ // Specific events for this class (can override/add to schedule)
          { id: 'EV001', title: 'Field Trip: Science Museum', date: '2025-07-18', startTime: '09:00', endTime: '15:00', location: 'Science Museum', type: 'Field Trip' },
          { id: 'EV002', title: 'Guest Speaker: AI in Math', date: '2025-07-16', startTime: '10:00', endTime: '11:00', location: 'Auditorium', type: 'Guest Speaker' },
          { id: 'EV003', title: 'Midterm Math Exam', date: '2025-07-17', startTime: '09:00', endTime: '10:30', location: 'Room 101', type: 'Exam' },
        ],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        schedule: [
          { day: 'Tuesday', startTime: '09:00', endTime: '09:45', subject: 'English', topic: 'Literary Analysis', room: 'Room 201' },
          { day: 'Thursday', startTime: '09:00', endTime: '09:45', subject: 'English', topic: 'Creative Writing', room: 'Room 201' },
        ],
        events: [],
      },
    ]
  },
});

interface ClassSchedulePageProps {
  classId: string; // The ID of the class whose schedule to display
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function ClassSchedulePage({ classId,  }: ClassSchedulePageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date()); // State to manage the start of the displayed week

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  // Helper to get the start of the week (Monday)
  const getStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0) to be last day of prev week
    return new Date(date.setDate(diff));
  };

  // Generate days of the current week
  const weekDays = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date(currentWeekStart));
    const days = [];
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  // Generate time slots (e.g., every 45 minutes from 8 AM to 4 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 16; hour++) { // 8 AM to 4 PM
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      if (hour < 16) { // Don't add 45 min slot after 4 PM
        slots.push(`${String(hour).padStart(2, '0')}:45`);
      }
    }
    return slots;
  }, []);

  // Map schedule and events to the weekly grid
  const scheduleGrid = useMemo(() => {
    const grid: { [day: string]: { [time: string]: any[] } } = {}; // day -> time -> items

    weekDays.forEach(day => {
      const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
      const dateString = day.toISOString().split('T')[0]; // YYYY-MM-DD
      grid[dayName] = {};

      timeSlots.forEach(time => {
        grid[dayName][time] = [];
      });

      // Add recurring schedule items
      currentClass?.schedule?.forEach((lesson: any) => {
        if (lesson.day === dayName) {
          grid[dayName][lesson.startTime]?.push({
            type: 'lesson',
            title: lesson.subject,
            topic: lesson.topic,
            time: `${lesson.startTime}-${lesson.endTime}`,
            room: lesson.room,
          });
        }
      });

      // Add specific events for this date
      currentClass?.events?.forEach((event: any) => {
        if (event.date === dateString) {
          grid[dayName][event.startTime]?.push({
            type: 'event',
            title: event.title,
            description: event.description,
            time: `${event.startTime}-${event.endTime}`,
            location: event.location,
            eventType: event.type,
          });
        }
      });
    });
    return grid;
  }, [currentClass, weekDays, timeSlots]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

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

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded for schedule.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back to Class List
        </button>
      </div>
    );
  }

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
            onClick={() => window.history.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Class Schedule <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View the weekly timetable and upcoming events.
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
                              {item.type === 'lesson' && (
                                <p className="text-gray-600 flex items-center gap-1">
                                  <MapPinIcon className="h-3 w-3" /> {item.room}
                                </p>
                              )}
                              {item.type === 'event' && (
                                <p className="text-gray-600 flex items-center gap-1">
                                  <SparklesIcon className="h-3 w-3" /> {item.eventType}
                                </p>
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
        {(currentClass?.schedule?.length === 0 && currentClass?.events?.length === 0) && (
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
