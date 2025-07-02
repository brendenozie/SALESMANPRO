'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  FunnelIcon,
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
    <div className="relative bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6">
      {/* Title & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Weekly Timetable <span className="inline-block">📅</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage class schedules by level and educator.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span className="whitespace-nowrap">{today}</span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">

        {/* Academic Level Filter */}
        <div className="flex items-center gap-2">
          <AcademicCapIcon className="h-5 w-5 text-gray-500" />
          <select
            value={selectedClassId}
            onChange={e => onChangeClass(e.target.value)}
            className="w-full md:min-w-12 sm:w-auto px-3 py-2 border rounded-md text-sm bg-gray-50 text-gray-700 border-gray-300 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Levels</option>
            {allAcademicLevels.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>

        {/* Educator Filter */}
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-gray-500" />
          <select
            value={selectedEducatorId}
            onChange={e => onChangeEducator(e.target.value)}
            className="w-full md:min-w-12  sm:w-auto  border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Educators</option>
            {allEducators.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Floating Add Lesson Button */}
      <button
        onClick={onAddLesson}
        className="fixed sm:static bottom-4 right-4 sm:mt-6 sm:ml-auto sm:flex sm:justify-end z-50 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all"
      >
        <PlusIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Add Lesson</span>
      </button>
    </div>
  );
}
