'use client';
import React, { useState } from 'react';
import { XMarkIcon, HomeModernIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { ClassroomType, AcademicLevelType } from './ClassroomsClient';

interface Props {
  classroomData?: ClassroomType | null;
  academicLevels: AcademicLevelType[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const ClassroomFormModal: React.FC<Props> = ({ classroomData, academicLevels, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    id: classroomData?.id || '',
    name: classroomData?.name || '',
    academicLevelId: classroomData?.academicLevelId || '',
    capacity: classroomData?.capacity || 30,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400"><XMarkIcon className="h-6 w-6" /></button>
        
        <h2 className="text-2xl font-bold mb-6">
          {classroomData ? 'Edit Classroom' : 'New Classroom'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Classroom Name</label>
            <input 
              required
              className="w-full border rounded-lg p-2"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Blue Room or Grade 1-A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Academic Level</label>
            <select 
              required
              className="w-full border rounded-lg p-2"
              value={formData.academicLevelId}
              onChange={e => setFormData({...formData, academicLevelId: e.target.value})}
            >
              <option value="">Select a Level...</option>
              {academicLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Student Capacity</label>
            <input 
              type="number"
              className="w-full border rounded-lg p-2"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
            <button 
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassroomFormModal;