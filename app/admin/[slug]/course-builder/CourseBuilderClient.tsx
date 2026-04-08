"use client";

import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  ArchiveBoxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon, // <-- FIX: Renamed from DownloadIcon
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

interface Lesson {
  id: string;
  title: string;
  type: 'Video' | 'Text' | 'Quiz' | 'Download';
  duration: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  status: 'Draft' | 'Published';
}

const initialCourse: Course = {
  id: 'c-growth',
  title: 'High-Impact Growth Strategy Masterclass',
  description: 'A 12-module program designed to turn solo consultants into agency owners.',
  status: 'Draft',
  modules: [
    {
      id: 'm1',
      title: 'Module 1: The Foundation',
      lessons: [
        { id: 'l1', title: 'Welcome & Program Overview', type: 'Video', duration: '5 min' },
        { id: 'l2', title: 'Defining Your Niche Statement', type: 'Text', duration: '10 min' },
      ],
    },
    {
      id: 'm2',
      title: 'Module 2: Lead Generation Systems',
      lessons: [
        { id: 'l3', title: 'Automating Outreach Workflow', type: 'Video', duration: '15 min' },
        { id: 'l4', title: 'The Cold Outreach Template Pack', type: 'Download', duration: '—' },
        { id: 'l5', title: 'End of Module Quiz', type: 'Quiz', duration: '15 min' },
      ],
    },
  ],
};

const getLessonIcon = (type: Lesson['type']) => {
  switch (type) {
    case 'Video': return VideoCameraIcon;
    case 'Text': return DocumentTextIcon;
    case 'Quiz': return ClipboardDocumentIcon;
    case 'Download': return ArrowDownTrayIcon; // <-- FIX: Changed to ArrowDownTrayIcon
    default: return DocumentTextIcon;
  }
};

// --- HELPER COMPONENTS ---

// Card for course settings overview
const CourseSettingsCard: React.FC<{ course: Course, onPublish: () => void }> = ({ course, onPublish }) => (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ArchiveBoxIcon className="w-5 h-5 text-indigo-500" /> Course Details
        </h3>
        <p className="2xl font-extrabold text-indigo-600">{course.title}</p>
        <p className="text-sm text-gray-600 italic">{course.description}</p>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {course.status}
            </span>
            <button
                onClick={onPublish}
                disabled={course.status === 'Published'}
                className="flex items-center gap-1 text-sm px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
            >
                {course.status === 'Published' ? <CheckCircleIcon className="w-4 h-4" /> : <GlobeAltIcon className="w-4 h-4" />}
                {course.status === 'Published' ? 'Live' : 'Publish Course'}
            </button>
        </div>
    </div>
);


// --- MAIN COMPONENT ---
export default function CourseBuilderClient() {
  const [course, setCourse] = useState<Course>(initialCourse);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(course.modules[0]?.lessons[0]?.id || null);

  // Derive the currently selected module and lesson
  const { selectedModule, selectedLesson } = useMemo(() => {
    let currentModule: Module | undefined;
    let currentLesson: Lesson | undefined;

    for (const mod of course.modules) {
      currentLesson = mod.lessons.find(l => l.id === selectedLessonId);
      if (currentLesson) {
        currentModule = mod;
        break;
      }
    }
    return { selectedModule: currentModule, selectedLesson: currentLesson };
  }, [course, selectedLessonId]);

  // --- HANDLERS ---

  const handlePublish = () => {
      setCourse(prev => ({ ...prev, status: 'Published' }));
      // NOTE: Replaced standard alert() with a console log for better compatibility.
    //   console.log('Course published! Go to the Programs page to view it live.'); 
  };

  const handleUpdateLessonTitle = (newTitle: string) => {
    if (!selectedModule || !selectedLesson) return;

    setCourse(prevCourse => ({
        ...prevCourse,
        modules: prevCourse.modules.map(mod => 
            mod.id === selectedModule.id 
                ? { 
                    ...mod, 
                    lessons: mod.lessons.map(lesson => 
                        lesson.id === selectedLesson.id ? { ...lesson, title: newTitle } : lesson
                    ) 
                } 
                : mod
        ),
        status: 'Draft',
    }));
  };

  const handleAddModule = () => {
    const newModule: Module = {
        id: `m${Date.now()}`,
        title: `New Module ${course.modules.length + 1}`,
        lessons: [],
    };
    setCourse(prev => ({ ...prev, modules: [...prev.modules, newModule], status: 'Draft' }));
  };
  
  const handleAddLesson = (moduleId: string) => {
      const newLesson: Lesson = {
          id: `l${Date.now()}`,
          title: 'New Video Lesson',
          type: 'Video',
          duration: '10 min',
      };
      setCourse(prevCourse => {
          const updatedModules = prevCourse.modules.map(mod => {
              if (mod.id === moduleId) {
                  return { ...mod, lessons: [...mod.lessons, newLesson] };
              }
              return mod;
          });
          return { ...prevCourse, modules: updatedModules, status: 'Draft' };
      });
      setSelectedLessonId(newLesson.id);
  };
  
  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
      setCourse(prevCourse => {
          const updatedModules = prevCourse.modules.map(mod => {
              if (mod.id === moduleId) {
                  return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
              }
              return mod;
          });
          return { ...prevCourse, modules: updatedModules, status: 'Draft' };
      });
      if (selectedLessonId === lessonId) setSelectedLessonId(null);
  };

  // --- RENDER LOGIC: Structure Panel (Left) ---

  const StructurePanel = () => (
    <div className="p-6 h-full bg-white rounded-3xl shadow-xl overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-indigo-500" /> Course Structure
            </h2>
            <button 
                onClick={handleAddModule}
                className="flex items-center gap-1 text-sm px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
                <PlusCircleIcon className="w-4 h-4" /> Add Module
            </button>
        </div>

        {course.modules.map((mod, modIndex) => (
            <div key={mod.id} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {/* Module Header */}
                <div className="flex justify-between items-center font-bold text-gray-800 cursor-pointer mb-3">
                    <span className="truncate">{mod.title}</span>
                    <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleAddLesson(mod.id)} title="Add Lesson" className="p-1 rounded-full text-indigo-500 hover:bg-indigo-100 transition">
                            <PlusCircleIcon className="w-4 h-4" />
                        </button>
                        <button title="Edit Module" className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition">
                            <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button title="Move Down" className="p-1 rounded-full text-gray-500 hover:bg-gray-200 transition">
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Lessons List */}
                <ul className="space-y-1 ml-2 border-l border-gray-200 pl-3">
                    {mod.lessons.map((lesson) => {
                        const Icon = getLessonIcon(lesson.type);
                        const isSelected = lesson.id === selectedLessonId;
                        return (
                            <li 
                                key={lesson.id} 
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                                    isSelected ? 'bg-amber-100 text-amber-800 font-semibold border-l-4 border-amber-500' : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-indigo-500'}`} />
                                    <span className="truncate">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs shrink-0">
                                    {lesson.type !== 'Download' && <span className="text-gray-500">{lesson.duration}</span>}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteLesson(mod.id, lesson.id); }} 
                                        title="Delete Lesson"
                                        className={`p-1 rounded-full ${isSelected ? 'text-red-600 hover:bg-red-200' : 'text-gray-400 hover:text-red-500'}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        ))}
    </div>
  );

  // --- RENDER LOGIC: Content Editor (Right) ---

  const ContentEditor = () => {
    if (!selectedLesson) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px] bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300">
                <p className="text-xl text-gray-500 flex items-center gap-2">
                    <PencilSquareIcon className="w-6 h-6" /> Select a lesson to begin editing.
                </p>
            </div>
        );
    }
    
    const Icon = getLessonIcon(selectedLesson.type);

    return (
      <div className="p-8 h-full bg-white rounded-3xl shadow-xl overflow-y-auto">
        <header className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                <Icon className="w-8 h-8 text-amber-500" /> {selectedLesson.type} Editor
            </h2>
            <p className="text-sm text-gray-500 mt-1">Editing in **{selectedModule?.title}**</p>
        </header>

        {/* Lesson Title Input */}
        <div className="mb-6">
            <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
            <input
                type="text"
                id="lesson-title"
                value={selectedLesson.title}
                onChange={(e) => handleUpdateLessonTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-semibold focus:ring-amber-500 focus:border-amber-500 transition"
            />
        </div>

        {/* Content Area based on Type */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 min-h-[300px]">
            <h3 className="text-lg font-bold text-gray-700 mb-4">
                {selectedLesson.type} Content
            </h3>
            {selectedLesson.type === 'Video' && (
                <div className="space-y-4">
                    <label htmlFor="video-url" className="block text-sm font-medium text-gray-700">Video URL (e.g., YouTube/Vimeo)</label>
                    <input type="url" id="video-url" placeholder="https://..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" />
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
                    <input type="number" id="duration" defaultValue={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" />
                    <div className="text-center pt-4 text-gray-500 italic">
                        [Placeholder for Video Player or Upload Widget]
                    </div>
                </div>
            )}
            {selectedLesson.type === 'Text' && (
                <div className="space-y-4">
                    <label htmlFor="text-content" className="block text-sm font-medium text-gray-700">Detailed Text Content (Markdown Supported)</label>
                    <textarea id="text-content" rows={10} placeholder="Write your lesson notes here..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500"></textarea>
                </div>
            )}
            {selectedLesson.type === 'Quiz' && (
                <div className="space-y-4 text-gray-600">
                    <p className="font-semibold">Quiz Configuration</p>
                    <div className="p-4 border border-dashed border-purple-300 rounded-lg text-sm text-center">
                        [Placeholder for Question Builder Interface]
                    </div>
                    <label htmlFor="passing-score" className="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                    <input type="number" id="passing-score" defaultValue={80} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" />
                </div>
            )}
            {selectedLesson.type === 'Download' && (
                 <div className="space-y-4 text-gray-600">
                    <p className="font-semibold">Resource File Upload</p>
                    <div className="p-4 border border-dashed border-amber-300 rounded-lg text-sm text-center">
                        [Placeholder for File Upload Widget (PDF, Spreadsheet, etc.)]
                    </div>
                    <button className="w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">Upload File</button>
                </div>
            )}
        </div>
        
        <div className="mt-8 flex justify-end">
             <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition">
                Save Lesson Changes
            </button>
        </div>

      </div>
    );
  };


  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Header --- */}
        <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                Program & Course <span className="text-amber-600">Builder</span>
            </h1>
            <p className="text-base text-gray-500 font-medium mt-1">Design, organize, and publish your digital learning programs.</p>
        </header>
        
        <CourseSettingsCard course={course} onPublish={handlePublish} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8" style={{ minHeight: '800px' }}>
          {/* Left Column: Course Structure */}
          <div className="lg:col-span-2">
            <StructurePanel />
          </div>

          {/* Right Column: Content Editor */}
          <div className="lg:col-span-3">
            <ContentEditor />
          </div>
        </div>

      </div>
    </div>
  );
}
