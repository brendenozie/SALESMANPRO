'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon, // Main icon for subjects
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add subject
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  AcademicCapIcon, // For courses count
  CubeTransparentIcon, // For subject type (Core/Elective)
} from '@heroicons/react/24/outline';

// Sample Subject Data (independent definitions)
const sampleSubjectsData = [
  {
    id: 'SUB001',
    name: 'Mathematics',
    description: 'Covers arithmetic, algebra, geometry, trigonometry, and calculus.',
    type: 'Core', // Core, Elective, Other
  },
  {
    id: 'SUB002',
    name: 'English',
    description: 'Focuses on language arts, literature, composition, and communication.',
    type: 'Core',
  },
  {
    id: 'SUB003',
    name: 'Science',
    description: 'Encompasses biology, chemistry, physics, and environmental science.',
    type: 'Core',
  },
  {
    id: 'SUB004',
    name: 'Social Studies',
    description: 'Includes history, geography, civics, and economics.',
    type: 'Core',
  },
  {
    id: 'SUB005',
    name: 'Computer Science',
    description: 'Introduction to programming, algorithms, and digital literacy.',
    type: 'Elective',
  },
  {
    id: 'SUB006',
    name: 'Arts',
    description: 'Visual arts, performing arts, and music education.',
    type: 'Elective',
  },
  {
    id: 'SUB007',
    name: 'Physical Education',
    description: 'Promotes physical fitness, sports skills, and healthy living.',
    type: 'Core',
  },
];

// Re-using simplified sample data from 'Courses Management Page' for dynamic counts
const allCourses = [
  { id: 'MATH101', name: 'Algebra I', subject: 'Mathematics', level: 'Grade 9', status: 'Active' },
  { id: 'ENG102', name: 'Literary Analysis', subject: 'English', level: 'Grade 10', status: 'Active' },
  { id: 'SCI201', name: 'Biology', subject: 'Science', level: 'Grade 9', status: 'Active' },
  { id: 'HIST301', name: 'World History I', subject: 'Social Studies', level: 'Grade 10', status: 'Active' },
  { id: 'COMP401', name: 'Introduction to Programming', subject: 'Computer Science', level: 'Grade 11', status: 'Active' },
  { id: 'PHY302', name: 'Advanced Physics', subject: 'Science', level: 'Grade 11', status: 'Archived' },
  { id: 'ART101', name: 'Drawing Basics', subject: 'Arts', level: 'Grade 7', status: 'Active' },
  { id: 'PE101', name: 'Fitness and Wellness', subject: 'Physical Education', level: 'Grade 8', status: 'Active' },
  { id: 'MATH102', name: 'Geometry', subject: 'Mathematics', level: 'Grade 10', status: 'Active' },
];


// Type for Subject data (without id, for form input)
type SubjectInput = {
  name: string;
  description: string;
  type: string;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(sampleSubjectsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<null | (SubjectInput & { id: string })>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate dynamic data for each subject (e.g., number of courses under it)
  const subjectsWithCounts = useMemo(() => {
    return subjects.map(sub => {
      const coursesCount = allCourses.filter(course => course.subject === sub.name).length;
      return { ...sub, coursesCount };
    });
  }, [subjects]); // Recalculate if subjects state changes

  // Overview stats
  const totalSubjects = subjects.length;
  const coreSubjectsCount = subjects.filter(sub => sub.type === 'Core').length;
  const electiveSubjectsCount = subjects.filter(sub => sub.type === 'Elective').length;

  const filteredSubjects = subjectsWithCounts.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(sub =>
    filterType === 'All' || sub.type === filterType
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleAddNewSubject = (newSubjectData: SubjectInput) => {
    const newId = `SUB${String(subjects.length + 1).padStart(3, '0')}`; // Simple ID generation
    setSubjects([...subjects, { id: newId, ...newSubjectData }]);
    setShowFormModal(false);
  };

  const handleEditSubject = (updatedSubjectData: SubjectInput & { id?: string }) => {
    if (!updatedSubjectData.id) return; // Ensure id is present
    setSubjects(subjects.map(sub => sub.id === updatedSubjectData.id ? { ...updatedSubjectData, id: updatedSubjectData.id } : sub));
    setShowFormModal(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm("Are you sure you want to delete this subject? This will also affect any courses categorized under it.")) { // Use custom modal in real app
      setSubjects(subjects.filter(sub => sub.id !== subjectId));
    }
  };

  // --- Subject Form Modal ---
  type SubjectFormModalProps = {
    subjectData?: (SubjectInput & { id: string }) | null;
    onClose: () => void;
    onSave: (data: SubjectInput & { id?: string }) => void;
    isEdit?: boolean;
  };

  const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ subjectData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(subjectData || {
      name: '', description: '', type: 'Core'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Subject: ${formData.name}` : 'Add New Subject'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Subject Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="Core">Core Subject</option>
                <option value="Elective">Elective Subject</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Add Subject'}
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
            Subjects Management
            <span className="ml-2 text-green-600 text-base sm:text-xl">📚</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Define and manage the school's academic subjects.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BookOpenIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalSubjects}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Core Subjects</p>
              <h2 className="text-3xl font-bold text-gray-800">{coreSubjectsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CubeTransparentIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Elective Subjects</p>
              <h2 className="text-3xl font-bold text-gray-800">{electiveSubjectsCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500" /> All Subjects
          </h3>
          <button
            onClick={() => { setEditingSubject(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Subject
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
              placeholder="Search by subject name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses Offered</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                           ${subject.type === 'Core' ? 'bg-green-100 text-green-800' :
                             subject.type === 'Elective' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            {subject.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.coursesCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{subject.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingSubject(subject); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Subject"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Subject"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No subjects found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <SubjectFormModal subjectData={editingSubject} onClose={() => setShowFormModal(false)} onSave={editingSubject ? handleEditSubject : handleAddNewSubject} isEdit={!!editingSubject} />}
    </div>
  );
}
