import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  Bars3BottomLeftIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// Assuming types are imported from CourseAssignmentsClient.tsx
export type CourseAssignmentType = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseInstructorName?: string;
  courseAcademicLevels: { id: string; name: string }[];
  title: string;
  description?: string | null;
  dueDate: Date;
  maxGrade?: number | null;
  assignedAt: Date;
  updatedAt: Date;
  totalSubmissions: number;
};

export type CourseOption = {
  id: string;
  title: string;
  instructorName?: string;
  academicLevels: { id: string; name: string }[];
};

interface AssignmentFormModalProps {
  assignmentData?: CourseAssignmentType | null;
  onClose: () => void;
  onSave: (data: Omit<CourseAssignmentType, 'id' | 'courseTitle' | 'courseInstructorName' | 'courseAcademicLevels' | 'assignedAt' | 'updatedAt' | 'totalSubmissions'> & { id?: string }) => Promise<void>;
  isLoading: boolean;
  allCourses: CourseOption[]; // All available courses for selection
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({ assignmentData, onClose, onSave, isLoading, allCourses }) => {
  const [formData, setFormData] = useState({
    id: assignmentData?.id || '',
    courseId: assignmentData?.courseId || '',
    title: assignmentData?.title || '',
    description: assignmentData?.description || '',
    dueDate: assignmentData?.dueDate.toISOString().substring(0, 16) || '', // Format for datetime-local input
    maxGrade: assignmentData?.maxGrade || 0,
  });

  useEffect(() => {
    if (assignmentData) {
      setFormData({
        id: assignmentData.id,
        courseId: assignmentData.courseId,
        title: assignmentData.title,
        description: assignmentData.description || '',
        dueDate: assignmentData.dueDate.toISOString().substring(0, 16),
        maxGrade: assignmentData.maxGrade || 0,
      });
    } else {
      setFormData({
        id: '', courseId: '', title: '', description: '', dueDate: '', maxGrade: 0
      });
    }
  }, [assignmentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxGrade' ? parseFloat(value) || 0 : value, // Parse maxGrade to float
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!formData.courseId || !formData.title || !formData.dueDate) {
      alert("Please fill in all required fields: Course, Title, and Due Date.");
      return;
    }

    await onSave({
      ...formData,
      dueDate: new Date(formData.dueDate), // Convert back to Date object for API
      maxGrade: formData.maxGrade === 0 ? null : formData.maxGrade, // Send null if 0
    });
  };

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
          {assignmentData ? `Edit Assignment: ${assignmentData.title}` : 'Add New Course Assignment'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-500" /> Assignment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Assign to Course <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpenIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
                    disabled={!!assignmentData} // Disable course selection when editing existing assignment
                  >
                    <option value="">-- Select Course --</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.title} (Instructor: {course.instructorName || 'N/A'})</option>
                    ))}
                  </select>
                </div>
                {assignmentData && (
                  <p className="mt-1 text-xs text-gray-500">Course cannot be changed for an existing assignment.</p>
                )}
              </div>
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
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="datetime-local" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} required
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
                </div>
              </div>
              <div>
                <label htmlFor="maxGrade" className="block text-sm font-medium text-gray-700 mb-1">Maximum Grade</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" name="maxGrade" id="maxGrade" value={formData.maxGrade} onChange={handleChange} step="0.1" min="0"
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
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
              className={`px-6 py-3 rounded-lg text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (assignmentData ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentFormModal;