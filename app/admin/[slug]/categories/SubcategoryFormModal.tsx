import React, { useState, useEffect } from 'react';
import { Subcategory } from './CategoryManagerClient'; // Import type

interface SubcategoryFormModalProps {
  parentId: string; // The ID of the parent category
  subcategoryData: Subcategory | null;
  onClose: () => void;
  onSave: (parentId: string, subcategory: Subcategory) => Promise<void>;
  isLoading: boolean;
}

const SubcategoryFormModal: React.FC<SubcategoryFormModalProps> = ({ parentId, subcategoryData, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<Subcategory>({
    id: '',
    name: '',
    slug: '',
    sortOrder: 0,
    visible: true,
    ...(subcategoryData || {}), // Pre-fill if editing
  });

  useEffect(() => {
    if (subcategoryData) {
      setFormData(subcategoryData);
    } else {
      setFormData({ id: '', name: '', slug: '', sortOrder: 0, visible: true });
    }
  }, [subcategoryData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Automatically generate slug if name changes and it's a new subcategory
      ...(name === 'name' && !prev.id && { slug: value.toLowerCase().replace(/\s+/g, '-') }),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(parentId, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {subcategoryData?.id ? 'Edit Subcategory' : 'Add New Subcategory'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-base"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 text-base"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="visible"
              id="visible"
              checked={formData.visible}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="visible" className="ml-2 block text-base text-gray-900">Visible</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-green-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (subcategoryData ? 'Save Changes' : 'Add Subcategory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubcategoryFormModal;
