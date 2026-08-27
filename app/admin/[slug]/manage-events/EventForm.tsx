// components/EventForm.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  TagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  IEvent
} from '@/types/typings';
import { EventStatus } from '@prisma/client';

// --- Shared Constants (Create a separate file, e.g., constants/event.ts) ---
export const VALID_EVENT_TYPES = [
  "GENERAL", "ACADEMIC", "SPORTS", "CULTURAL", "MEETING", "WORKSHOP", "ORIENTATION", "FUNDRAISER", "OTHER"
];
export const VALID_EVENT_STATUSES = [
  "SCHEDULED", "POSTPONED", "CANCELLED", "COMPLETED", "DRAFT" // Added DRAFT as it's used in form
];
export const VALID_EVENT_AUDIENCES = [
  "ALL",  "STAFF"//, "PARENT","ACADEMIC_LEVEL", "COURSE", "EDUCATOR", "STUDENT", "DEPARTMENT",
];

// Map enum values to more user-friendly labels for the UI
export const EVENT_TYPE_LABELS: Record<typeof VALID_EVENT_TYPES[number], string> = {
  GENERAL: "General",
  ACADEMIC: "Academic",
  SPORTS: "Sports",
  CULTURAL: "Cultural",
  MEETING: "Meeting",
  WORKSHOP: "Workshop",
  ORIENTATION: "Orientation",
  FUNDRAISER: "Fundraiser",
  OTHER: "Other",
};

export const EVENT_STATUS_LABELS: Record<typeof VALID_EVENT_STATUSES[number], string> = {
  SCHEDULED: "Scheduled",
  POSTPONED: "Postponed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  DRAFT: "Draft",
};

export const EVENT_AUDIENCE_LABELS: Record<typeof VALID_EVENT_AUDIENCES[number], string> = {
  ALL: "All Users",
  // ACADEMIC_LEVEL: "Specific Academic Levels",
  // COURSE: "Specific Courses",
  // EDUCATOR: "Specific Educators",
  // STUDENT: "Specific Students",
  // DEPARTMENT: "Specific Departments",
  STAFF: "Staff",
  // PARENT: "Parents",
};



// --- Helper for date formatting ---
const formatDateForInput = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  // Ensure correct local time zone handling for input[type="datetime-local"]
  const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

// --- Framer Motion Variants ---
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 20, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { ease: "easeOut", duration: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

type Agent = {
  id: string;
  name: string;
   email: string
};

// --- Event Form Component ---
interface EventFormProps {
  event?: Partial<IEvent | null>;
  onSave: (eventData: Partial<IEvent>) => void;
  onClose: () => void;
  isSaving: boolean;
  apiError: string | null;
  // Add props for dynamic data if needed, e.g., lists of academic levels, courses, etc.
  // academicLevels: { id: string; name: string }[];
  // courses: { id: string; name: string }[];
  // etc.
  companyId: string; // Pass companyId from parent
  allOrganizers?: Agent[]; 
  // organizerId: string; // Pass organizerId from parent
}

export default function EventForm({ event, onSave, onClose, isSaving, apiError, companyId, allOrganizers }: EventFormProps) {

  const [formData, setFormData] = useState<Partial<IEvent>>({
    title: '',
    summary: '',
    description: '',
    startDateTime: new Date(), // defaults to "now"
    endDateTime: new Date(), 
    location: '',
    onlineMeetingLink: '',
    imageUrl: '',
    videoUrl: '',
    eventType: 'GENERAL',
    eventStatus: 'DRAFT' as EventStatus,
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
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    companyId: companyId, // Initialize with passed companyId
    organizerId: "organizerId", // Initialize with passed organizerId
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        // startDateTime: formatDateForInput(event.startDateTime),
        // endDateTime: formatDateForInput(event.endDateTime),
        startDateTime: event.startDateTime ? new Date(event.startDateTime) : undefined,
        endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
      });
    } else {
      // Reset form if no event is passed (e.g., for creating a new event)
      setFormData({
        title: '',
        summary: '',
        description: '',
        // startDateTime: '',
        // endDateTime: '',
        startDateTime: new Date(), // defaults to "now"
        endDateTime: new Date(),
        location: '',
        onlineMeetingLink: '',
        imageUrl: '',
        videoUrl: '',
        eventType: 'GENERAL',
        eventStatus: 'DRAFT' as EventStatus,
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
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        companyId: companyId,
        organizerId: "organizerId",
      });
    }
    setValidationErrors({}); // Clear errors on event change
  }, [event, companyId, ]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormData(prev => {
      const updatedData = { ...prev };
      if (type === 'checkbox') {
        updatedData[name as keyof IEvent] = checked as any;
      } else {
        updatedData[name as keyof IEvent] = value as any;
      }

      // Clear specific validation error when user starts typing/changing
      setValidationErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });

      return updatedData;
    });
  };

  const handleNumericChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : (name === 'price' ? parseFloat(value) : parseInt(value)),
    }));
    setValidationErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handler for multi-select (e.g., for target audiences) - Example for a hypothetical MultiSelect component
  const handleMultiSelectChange = (name: keyof Partial<IEvent>, selectedIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedIds,
    }));
    setValidationErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title) errors.title = "Event Title is required.";
    if (!formData.startDateTime) errors.startDateTime = "Start Date & Time is required.";
    if (!formData.location && !formData.onlineMeetingLink) {
      errors.location = "Either Location or Online Meeting Link is required.";
      errors.onlineMeetingLink = "Either Location or Online Meeting Link is required.";
    }
    if (!formData.eventType) errors.eventType = "Event Type is required.";
    if (!formData.eventStatus) errors.eventStatus = "Event Status is required.";
    if (!formData.audience) errors.audience = "Audience is required.";

    const start = new Date(formData.startDateTime || '');
    const end = formData.endDateTime ? new Date(formData.endDateTime) : null;

    if (isNaN(start.getTime())) {
      errors.startDateTime = "Invalid Start Date & Time format.";
    }
    if (end && isNaN(end.getTime())) {
      errors.endDateTime = "Invalid End Date & Time format.";
    }
    if (end && start && end <= start) {
      errors.endDateTime = "End Date & Time must be after Start Date & Time.";
    }

    if (formData.isRegistrationRequired && (formData.maxCapacity === null || formData.maxCapacity === undefined  || formData.maxCapacity <= 0)) {
      errors.maxCapacity = "Max Capacity is required and must be greater than 0 for registration.";
    }

    if (formData.isPaid && (formData.price === null ||  formData.price === undefined  || formData.price < 0)) {
      errors.price = "Price is required and must be a non-negative number for paid events.";
    }

    // Basic email validation
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      errors.contactEmail = "Invalid email format.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for API, keep Date objects for IEvent fields (or undefined)
      const dataToSave: Partial<IEvent> = {
        ...formData,
        startDateTime: formData.startDateTime
          ? (formData.startDateTime instanceof Date ? formData.startDateTime : new Date(formData.startDateTime))
          : undefined,
        endDateTime: formData.endDateTime
          ? (formData.endDateTime instanceof Date ? formData.endDateTime : new Date(formData.endDateTime))
          : undefined, // Send as undefined if empty
        // Ensure price is null if not paid, as per backend logic
        price: formData.isPaid ? formData.price : null,
        // Ensure maxCapacity is null if registration is not required
        maxCapacity: formData.isRegistrationRequired ? formData.maxCapacity : null,
        id: event?.id, // Include ID if editing
      };
      onSave(dataToSave);
    }
  };

  // Dummy data for audience target dropdowns (replace with actual fetched data)
  const academicLevels = [{ id: 'level1', name: 'Undergraduate' }, { id: 'level2', name: 'Graduate' }];
  const courses = [{ id: 'courseA', name: 'Computer Science' }, { id: 'courseB', name: 'Business Administration' }];
  const educators = [{ id: 'edu1', name: 'Prof. Smith' }, { id: 'edu2', name: 'Dr. Jones' }];
  const students = [{ id: 'stu1', name: 'Alice Doe' }, { id: 'stu2', name: 'Bob Ray' }];
  const departments = [{ id: 'dept1', name: 'Engineering' }, { id: 'dept2', name: 'Arts & Sciences' }];
  const parents = [{ id: 'parent1', name: 'John Doe Sr.' }, { id: 'parent2', name: 'Jane Ray Sr.' }];

  const renderTargetAudienceFields = () => {
    switch (formData.audience) {
      case 'ACADEMIC_LEVEL':
        return (
          <MultiSelect
            label="Target Academic Levels"
            options={academicLevels}
            selectedIds={formData.targetAcademicLevelIds || []}
            onChange={(ids) => handleMultiSelectChange('targetAcademicLevelIds', ids)}
            placeholder="Select academic levels..."
          />
        );
      case 'COURSE':
        return (
          <MultiSelect
            label="Target Courses"
            options={courses}
            selectedIds={formData.targetCourseIds || []}
            onChange={(ids) => handleMultiSelectChange('targetCourseIds', ids)}
            placeholder="Select courses..."
          />
        );
      case 'EDUCATOR':
        return (
          <MultiSelect
            label="Target Educators"
            options={educators}
            selectedIds={formData.targetEducatorIds || []}
            onChange={(ids) => handleMultiSelectChange('targetEducatorIds', ids)}
            placeholder="Select educators..."
          />
        );
      case 'STUDENT':
        return (
          <MultiSelect
            label="Target Students"
            options={students}
            selectedIds={formData.targetStudentIds || []}
            onChange={(ids) => handleMultiSelectChange('targetStudentIds', ids)}
            placeholder="Select students..."
          />
        );
      case 'DEPARTMENT':
        return (
          <MultiSelect
            label="Target Departments"
            options={departments}
            selectedIds={formData.targetDepartmentIds || []}
            onChange={(ids) => handleMultiSelectChange('targetDepartmentIds', ids)}
            placeholder="Select departments..."
          />
        );
      case 'PARENT':
        return (
          <MultiSelect
            label="Target Parents"
            options={parents}
            selectedIds={formData.targetParentIds || []}
            onChange={(ids) => handleMultiSelectChange('targetParentIds', ids)}
            placeholder="Select parents..."
          />
        );
      default:
        return null;
    }
  };

  const renderOrganizers = () => {
    return (
      <div>
        <label htmlFor="organizerId" className="block text-sm font-medium text-gray-700 mb-1">Organizer <span className="text-red-500">*</span></label>
        <select name="organizerId" id="organizerId" value={formData.organizerId} onChange={handleChange} required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white focus:outline-none focus:ring-1 sm:text-sm text-gray-900"
        >
          <option value="">-- Select Organizer --</option>
          {allOrganizers && allOrganizers.map(organizer => (
            <option key={organizer.id} value={organizer.id}>{organizer.name} ({organizer.email})</option>
          ))}
        </select>
      </div>
    );
  };

  // Helper for rendering input fields with consistent styling and error display
  const renderInputField = (
    id: keyof Partial<IEvent>,
    label: string,
    type: string = 'text',
    required: boolean = false,
    placeholder: string = '',
    icon: React.ReactNode = null,
    min?: string,
    step?: string
  ) => (
    <div className="mb-4">
      <label htmlFor={id as string} className="block text-gray-300 text-sm font-bold mb-2">
        {icon && <span className="inline-block mr-2 text-indigo-400">{icon}</span>}{label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id as string}
          name={id as string}
          value={formData[id as keyof Partial<IEvent>] as string || ''}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${validationErrors[id as string] ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:border-indigo-500 transition-colors duration-200`}
          required={required}
          placeholder={placeholder}
        ></textarea>
      ) : (
        <input
          type={type}
          id={id as string}
          name={id as string}
          value={(formData[id as keyof Partial<IEvent>] ?? '') as string | number}
          onChange={type === 'number' ? handleNumericChange : handleChange}
          className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${validationErrors[id as string] ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:border-indigo-500 transition-colors duration-200`}
          required={required}
          placeholder={placeholder}
          min={min}
          step={step}
        />
      )}
      {validationErrors[id as string] && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <ExclamationCircleIcon className="w-4 h-4 inline" /> {validationErrors[id as string]}
        </p>
      )}
    </div>
  );

  const renderSelectField = (
    id: keyof Partial<IEvent>,
    label: string,
    options: Record<string, string>,
    required: boolean = false,
    icon: React.ReactNode = null
  ) => (
    <div className="mb-4">
      <label htmlFor={id as string} className="block text-gray-300 text-sm font-bold mb-2">
        {icon && <span className="inline-block mr-2 text-indigo-400">{icon}</span>}{label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id as string}
        name={id as string}
        value={formData[id as keyof Partial<IEvent>] as string || ''}
        onChange={handleChange}
        className={`w-full px-4 py-3 rounded-lg bg-gray-900 border ${validationErrors[id as string] ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:border-indigo-500 appearance-none pr-8 transition-colors duration-200`}
        required={required}
      >
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
      {validationErrors[id as string] && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <ExclamationCircleIcon className="w-4 h-4 inline" /> {validationErrors[id as string]}
        </p>
      )}
    </div>
  );


  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-2xl overflow-y-auto max-h-[90vh] relative"
        variants={modalVariants} // Use modalVariants for the content too for consistent animation
      >
        <h3 className="text-3xl font-extrabold text-white mb-6 text-center">{event ? 'Edit Event' : 'Create New Event'}</h3>
        {apiError && (
          <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm animate-fade-in-down">
            <ExclamationCircleIcon className="w-5 h-5" />
            <p>{apiError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Event Details */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <InformationCircleIcon className="w-6 h-6 mr-2 text-indigo-400" /> Event Details
            </h4>
            {renderInputField('title', 'Event Title', 'text', true, 'e.g., Annual Sports Day')}
            {renderInputField('summary', 'Short Summary', 'text', false, 'A brief overview of the event')}
            {renderInputField('description', 'Detailed Description', 'textarea', false, 'Provide full details about the event...')}
            {renderInputField('imageUrl', 'Image URL', 'url', false, 'https://example.com/event-banner.jpg', <PhotoIcon />)}
            {formData.imageUrl && (
              <div className="mb-4">
                <img src={formData.imageUrl} alt="Event Preview" className="max-w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
            {renderInputField('videoUrl', 'Video URL (Optional)', 'url', false, 'https://youtube.com/watch?v=...', <VideoCameraIcon />)}
          </div>

          {/* Section: Date, Time & Location */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2 text-indigo-400" /> Date, Time & Location
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInputField('startDateTime', 'Start Date & Time', 'datetime-local', true, '', <CalendarDaysIcon />)}
              {renderInputField('endDateTime', 'End Date & Time (Optional)', 'datetime-local', false, '', <CalendarDaysIcon />)}
            </div>
            {renderInputField('location', 'Physical Location (if applicable)', 'text', false, 'e.g., Main Auditorium', <MapPinIcon />)}
            {renderInputField('onlineMeetingLink', 'Online Meeting Link (if applicable)', 'url', false, 'e.g., https://zoom.us/j/12345', <LinkIcon />)}
            {(validationErrors.location || validationErrors.onlineMeetingLink) && !formData.location && !formData.onlineMeetingLink && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <ExclamationCircleIcon className="w-4 h-4 inline" /> {validationErrors.location || validationErrors.onlineMeetingLink}
              </p>
            )}
          </div>

          {/* Section: Classification & Status */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TagIcon className="w-6 h-6 mr-2 text-indigo-400" /> Classification & Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSelectField('eventType', 'Event Type', EVENT_TYPE_LABELS, true, <TagIcon />)}
              {renderSelectField('eventStatus', 'Event Status', EVENT_STATUS_LABELS, true, <InformationCircleIcon />)}
            </div>
          </div>

          {/* Section: Organizers */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-400" /> Organizers
            </h4>
            {renderOrganizers()}
          </div>

          {/* Section: Audience & Targeting */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <UserGroupIcon className="w-6 h-6 mr-2 text-indigo-400" /> Target Audience
            </h4>
            {renderSelectField('audience', 'Who is this event for?', EVENT_AUDIENCE_LABELS, true, <UsersIcon />)}
            <AnimatePresence>
              {formData.audience !== 'ALL' && formData.audience !== 'STAFF' && ( // Only show if not 'ALL' or 'STAFF'
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  {renderTargetAudienceFields()}
                  {/* You'd fetch and populate these MultiSelects based on companyId and specific data */}
                  <p className="text-gray-400 text-sm mt-2">
                    Select specific groups within the chosen audience type.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          {/* Section: Registration & Pricing */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2 text-indigo-400" /> Registration & Pricing
            </h4>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isRegistrationRequired"
                name="isRegistrationRequired"
                checked={formData.isRegistrationRequired || false}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded-md bg-gray-900 cursor-pointer"
              />
              <label htmlFor="isRegistrationRequired" className="text-gray-300 text-base font-medium select-none">Registration Required</label>
            </div>

            <AnimatePresence>
              {formData.isRegistrationRequired && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  {renderInputField('maxCapacity', 'Max Capacity', 'number', true, 'e.g., 100', <UsersIcon />, "1")}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid || false}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded-md bg-gray-900 cursor-pointer"
              />
              <label htmlFor="isPaid" className="text-gray-300 text-base font-medium select-none">Paid Event</label>
            </div>

            <AnimatePresence>
              {formData.isPaid && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={sectionVariants}
                  className="mt-4 pt-4 border-t border-gray-700"
                >
                  {renderInputField('price', 'Price', 'number', true, 'e.g., 25.00', <CurrencyDollarIcon />, "0", "0.01")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Contact Information */}
          <div className="border border-gray-700 p-6 rounded-lg bg-gray-850">
            <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
              <InformationCircleIcon className="w-6 h-6 mr-2 text-indigo-400" /> Contact Information
            </h4>
            {renderInputField('contactPerson', 'Contact Person', 'text', false, 'e.g., Jane Doe')}
            {renderInputField('contactEmail', 'Contact Email', 'email', false, 'e.g., contact@example.com', <EnvelopeIcon />)}
            {renderInputField('contactPhone', 'Contact Phone', 'tel', false, 'e.g., +1234567890', <PhoneIcon />)}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Event'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};


// --- Dummy MultiSelect Component (You'd replace this with a real one) ---
interface MultiSelectProps {
  label: string;
  options: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedIds, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedNames = selectedIds.map(id => options.find(opt => opt.id === id)?.name).filter(Boolean);

  return (
    <div className="relative mb-4">
      <label className="block text-gray-300 text-sm font-bold mb-2">{label}</label>
      <div
        className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedNames.length > 0
            ? selectedNames.join(', ')
            : <span className="text-gray-500">{placeholder || 'Select items...'}</span>
          }
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg"
          >
            {options.length === 0 && <p className="p-3 text-gray-400">No options available.</p>}
            {options.map(option => (
              <div
                key={option.id}
                className={`p-3 cursor-pointer hover:bg-gray-600 flex items-center justify-between ${selectedIds.includes(option.id) ? 'bg-indigo-700 hover:bg-indigo-600' : ''}`}
                onClick={() => toggleOption(option.id)}
              >
                <span className={selectedIds.includes(option.id) ? 'text-white' : 'text-gray-200'}>{option.name}</span>
                {selectedIds.includes(option.id) && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};