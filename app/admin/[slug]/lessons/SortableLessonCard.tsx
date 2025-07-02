// SortableLessonCard.tsx
'use client';

import React from 'react';
import {
  UsersIcon,
  AcademicCapIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimetableEntry } from '@/types/typings';


interface SortableLessonCardProps {
  entry: TimetableEntry;
  onClick: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

export default function SortableLessonCard({ entry, onClick, onDelete }: SortableLessonCardProps) {
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
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0px 8px 20px rgba(0, 0, 0, 0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', {
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
      className={`group relative flex flex-col gap-2 p-3 rounded-xl bg-white border-l-4 border-blue-400 shadow-sm transition hover:shadow-md cursor-grab active:cursor-grabbing`}
    >
      <div className="text-sm font-semibold text-blue-900 truncate">
        {entry.courseTitle}
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div className="flex items-center gap-1">
          <UsersIcon className="h-4 w-4 text-gray-500" />
          <span>{entry.educatorName}</span>
        </div>

        {entry.courseAcademicLevels.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <AcademicCapIcon className="h-4 w-4 text-gray-500" />
            {entry.courseAcademicLevels.map((level) => (
              <span
                key={level.id}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mr-1"
              >
                {level.name}
              </span>
            ))}
          </div>
        )}

        {entry.topic && (
          <div className="text-gray-700 line-clamp-2">
            <strong>Topic:</strong> {entry.topic}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-700 border-t pt-2 border-gray-100">
        <span>
          {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
        </span>

        <div className="flex items-center gap-1">
          {entry.meetingLink && (
            <a
              href={entry.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Join meeting"
            >
              <LinkIcon className="h-4 w-4" />
            </a>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(entry);
            }}
            className="p-1 text-indigo-600 hover:text-indigo-800"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="p-1 text-red-500 hover:text-red-700"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
