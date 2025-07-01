import React, { useState, useEffect } from 'react';
import { XMarkIcon, TagIcon, DocumentTextIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// Assuming AcademicLevelType is imported from AcademicLevelsClient.tsx
export type AcademicLevelType = {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

interface AcademicLevelFormModalProps {
  academicLevelData?: AcademicLevelType | null;
  onClose: () => void;
  onSave: (data: Omit<AcademicLevelType, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  isLoading: boolean;
  companyId: string;
}

const AcademicLevelFormModal: React.FC<AcademicLevelFormModalProps> = ({ academicLevelData, onClose, onSave, isLoading, companyId }) => {
  
  const [formData, setFormData] = useState({
    id: academicLevelData?.id || '',
    name: academicLevelData?.name || '',
    description: academicLevelData?.description || '',
    sortOrder: academicLevelData?.sortOrder || 0,
  });

  useEffect(() => {
    if (academicLevelData) {
      setFormData({
        id: academicLevelData.id,
        name: academicLevelData.name,
        description: academicLevelData.description || '',
        sortOrder: academicLevelData.sortOrder,
      });
    } else {
      setFormData({
        id: '', name: '', description: '', sortOrder: 0
      });
    }
  }, [academicLevelData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value) || 0 : value, // Parse sortOrder to integer
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave({ ...formData, companyId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {academicLevelData ? `Edit Academic Level: ${academicLevelData.name}` : 'Add New Academic Level'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Level Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TagIcon className="h-6 w-6 text-indigo-500" /> Level Details
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Level Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
              </div>
              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" name="sortOrder" id="sortOrder" value={formData.sortOrder} onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first in lists (e.g., 1 for Playgroup, 10 for High School).</p>
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
              ) : (academicLevelData ? 'Save Changes' : 'Add Academic Level')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcademicLevelFormModal;
