import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, UserCircleIcon, BriefcaseIcon, PhoneIcon, MapPinIcon, AcademicCapIcon, TagIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Assuming EducatorType, DepartmentOption, AcademicLevelOption are imported from TeachersClient.tsx
// Redefining here for self-containment of the immersive, but in a real app
// these would be imported from a shared types file or directly from TeachersClient.
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type EducatorType = {
  id: string;
  userId: string;
  loginCode: string;
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId: string;
  departmentId?: string | null; // Can be null
  departmentName?: string;
  academicLevels: AcademicLevelOption[]; // Corrected name
  totalStudents: number; // Now calculated in API response
  totalCoursesTaught: number; // Now calculated in API response
  totalClassesScheduled: number;
  totalExamsCreated: number;
  totalMaterialsUploaded: number;
  totalAttendanceRecords: number;
  totalDiscussionTopics: number;
  totalUploadedMaterials: number;
  totalAssignmentSubmissions: number;
  totalExamSubmissions: number;
  totalGradesRecorded: number;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

interface EducatorFormModalProps {
  isOpen: boolean; // Added isOpen prop for explicit modal control
  educatorData?: EducatorType | null;
  onClose: () => void;
  // Updated onSave signature to reflect that calculated fields are not sent in payload
  onSave: (data: Omit<EducatorType, 'id' | 'userId' | 'loginCode' | 'totalStudents' | 'totalCoursesTaught' | 'totalClassesScheduled' | 'totalExamsCreated' | 'totalMaterialsUploaded' | 'totalAttendanceRecords' | 'totalDiscussionTopics' | 'totalUploadedMaterials' | 'totalAssignmentSubmissions' | 'totalExamSubmissions' | 'totalGradesRecorded' | 'createdAt' | 'updatedAt' | 'departmentName' | 'academicLevels'> & { id?: string; userId?: string; academicLevelIds?: string[] | null }) => Promise<void>;
  allDepartments: DepartmentOption[];
  allAcademicLevels: AcademicLevelOption[]; // All available academic levels
  isLoading: boolean;
  companyId: string;
}

const EducatorFormModal: React.FC<EducatorFormModalProps> = ({ isOpen, educatorData, onClose, onSave, allDepartments, allAcademicLevels, isLoading, companyId }) => {
  const [formData, setFormData] = useState({
    id: educatorData?.id || '',
    userId: educatorData?.userId || '', // userId is needed for PATCH to update user details
    name: educatorData?.name || '',
    email: educatorData?.email || '',
    profilePicture: educatorData?.profilePicture || '',
    phone: educatorData?.phone || '',
    bio: educatorData?.bio || '',
    address: educatorData?.address || '',
    departmentId: educatorData?.departmentId || '',
    academicLevelIds: educatorData?.academicLevels.map(al => al.id) || [], // Initialize with assigned IDs
  });

  useEffect(() => {
    if (educatorData) {
      setFormData({
        id: educatorData.id,
        userId: educatorData.userId,
        name: educatorData.name,
        email: educatorData.email,
        profilePicture: educatorData.profilePicture || '',
        phone: educatorData.phone || '',
        bio: educatorData.bio || '',
        address: educatorData.address || '',
        departmentId: educatorData.departmentId || '',
        academicLevelIds: educatorData.academicLevels.map(al => al.id),
      });
    } else {
      setFormData({
        id: '', userId: '', name: '', email: '', profilePicture: '',
        phone: '', bio: '', address: '', departmentId: '', academicLevelIds: []
      });
    }
  }, [educatorData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const payload: any = {
      ...formData,
      companyId,
      // Ensure departmentId is null if empty string
      departmentId: formData.departmentId === '' ? null : formData.departmentId,
      // Ensure academicLevelIds is null if empty array
      academicLevelIds: formData.academicLevelIds.length === 0 ? null : formData.academicLevelIds,
      // loginCode is generated on backend for POST, not updated via PATCH
      // totalStudents, totalCoursesTaught, etc. are calculated on backend, not sent from frontend
    };

    // Remove id and userId from payload if it's a new educator creation
    if (!educatorData) {
      delete payload.id;
      delete payload.userId; // userId will be created/linked by the backend during POST
    }

    await onSave(payload);
  };

  // Only render the modal if isOpen is true
  if (!isOpen) return null;

  const defaultProfilePic = `https://placehold.co/100x100/E0E7FF/4338CA?text=${formData.name?.charAt(0) || '?'}`;

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
          {educatorData ? `Edit Teacher: ${educatorData.name}` : 'Add New Teacher'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6 text-indigo-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" id="bio" value={formData.bio} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Image
                    className="h-20 w-20 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                    src={formData.profilePicture || defaultProfilePic}
                    alt="Profile Preview"
                    loader={loader}
                    width={80}
                    height={80}
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = defaultProfilePic;
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                  <input type="url" name="profilePicture" id="profilePicture" value={formData.profilePicture} onChange={handleChange}
                    placeholder="https://example.com/pic.jpg"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Organizational Information */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BriefcaseIcon className="h-6 w-6 text-green-500" /> Contact & Organization
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" name="address" id="address" value={formData.address} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="departmentId" id="departmentId" value={formData.departmentId} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Department (Optional) --</option>
                    {allDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Level Assignments */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TagIcon className="h-6 w-6 text-purple-500" /> Assigned Academic Levels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {allAcademicLevels.length > 0 ? allAcademicLevels
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // Sort by sortOrder
                .map(level => (
                  <div key={level.id} className="flex items-center">
                    <input
                      id={`level-${level.id}`}
                      name="academicLevelIds" // Corrected name to match API payload
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
            <p className="mt-2 text-sm text-gray-600">Select all academic levels this educator is assigned to.</p>
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
              ) : (educatorData ? 'Save Changes' : 'Add Teacher')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducatorFormModal;
