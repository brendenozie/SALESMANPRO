'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, DragOverlay, closestCenter } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';

// Custom styling variables
const COLORS = {
  Planned: 'bg-indigo-100 text-indigo-800',
  Taught: 'bg-green-100 text-green-800',
  Draft: 'bg-yellow-100 text-yellow-800',
};
const FONT = 'font-sans';

// Sample Data & Types
const sampleClasses = [
  { id: 'CL101', name: 'Grade 7 Mathematics' },
  { id: 'CL102', name: 'Grade 8 Science' },
  { id: 'CL103', name: 'Grade 9 Algebra' },
];
type Lesson = { id: string; title: string; classId: string; day: string; time: string; status: keyof typeof COLORS; recurring?: boolean; duration: string; objectives?: string; activities?: string; materials?: string; assessment?: string; className?: string; };
const sampleLessons: Lesson[] = [
  { id: 'L001', title: 'Algebra', classId: 'CL103', day: 'Monday', time: '08:00', duration: '45 mins', status: 'Planned', recurring: true
    , objectives: 'Understand basic algebraic concepts', activities: 'Solve equations', materials: 'Textbook, worksheets', assessment: 'Quiz on Friday'
   },
  { id: 'L002', title: 'Geometry', classId: 'CL101', day: 'Tuesday', time: '09:00', duration: '45 mins', status: 'Planned', recurring: true,
    objectives: 'Understand basic geometric shapes', activities: 'Draw shapes', materials: 'Ruler, compass', assessment: 'Quiz on Tuesday'
  },
  { id: 'L003', title: 'Decimals', classId: 'CL101', day: 'Wednesday', time: '10:00', duration: '45 mins', status: 'Draft',
    objectives: 'Understand decimal numbers', activities: 'Convert fractions to decimals', materials: 'Worksheets', assessment: 'Quiz on Wednesday'
  },
];
const daysOfWeek = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const defaultTimeSlots = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00'];

export default function WeeklyTimetable() {
  // State & Modal integration
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [selectedClass, setSelectedClass] = useState(sampleClasses[0].id);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const lessonsByClass = useMemo(
    () => lessons.filter(l => l.classId === selectedClass),
    [lessons, selectedClass]
  );

  
  // --- Lesson Form Modal ---
  type LessonFormModalProps = {
    lessonData: Lesson | null;
    onClose: () => void;
    onSave: (lesson: any) => void;
    isEdit?: boolean;
  };

  const LessonFormModal: React.FC<LessonFormModalProps> = ({ lessonData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(lessonData || {
      title: '', classId: '', time: '08:00', duration: '45 mins', objectives: '', activities: '', materials: '', assessment: '', status: 'Planned',
      recurring: false, className: ''
    });

    // Set default class if available and not in edit mode
    React.useEffect(() => {
        if (!isEdit && sampleClasses.length > 0 && !formData.classId) {
            setFormData(prev => ({ ...prev, classId: sampleClasses[0].id }));
        }
    }, [isEdit, formData.classId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Add className before saving
      const selectedClass = sampleClasses.find(c => c.id === formData.classId);
      onSave({ ...formData, className: selectedClass ? selectedClass.name : '' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Lesson: ${formData.title}` : 'Create New Lesson Plan'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Lesson Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">Class</label>
              <select name="classId" id="classId" value={formData.classId} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                {sampleClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" name="date" id="date" value={formData.time} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
              <input type="text" name="duration" id="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 45 mins, 1 hour"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">Learning Objectives</label>
              <textarea name="objectives" id="objectives" value={formData.objectives} onChange={handleChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="activities" className="block text-sm font-medium text-gray-700">Activities</label>
              <textarea name="activities" id="activities" value={formData.activities} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-700">Materials Needed</label>
              <textarea name="materials" id="materials" value={formData.materials} onChange={handleChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="assessment" className="block text-sm font-medium text-gray-700">Assessment</label>
              <textarea name="assessment" id="assessment" value={formData.assessment} onChange={handleChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            {isEdit && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                  <option value="Planned">Planned</option>
                  <option value="Taught">Taught</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  // DnD Handlers
  const handleDragStart = ({ active }: any) => setActiveId(active.id);
  const handleDragEnd = ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      setLessons(curr => curr.map(l => {
        if (l.id === active.id) return { ...l, day: over.data.current.day, time: over.data.current.time };
        return l;
      }));
    }
    setActiveId(null);
  };

  // Modal Save
  const handleSave = (lessonData: Lesson) => {
    setLessons(curr => curr.map(l => l.id === lessonData.id ? lessonData : lessonData.id ? lessonData : { ...lessonData, id: `L${curr.length+1}` }));
    setShowForm(false);
    setEditingLesson(null);
  };

  // Render cell using Sortable wrapper
  const renderCell = useCallback((day: string, time: string) => {
    const lesson = lessonsByClass.find(l => l.day === day && l.time === time);

    if (!lesson) return (
      <div data-day={day} data-time={time} className="h-full flex items-center justify-center">
        <PlusCircleIcon className="h-6 w-6 text-gray-300 hover:text-gray-500 cursor-pointer" onClick={() => { setEditingLesson({ id: '', title: '', classId: selectedClass, day, time, status: 'Planned', duration: '45 mins' }); setShowForm(true); }} />
      </div>
    );

    return (
      <div
        id={lesson.id}
        data-day={day} data-time={time}
        className={`${COLORS[lesson.status]} p-2 rounded-lg ${FONT} cursor-move h-full`}
        onClick={() => { setEditingLesson(lesson); setShowForm(true); }}
      >
        <p className="font-semibold text-sm truncate">{lesson.title}</p>
        {lesson.recurring && <span className="text-xs italic">(recurring)</span>}
      </div>
    );
  }, [lessonsByClass, selectedClass]);

  return (
    <div className="p-6 bg-white min-h-screen font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <h1 className="text-3xl font-bold">Timetable</h1>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="mt-2 sm:mt-0 px-3 py-2 border rounded-md">
          {sampleClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* DnD Context & Grid */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="grid grid-cols-[80px_repeat(5,1fr)] border rounded-lg overflow-hidden">
          {/* Days header */}
          <div className="bg-gray-100 border p-2"></div>
          {daysOfWeek.map(day => <div key={day} className="border p-2 bg-gray-50 text-center font-medium">{day}</div>)}

          {/* Time rows */}
          {defaultTimeSlots.map(time => (
            <React.Fragment key={time}>
              <div className="border p-2 bg-gray-100 text-sm font-medium">{time}</div>
              {daysOfWeek.map(day => (
                <SortableContext key={`${day}-${time}`} items={lessonsByClass.map(l => l.id)} strategy={rectSortingStrategy}>
                  <div key={`${day}-${time}`} className="border h-28 p-1 bg-white" data-day={day} data-time={time}>
                    {renderCell(day, time)}
                  </div>
                </SortableContext>
              ))}
            </React.Fragment>
          ))}
        </div>

        <DragOverlay>
          {activeId ? <div className="p-2 bg-gray-200 rounded">{lessons.find(l => l.id === activeId)?.title}</div> : null}
        </DragOverlay>
      </DndContext>

      {/* Lesson Form Modal */}
      {showForm && (
        <LessonFormModal
          lessonData={editingLesson}
          onClose={() => { setShowForm(false); setEditingLesson(null); }}
          onSave={handleSave}
          isEdit={!!editingLesson}
        />
      )}
    </div>
  );
}
