'use client';

import React, { useMemo } from 'react';
import { ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
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

import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
  day: string;
  time: string;
  activeLesson: TimetableEntry | null;
  allLessons: TimetableEntry[];
  children: React.ReactNode;
  onAdd: () => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ 
  day, time, activeLesson, allLessons, children, onAdd 
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}-${time}`,
    data: { dayOfWeek: day, time: time },
  });

  // Calculate if there's a conflict ONLY if we are hovering over this specific cell
  const hasConflict = React.useMemo(() => {
  if (!isOver || !activeLesson) return false;

  const durationMs = new Date(activeLesson.endTime).getTime() - new Date(activeLesson.startTime).getTime();
  const [hours, minutes] = time.split(':').map(Number);
  const proposedStart = Date.UTC(1970, 0, 1, hours, minutes, 0, 0);
  const proposedEnd = proposedStart + durationMs;

  // Get classroom IDs for the lesson being dragged
  const activeClassroomIds = activeLesson.classroom ? [activeLesson.classroom.id] : [];

  return allLessons.some(existing => {
    // 1. Skip if it's the same lesson
    if (existing.id === activeLesson.id) return false;
    
    // 2. Only check if it's the same day
    if (existing.dayOfWeek !== day) return false;

    // 3. Check for Time Overlap
    const exStart = new Date(existing.startTime).getTime();
    const exEnd = new Date(existing.endTime).getTime();
    const isOverlapping = proposedStart < exEnd && proposedEnd > exStart;

    if (!isOverlapping) return false;

    // 4. Check Educator Conflict
    const isTeacherBusy = existing.educatorId === activeLesson.educatorId;

    // 5. Check Classroom Conflict 
    // (Check if any classroom ID in 'existing' is present in 'activeClassroomIds')
    const isRoomBusy = existing.classroom ? activeClassroomIds.includes(existing.classroom.id) : false;

    return isTeacherBusy || isRoomBusy;
  });
}, [isOver, activeLesson, allLessons, day, time]);


  return (
    <div
      ref={setNodeRef}
      onClick={onAdd}
      className={`p-1 min-h-[110px] border-b border-r border-gray-100 relative transition-colors duration-200
        ${isOver && hasConflict ? 'bg-red-200 ring-2 ring-red-500 z-10' : ''}
        ${isOver && !hasConflict ? 'bg-green-100 ring-2 ring-green-500 z-10' : ''}
        ${!isOver ? 'bg-white hover:bg-gray-50' : ''}
      `}
    >
      {/* Visual "X" or Warning Icon if conflict */}
      {/* // Inside DroppableCell return statement */}
      {isOver && hasConflict && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-white/90 border border-red-500 p-2 rounded shadow-lg flex flex-col items-center">
            <span className="text-red-700 font-bold text-[10px] uppercase tracking-wider">
              Conflict Detected
            </span>
            <span className="text-gray-600 text-[9px] text-center">
              Teacher or Room is already occupied
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

const getUTCTimeString = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Prevent accidental drags
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isToday = (dayName: string) => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return todayName === dayName;
  };

  const activeLesson = activeId ? (timetable.find(l => l.id === activeId) ?? null) : null;
  

  const currentWeekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diff));

    return daysOfWeek.map((_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date.toISOString().split('T')[0];
    });
  }, [daysOfWeek]);

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({ active }) => setActiveId(active.id?.toString() ?? null)} onDragEnd={onDragEnd}>
        <div className="min-w-[900px] grid" style={{ gridTemplateColumns: `80px repeat(${daysOfWeek.length}, minmax(180px, 1fr))` }}>
          
          {/* Corner */}
          <div className="sticky top-0 z-10 bg-white border-r border-b border-gray-200 p-2 flex items-center justify-center">
             <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>

          {/* Header Row */}
          {daysOfWeek.map((day, index) => {
            const isDayToday = isToday(day);
            return (
              <div
                key={day}
                className={`sticky top-0 z-10 border-b border-gray-200 p-3 text-center
                  ${isDayToday ? 'bg-indigo-50 border-b-indigo-200' : 'bg-gray-50'}
                  ${index === daysOfWeek.length - 1 ? 'rounded-tr-xl' : ''}
                `}
              >
                <div className={`text-sm font-bold ${isDayToday ? 'text-indigo-700' : 'text-gray-700'}`}>
                  {day}
                </div>
                <div className={`text-xs mt-1 ${isDayToday ? 'text-indigo-500 font-medium' : 'text-gray-500'}`}>
                  {new Date(currentWeekDays[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {/* Visual indicator for today */}
                {isDayToday && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500" />}
              </div>
            );
          })}

          {/* Grid Body */}
          {timeSlots.map(timeSlot => (
            <React.Fragment key={timeSlot}>
              {/* Time Label */}
              <div className="p-2 text-xs font-semibold text-gray-500 border-r border-gray-200 bg-gray-50/50 flex items-start justify-center pt-3">
                {timeSlot}
              </div>

              {/* Lesson Cells */}
              {daysOfWeek.map(day => {
                // Inside {daysOfWeek.map(day => { ... })}
                const cellId = `${day}-${timeSlot}`;

                const lessonsInCell = filteredLessons.filter(l => {
                  const startHour = new Date(l.startTime).getUTCHours().toString().padStart(2, '0');
                  const slotHour = timeSlot.split(':')[0]; // Gets "08" from "08:00"
                  
                  return l.dayOfWeek === day && startHour === slotHour;
                });
                
                const isDayToday = isToday(day);

                return (
                  <DroppableCell
                    key={`${day}-${timeSlot}`}
                    day={day}
                    time={timeSlot}
                    activeLesson={activeLesson}
                    allLessons={timetable} // All lessons to check for global teacher conflicts
                    // onAdd={() => onAddLesson(day, timeSlot)}
                    onAdd={() => {}}
                  >
                     <div
                        key={cellId}
                        className={`p-1 min-h-[110px] h-full border-b border-r border-gray-100 relative group transition-colors duration-200
                          ${isDayToday ? 'bg-indigo-50/30' : 'bg-white hover:bg-gray-50'}
                        `}
                        >
                          <SortableContext items={lessonsInCell.map(l => l.id)} strategy={rectSortingStrategy}>
                            <div className="flex flex-col gap-2 h-full">
                              {lessonsInCell.map(lesson => (
                                <SortableLessonCard 
                                  key={lesson.id} 
                                  entry={lesson} 
                                  onClick={(lesson) => {
                                    onClickLesson(lesson);
                                  }}
                                  onDelete={() => onDeleteLesson(lesson.id)}
                                />
                              ))}
                              {/* Empty State / Add Button */}
                              <div
                                className={`flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-transparent
                                            ${lessonsInCell.length === 0 ? 'min-h-[60px]' : ''}
                                            group-hover:border-indigo-200 group-hover:bg-indigo-50/50 transition-all cursor-pointer`}
                                onClick={() => onAddLesson(day, timeSlot)}
                              >
                                <PlusIcon className="h-6 w-6 text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </SortableContext>
                      </div>
                  </DroppableCell>
  );

              })}
            </React.Fragment>
          ))}
        </div>

        <DragOverlay>
          {activeLesson ? (
            <div className="opacity-90 rotate-3 cursor-grabbing">
               <SortableLessonCard entry={activeLesson} onClick={() => {   }} onDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};