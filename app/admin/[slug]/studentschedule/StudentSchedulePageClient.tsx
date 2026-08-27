// app/student/[slug]/my-schedule/StudentSchedulePageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon, // For classes
  MapPinIcon, // For location
  UserGroupIcon, // For club/group meetings
  SparklesIcon, // For general events/other activities
  ArrowLeftIcon,
  ArrowRightIcon,
  LinkIcon, // For online meeting links
  CheckCircleIcon, // Success message icon
  ExclamationCircleIcon, // Error message icon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { ClassScheduleItem, EventScheduleItem, StudentInfo } from './page';

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface StudentSchedulePageClientProps {
  student: StudentInfo;
  initialSchedule: ClassScheduleItem[];
  initialEvents: EventScheduleItem[];
  companyId: string; // Not directly used on this page, but good to pass down
}

export default function StudentSchedulePageClient({
  student,
  initialSchedule,
  initialEvents,
  companyId,
}: StudentSchedulePageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings();

  const [schedule, setSchedule] = useState<ClassScheduleItem[]>(initialSchedule);
  const [events, setEvents] = useState<EventScheduleItem[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update state when initial props change
  useEffect(() => {
    setSchedule(initialSchedule);
    setEvents(initialEvents);
  }, [initialSchedule, initialEvents]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const getEventIcon = useCallback((type: string) => {
    switch (type) {
      case 'class': return <BookOpenIcon className="h-5 w-5 text-indigo-600" />;
      case 'BREAK': return <ClockIcon className="h-5 w-5 text-gray-500" />; // Assuming a 'BREAK' type from events
      case 'CLUB': return <UserGroupIcon className="h-5 w-5 text-teal-600" />; // Assuming a 'CLUB' type from events
      case 'GENERAL':
      case 'ACADEMIC':
      case 'SPORTS':
      case 'CULTURAL':
      case 'MEETING':
      case 'WORKSHOP':
      case 'ORIENTATION':
      case 'FUNDRAISER':
      case 'OTHER': return <SparklesIcon className="h-5 w-5 text-purple-600" />;
      default: return <CalendarDaysIcon className="h-5 w-5 text-gray-500" />; // Fallback
    }
  }, []);

  const getFormattedDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }, []);

  const changeDateByDays = useCallback((days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  }, [selectedDate]);

  // Combine recurring schedule and specific events for the selected day
  const currentDayScheduleAndEvents = useMemo(() => {
    const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const selectedDateISO = selectedDate; // YYYY-MM-DD

    const dayItems: { time: string; event: string; type: string; location?: string | null; meetingLink?: string | null; topic?: string | null; }[] = [];

    // Add recurring classes for the selected day
    schedule.forEach(item => {
      if (item.day === selectedDayName) {
        dayItems.push({
          time: `${item.startTime} - ${item.endTime}`,
          event: item.title, // Course title with teacher name
          type: item.type, // 'class'
          location: item.topic, // Using topic as location for recurring classes if applicable
          meetingLink: item.meetingLink,
          topic: item.topic, // Keep topic explicitly for display
        });
      }
    });

    // Add specific events for the selected date
    events.forEach(item => {
      if (item.date === selectedDateISO) {
        dayItems.push({
          time: `${item.startTime} - ${item.endTime}`,
          event: item.title,
          type: item.type, // EventType (e.g., 'MEETING', 'SPORTS', 'OTHER')
          location: item.location,
          meetingLink: item.onlineMeetingLink,
          topic: item.summary, // Use summary for events
        });
      }
    });

    // Sort by start time
    return dayItems.sort((a, b) => {
      const timeA = a.time.split(' - ')[0];
      const timeB = b.time.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });
  }, [selectedDate, schedule, events]);

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              My Schedule <span style={{ color: primaryColor }}>({student.name})</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your daily activities and classes, {student.gradeLevel}.
            </p>
          </div>
        </motion.div>
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{todayDisplay}</span>
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

      {/* Date Navigation & Current Day */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeDateByDays(-1)}
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            title="Previous Day"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {getFormattedDate(selectedDate)}
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 text-center text-sm text-blue-600 border border-gray-300 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => changeDateByDays(1)}
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            title="Next Day"
          >
            <ArrowRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Daily Schedule Table */}
        <div className="overflow-x-auto">
          {currentDayScheduleAndEvents.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDayScheduleAndEvents.map((slot, index) => (
                  <motion.tr key={index} variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" /> {slot.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getEventIcon(slot.type)} {slot.event}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        {slot.location && (
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4 text-gray-400" /> {slot.location}
                          </span>
                        )}
                        {slot.meetingLink && (
                          <a href={slot.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" /> Join Online
                          </a>
                        )}
                        {slot.topic && ( // Display topic/summary for both classes and events
                          <span className="text-gray-600 italic">Info: {slot.topic}</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No schedule found for {getFormattedDate(selectedDate)}.</p>
              <p className="text-sm mt-2">Enjoy your free time!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Stats (Optional - for overall view) */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className={`p-3 rounded-full bg-[${primaryColor}10]`}>
            <BookOpenIcon className={`h-7 w-7 text-[${primaryColor}]`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Classes Enrolled</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {schedule.length}
            </h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white flex items-center gap-4">
          <div className={`p-3 rounded-full bg-[${accentColor}10]`}>
            <SparklesIcon className={`h-7 w-7 text-[${accentColor}]`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Events Targeted</p>
            <h2 className="text-3xl font-bold text-gray-800">
              {events.length}
            </h2>
          </div>
        </div>
        {/* You can add more stats here, e.g., total study hours, upcoming exams etc. */}
      </motion.div>
    </div>
  );
}
