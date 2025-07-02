import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  UsersIcon,
  AcademicCapIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimetableEntry } from '@/types/typings';

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
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.7 : 1,
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
      className={`group relative p-3 rounded-lg bg-white border border-gray-200 shadow-sm transition-shadow duration-200
                 cursor-grab active:cursor-grabbing hover:shadow-md`}
    >
      {/* Course Title */}
      <h3 className="font-semibold text-sm text-gray-800 truncate">{entry.courseTitle}</h3>

      {/* Educator */}
      <div className="mt-1 flex items-center text-xs text-gray-600">
        <UsersIcon className="h-4 w-4 mr-1 text-indigo-500" />
        {entry.educatorName}
      </div>

      {/* Levels */}
      {entry.courseAcademicLevels?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1 text-[11px] font-medium text-indigo-700">
          {entry.courseAcademicLevels.map((level) => (
            <span
              key={level.id}
              className="bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100"
            >
              <AcademicCapIcon className="inline-block h-3 w-3 mr-1" />
              {level.name}
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
            className="hover:text-blue-600"
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
          className="hover:text-indigo-600"
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
          className="hover:text-red-500"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
