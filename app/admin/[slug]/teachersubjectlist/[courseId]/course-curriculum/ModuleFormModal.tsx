import React, { useState, useEffect } from 'react';
import { XMarkIcon, HashtagIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

interface ModuleFormModalProps {
  moduleData?: any | null; // Replace with ModuleType
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  courseId: string;
}

const ModuleFormModal: React.FC<ModuleFormModalProps> = ({ moduleData, onClose, onSave, isLoading, courseId }) => {
  const [formData, setFormData] = useState({
    id: moduleData?.id || '',
    title: moduleData?.title || '',
    description: moduleData?.description || '',
    order: moduleData?.order || 0,
  });

  useEffect(() => {
    if (moduleData) {
      setFormData({
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description || '',
        order: moduleData.order,
      });
    }
  }, [moduleData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...formData, courseId });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {moduleData ? 'Edit Module' : 'Add New Module'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Module Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Introduction to React"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What will students learn in this module?"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : moduleData ? 'Update Module' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleFormModal;