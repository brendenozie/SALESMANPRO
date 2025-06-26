'use client';

import React, { useState } from 'react';
import {
  CalendarDaysIcon, // For date
  ClockIcon, // For time/schedule
  BookOpenIcon, // For classes
  MapPinIcon, // For location
  UserGroupIcon, // For study groups/club meetings
  SparklesIcon, // For special events/activities
  ArrowLeftIcon, // For previous day
  ArrowRightIcon, // For next day
  LightBulbIcon, // For study tips
} from '@heroicons/react/24/outline';

// Sample Data
const studentName = "Jane Wanjiru"; // Placeholder for logged-in student's name
const studentGradeLevel = "Grade 8";

// Sample Schedule Data (daily format for simplicity, can expand to weekly later)
type ScheduleSlot = { time: string; event: string; type: 'class' | 'break' | 'club' | 'other'; location: string };
type StudentSchedules = { [date: string]: ScheduleSlot[] };

const sampleStudentSchedules: StudentSchedules = {
  '2025-06-23': [ // Monday
    { time: '8:30 AM - 9:00 AM', event: 'Homeroom', type: 'other', location: 'Homeroom 8A' },
    { time: '9:00 AM - 9:45 AM', event: 'Mathematics (Mr. John Doe)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Science (Ms. Emily White)', type: 'class', location: 'Lab 2' },
    { time: '11:00 AM - 11:45 AM', event: 'Break/Snack', type: 'break', location: 'Courtyard' },
    { time: '12:00 PM - 12:45 PM', event: 'English Language (Mrs. Jane Smith)', type: 'class', location: 'Room 102' },
    { time: '1:00 PM - 2:00 PM', event: 'Lunch', type: 'break', location: 'Cafeteria' },
    { time: '2:00 PM - 2:45 PM', event: 'History (Mr. David Green)', type: 'class', location: 'Room 203' },
    { time: '3:00 PM - 4:00 PM', event: 'After-School Chess Club', type: 'club', location: 'Library' },
  ],
  '2025-06-24': [ // Tuesday
    { time: '9:00 AM - 9:45 AM', event: 'Mathematics (Mr. John Doe)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Physical Education (Coach Alex)', type: 'class', location: 'Gym' },
    { time: '11:00 AM - 11:45 AM', event: 'English Language (Mrs. Jane Smith)', type: 'class', location: 'Room 102' },
    { time: '1:00 PM - 1:45 PM', event: 'History (Mr. David Green)', type: 'class', location: 'Room 203' },
    { time: '2:00 PM - 2:45 PM', event: 'Science (Ms. Emily White)', type: 'class', location: 'Lab 2' },
  ],
  '2025-06-25': [ // Wednesday (Today)
    { time: '8:30 AM - 9:00 AM', event: 'Homeroom', type: 'other', location: 'Homeroom 8A' },
    { time: '9:00 AM - 9:45 AM', event: 'Mathematics (Mr. John Doe)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Science (Ms. Emily White)', type: 'class', location: 'Lab 2' },
    { time: '11:00 AM - 11:45 AM', event: 'Break/Snack', type: 'break', location: 'Courtyard' },
    { time: '12:00 PM - 12:45 PM', event: 'English Language (Mrs. Jane Smith)', type: 'class', location: 'Room 102' },
    { time: '1:00 PM - 2:00 PM', event: 'Lunch', type: 'break', location: 'Cafeteria' },
    { time: '2:00 PM - 2:45 PM', event: 'History (Mr. David Green)', type: 'class', location: 'Room 203' },
  ],
  '2025-06-26': [ // Thursday
    { time: '9:00 AM - 9:45 AM', event: 'Mathematics (Mr. John Doe)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Physical Education (Coach Alex)', type: 'class', location: 'Gym' },
    { time: '11:00 AM - 11:45 AM', event: 'English Language (Mrs. Jane Smith)', type: 'class', location: 'Room 102' },
    { time: '1:00 PM - 1:45 PM', event: 'History (Mr. David Green)', type: 'class', location: 'Room 203' },
    { time: '2:00 PM - 2:45 PM', event: 'Science (Ms. Emily White)', type: 'class', location: 'Lab 2' },
  ],
  '2025-06-27': [ // Friday
    { time: '8:30 AM - 9:00 AM', event: 'Homeroom', type: 'other', location: 'Homeroom 8A' },
    { time: '9:00 AM - 9:45 AM', event: 'Mathematics (Mr. John Doe)', type: 'class', location: 'Room 101' },
    { time: '10:00 AM - 10:45 AM', event: 'Student Council Meeting', type: 'club', location: 'School Hall' },
    { time: '11:00 AM - 11:45 AM', event: 'English Language (Mrs. Jane Smith)', type: 'class', location: 'Room 102' },
    { time: '1:00 PM - 2:00 PM', event: 'Lunch', type: 'break', location: 'Cafeteria' },
  ],
};


export default function StudentSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const todayDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getEventIcon = (type: 'class' | 'break' | 'club' | 'other') => {
    switch (type) {
      case 'class': return <BookOpenIcon className="h-5 w-5 text-indigo-600" />;
      case 'break': return <ClockIcon className="h-5 w-5 text-gray-500" />;
      case 'club': return <UserGroupIcon className="h-5 w-5 text-teal-600" />;
      case 'other': return <SparklesIcon className="h-5 w-5 text-purple-600" />;
      default: return <CalendarDaysIcon className="h-5 w-5 text-gray-500" />; // Fallback
    }
  };

  const currentDaySchedule = sampleStudentSchedules[selectedDate] || [];

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
          <p className="text-sm text-gray-600 mt-1">Your daily activities and classes, {studentName}.</p>
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
                        {getEventIcon(slot.type)} {slot.event}
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
              <p className="text-sm mt-2">Enjoy your free time!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips/Next Day Preview (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-yellow-500" /> Study Tip
          </h3>
          <p className="text-sm text-gray-700">Remember to review your notes for Science class tomorrow morning!</p>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-purple-500" /> Upcoming Event
          </h3>
          <p className="text-sm text-gray-700">School concert practice: Friday, 3:30 PM in the Auditorium.</p>
        </div>
      </div>
    </div>
  );
}
