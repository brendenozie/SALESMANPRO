'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  SparklesIcon,
  PlusCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  TagIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  UserIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  eventType: 'GENERAL' | 'HOLIDAY' | 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'WORKSHOP' | 'ORIENTATION' | 'FUNDRAISER' | 'OTHER';
  eventStatus: 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
  organizerName: string; // Populated from backend
  organizerEmail: string; // Populated from backend
  companyId: string; // Populated from backend
  companyName: string; // Populated from backend
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

interface AdminEventsPageProps {
  initialEvents: any[];
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allOrganizers: OrganizerOption[];
  teacherId: string; // The ID of the current educator (params.slug)
  classId: string;   // The ID of the academic level (params.classId)
  companyId: string; // The company ID associated with the teacher
}

// Helper to get month name
const getMonthName = (date: Date | string) => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });

// Helper to check if a date has an event
const hasEventOnDate = (dateString: string, events: EventData[]) => {
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0); // Normalize to start of day

  return events.some(event => {
    const eventStart = new Date(event.startDateTime);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = event.endDateTime ? new Date(event.endDateTime) : eventStart;
    eventEnd.setHours(0, 0, 0, 0);

    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};

// --- Event Form Modal Component ---
type EventFormModalProps = {
  eventData: EventData | null; // Null for new event
  onClose: () => void;
  // The onSave function will now receive the full EventData (minus derived fields)
  onSave: (data: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  currentEducatorId: string; // The ID of the educator currently logged in/managing
  currentCompanyId: string; // The ID of the company this educator belongs to
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allOrganizers: OrganizerOption[];
};

const EventFormModal: React.FC<EventFormModalProps> = ({
  eventData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  currentEducatorId, // Renamed from companyId for clarity
  currentCompanyId, // New prop for the actual company ID
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allOrganizers,
}) => {
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
      organizerId: currentEducatorId, // Pre-fill with current educator's ID
      companyId: currentCompanyId, // Pre-fill with current company's ID
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
    if (formData.isPaid && (formData.price === null || isNaN(formData.price) || (formData.price as number) < 0)) {
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allAcademicLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
          )}
          {formData.audience === 'COURSE' && (
            <div className="md:col-span-2">
              <label htmlFor="targetCourseIds" className="block text-sm font-medium text-gray-700 mb-1">Target Course(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetCourseIds" id="targetCourseIds" value={formData.targetCourseIds} onChange={handleMultiSelectChange} required={formData.audience === 'COURSE'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          )}
          {formData.audience === 'EDUCATOR' && (
            <div className="md:col-span-2">
              <label htmlFor="targetEducatorIds" className="block text-sm font-medium text-gray-700 mb-1">Target Educator(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetEducatorIds" id="targetEducatorIds" value={formData.targetEducatorIds} onChange={handleMultiSelectChange} required={formData.audience === 'EDUCATOR'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allEducators.map(educator => (
                  <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                ))}
              </select>
            </div>
          )}
          {formData.audience === 'STUDENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetStudentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Student(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetStudentIds" id="targetStudentIds" value={formData.targetStudentIds} onChange={handleMultiSelectChange} required={formData.audience === 'STUDENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                ))}
              </select>
            </div>
          )}
          {formData.audience === 'DEPARTMENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetDepartmentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Department(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetDepartmentIds" id="targetDepartmentIds" value={formData.targetDepartmentIds} onChange={handleMultiSelectChange} required={formData.audience === 'DEPARTMENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allDepartments.map(department => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            </div>
          )}
          {formData.audience === 'PARENT' && (
            <div className="md:col-span-2">
              <label htmlFor="targetParentIds" className="block text-sm font-medium text-gray-700 mb-1">Target Parent(s) <span className="text-red-500">*</span></label>
              <select multiple name="targetParentIds" id="targetParentIds" value={formData.targetParentIds} onChange={handleMultiSelectChange} required={formData.audience === 'PARENT'}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32"
              >
                {allParents.map(parent => (
                  <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="isRegistrationRequired" className="flex items-center text-sm font-medium text-gray-700">
                <input type="checkbox" name="isRegistrationRequired" id="isRegistrationRequired" checked={formData.isRegistrationRequired} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
                Registration Required?
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
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2" />
                Paid Event?
              </label>
            </div>
            {formData.isPaid && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                <input type="number" name="price" id="price" value={formData.price || ''} onChange={handleChange} step="0.01" min="0" required={formData.isPaid}
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

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isEdit ? 'Update Event' : 'Create Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default function AddClassEventPage({
  initialEvents,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allOrganizers,
  teacherId, // Educator ID
  classId, // AcademicLevel ID
  companyId, // The actual company ID
}: AdminEventsPageProps) {
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Date object for calendar navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Updated API call to match the new backend endpoint
      const res = await fetch(`${apiUrl}/teacher/events?academicLevelId=${encodeURIComponent(classId)}&teacherId=${encodeURIComponent(teacherId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: EventData[] = await res.json();
        setEvents(data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())); // Sort by upcoming
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch events.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching events.");
    } finally {
      setIsLoading(false);
    }
  }, [classId, teacherId]); // Dependencies: re-fetch if classId or teacherId changes

  useEffect(() => {
    // Always fetch events when component mounts or relevant IDs change
    // This ensures the latest data is always displayed, not just on initial empty state
    fetchEvents();
  }, [fetchEvents]);


  // Calculate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday etc.
    const days = [];

    // Add days from previous month to fill the first week
    for (let i = startDayIndex; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push({
        date: prevMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(prevMonthDay.toISOString().split('T')[0], events),
      });
    }

    // Add days of the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      const isToday = day.toDateString() === new Date().toDateString();
      days.push({
        date: day.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: isToday,
        hasEvent: hasEventOnDate(day.toISOString().split('T')[0], events),
      });
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // Ensure 6 rows (6*7=42 days)
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(nextMonthDay.toISOString().split('T')[0], events),
      });
    }
    return days;
  }, [currentMonth, events]);

  const uniqueEventTypes = useMemo(() => Array.from(new Set(events.map(e => e.eventType))).sort(), [events]);
  const uniqueAudiences = useMemo(() => Array.from(new Set(events.map(e => e.audience))).sort(), [events]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(events.map(e => e.eventStatus))).sort(), [events]);


  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (event.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              event.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'All' || event.eventType === filterType;
      const matchesAudience = filterAudience === 'All' || event.audience === filterAudience;
      const matchesStatus = filterStatus === 'All' || event.eventStatus === filterStatus;

      return matchesSearch && matchesType && matchesAudience && matchesStatus;
    }).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()); // Sort by upcoming
  }, [events, searchTerm, filterType, filterAudience, filterStatus]);

  const upcomingEvents = filteredEvents.filter(event =>
    new Date(event.endDateTime || event.startDateTime) >= new Date() &&
    new Date(event.startDateTime).getMonth() === currentMonth.getMonth() &&
    new Date(event.startDateTime).getFullYear() === currentMonth.getFullYear()
  ).slice(0, 5); // Show top 5 upcoming for current month


  // Event handlers
  const handleSaveEvent = async (eventData: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = eventData.id ? 'PATCH' : 'POST';
    const url = eventData.id ? `${apiUrl}/teacher/events/${eventData.id}` : `${apiUrl}/teacher/events`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventData,
          // Ensure organizerId and companyId are explicitly sent,
          // even if pre-filled in the form, for robustness.
          organizerId: eventData.organizerId || teacherId, // Use form value or fallback to current teacher
          companyId: eventData.companyId || companyId,     // Use form value or fallback to current company
        }),
      });

      if (res.ok) {
        await fetchEvents(); // Re-fetch all events to update the list
        setShowFormModal(false);
        setEditingEvent(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'create' : 'update'} event.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'creating' : 'updating'} event.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    // IMPORTANT: Replace `confirm` with a custom modal for better UX and consistency
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/teacher/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete event.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting event.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: EventData['eventStatus']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/teacher/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update event status.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating event status.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  // Helper for status badge color
  const getStatusColor = (status: EventData['eventStatus']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'POSTPONED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Class Calendar & Events
            <span className="ml-2 text-teal-600 text-base sm:text-xl">🗓️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage and publish class events and holidays.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <SparklesIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Events</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.filter(e => e.eventStatus === 'SCHEDULED' && new Date(e.endDateTime || e.startDateTime) >= new Date()).length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Postponed/Cancelled</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.filter(e => e.eventStatus === 'POSTPONED' || e.eventStatus === 'CANCELLED').length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TagIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Event Types</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {uniqueEventTypes.map(type => (
                  <span key={type} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Previous Month"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{getMonthName(currentMonth)}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Next Month"
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`py-2 rounded-md transition-colors
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'bg-indigo-100 font-bold border border-indigo-300' : 'hover:bg-gray-50'}
                  ${day.hasEvent ? 'bg-blue-100 border border-blue-300 font-semibold' : ''}
                `}
                title={day.hasEvent ? `Events on ${new Date(day.date).toLocaleDateString()}` : ''}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300 mr-1"></span> Today
            <span className="inline-block w-3 h-3 rounded-full bg-blue-100 border border-blue-300 ml-3 mr-1"></span> Event Day
          </p>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-purple-500" /> Upcoming Events This Month
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" /> {new Date(event.startDateTime).toLocaleDateString()}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleDateString()}`}
                      {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-4 w-4" /> {event.location || 'Online'}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">{event.eventType.replace(/_/g, ' ')}</span>
                    </p>                   </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">No upcoming events this month.</li>
            )}
          </ul>
          {/* You might want a "View All Events" link here that navigates to the filtered table below */}
        </div>
      </div>

      {/* Events List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-500" /> All Events
          </h3>
          <button
            onClick={() => { setShowFormModal(true); setEditingEvent(null); setError(null); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Event
          </button>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading events...
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
            <div>
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Audiences</option>
              {uniqueAudiences.map(audience => (
                <option key={audience} value={audience}>{audience.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No events found matching your criteria.
            </div>
          )}
          {filteredEvents.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        {event.title}
                        <p className="text-xs text-gray-500 mt-1">{event.summary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.startDateTime).toLocaleDateString()}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleDateString()}`}
                      <br />
                      <span className="text-xs text-gray-600">
                        {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {event.location || 'Online'}
                      </div>
                      {event.onlineMeetingLink && (
                        <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1 mt-1">
                          <LinkIcon className="h-3 w-3" /> Meeting Link
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      {event.isPaid && (
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-1">
                          <CurrencyDollarIcon className="h-3 w-3" /> {event.price?.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                        {event.audience.replace(/_/g, ' ')}
                      </span>
                      {/* Display specific targets if audience is not ALL */}
                      {event.audience === 'ACADEMIC_LEVEL' && event.targetAcademicLevelIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetAcademicLevelIds.map(id => allAcademicLevels.find(al => al.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'COURSE' && event.targetCourseIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetCourseIds.map(id => allCourses.find(c => c.id === id)?.title || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'EDUCATOR' && event.targetEducatorIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetEducatorIds.map(id => allEducators.find(e => e.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'STUDENT' && event.targetStudentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetStudentIds.map(id => allStudents.find(s => s.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'DEPARTMENT' && event.targetDepartmentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetDepartmentIds.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'PARENT' && event.targetParentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetParentIds.map(id => allParents.find(p => p.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.eventStatus)}`}>
                        {event.eventStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setShowFormModal(true); setEditingEvent(event); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Event"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {event.eventStatus === 'SCHEDULED' && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            title="Cancel Event"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        {(event.eventStatus === 'POSTPONED' || event.eventStatus === 'CANCELLED') && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Reschedule Event"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center"
                          title="Delete Event"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <EventFormModal
          eventData={editingEvent}
          onClose={() => { setShowFormModal(false); setEditingEvent(null); setError(null); }}
          onSave={handleSaveEvent}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          currentEducatorId={teacherId} // Pass the current educator's ID
          currentCompanyId={companyId} // Pass the actual company ID
          allAcademicLevels={allAcademicLevels}
          allCourses={allCourses}
          allEducators={allEducators}
          allStudents={allStudents}
          allDepartments={allDepartments}
          allParents={allParents}
          allOrganizers={allOrganizers}
        />
      )}
    </div>
  );
}
