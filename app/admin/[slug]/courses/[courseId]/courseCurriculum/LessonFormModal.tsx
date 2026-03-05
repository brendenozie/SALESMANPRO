import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlayCircleIcon, ClockIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

interface LessonFormModalProps {
  lessonData?: any | null; // Replace with LessonType
  moduleId: string;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({ lessonData, moduleId, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    id: lessonData?.id || '',
    title: lessonData?.title || '',
    description: lessonData?.description || '',
    videoUrl: lessonData?.videoUrl || '',
    duration: lessonData?.duration || 0,
    order: lessonData?.order || 0,
    moduleId: moduleId,
  });

  useEffect(() => {
    if (lessonData) {
      setFormData({ ...lessonData, moduleId });
    }
  }, [lessonData, moduleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {lessonData ? 'Edit Lesson' : 'Add New Lesson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lesson Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Setting up your Workspace"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Minutes)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PlayCircleIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : lessonData ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonFormModal;