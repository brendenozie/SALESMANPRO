'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  FolderOpenIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  LinkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  BookOpenIcon,
  TagIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import MaterialFormModal from './MaterialFormModal';

// --- Type Definitions ---
export type CourseMaterialType = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  linkUrl?: string | null;
  type: 'DOCUMENT' | 'VIDEO' | 'LINK' | 'IMAGE' | 'AUDIO' | 'OTHER';
  uploadedById: string;
  uploadedByName?: string;
  uploadedByEmail?: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  instructorName?: string;
  academicLevels: { id: string; name: string }[];
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
  apiBaseUrl: string;
}

export default function MaterialsGlobalClient({
  initialMaterials,
  allCourses,
  allEducators,
  allAcademicLevels,
  companyId,
  apiBaseUrl
}: MaterialsGlobalClientProps) {
  const [materials, setMaterials] = useState<CourseMaterialType[]>(initialMaterials);
  const [courses, setCourses] = useState<CourseOption[]>(allCourses);
  const [educators, setEducators] = useState<EducatorOption[]>(allEducators);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterAcademicLevel, setFilterAcademicLevel] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterialType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const materialTypeIcons = {
    DOCUMENT: <DocumentTextIcon className="h-5 w-5 text-blue-500" />,
    VIDEO: <PlayCircleIcon className="h-5 w-5 text-red-500" />,
    LINK: <LinkIcon className="h-5 w-5 text-green-500" />,
    IMAGE: <PhotoIcon className="h-5 w-5 text-purple-500" />,
    AUDIO: <MusicalNoteIcon className="h-5 w-5 text-orange-500" />,
    OTHER: <FolderOpenIcon className="h-5 w-5 text-gray-500" />,
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [materialsRes, coursesRes, educatorsRes, academicLevelsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/course-materials?companyId=${encodeURIComponent(companyId)}`),
        fetch(`${apiBaseUrl}/admin/courses?companyId=${encodeURIComponent(companyId)}`),
        fetch(`${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(companyId)}`),
        fetch(`${apiBaseUrl}/admin/academic-levels?companyId=${encodeURIComponent(companyId)}`)
      ]);

      if (materialsRes.ok) setMaterials((await materialsRes.json()).data);
      if (coursesRes.ok) {
        const fetched = (await coursesRes.json()).data as any[];
        setCourses(fetched.map(c => ({ id: c.id, title: c.title, instructorName: c.instructorName, academicLevels: c.academicLevels })));
      }
      if (educatorsRes.ok) {
        const fetched = (await educatorsRes.json()).data as any[];
        setEducators(fetched.map(e => ({ id: e.id, name: e.name, email: e.email })));
      }
      if (academicLevelsRes.ok) setAcademicLevels((await academicLevelsRes.json()).data);

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId]);

  useEffect(() => {
    if (initialMaterials.length === 0 || allCourses.length === 0 || allEducators.length === 0 || allAcademicLevels.length === 0) {
      fetchAllData();
    }
  }, [fetchAllData, initialMaterials, allCourses, allEducators, allAcademicLevels]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = 
        (material.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (material.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (material.uploadedByName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (material.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

      const matchesType = filterType === 'All' || material.type === filterType;
      const matchesCourse = filterCourse === 'All' || material.courseId === filterCourse;
      const matchesAcademicLevel = filterAcademicLevel === 'All' ||
        courses.find(c => c.id === material.courseId)?.academicLevels.some(al => al.id === filterAcademicLevel);

      return matchesSearch && matchesType && matchesCourse && matchesAcademicLevel;
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [materials, searchTerm, filterType, filterCourse, filterAcademicLevel, courses]);

  const handleSaveMaterial = async (materialData: any) => {
    setIsLoading(true);
    setError(null);
    const method = materialData.id ? 'PATCH' : 'POST';
    const url = materialData.id ? `${apiBaseUrl}/admin/course-materials/${materialData.id}` : `${apiBaseUrl}/admin/course-materials`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData),
      });

      if (res.ok) {
        await fetchAllData();
        setShowFormModal(false);
        setEditingMaterial(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to satisfy ${method} operation.`);
      }
    } catch (err: any) {
      setError(err.message || "Network error updating material.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this course material? This action cannot be undone.")) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/course-materials/${materialId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAllData();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete resource.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting component.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* States UI Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading components...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Counter Dashboard Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm"><FolderOpenIcon className="h-8 w-8 text-blue-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Materials</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalMaterials}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm"><DocumentTextIcon className="h-8 w-8 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Documents</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalDocuments}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm"><PlayCircleIcon className="h-8 w-8 text-purple-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">Videos</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalVideos}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm"><LinkIcon className="h-8 w-8 text-yellow-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-600">External Links</p>
            <h2 className="text-3xl font-bold text-gray-800">{totalLinks}</h2>
          </div>
        </div>
      </div>

      {/* Workspace Management List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FolderOpenIcon className="h-6 w-6 text-indigo-500" /> All Materials
          </h3>
          <button
            onClick={() => { setEditingMaterial(null); setShowFormModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-base font-medium focus:outline-none"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Material
          </button>
        </div>

        {/* Inputs and Dropdowns Filter Bar */}
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
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white placeholder-gray-500 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm text-base focus:outline-none"
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
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm text-base focus:outline-none"
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
              className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm text-base focus:outline-none"
            >
              <option value="All">All Academic Levels</option>
              {academicLevels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Materials Data Table Node */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Material</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                <th scope="col" className="relative px-6 py-3 rounded-tr-lg"><span className="sr-only">Actions</span></th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {material.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{material.uploadedByName || 'Institution Staff'}</div>
                      <div className="text-xs text-gray-400">{material.uploadedByEmail || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(material.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => { setEditingMaterial(material); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 font-medium">
                    No course materials found matching your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Material Modal Formulation Layer */}
      {showFormModal && (
        <MaterialFormModal
          apiBaseUrl={apiBaseUrl}
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