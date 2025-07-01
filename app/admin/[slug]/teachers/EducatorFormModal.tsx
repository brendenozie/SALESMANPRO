import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // For profile picture preview
import { XMarkIcon, UserCircleIcon, BriefcaseIcon, PhoneIcon, MapPinIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // New icons for sections
import { EducatorType } from './TeachersClient';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export type DepartmentOption = {
  id: string;
  name: string;
};

interface EducatorFormModalProps {
  educatorData?: EducatorType | null;
  onClose: () => void;
  // Adjusted onSave type to match the client component's handleSaveEducator
  onSave: (data: Omit<EducatorType, 'id' | 'userId' | 'loginCode' | 'totalStudents' | 'totalCoursesTaught' | 'totalClassesScheduled' | 'totalExamsCreated' | 'totalMaterialsUploaded' | 'createdAt' | 'updatedAt' | 'departmentName'> & { id?: string; userId?: string }) => Promise<void>;
  allDepartments: DepartmentOption[];
  isLoading: boolean;
  companyId: string; // Pass companyId to the modal for the save function
}

const EducatorFormModal: React.FC<EducatorFormModalProps> = ({ educatorData, onClose, onSave, allDepartments, isLoading, companyId }) => {
  const [formData, setFormData] = useState({
    id: educatorData?.id || '',
    userId: educatorData?.userId || '',
    name: educatorData?.name || '',
    email: educatorData?.email || '',
    profilePicture: educatorData?.profilePicture || '',
    phone: educatorData?.phone || '',
    bio: educatorData?.bio || '',
    address: educatorData?.address || '',
    departmentId: educatorData?.departmentId || '',
  });

  // Effect to update form data if educatorData changes (e.g., when switching from Add to Edit)
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
      });
    } else {
      setFormData({
        id: '', userId: '', name: '', email: '', profilePicture: '',
        phone: '', bio: '', address: '', departmentId: ''
      });
    }
  }, [educatorData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave({ ...formData, companyId }); // Ensure companyId is passed with the payload
  };

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
                    loader={loader}
                    alt="Profile Preview"
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
