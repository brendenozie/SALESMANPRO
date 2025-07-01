import React, { useState, useEffect } from 'react';
import { StoreCategory } from './CategoryManagerClient'; // Import type

interface CategoryFormModalProps {
  categoryData: StoreCategory | null;
  onClose: () => void;
  onSave: (category: StoreCategory) => Promise<void>;
  isLoading: boolean;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ categoryData, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState<StoreCategory>({
    id: '',
    displayName: '',
    icon: '📦', // Default icon
    sortOrder: 0,
    visible: true,
    items: [], // Subcategories are managed separately
    ...(categoryData || {}), // Pre-fill if editing
  });

  useEffect(() => {
    if (categoryData) {
      setFormData({ ...categoryData, items: [] }); // Ensure items is an empty array for form state
    } else {
      setFormData({ id: '', displayName: '', icon: '📦', sortOrder: 0, visible: true, items: [] });
    }
  }, [categoryData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {categoryData ? 'Edit Category' : 'Add New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji or Text)</label>
            <input
              type="text"
              name="icon"
              id="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="e.g., 🎵, 📚, 🚗"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="visible"
              id="visible"
              checked={formData.visible}
              onChange={handleChange}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="visible" className="ml-2 block text-base text-gray-900">Visible on Storefront</label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (categoryData ? 'Save Changes' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
