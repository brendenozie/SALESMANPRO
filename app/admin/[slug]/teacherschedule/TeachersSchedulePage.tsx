'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  BookOpenIcon, // For classes
  MapPinIcon, // For location
  UsersIcon, // For meetings
  BriefcaseIcon, // For prep/office hours
  ArrowLeftIcon, // For previous day/week
  ArrowRightIcon, // For next day/week
} from '@heroicons/react/24/outline';

// Sample Data
const teacherName = "Mr. John Doe";
const teacherRole = "Mathematics Teacher";

// Sample Schedule Data (daily format for simplicity, can expand to weekly later)
type ScheduleSlot = { time: string; event: string; type: string; location: string };
type TeacherSchedules = { [date: string]: ScheduleSlot[] };

const sampleTeacherSchedules: TeacherSchedules = {
  '2025-06-23': [ // Monday
    { time: '8:00 AM - 8:45 AM', event: 'Staff Meeting', type: 'meeting', location: 'Admin Conference Room' },
    { time: '9:00 AM - 9:45 AM', event: 'Grade 7 Mathematics (CL101)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Prep Period', type: 'prep', location: 'Teacher Workroom' },
    { time: '11:00 AM - 11:45 AM', event: 'Grade 9 Algebra (CL103)', type: 'class', location: 'Room 103' },
    { time: '12:00 PM - 1:00 PM', event: 'Lunch Break', type: 'break', location: 'Cafeteria' },
    { time: '1:00 PM - 1:45 PM', event: 'Student Counseling Session', type: 'meeting', location: 'Counselor Office' },
    { time: '2:00 PM - 2:45 PM', event: 'Grade 7 Mathematics (CL101)', type: 'class', location: 'Room 101' },
    { time: '3:00 PM - 4:00 PM', event: 'After-School Tutoring', type: 'other', location: 'Library' },
  ],
  '2025-06-24': [ // Tuesday
    { time: '9:00 AM - 9:45 AM', event: 'Grade 8 English Language (CL102)', type: 'class', location: 'Room 102' },
    { time: '10:30 AM - 11:15 AM', event: 'Grade 10 Geometry (CL104)', type: 'class', location: 'Room 205' },
    { time: '1:00 PM - 1:45 PM', event: 'Prep Period', type: 'prep', location: 'Teacher Workroom' },
    { time: '2:00 PM - 3:00 PM', event: 'Department Meeting', type: 'meeting', location: 'Math Dept. Office' },
  ],
  '2025-06-25': [ // Wednesday (Today)
    { time: '9:00 AM - 9:45 AM', event: 'Grade 7 Mathematics (CL101)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Office Hours', type: 'other', location: 'My Office' },
    { time: '11:00 AM - 11:45 AM', event: 'Grade 9 Algebra (CL103)', type: 'class', location: 'Room 103' },
    { time: '1:00 PM - 1:45 PM', event: 'Curriculum Planning', type: 'prep', location: 'Teacher Workroom' },
  ],
  '2025-06-26': [ // Thursday
    { time: '9:00 AM - 9:45 AM', event: 'Grade 8 English Language (CL102)', type: 'class', location: 'Room 102' },
    { time: '10:30 AM - 11:15 AM', event: 'Grade 10 Geometry (CL104)', type: 'class', location: 'Room 205' },
    { time: '1:00 PM - 1:45 PM', event: 'Student Support Session', type: 'meeting', location: 'Guidance Office' },
  ],
  '2025-06-27': [ // Friday
    { time: '9:00 AM - 9:45 AM', event: 'Grade 7 Mathematics (CL101)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Exam Proctoring', type: 'other', location: 'Gymnasium' },
    { time: '11:00 AM - 11:45 AM', event: 'Grade 9 Algebra (CL103)', type: 'class', location: 'Room 103' },
  ],
};


function getISOWeek(date: Date): number {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}

export default function TeachersSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getEventIcon = (type: 'class' | 'meeting' | 'prep' | 'break' | 'other') => {
    switch (type) {
      case 'class': return <BookOpenIcon className="h-5 w-5 text-indigo-600" />;
      case 'meeting': return <UsersIcon className="h-5 w-5 text-teal-600" />;
      case 'prep': return <BriefcaseIcon className="h-5 w-5 text-purple-600" />;
      case 'break': return <ClockIcon className="h-5 w-5 text-gray-500" />;
      default: return <CalendarDaysIcon className="h-5 w-5 text-gray-500" />; // Fallback
    }
  };

  const currentDaySchedule = sampleTeacherSchedules[selectedDate] || [];

  // Helper to change date
  const changeDateByDays = (days: number) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Schedule
            <span className="ml-2 text-blue-600 text-base sm:text-xl">🗓️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Your daily and weekly timetable overview.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{todayDisplay}</span>
        </div>
      </div>

      {/* Date Navigation & Current Day */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
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
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            title="Next Day"
          >
            <ArrowRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Daily Schedule */}
        <div className="overflow-x-auto">
          {currentDaySchedule.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDaySchedule.map((slot, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" /> {slot.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {getEventIcon(slot.type as 'class' | 'meeting' | 'prep' | 'break' | 'other')} {slot.event}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" /> {slot.location}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No schedule found for {getFormattedDate(selectedDate)}.</p>
                {Object.entries(sampleTeacherSchedules)
                  .filter(([date]) => getISOWeek(new Date(date)) === getISOWeek(new Date(selectedDate)))
                  .flatMap(([, slots]) => slots)
                  .filter(s => s.type === 'class').length}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats (Optional - for weekly or overall view) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white">
          <div className="flex items-center mb-3">
                {Object.entries(sampleTeacherSchedules)
                  .filter(([date]) => getISOWeek(new Date(date)) === getISOWeek(new Date(selectedDate)))
                  .flatMap(([, slots]) => slots)
                  .filter(s => s.type === 'meeting').length}
              <BookOpenIcon className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Classes This Week</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {Object.entries(sampleTeacherSchedules)
                  .filter(([date]) => getISOWeek(new Date(date)) === getISOWeek(new Date(selectedDate)))
                  .flatMap(([, slots]) => slots)
                  .filter(s => s.type === 'class').length}
              </h2> {/* Placeholder for actual calculation */}
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-teal-100 rounded-full">
              <UsersIcon className="h-7 w-7 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Meetings This Week</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {Object.entries(sampleTeacherSchedules)
                  .filter(([date]) => getISOWeek(new Date(date)) === getISOWeek(new Date(selectedDate)))
                  .flatMap(([, slots]) => slots)
                  .filter(s => s.type === 'meeting').length}
              </h2> {/* Placeholder */}
            </div>
          </div>
        </div>
      </div>
    
  );
}
