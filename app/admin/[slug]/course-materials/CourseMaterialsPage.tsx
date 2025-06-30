'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon, // For date
  BookOpenIcon, // Main icon for course materials
  DocumentTextIcon, // For documents (PDF, Doc)
  PlayCircleIcon, // For Videos
  LinkIcon, // For External Links
  PhotoIcon, // For Images
  AcademicCapIcon, // For course context
  MagnifyingGlassIcon, // For search
  CloudArrowDownIcon, // For download/access
} from '@heroicons/react/24/outline';

// Sample Data for Course Materials (could be fetched based on courseId)
const sampleCourseMaterials = [
  {
    id: 'CM001',
    courseId: 'CL101', // Link to Grade 7 Mathematics
    name: 'Chapter 1: Numbers & Operations PDF',
    type: 'PDF',
    description: 'Textbook chapter covering whole numbers, fractions, and decimals. Essential reading for unit 1.',
    uploadedDate: '2025-06-10',
    url: '/materials/CL101_Chapter1.pdf', // Placeholder URL
  },
  {
    id: 'CM002',
    courseId: 'CL101',
    name: 'Introduction to Integers Video',
    type: 'Video',
    description: 'Short animated video explaining positive and negative numbers. Great for visual learners!',
    uploadedDate: '2025-06-12',
    url: 'https://www.youtube.com/watch?v=Kz_2fM6bT5g', // Example YouTube link
  },
  {
    id: 'CM003',
    courseId: 'CL102', // Link to Grade 8 English Language
    name: 'Elements of a Story Handout',
    type: 'PDF',
    description: 'Handout defining plot, character, setting, and theme. Useful for literary analysis.',
    uploadedDate: '2025-06-15',
    url: '/materials/CL102_ElementsOfStory.pdf',
  },
  {
    id: 'CM004',
    courseId: 'CL102',
    name: 'Literary Analysis Rubric',
    type: 'PDF',
    description: 'Detailed rubric outlining grading criteria for literary analysis essays. Please review before submitting.',
    uploadedDate: '2025-06-16',
    url: '/materials/CL102_EssayRubric.pdf',
  },
  {
    id: 'CM005',
    courseId: 'CL103', // Link to Grade 9 Algebra
    name: 'Algebraic Expressions Practice (External Link)',
    type: 'Link',
    description: 'Link to an interactive online platform for extra practice on simplifying algebraic expressions.',
    uploadedDate: '2025-06-18',
    url: 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-and-inequalities/x2f8bb11595b61c86:forms-of-linear-equations/e/linear-equations-1', // Example Khan Academy link
  },
  {
    id: 'CM006',
    courseId: 'CL103',
    name: 'Graphing Linear Equations Slides',
    type: 'PDF', // Representing a presentation/slides as PDF for simplicity
    description: 'Slides covering slope-intercept form and various graphing techniques for linear equations.',
    uploadedDate: '2025-06-20',
    url: '/materials/CL103_GraphingLinear.pdf',
  },
  {
    id: 'CM007',
    courseId: 'CL104', // Link to Grade 10 Geometry
    name: 'Geometry Formulas Cheat Sheet',
    type: 'Image', // Example of an image material
    description: 'Quick reference guide for common geometry formulas and theorems.',
    uploadedDate: '2025-06-22',
    url: 'https://placehold.co/600x400/FF0000/FFFFFF?text=Geometry+Formulas', // Placeholder image URL
  },
];

// Sample classes to get context (like name and teacher) for the header
const sampleCoursesContext = [
    { id: 'CL101', name: 'Grade 7 Mathematics', teacherName: 'Mr. John Doe' },
    { id: 'CL102', name: 'Grade 8 English Language', teacherName: 'Mrs. Jane Smith' },
    { id: 'CL103', name: 'Grade 9 Algebra', teacherName: 'Mr. John Doe' },
    { id: 'CL104', name: 'Grade 10 Geometry', teacherName: 'Mr. John Doe' },
    // Add other classes relevant to sampleCourseMaterials
];


export default function CourseMaterialsPage() {
  // For demonstration, let's pick a default course ID.
  // In a real application, this would come from URL parameters (e.g., /student/courses/CL101/materials)
  const [currentCourseId, setCurrentCourseId] = useState('CL101');

  const courseContext = sampleCoursesContext.find(c => c.id === currentCourseId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
      case 'Video': return <PlayCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'Link': return <LinkIcon className="h-5 w-5 text-purple-500" />;
      case 'Image': return <PhotoIcon className="h-5 w-5 text-green-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const materialsForCurrentCourse = useMemo(() => {
    return sampleCourseMaterials.filter(material => material.courseId === currentCourseId);
  }, [currentCourseId]);

  const uniqueMaterialTypes = useMemo(() => Array.from(new Set(materialsForCurrentCourse.map(m => m.type))).sort(), [materialsForCurrentCourse]);

  const filteredMaterials = materialsForCurrentCourse.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || material.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime()); // Sort by most recent uploaded date

  const totalMaterials = materialsForCurrentCourse.length;


  const handleAccessMaterial = (url: string, type: string) => {
    if (url) {
      window.open(url, '_blank'); // Open in new tab
    } else {
      alert("Material URL is not available.");
    }
  };

  if (!courseContext) {
    return (
      <div className="p-8 text-center bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Course Materials</h1>
        <p className="text-gray-600">Please select a valid course to view its materials.</p>
        {/* Simple dropdown to pick a class for demo purposes */}
        <select
          value={currentCourseId}
          onChange={(e) => setCurrentCourseId(e.target.value)}
          className="mt-6 block mx-auto py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">-- Select a Course --</option>
          {sampleCoursesContext.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Materials for: {courseContext.name}
            <span className="ml-2 text-blue-600 text-base sm:text-xl">📖</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Managed by {courseContext.teacherName}. Browse all resources for this course.</p>
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
              <p className="text-sm font-medium text-gray-600">Total Materials</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalMaterials}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <AcademicCapIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Material Types</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {uniqueMaterialTypes.length > 0 ? uniqueMaterialTypes.map(type => (
                  <span key={type} className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    {type}
                  </span>
                )) : <span className="text-xs text-gray-500">N/A</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CalendarDaysIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {filteredMaterials.length > 0 ? new Date(filteredMaterials[0].uploadedDate).toLocaleDateString() : 'N/A'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Course Materials List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-indigo-500" /> All Course Materials
          </h3>
          {/* For demo: Class selection dropdown for easy switching */}
          <select
            value={currentCourseId}
            onChange={(e) => setCurrentCourseId(e.target.value)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {sampleCoursesContext.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or description..."
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
              {uniqueMaterialTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Grid/List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="bg-gray-50 rounded-lg shadow-md border border-gray-200 p-5 flex flex-col justify-between
                           hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              >
                <div className="flex items-center gap-3 mb-3">
                  {getMaterialIcon(material.type)}
                  <h4 className="text-lg font-semibold text-gray-900 flex-grow line-clamp-1">{material.name}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{material.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3 mt-auto">
                  <span>Uploaded: {new Date(material.uploadedDate).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleAccessMaterial(material.url, material.type)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md
                               hover:bg-blue-200 transition-colors duration-150"
                  >
                    Access <CloudArrowDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-3 p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
              <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No materials available for this course yet.</p>
              <p className="text-sm mt-2">Check back later or contact your teacher for more resources.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
