import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  PlayCircleIcon,
  LinkIcon,
  PhotoIcon,
  MusicalNoteIcon,
  FolderIcon,
  UserIcon,
  Bars3BottomLeftIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

// Assuming types are imported from MaterialsClient.tsx
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

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

interface MaterialFormModalProps {
  materialData?: CourseMaterialType | null;
  onClose: () => void;
  onSave: (data: Omit<CourseMaterialType, 'id' | 'courseTitle' | 'uploadedByName' | 'uploadedByEmail' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  isLoading: boolean;
  courseId: string; // The ID of the course this material belongs to
  allEducators: EducatorOption[];
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ materialData, onClose, onSave, isLoading, courseId, allEducators }) => {
  const [formData, setFormData] = useState({
    id: materialData?.id || '',
    title: materialData?.title || '',
    description: materialData?.description || '',
    fileUrl: materialData?.fileUrl || '',
    linkUrl: materialData?.linkUrl || '',
    type: materialData?.type || 'DOCUMENT',
    uploadedById: materialData?.uploadedById || '',
  });

  useEffect(() => {
    if (materialData) {
      setFormData({
        id: materialData.id,
        title: materialData.title,
        description: materialData.description || '',
        fileUrl: materialData.fileUrl || '',
        linkUrl: materialData.linkUrl || '',
        type: materialData.type,
        uploadedById: materialData.uploadedById,
      });
    } else {
      setFormData({
        id: '', title: '', description: '', fileUrl: '', linkUrl: '', type: 'DOCUMENT', uploadedById: ''
      });
    }
  }, [materialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation for fileUrl/linkUrl based on type
    if (formData.type === 'DOCUMENT' || formData.type === 'IMAGE' || formData.type === 'AUDIO') {
      if (!formData.fileUrl && !formData.linkUrl) {
        alert("For selected material type, either File URL or Link URL is required.");
        return;
      }
      if (formData.fileUrl && formData.linkUrl) {
        alert("Cannot provide both File URL and Link URL for this material type.");
        return;
      }
    } else if (formData.type === 'VIDEO' || formData.type === 'LINK') {
      if (!formData.linkUrl && !formData.fileUrl) {
        alert("For selected material type, Link URL is typically required.");
        return;
      }
      if (formData.fileUrl && formData.linkUrl) {
        alert("Cannot provide both File URL and Link URL for this material type.");
        return;
      }
    }

    await onSave({ ...formData, courseId });
  };

  const materialTypeOptions = [
    { value: 'DOCUMENT', label: 'Document', icon: <DocumentTextIcon className="h-5 w-5 text-blue-500" /> },
    { value: 'VIDEO', label: 'Video', icon: <PlayCircleIcon className="h-5 w-5 text-red-500" /> },
    { value: 'LINK', label: 'Link', icon: <LinkIcon className="h-5 w-5 text-green-500" /> },
    { value: 'IMAGE', label: 'Image', icon: <PhotoIcon className="h-5 w-5 text-purple-500" /> },
    { value: 'AUDIO', label: 'Audio', icon: <MusicalNoteIcon className="h-5 w-5 text-orange-500" /> },
    { value: 'OTHER', label: 'Other', icon: <FolderIcon className="h-5 w-5 text-gray-500" /> },
  ];

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
          {materialData ? `Edit Material: ${materialData.title}` : 'Add New Course Material'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <HashtagIcon className="h-6 w-6 text-indigo-500" /> Material Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Material Type <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {materialTypeOptions.find(opt => opt.value === formData.type)?.icon || <FolderIcon className="h-5 w-5 text-gray-400" />}
                  </div>
                  <select name="type" id="type" value={formData.type} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    {materialTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="uploadedById" className="block text-sm font-medium text-gray-700 mb-1">Uploaded By <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="uploadedById" id="uploadedById" value={formData.uploadedById} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white">
                    <option value="">-- Select Uploader --</option>
                    {allEducators.map(educator => (
                      <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">File URL (for Documents, Images, Audio)</label>
                <input type="url" name="fileUrl" id="fileUrl" value={formData.fileUrl} onChange={handleChange}
                  placeholder="https://example.com/document.pdf"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">Link URL (for Videos, External Links)</label>
                <input type="url" name="linkUrl" id="linkUrl" value={formData.linkUrl} onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=example"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
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
              ) : (materialData ? 'Save Changes' : 'Add Material')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialFormModal;
