// TimetableGrid.tsx
'use client';

import React, { useMemo } from 'react';
import { ClockIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
// import { TimetableEntry } from './types';
// import { SortableLessonCard } from './SortableLessonCard';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TimetableEntry } from './WeeklyTimetable';
import SortableLessonCard from './SortableLessonCard';

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
  timetable,
  daysOfWeek,
  timeSlots,
  onClickLesson,
  onDeleteLesson,
  onAddLesson,
  activeId,
  setActiveId,
  onDragEnd,
  filteredLessons,
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
    }, []); // Recalculate only once or when a "week" navigation is added

  return (
    <div className="overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id?.toString() ?? null)} onDragEnd={onDragEnd}>
        <div className="min-w-[900px] grid" style={{ gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(150px, 1fr))` }}>
          {/* Headers */}
          <div className="sticky top-0 z-10 bg-white border-r border-b" />
          
          {daysOfWeek.map((day, index) => (
               <div key={day} className={`bg-gray-50 border-b border-gray-200 p-3 text-center text-sm font-semibold text-gray-700  ${isToday(day) ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
               {day} <br />
               <span className="text-xs font-normal text-gray-500">{new Date(currentWeekDays[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
             </div>
            ))}

          {/* Time rows */}
          {timeSlots.map(timeSlot => (
            <React.Fragment key={timeSlot}>
              {/* Time Label */}
              <div className="p-2 text-right font-semibold text-gray-700 border-r border-gray-200 bg-gray-50 flex items-center justify-end">
                <ClockIcon className="h-4 w-4 mr-1 text-gray-500" /> {timeSlot}
              </div>

              {/* Lesson Cells */}
              {daysOfWeek.map(day => {
                const cellId = `${day}-${timeSlot}`;
                const lessonsInCell = filteredLessons.filter(l => l.dayOfWeek === day && new Date(l.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === timeSlot);

                return (
                  <div
                    key={cellId}
                    className="p-1 min-h-[100px] border border-gray-200 rounded-md overflow-hidden relative"
                    data-dayOfWeek={day}
                    data-time={timeSlot}
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
                            <div
                              className="h-full flex items-center justify-center bg-gray-50 rounded-md border border-dashed border-gray-200
                                         hover:bg-gray-100 transition-colors duration-150 cursor-pointer group"
                              onClick={() => {
                              }}
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
              onClick={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
