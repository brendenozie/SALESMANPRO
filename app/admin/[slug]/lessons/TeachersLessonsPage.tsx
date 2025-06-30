'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon, // Main icon for lessons/learning
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add lesson
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  AcademicCapIcon, // For class association
  TagIcon, // For lesson status
  LightBulbIcon, // For objectives/tips
  ClockIcon, // For duration/time
} from '@heroicons/react/24/outline';

// Sample Data for Teacher's Lessons
const teacherName = "Mr. John Doe"; // Placeholder for logged-in teacher's name

const sampleClassesForLessons = [ // Simplified list of classes for filtering
    { id: 'CL101', name: 'Grade 7 Mathematics' },
    { id: 'CL103', name: 'Grade 9 Algebra' },
];

const sampleLessons = [
  {
    id: 'L001',
    title: 'Introduction to Linear Equations',
    classId: 'CL103',
    className: 'Grade 9 Algebra',
    date: '2025-07-01',
    duration: '45 mins',
    objectives: 'Students will be able to identify linear equations and solve one-step equations.',
    activities: 'Lecture, guided practice, small group work.',
    materials: 'Whiteboard, markers, worksheet 1.1',
    assessment: 'Exit ticket, homework problems.',
    status: 'Planned', // Planned, Taught, Draft
  },
  {
    id: 'L002',
    title: 'Fractions and Decimals Review',
    classId: 'CL101',
    className: 'Grade 7 Mathematics',
    date: '2025-07-02',
    duration: '45 mins',
    objectives: 'Students will review addition and subtraction of fractions and decimals.',
    activities: 'Interactive presentation, pair-share activity.',
    materials: 'Projector, "Fraction Fun" game',
    assessment: 'Quick quiz.',
    status: 'Planned',
  },
  {
    id: 'L003',
    title: 'Solving Systems by Substitution',
    classId: 'CL103',
    className: 'Grade 9 Algebra',
    date: '2025-06-25', // Past date
    duration: '45 mins',
    objectives: 'Students will apply the substitution method to solve systems of linear equations.',
    activities: 'Guided example, independent practice.',
    materials: 'Textbook, whiteboard',
    assessment: 'Homework set 2.',
    status: 'Taught',
  },
  {
    id: 'L004',
    title: 'Introduction to Geometry',
    classId: 'CL101',
    className: 'Grade 7 Mathematics',
    date: '2025-06-20', // Past date
    duration: '45 mins',
    objectives: 'Students will define basic geometric terms (point, line, plane) and identify shapes.',
    activities: 'Visual examples, brainstorming.',
    materials: 'Geometry flashcards, protractors',
    assessment: 'Class discussion.',
    status: 'Taught',
  },
];

type Lesson = {
  id: string;
  title: string;
  classId: string;
  className: string;
  date: string;
  duration: string;
  objectives: string;
  activities: string;
  materials: string;
  assessment: string;
  status: string;
};

export default function TeachersLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const uniqueStatuses = useMemo(() => Array.from(new Set(lessons.map(l => l.status))).sort(), [lessons]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lesson.objectives.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || lesson.classId === filterClass;
    const matchesStatus = filterStatus === 'All' || lesson.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

  const totalLessons = lessons.length;
  const plannedLessons = lessons.filter(l => l.status === 'Planned').length;
  const taughtLessons = lessons.filter(l => l.status === 'Taught').length;

  const lessonsToday = lessons.filter(l => new Date(l.date).toLocaleDateString() === new Date().toLocaleDateString()).length;

  // Function to get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-100 text-blue-800';
      case 'Taught': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Event handlers
  const handleAddNewLesson = (newLessonData: Omit<Lesson, 'id'>) => {
    const newId = `L${String(lessons.length + 1).padStart(3, '0')}`; // Simple ID generation
    setLessons([...lessons, { id: newId, ...newLessonData }]);
    setShowFormModal(false);
  };

  const handleEditLesson = (updatedLessonData: Lesson) => {
    setLessons(lessons.map(lesson => lesson.id === updatedLessonData.id ? updatedLessonData : lesson));
    setShowFormModal(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (confirm("Are you sure you want to delete this lesson plan?")) { // Use custom modal in real app
      setLessons(lessons.filter(lesson => lesson.id !== lessonId));
    }
  };

  // --- Lesson Form Modal ---
  type LessonFormModalProps = {
    lessonData: Lesson | null;
    onClose: () => void;
    onSave: (lesson: any) => void;
    isEdit?: boolean;
  };

  const LessonFormModal: React.FC<LessonFormModalProps> = ({ lessonData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(lessonData || {
      title: '', classId: '', date: new Date().toISOString().split('T')[0], duration: '45 mins', objectives: '', activities: '', materials: '', assessment: '', status: 'Planned',
    });

    // Set default class if available and not in edit mode
    React.useEffect(() => {
        if (!isEdit && sampleClassesForLessons.length > 0 && !formData.classId) {
            setFormData(prev => ({ ...prev, classId: sampleClassesForLessons[0].id }));
        }
    }, [isEdit, formData.classId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Add className before saving
      const selectedClass = sampleClassesForLessons.find(c => c.id === formData.classId);
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
                {sampleClassesForLessons.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Lesson Plans
            <span className="ml-2 text-teal-600 text-base sm:text-xl">📝</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Organize and manage your teaching lesson plans.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lessons</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalLessons}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TagIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Planned Lessons</p>
              <h2 className="text-3xl font-bold text-gray-800">{plannedLessons}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Taught</p>
              <h2 className="text-3xl font-bold text-gray-800">{taughtLessons}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CalendarDaysIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Lessons Today</p>
              <h2 className="text-3xl font-bold text-gray-800">{lessonsToday}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500" /> All Lesson Plans
          </h3>
          <button
            onClick={() => { setEditingLesson(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Lesson
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, objectives, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Classes</option>
              {sampleClassesForLessons.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lessons Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectives</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.length > 0 ? (
                filteredLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lesson.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lesson.className}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lesson.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lesson.status)}`}>
                        {lesson.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{lesson.objectives}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingLesson(lesson); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Lesson"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Lesson"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No lesson plans found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <LessonFormModal lessonData={editingLesson} onClose={() => setShowFormModal(false)} onSave={editingLesson ? handleEditLesson : handleAddNewLesson} isEdit={!!editingLesson} />}
    </div>
  );
}
