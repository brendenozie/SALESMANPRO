'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface TimetableHeaderProps {
  today: string;
  selectedClassId: string;
  selectedEducatorId: string;
  onChangeClass: (value: string) => void;
  onChangeEducator: (value: string) => void;
  allAcademicLevels: { id: string; name: string }[];
  allEducators: { id: string; name: string }[];
  onAddLesson: () => void;
}

export default function TimetableHeader({
  today,
  selectedClassId,
  selectedEducatorId,
  onChangeClass,
  onChangeEducator,
  allAcademicLevels,
  allEducators,
  onAddLesson,
}: TimetableHeaderProps) {
  return (
    <header className="relative bg-white rounded-2xl shadow-md px-4 py-5 sm:px-6 sm:py-6 mb-6 border border-gray-100">
      {/* Title and Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Weekly Timetable 📅
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage class schedules by level and educator.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDaysIcon className="h-5 w-5 text-indigo-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Academic Level */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <AcademicCapIcon className="h-5 w-5 text-indigo-500" />
          <select
            value={selectedClassId}
            onChange={(e) => onChangeClass(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          >
            <option value="All">All Levels</option>
            {allAcademicLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Educator */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <UsersIcon className="h-5 w-5 text-indigo-500" />
          <select
            value={selectedEducatorId}
            onChange={(e) => onChangeEducator(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          >
            <option value="All">All Educators</option>
            {allEducators.map((edu) => (
              <option key={edu.id} value={edu.id}>
                {edu.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Lesson Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onAddLesson}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md transition-all"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Lesson</span>
        </button>
      </div>

      {/* Floating for mobile */}
      <button
        onClick={onAddLesson}
        className="sm:hidden fixed bottom-5 right-5 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </header>
  );
}
