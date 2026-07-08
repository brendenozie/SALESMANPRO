'use client';

import React from 'react';
import { PencilIcon, TrashIcon, UsersIcon, AcademicCapIcon, LinkIcon, BookOpenIcon, TagIcon } from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimetableEntry } from './WeeklyTimetable';
// import { TimetableEntry } from '@/types/typings';
// Assuming TimetableEntry is defined in a shared types file or directly in WeeklyTimetable.tsx
// For this immersive, I'll define it locally for self-containment.
// export type TimetableEntry = {
//   id: string;
//   courseId: string;
//   courseTitle: string;
//   courseCode: string; // Added
//   courseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
//   educatorId: string;
//   educatorName: string;
//   educatorEmail: string;
//   dayOfWeek: string;
//   startTime: string;
//   endTime: string;
//   topic?: string | null;
//   meetingLink?: string | null;
//   companyId: string;
//   createdAt: string;
//   updatedAt: string;
// };

const LESSON_COLORS = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function LessonCard({
  entry,
  onClick,
  onDelete,
}: {
  entry: TimetableEntry;
  onClick: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0px 8px 20px rgba(0, 0, 0, 0.2)' : '0px 2px 5px rgba(0, 0, 0, 0.05)',
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative p-3 rounded-lg border ${LESSON_COLORS.default} cursor-grab active:cursor-grabbing hover:shadow-md`}
    >
      <p className="font-bold text-sm truncate">{entry.course.title}</p>
      {entry.courseId && ( // Display course code if available
        <p className="text-xs text-gray-700 mt-0.5 flex items-center">
          <BookOpenIcon className="h-3 w-3 mr-1" /> {entry.courseId}
        </p>
      )}
      <p className="text-xs text-gray-700 mt-0.5 flex items-center">
        <UsersIcon className="h-3 w-3 mr-1" /> {entry.educatorName}
      </p>
      {entry.course?.academicLevels?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-medium text-indigo-700">
          <TagIcon className="h-3 w-3 mr-1 text-gray-700" /> {/* Changed to TagIcon */}
          {entry.course.academicLevels.map((level) => (
            <span
              key={level.id}
              className="bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100"
            >
              {level.name}
            </span>
          ))}
        </div>
      )}
      {entry.topic && <p className="text-xs mt-1 text-gray-500 line-clamp-2">📌 {entry.topic}</p>}

      <div className="flex justify-between items-center text-xs text-gray-700 mt-2 pt-2 border-t border-gray-200">
        <span>{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</span>
        <div className="flex items-center gap-1">
          {entry.meetingLink && (
            <a href={entry.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 p-1 rounded-full">
              <LinkIcon className="h-4 w-4" />
            </a>
          )}
          <button onClick={(e) => { e.stopPropagation(); onClick(entry); }} className="hover:text-indigo-600 p-1 rounded-full">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} className="hover:text-red-600 p-1 rounded-full">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
