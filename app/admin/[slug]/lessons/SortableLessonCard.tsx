'use client';

import React from 'react';
import {
  TrashIcon,
  BookOpenIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimetableEntry } from './WeeklyTimetable';

// deterministic pastel colors based on string input
const getCourseColor = (str: string) => {
  const colors = [
    'bg-red-100 border-red-200 text-red-900',
    'bg-orange-100 border-orange-200 text-orange-900',
    'bg-amber-100 border-amber-200 text-amber-900',
    'bg-lime-100 border-lime-200 text-lime-900',
    'bg-green-100 border-green-200 text-green-900',
    'bg-emerald-100 border-emerald-200 text-emerald-900',
    'bg-teal-100 border-teal-200 text-teal-900',
    'bg-cyan-100 border-cyan-200 text-cyan-900',
    'bg-sky-100 border-sky-200 text-sky-900',
    'bg-blue-100 border-blue-200 text-blue-900',
    'bg-indigo-100 border-indigo-200 text-indigo-900',
    'bg-violet-100 border-violet-200 text-violet-900',
    'bg-purple-100 border-purple-200 text-purple-900',
    'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-900',
    'bg-pink-100 border-pink-200 text-pink-900',
    'bg-rose-100 border-rose-200 text-rose-900',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface SortableLessonCardProps {
  entry: TimetableEntry;
  onClick: (entry: TimetableEntry) => void;
  onDelete: (id: string) => void;
}

const getUTCTimeString = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

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

  const colorClass = getCourseColor(entry.courseId);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      // Added double click to edit as it's often more intuitive for "opening" something
      // onDoubleClick={(e) => { e.stopPropagation(); onClick(entry); }}
      onClick={() => onClick(entry)}
      className={`group relative p-3 rounded-lg border shadow-sm transition-all duration-200
                  cursor-grab active:cursor-grabbing hover:shadow-md select-none
                  ${colorClass} ${isDragging ? 'shadow-xl ring-2 ring-indigo-400 rotate-2' : ''}`}
    >
      {/* Delete Button (visible on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(entry.id);
        }}
        className="absolute top-2 right-2 p-1 rounded-full bg-white/50 hover:bg-white text-gray-500 hover:text-red-600 
                   opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete Lesson"
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      {/* Course Title & Code */}
      <div className="pr-6"> {/* Padding for delete button */}
        <h3 className="font-bold text-sm leading-tight">{entry.course?.title}</h3>
        {entry.course?.code && (
          <div className="flex items-center gap-1 mt-1 opacity-80">
            <BookOpenIcon className="h-3 w-3" />
            <span className="text-xs font-medium">{entry.course.code}</span>
          </div>
        )}
      </div>

      {/* Metadata (Time, Educator, Room) */}
      <div className="mt-2 space-y-1 border-t border-black/5 pt-2">
        <div className="flex items-center justify-between text-xs font-medium opacity-90">
          <span>
            {
              `${getUTCTimeString(entry.startTime)} - ${getUTCTimeString(entry.endTime)}`
            }
          </span>
           {/* <span>{new Date(entry.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})} - {new Date(entry.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span> */}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs opacity-80 truncate">
          <UserIcon className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{entry.educators?.[0]?.name || entry.educator?.name || entry.educator?.user?.name || entry.educatorName || 'No Educator Assigned'}</span>
        </div>

        {entry.classroom && (
          <div className="flex items-center gap-1.5 text-xs opacity-80 truncate">
            <MapPinIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{entry.classroom.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}