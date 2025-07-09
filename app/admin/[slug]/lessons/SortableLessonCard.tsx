'use client';

import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  UsersIcon,
  LinkIcon,
  BookOpenIcon, // Added for course code
  TagIcon, // Changed from AcademicCapIcon for academic levels
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Re-defining TimetableEntry here for self-containment, but ideally it would be imported from a shared types file.
export type TimetableEntry = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string; // Added courseCode
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
  educatorId: string;
  educatorName: string;
  educatorEmail: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  topic?: string | null;
  meetingLink?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

const LESSON_COLORS = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  // highlight: 'bg-indigo-100 text-indigo-800 border-indigo-200', // Not used in this component, but good to keep in mind for consistency
};

interface SortableLessonCardProps {
  entry: TimetableEntry;
  onClick: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

export default function SortableLessonCard({
  entry,
  onClick,
  onDelete,
}: SortableLessonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1, // Bring dragged item to front
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0px 8px 20px rgba(0, 0, 0, 0.2)' : '0px 2px 5px rgba(0, 0, 0, 0.05)',
  };

  const formatTime = (isoString: string) =>
    new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`group relative p-3 rounded-lg bg-white border border-gray-200 shadow-sm transition-shadow duration-200
                  cursor-grab active:cursor-grabbing hover:shadow-md`}
    >
      {/* Course Title */}
      <h3 className="font-semibold text-sm text-gray-800 truncate">{entry.courseTitle}</h3>

      {/* Course Code (NEW) */}
      {entry.courseCode && (
        <p className="text-xs text-gray-700 mt-0.5 flex items-center">
          <BookOpenIcon className="h-3 w-3 mr-1 text-gray-500" /> {entry.courseCode}
        </p>
      )}

      {/* Educator */}
      <p className="mt-1 flex items-center text-xs text-gray-600">
        <UsersIcon className="h-4 w-4 mr-1 text-indigo-500" />
        {entry.educatorName}
      </p>

      {/* Academic Levels */}
      {entry.courseAcademicLevels && entry.courseAcademicLevels.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-medium text-indigo-700">
          <TagIcon className="h-4 w-4 mr-1 text-gray-500" /> {/* Changed to TagIcon */}
          {entry.courseAcademicLevels.map((level, index) => (
            <span
              key={level.id}
              className="bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100"
            >
              {level.name}
              {index < entry.courseAcademicLevels.length - 1 ? ', ' : ''} {/* Add comma if not last */}
            </span>
          ))}
        </div>
      )}

      {/* Topic */}
      {entry.topic && (
        <p className="text-xs mt-1 text-gray-500 line-clamp-2">📌 {entry.topic}</p>
      )}

      {/* Time */}
      <div className="text-xs mt-2 text-gray-700 font-medium">
        🕒 {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
      </div>

      {/* Actions (hover only on desktop, always visible on mobile) */}
      <div
        className="absolute inset-x-0 bottom-0 px-2 py-1 flex justify-end items-center gap-2 text-gray-600
                   opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100 bg-white bg-opacity-90"
      >
        {/* Meeting link */}
        {entry.meetingLink && (
          <a
            href={entry.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full hover:bg-gray-100 hover:text-blue-600 transition-colors"
            title="Join meeting"
          >
            <LinkIcon className="h-4 w-4" />
          </a>
        )}

        {/* Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(entry);
          }}
          title="Edit"
          className="p-1 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
        >
          <PencilIcon className="h-4 w-4" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          title="Delete"
          className="p-1 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
