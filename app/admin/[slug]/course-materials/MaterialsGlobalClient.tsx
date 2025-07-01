'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderOpenIcon, // Main icon for global materials
  PlusCircleIcon, // Add material
  PencilIcon, // Edit material
  TrashIcon, // Delete material
  MagnifyingGlassIcon, // Search
  CalendarDaysIcon, // Date
  DocumentTextIcon, // Document type
  PlayCircleIcon, // Video type
  LinkIcon, // Link type
  PhotoIcon, // Image type
  MusicalNoteIcon, // Audio type
  UserIcon, // Uploader
  BookOpenIcon, // Course icon
  TagIcon, // Academic Level icon
  XMarkIcon, // Error close
  EnvelopeIcon, // For email
} from '@heroicons/react/24/outline';

// Import the MaterialFormModal (will be slightly adjusted or duplicated for this context)
import MaterialFormModal from './MaterialFormModal';

// --- Type Definitions (matching API response) ---
export type CourseMaterialType = {
  id: string;
  courseId: string;
  courseTitle: string; // Flattened for display
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  linkUrl?: string | null;
  type: 'DOCUMENT' | 'VIDEO' | 'LINK' | 'IMAGE' | 'AUDIO' | 'OTHER';
  uploadedById: string;
  uploadedByName?: string; // Flattened for display
  uploadedByEmail?: string; // Flattened for display
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  instructorName?: string;
  academicLevels: { id: string; name: string }[]; // Include academic levels for filtering
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

interface MaterialsGlobalClientProps {
  initialMaterials: CourseMaterialType[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allAcademicLevels: AcademicLevelOption[];
  companyId: string;
  apiUrl: string;
}

export default function MaterialsGlobalClient({ initialMaterials, allCourses, allEducators, allAcademicLevels, companyId, apiUrl }: MaterialsGlobalClientProps) {
  const [materials, setMaterials] = useState<CourseMaterialType[]>(initialMaterials);
  const [courses, setCourses] = useState<CourseOption[]>(allCourses);
  const [educators, setEducators] = useState<EducatorOption[]>(allEducators);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All'); // New filter
  const [filterAcademicLevel, setFilterAcademicLevel] = useState('All'); // New filter
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterialType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Map material types to icons
  const materialTypeIcons = {
    DOCUMENT: <DocumentTextIcon className="h-5 w-5 text-blue-500" />,
    VIDEO: <PlayCircleIcon className="h-5 w-5 text-red-500" />,
    LINK: <LinkIcon className="h-5 w-5 text-green-500" />,
    IMAGE: <PhotoIcon className="h-5 w-5 text-purple-500" />,
    AUDIO: <MusicalNoteIcon className="h-5 w-5 text-orange-500" />,
    OTHER: <FolderOpenIcon className="h-5 w-5 text-gray-500" />,
  };

  // --- Data Fetching and Management ---
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const materialsRes = await fetch(`${apiUrl}/course-materials?companyId=${encodeURIComponent(companyId)}`);
      const coursesRes = await fetch(`${apiUrl}/courses?companyId=${encodeURIComponent(companyId)}`);
      const educatorsRes = await fetch(`${apiUrl}/educators?companyId=${encodeURIComponent(companyId)}`);
      const academicLevelsRes = await fetch(`${apiUrl}/academic-levels?companyId=${encodeURIComponent(companyId)}`);

      if (materialsRes.ok) {
        const data: CourseMaterialType[] = await materialsRes.json();
        setMaterials(data);
      } else {
        const errorData = await materialsRes.json();
        setError(errorData.message || "Failed to fetch course materials.");
        setMaterials(initialMaterials);
      }

      if (coursesRes.ok) {
        const fetchedCourses = (await coursesRes.json()) as any[];
        setCourses(fetchedCourses.map(c => ({
          id: c.id,
          title: c.title,
          instructorName: c.instructorName,
          academicLevels: c.academicLevels,
        })));
      } else {
        const errorData = await coursesRes.json();
        setError(errorData.message || "Failed to fetch courses.");
        setCourses(allCourses);
      }

      if (educatorsRes.ok) {
        const fetchedEducators = (await educatorsRes.json()) as any[];
        setEducators(fetchedEducators.map(e => ({ id: e.id, name: e.name, email: e.email })));
      } else {
        const errorData = await educatorsRes.json();
        setError(errorData.message || "Failed to fetch educators.");
        setEducators(allEducators);
      }

      if (academicLevelsRes.ok) {
        const data: AcademicLevelOption[] = await academicLevelsRes.json();
        setAcademicLevels(data);
      } else {
        const errorData = await academicLevelsRes.json();
        setError(errorData.message || "Failed to fetch academic levels.");
        setAcademicLevels(allAcademicLevels);
      }

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
      setMaterials(initialMaterials);
      setCourses(allCourses);
      setEducators(allEducators);
      setAcademicLevels(allAcademicLevels);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, companyId, initialMaterials, allCourses, allEducators, allAcademicLevels]);

  useEffect(() => {
    // If initial data from server is empty, try fetching on client side
    if (initialMaterials.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allAcademicLevels.length === 0) {
      fetchAllData();
    }
  }, [fetchAllData, initialMaterials, allCourses, allEducators, allAcademicLevels]);


  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = (material.title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (material.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (material.uploadedByName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
                            (material.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

      const matchesType = filterType === 'All' || material.type === filterType;
      const matchesCourse = filterCourse === 'All' || material.courseId === filterCourse;

      // Check if material's course is associated with the filtered academic level
      const matchesAcademicLevel = filterAcademicLevel === 'All' ||
                                   courses.find(c => c.id === material.courseId)?.academicLevels.some(al => al.id === filterAcademicLevel);

      return matchesSearch && matchesType && matchesCourse && matchesAcademicLevel;
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort by creation date
  }, [materials, searchTerm, filterType, filterCourse, filterAcademicLevel, courses]);

  // --- API Interaction Functions ---
  const handleSaveMaterial = async (materialData: Omit<CourseMaterialType, 'id' | 'courseTitle' | 'uploadedByName' | 'uploadedByEmail' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    setIsLoading(true);
    setError(null);
    const method = materialData.id ? 'PATCH' : 'POST';
    
    try {

      const url = materialData.id ? `${apiUrl}/course-materials/${materialData.id}` : `${apiUrl}/course-materials`;

      const payload = {
        ...materialData,
      };

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchAllData(); // Re-fetch to get the latest data
        setShowFormModal(false);
        setEditingMaterial(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'add' : 'update'} material.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'adding' : 'updating'} material.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this course material? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/course-materials/${materialId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete course material.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting course material.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalMaterials = materials.length;
  const totalDocuments = materials.filter(m => m.type === 'DOCUMENT').length;
  const totalVideos = materials.filter(m => m.type === 'VIDEO').length;
  const totalLinks = materials.filter(m => m.type === 'LINK').length;


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FolderOpenIcon className="h-10 w-10 text-blue-600" />
            Global Course Materials
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Manage all learning resources across all courses in your institution.
          </p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <FolderOpenIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Materials</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalMaterials}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <DocumentTextIcon className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Documents</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalDocuments}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <PlayCircleIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Videos</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalVideos}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <LinkIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">External Links</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalLinks}</h2>
          </div>
        </div>
      </div>

      {/* Materials List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FolderOpenIcon className="h-6 w-6 text-indigo-500" /> All Materials
          </h3>
          <button
            onClick={() => { setEditingMaterial(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-base font-medium"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Material
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
              placeholder="Search by title, description, course, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Types</option>
              {Object.keys(materialTypeIcons).map(type => (
                <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterAcademicLevel}
              onChange={(e) => setFilterAcademicLevel(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
            >
              <option value="All">All Academic Levels</option>
              {academicLevels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Material</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                          {materialTypeIcons[material.type as keyof typeof materialTypeIcons]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{material.title}</div>
                          <div className="text-xs text-gray-500 truncate w-48">{material.description || 'No description.'}</div>
                          {(material.fileUrl || material.linkUrl) && (
                            <a
                              href={material.fileUrl || material.linkUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs mt-1 flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" /> View Content
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link
                        href={`/admin/${companyId}/courses/${material.courseId}/materials`}
                        className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                        title={`View all materials for ${material.courseTitle}`}
                      >
                        <BookOpenIcon className="h-4 w-4" /> {material.courseTitle || 'N/A'}
                      </Link>
                      {/* Display academic levels associated with the course */}
                      {courses.find(c => c.id === material.courseId)?.academicLevels && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {courses.find(c => c.id === material.courseId)?.academicLevels.map(level => (
                            <span key={level.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <TagIcon className="h-3 w-3 mr-1" /> {level.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${material.type === 'DOCUMENT' ? 'bg-blue-100 text-blue-800' :
                                          material.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
                                          material.type === 'LINK' ? 'bg-green-100 text-green-800' :
                                          material.type === 'IMAGE' ? 'bg-purple-100 text-purple-800' :
                                          material.type === 'AUDIO' ? 'bg-orange-100 text-orange-800' :
                                          'bg-gray-100 text-gray-800'}
                                        `}>
                        {material.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4 text-gray-500" /> {material.uploadedByName || 'N/A'}
                      </div>
                      {material.uploadedByEmail && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <EnvelopeIcon className="h-3 w-3 text-gray-400" /> {material.uploadedByEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingMaterial(material); setShowFormModal(true); }}
                          className="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                          title="Edit Material"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                          title="Delete Material"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <FolderOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No course materials found matching your criteria.</p>
                    <p className="text-sm mt-2">Try adjusting your filters or add a new material.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <MaterialFormModal
          materialData={editingMaterial}
          onClose={() => { setShowFormModal(false); setEditingMaterial(null); }}
          onSave={handleSaveMaterial}
          isLoading={isLoading}
          courseId={editingMaterial?.courseId || ''} // Pass existing courseId for edit, or empty for new
          allEducators={educators}
          allCourses={courses} // Pass all courses to the modal for selection
        />
      )}
    </div>
  );
}
