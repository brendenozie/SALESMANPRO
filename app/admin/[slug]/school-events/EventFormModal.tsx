'use client';

import React, { useState } from 'react';
import {
  XMarkIcon, // For student/parent
} from '@heroicons/react/24/outline';

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with Event API Response) ---
export type EventData = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  startDateTime: string; // ISO string
  endDateTime: string | null; // ISO string
  location: string | null;
  onlineMeetingLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  eventType: 'GENERAL' | 'HOLIDAY'| 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'WORKSHOP' | 'ORIENTATION' | 'FUNDRAISER' | 'OTHER';
  eventStatus: 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  companyId: string;
  companyName: string;
  audience: 'ALL' | 'ACADEMIC_LEVEL' | 'COURSE' | 'EDUCATOR' | 'STUDENT' | 'DEPARTMENT' | 'STAFF' | 'PARENT';
  targetAcademicLevelIds: string[];
  targetCourseIds: string[];
  targetEducatorIds: string[];
  targetStudentIds: string[];
  targetDepartmentIds: string[];
  targetParentIds: string[];
  isRegistrationRequired: boolean;
  maxCapacity: number | null;
  isPaid: boolean;
  price: number | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

// Types for Audience Selection Dropdowns
export type AcademicLevelOption = { id: string; name: string };
export type CourseOption = { id: string; title: string };
export type EducatorOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };
export type DepartmentOption = { id: string; name: string };
export type ParentOption = { id: string; name: string; email: string };
export type OrganizerOption = { id: string; name: string; email: string };

// --- Event Form Modal Component ---
type EventFormModalProps = {
  eventData: EventData | null; // Null for new event
  onClose: () => void;
  onSave: (data: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  companyId: string;
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allOrganizers: OrganizerOption[];
};

export default function  EventFormModal({
  eventData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  companyId,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allOrganizers,
}:EventFormModalProps) {
  
  const [formData, setFormData] = useState<Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>>(
    eventData || {
      id: '',
      title: '',
      summary: null,
      description: null,
      startDateTime: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
      endDateTime: null,
      location: null,
      onlineMeetingLink: null,
      imageUrl: null,
      videoUrl: null,
      eventType: 'GENERAL',
      eventStatus: 'SCHEDULED',
      organizerId: '', // Should be pre-filled with current user's ID in a real app
      companyId: companyId,
      audience: 'ALL',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      isRegistrationRequired: false,
      maxCapacity: null,
      isPaid: false,
      price: null,
      contactPerson: null,
      contactEmail: null,
      contactPhone: null,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError(); // Clear any previous errors

    // Basic client-side validation
    if (!formData.title || !formData.startDateTime || !formData.eventType || !formData.eventStatus || !formData.organizerId || !formData.audience) {
      alert("Please fill all required fields: Title, Start Date/Time, Event Type, Event Status, Organizer, and Audience.");
      return;
    }

    // Validate date/time fields
    const startDt = new Date(formData.startDateTime);
    if (isNaN(startDt.getTime())) {
      alert("Invalid Start Date/Time format.");
      return;
    }
    if (formData.endDateTime) {
      const endDt = new Date(formData.endDateTime);
      if (isNaN(endDt.getTime())) {
        alert("Invalid End Date/Time format.");
        return;
      }
      if (endDt <= startDt) {
        alert("End Date/Time must be after Start Date/Time.");
        return;
      }
    }

    // Validate price for paid events
    if (formData.isPaid && (formData.price === null || isNaN(formData.price) || formData.price < 0)) {
      alert("Please enter a valid non-negative price for paid events.");
      return;
    }
    if (!formData.isPaid) {
        formData.price = null; // Ensure price is null if not paid
    }

    // Validate audience-specific selections
    switch (formData.audience) {
      case 'ACADEMIC_LEVEL':
        if (formData.targetAcademicLevelIds.length === 0) {
          alert("Please select at least one Academic Level for this audience type.");
          return;
        }
        break;
      case 'COURSE':
        if (formData.targetCourseIds.length === 0) {
          alert("Please select at least one Course for this audience type.");
          return;
        }
        break;
      case 'EDUCATOR':
        if (formData.targetEducatorIds.length === 0) {
          alert("Please select at least one Educator for this audience type.");
          return;
        }
        break;
      case 'STUDENT':
        if (formData.targetStudentIds.length === 0) {
          alert("Please select at least one Student for this audience type.");
          return;
        }
        break;
      case 'DEPARTMENT':
        if (formData.targetDepartmentIds.length === 0) {
          alert("Please select at least one Department for this audience type.");
          return;
        }
        break;
      case 'PARENT':
        if (formData.targetParentIds.length === 0) {
          alert("Please select at least one Parent for this audience type.");
          return;
        }
        break;
      // For 'ALL' and 'STAFF', no specific target IDs are required here
    }

    onSave(formData);
  };

  const isEdit = !!eventData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {isEdit ? `Edit Event: ${eventData?.title}` : 'Create New Event'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Event Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Summary (Optional)</label>
              <input type="text" name="summary" id="summary" value={formData.summary || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={3}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
            </div>

            <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="startDateTime" id="startDateTime" value={formData.startDateTime.slice(0, 16)} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-1">End Date & Time (Optional)</label>
              <input type="datetime-local" name="endDateTime" id="endDateTime" value={formData.endDateTime ? formData.endDateTime.slice(0, 16) : ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location (e.g., "Auditorium", "Online")</label>
              <input type="text" name="location" id="location" value={formData.location || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="onlineMeetingLink" className="block text-sm font-medium text-gray-700 mb-1">Online Meeting Link (Optional)</label>
              <input type="url" name="onlineMeetingLink" id="onlineMeetingLink" value={formData.onlineMeetingLink || ''} onChange={handleChange} placeholder="https://zoom.us/j/..."
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
              <input type="url" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="https://example.com/event.jpg"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
              <input type="url" name="videoUrl" id="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} placeholder="https://example.com/event.mp4"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Event Type <span className="text-red-500">*</span></label>
              <select name="eventType" id="eventType" value={formData.eventType} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Type --</option>
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="SPORTS">Sports</option>
                <option value="CULTURAL">Cultural</option>
                <option value="MEETING">Meeting</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="ORIENTATION">Orientation</option>
                <option value="FUNDRAISER">Fundraiser</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="eventStatus" className="block text-sm font-medium text-gray-700 mb-1">Event Status <span className="text-red-500">*</span></label>
              <select name="eventStatus" id="eventStatus" value={formData.eventStatus} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="POSTPONED">Postponed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="organizerId" className="block text-sm font-medium text-gray-700 mb-1">Organizer <span className="text-red-500">*</span></label>
              <select name="organizerId" id="organizerId" value={formData.organizerId} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Organizer --</option>
                {allOrganizers.map(organizer => (
                  <option key={organizer.id} value={organizer.id}>{organizer.name} ({organizer.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">Audience <span className="text-red-500">*</span></label>
              <select name="audience" id="audience" value={formData.audience} onChange={handleChange} required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
              >
                <option value="">-- Select Audience --</option>
                <option value="ALL">All Users</option>
                <option value="ACADEMIC_LEVEL">Academic Level(s)</option>
                <option value="COURSE">Course(s)</option>
                <option value="EDUCATOR">Educator(s)</option>
                <option value="STUDENT">Student(s)</option>
                <option value="DEPARTMENT">Department(s)</option>
                <option value="STAFF">Staff Only</option>
                <option value="PARENT">Parent(s)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Audience Selection Fields */}
          {formData.audience === 'ACADEMIC_LEVEL' && (
            <div className="md:col-span-2">
              <label htmlFor="targetAcademicLevelIds" className="block text-sm font-medium text-gray-700 mb-1">Target Academic Level(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetAcademicLevelIds" id="targetAcademicLevelIds" value={formData.targetAcademicLevelIds} onChange={handleMultiSelectChange} required={formData.audience === 'ACADEMIC_LEVEL'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allAcademicLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'COURSE' && (
            <div className="md:col-span-2">
              <label htmlFor="targetCourseIds" className="block text-sm font-medium text-gray-700 mb-1">Target Course(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetCourseIds" id="targetCourseIds" value={formData.targetCourseIds} onChange={handleMultiSelectChange} required={formData.audience === 'COURSE'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'EDUCATOR' && (
            <div className="md:col-span-2">
              <label htmlFor="targetEducatorIds" className="block text-sm font-medium text-gray-700 mb-1">Target Educator(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetEducatorIds" id="targetEducatorIds" value={formData.targetEducatorIds} onChange={handleMultiSelectChange} required={formData.audience === 'EDUCATOR'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'STUDENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetStudentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Student(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetStudentIds" id="targetStudentIds" value={formData.targetStudentIds} onChange={handleMultiSelectChange} required={formData.audience === 'STUDENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'DEPARTMENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetDepartmentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Department(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetDepartmentIds" id="targetDepartmentIds" value={formData.targetDepartmentIds} onChange={handleMultiSelectChange} required={formData.audience === 'DEPARTMENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          {formData.audience === 'PARENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetParentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Parent(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetParentIds" id="targetParentIds" value={formData.targetParentIds} onChange={handleMultiSelectChange} required={formData.audience === 'PARENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
              >
                {allParents.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="isRegistrationRequired" className="flex items-center text-sm font-medium text-gray-700">
                <input type="checkbox" name="isRegistrationRequired" id="isRegistrationRequired" checked={formData.isRegistrationRequired} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span className="ml-2">Registration Required?</span>
              </label>
            </div>
            {formData.isRegistrationRequired && (
              <div>
                <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (Optional)</label>
                <input type="number" name="maxCapacity" id="maxCapacity" value={formData.maxCapacity || ''} onChange={handleChange} min="1"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
            )}
            <div>
              <label htmlFor="isPaid" className="flex items-center text-sm font-medium text-gray-700">
                <input type="checkbox" name="isPaid" id="isPaid" checked={formData.isPaid} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <span className="ml-2">Paid Event?</span>
              </label>
            </div>
            {formData.isPaid && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                <input type="number" name="price" id="price" value={formData.price || ''} onChange={handleChange} min="0" step="0.01" required={formData.isPaid}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">Contact Person (Optional)</label>
              <input type="text" name="contactPerson" id="contactPerson" value={formData.contactPerson || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email (Optional)</label>
              <input type="email" name="contactEmail" id="contactEmail" value={formData.contactEmail || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone (Optional)</label>
              <input type="tel" name="contactPhone" id="contactPhone" value={formData.contactPhone || ''} onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
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
              ) : (isEdit ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

