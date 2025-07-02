// File: components/WeeklyTimetable/Header.tsx
'use client';

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { AcademicLevelOption, EducatorOption } from '@/types/typings';

interface HeaderProps {
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedEducatorId: string;
  setSelectedEducatorId: (id: string) => void;
  allAcademicLevels: AcademicLevelOption[];
  allEducators: EducatorOption[];
  todayLabel: string;
}

export default function Header({
  selectedClassId,
  setSelectedClassId,
  selectedEducatorId,
  setSelectedEducatorId,
  allAcademicLevels,
  allEducators,
  todayLabel,
}: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Weekly Timetable <span className="ml-2 text-purple-600 text-base sm:text-xl">🗓️</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">View and manage recurring class schedules.</p>
      </div>
      <div className="flex items-center gap-4">
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Classes</option>
          {allAcademicLevels.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedEducatorId}
          onChange={e => setSelectedEducatorId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Educators</option>
          {allEducators.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.email})</option>
          ))}
        </select>

        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{todayLabel}</span>
        </div>
      </div>
    </div>
  );
}
