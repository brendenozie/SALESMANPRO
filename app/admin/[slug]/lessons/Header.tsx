'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  UsersIcon,
  AcademicCapIcon,
  PlusIcon,
  BookOpenIcon, // Added for Course filter icon
} from '@heroicons/react/24/outline';
import { AcademicLevelOption, CourseOption, EducatorOption } from './WeeklyTimetable'; // Import types
import { ClassroomOption } from '../teachers/page';

interface TimetableHeaderProps {
  today: string;
  selectedAcademicLevelId: string; // Renamed from selectedClassId
  selectedClassroomId: string; // New prop for classroom filter
  selectedCourseId: string; // New prop for course filter
  selectedEducatorId: string;
  onChangeAcademicLevel: (value: string) => void; // Renamed from onChangeClass
  onChangeClassroom: (value: string) => void; // New handler for classroom filter
  onChangeCourse: (value: string) => void; // New handler for course filter
  onChangeEducator: (value: string) => void;
  allAcademicLevels: AcademicLevelOption[]; // Use imported type
  allClassrooms: ClassroomOption[]; // New prop for all classrooms
  allCourses: CourseOption[]; // New prop for all courses
  allEducators: EducatorOption[]; // Use imported type
  onAddLesson: () => void;
}

export default function TimetableHeader({
  today,
  selectedAcademicLevelId, // Renamed
  selectedClassroomId, // New
  selectedCourseId, // New
  selectedEducatorId,
  onChangeAcademicLevel, // Renamed
  onChangeClassroom, // New
  onChangeCourse, // New
  onChangeEducator,
  allAcademicLevels,
  allClassrooms, // New
  allCourses, // New
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
            Manage class schedules by level, course, and educator.
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
            value={selectedAcademicLevelId} // Renamed
            onChange={(e) => onChangeAcademicLevel(e.target.value)} // Renamed
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          >
            <option value="All">All Academic Levels</option>
            {allAcademicLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {/* Classroom Filter (NEW) */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <AcademicCapIcon className="h-5 w-5 text-indigo-500" />
          <select
            value={selectedClassroomId}
            onChange={(e) => onChangeClassroom(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          >
            <option value="All">All Classrooms</option>
            {allClassrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>

        {/* Course Filter (NEW) */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
          <BookOpenIcon className="h-5 w-5 text-indigo-500" />
          <select
            value={selectedCourseId}
            onChange={(e) => onChangeCourse(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          >
            <option value="All">All Courses</option>
            {allCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title} ({course.code})
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
