import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  BookOpenIcon,
  UserIcon,
  BuildingOffice2Icon,
  StarIcon,
  TagIcon,
  PhotoIcon,
  Bars3BottomLeftIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Assuming types are imported from CoursesClient.tsx
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export type CourseType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  instructorId?: string | null;
  instructorName?: string;
  instructorEmail?: string;
  totalLessons: number;
  rating?: number | null;
  studentsEnrolled: number;
  companyId: string;
  departmentId?: string | null;
  departmentName?: string;
  academicLevels: AcademicLevelOption[];
  createdAt: string;
  updatedAt: string;
};

interface CourseFormModalProps {
  courseData?: CourseType | null;
  onClose: () => void;
  onSave: (data: Omit<CourseType, 'id' | 'totalLessons' | 'studentsEnrolled' | 'createdAt' | 'updatedAt' | 'instructorName' | 'instructorEmail' | 'departmentName' | 'academicLevels'> & { id?: string; academicLevelIds?: string[] | null }) => Promise<void>;
  isLoading: boolean;
  companyId: string;
  allEducators: EducatorOption[];
  allDepartments: DepartmentOption[];
  allAcademicLevels: AcademicLevelOption[];
}

const CourseFormModal: React.FC<CourseFormModalProps> = ({ courseData, onClose, onSave, isLoading, companyId, allEducators, allDepartments, allAcademicLevels }) => {
  const [formData, setFormData] = useState({
    id: courseData?.id || '',
    title: courseData?.title || '',
    description: courseData?.description || '',
    imageUrl: courseData?.imageUrl || '',
    instructorId: courseData?.instructorId || '',
    rating: courseData?.rating || 0,
    departmentId: courseData?.departmentId || '',
    academicLevelIds: courseData?.academicLevels.map(al => al.id) || [], // Initialize with assigned IDs
  });

  useEffect(() => {
    if (courseData) {
      setFormData({
        id: courseData.id,
        title: courseData.title,
        description: courseData.description || '',
        imageUrl: courseData.imageUrl || '',
        instructorId: courseData.instructorId || '',
        rating: courseData.rating || 0,
        departmentId: courseData.departmentId || '',
        academicLevelIds: courseData.academicLevels.map(al => al.id),
      });
    } else {
      setFormData({
        id: '', title: '', description: '', imageUrl: '', instructorId: '', rating: 0, departmentId: '', academicLevelIds: []
      });
    }
  }, [courseData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) || 0 : value, // Parse rating to float
    }));
  };

  const handleAcademicLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentLevels = new Set(prev.academicLevelIds);
      if (checked) {
        currentLevels.add(value);
      } else {
        currentLevels.delete(value);
      }
      return { ...prev, academicLevelIds: Array.from(currentLevels) };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      ...formData,
      companyId,
      instructorId: formData.instructorId === '' ? null : formData.instructorId, // Send null if empty string
      departmentId: formData.departmentId === '' ? null : formData.departmentId, // Send null if empty string
      academicLevelIds: formData.academicLevelIds.length === 0 ? null : formData.academicLevelIds, // Send null if empty array
    };
    await onSave(payload);
  };

  const defaultCourseImage = `https://placehold.co/100x100/E0F2F7/0288D1?text=${formData.title?.charAt(0) || 'C'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {courseData ? `Edit Course: ${courseData.title}` : 'Add New Course'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpenIcon className="h-6 w-6 text-indigo-500" /> Course Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (0.0 - 5.0)</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <StarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" name="rating" id="rating" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="5"
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    className="h-20 w-20 rounded-lg object-cover border-2 border-indigo-200 shadow-md"
                    src={formData.imageUrl || defaultCourseImage}
                    alt="Course Image Preview"
                    width={80}
                    height={80}
                    loader={loader}
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = defaultCourseImage;
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange}
                    placeholder="https://example.com/course.jpg"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
            </div>
          </div>

          {/* Instructor & Department */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-blue-500" /> Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="instructorId" id="instructorId" value={formData.instructorId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Instructor (Optional) --</option>
                    {allEducators.map(educator => (
                      <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="departmentId" id="departmentId" value={formData.departmentId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Department (Optional) --</option>
                    {allDepartments.map(department => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Level Assignments */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TagIcon className="h-6 w-6 text-purple-500" /> Applicable Academic Levels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {allAcademicLevels.length > 0 ? allAcademicLevels
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // Sort by sortOrder
                .map(level => (
                <div key={level.id} className="flex items-center">
                  <input
                    id={`level-${level.id}`}
                    name="academicLevelIds"
                    type="checkbox"
                    value={level.id}
                    checked={formData.academicLevelIds.includes(level.id)}
                    onChange={handleAcademicLevelChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`level-${level.id}`} className="ml-2 block text-sm text-gray-900">
                    {level.name}
                  </label>
                </div>
              )) : (
                <p className="text-sm text-gray-500 col-span-2">No academic levels available. Please add them first.</p>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">Select all academic levels this course is applicable to.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (courseData ? 'Save Changes' : 'Add Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;
