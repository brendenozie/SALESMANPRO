'use client';

import React, { useMemo } from 'react';
import { ClockIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TimetableEntry } from './WeeklyTimetable'; // Import TimetableEntry from WeeklyTimetable
import SortableLessonCard from './SortableLessonCard'; // Import SortableLessonCard

interface TimetableGridProps {
  timetable: TimetableEntry[];
  daysOfWeek: string[];
  timeSlots: string[];
  onClickLesson: (entry: TimetableEntry) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: (dayOfWeek: string, time: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onDragEnd: (args: any) => void;
  filteredLessons: TimetableEntry[];
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable, // Full timetable data (for activeLesson lookup)
  daysOfWeek,
  timeSlots,
  onClickLesson,
  onDeleteLesson,
  onAddLesson,
  activeId,
  setActiveId,
  onDragEnd,
  filteredLessons, // Already filtered data for display in cells
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isToday = (dayName: string) => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return todayName === dayName;
  };

  const activeLesson = activeId ? timetable.find(l => l.id === activeId) : null;

  // Generate dates for the current week (Monday to Friday)
  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to get Monday of current week
    const monday = new Date(today.setDate(diff));

    return daysOfWeek.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    });
  }, [daysOfWeek]); // Recalculate if daysOfWeek changes


  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id?.toString() ?? null)} onDragEnd={onDragEnd}>
        <div className="min-w-[900px] grid" style={{ gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(180px, 1fr))` }}>
          {/* Headers */}
          <div className="sticky top-0 z-10 bg-white border-r border-b border-gray-200" /> {/* Empty corner cell */}

          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`bg-gray-50 border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700
                ${isToday(day) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}
                ${index === 0 ? 'rounded-tl-xl' : ''} ${index === daysOfWeek.length - 1 ? 'rounded-tr-xl' : ''}
              `}
            >
              {day} <br />
              <span className="text-xs font-normal text-gray-500">{new Date(currentWeekDays[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          ))}

          {/* Time rows and Lesson Cells */}
          {timeSlots.map(timeSlot => (
            <React.Fragment key={timeSlot}>
              {/* Time Label */}
              <div className="p-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 flex items-center justify-end">
                <ClockIcon className="h-4 w-4 mr-1 text-gray-500" /> {timeSlot}
              </div>

              {/* Lesson Cells */}
              {daysOfWeek.map(day => {
                const cellId = `${day}-${timeSlot}`;
                // Filter lessons that start exactly at this time slot on this day
                const lessonsInCell = filteredLessons.filter(l =>
                  l.dayOfWeek === day &&
                  new Date(l.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === timeSlot
                );

                return (
                  <div
                    key={cellId}
                    className="p-1 min-h-[100px] border border-gray-200 relative group" // Added group for hover effects
                    data-dayOfWeek={day}
                    data-time={timeSlot}
                    // Clicking on the cell background should add a new lesson
                    onClick={() => onAddLesson(day, timeSlot)}
                  >
                    <SortableContext items={lessonsInCell.map(l => l.id)} strategy={rectSortingStrategy}>
                      <div className="flex flex-col gap-1 h-full">
                        {lessonsInCell.length > 0 ? (
                          lessonsInCell.map(lesson => (
                            <SortableLessonCard
                              key={lesson.id}
                              entry={lesson}
                              onClick={onClickLesson}
                              onDelete={onDeleteLesson}
                            />
                          ))
                        ) : (
                          // Placeholder for empty cells, visible on hover
                          <div
                            className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-200
                                       opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); onAddLesson(day, timeSlot); }} // Ensure click on plus icon adds lesson
                          >
                            <PlusCircleIcon className="h-6 w-6 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <DragOverlay>
          {activeLesson ? (
            <SortableLessonCard
              entry={activeLesson}
              onClick={() => {}} // No action on click when dragging
              onDelete={() => {}} // No action on delete when dragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
