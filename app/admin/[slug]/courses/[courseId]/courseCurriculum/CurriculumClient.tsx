'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  Bars3Icon,
  ArrowLeftIcon,
  XMarkIcon,
  PlayIcon,
  ClockIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

// Assuming you'll create these form modals next
import ModuleFormModal from './ModuleFormModal';
import LessonFormModal from './LessonFormModal';

export type LessonType = {
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  duration: number; // in minutes
  order: number;
  createdAt: string;
};

export type ModuleType = {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: LessonType[];
  createdAt: string;
};

interface CurriculumClientProps {
  initialModules: ModuleType[];
  courseDetails: any; // Simplified for brevity
  companyId: string;
  apiBaseUrl: string;
}

export default function CurriculumClient({ 
  initialModules, 
  courseDetails, 
  companyId, 
  apiBaseUrl 
}: CurriculumClientProps) {
  const [modules, setModules] = useState<ModuleType[]>(initialModules);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleType | null>(null);
  const [editingLesson, setEditingLesson] = useState<{lesson: LessonType | null, moduleId: string}>({ lesson: null, moduleId: '' });

  // Toggle Accordion
  const toggleModule = (id: string) => {
    setExpandedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const fetchCurriculum = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/courses/${courseDetails.id}/curriculum`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules);
      }
    } catch (err: any) {
      setError("Failed to sync curriculum data.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, courseDetails.id]);

  // --- Handlers ---
  const handleDeleteModule = async (id: string) => {
    if (!confirm("Delete this module and all its lessons?")) return;
    // API Call Logic...
    setModules(modules.filter(m => m.id !== id));
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    // API Call Logic...
    setModules(modules.map(m => m.id === moduleId 
      ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
      : m
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/admin/${companyId}/courses`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <QueueListIcon className="h-8 w-8 text-indigo-600" />
            Curriculum: {courseDetails.title}
          </h1>
        </div>
        
        <button
          onClick={() => { setEditingModule(null); setShowModuleModal(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all font-semibold"
        >
          <PlusIcon className="h-5 w-5" /> Add Module
        </button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><XMarkIcon className="h-5 w-5" /></button>
        </div>
      )}

      {/* Curriculum Builder */}
      <div className="max-w-5xl mx-auto space-y-4">
        {modules.length > 0 ? (
          modules.sort((a, b) => a.order - b.order).map((module, mIdx) => (
            <div key={module.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all">
              {/* Module Row */}
              <div className="p-5 flex items-center justify-between group">
                <div 
                  className="flex items-center gap-4 flex-grow cursor-pointer"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg h-12 w-12 text-gray-500 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <span className="text-xs uppercase">Mod</span>
                    <span>{mIdx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{module.title}</h3>
                    <p className="text-sm text-gray-500">{module.lessons.length} Lessons</p>
                  </div>
                  {expandedModules.includes(module.id) ? 
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  }
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingModule(module); setShowModuleModal(true); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Lessons (Collapsible Section) */}
              {expandedModules.includes(module.id) && (
                <div className="bg-gray-50/50 border-t border-gray-100 p-5 space-y-3">
                  {module.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                    <div key={lesson.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between group/lesson shadow-sm">
                      <div className="flex items-center gap-4">
                        <Bars3Icon className="h-5 w-5 text-gray-300 cursor-grab active:cursor-grabbing" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            {lesson.title}
                            {lesson.videoUrl && <PlayIcon className="h-4 w-4 text-red-500" />}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" /> {lesson.duration} mins
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingLesson({lesson, moduleId: module.id}); setShowLessonModal(true); }}
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLesson(module.id, lesson.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => { setEditingLesson({lesson: null, moduleId: module.id}); setShowLessonModal(true); }}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" /> Add Lesson to {module.title}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Your curriculum is empty</h3>
            <p className="text-gray-500">Start by adding your first learning module.</p>
          </div>
        )}
      </div>

      {/* Placeholder for Modals */}
      {/* <ModuleFormModal ... /> */}
      <ModuleFormModal
        moduleData={editingModule}
        onClose={() => setShowModuleModal(false)}
        onSave={async (moduleData) => {
          // API call to save module (create or update)
          // On success, update local state and close modal
          setShowModuleModal(false);
          await fetchCurriculum(); // Refresh curriculum data after changes
        }}
        isLoading={false}
        courseId={courseDetails.id}
      />
      {/* <LessonFormModal ... /> */}
      <LessonFormModal
        lessonData={editingLesson.lesson}
        moduleId={editingLesson.moduleId}
        onClose={() => setShowLessonModal(false)}
        onSave={async (lessonData) => {
          // API call to save lesson (create or update)
          // On success, update local state and close modal
          setShowLessonModal(false);
          await fetchCurriculum(); // Refresh curriculum data after changes
        }}
        isLoading={false}
      />
    </div>
  );
}