// app/admin/[slug]/teacher-classes/[courseId]/manage-events/ManageEventsPageClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

// Import types from the server component file
import type { EventData, CourseInfo } from './page';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

// Define enums for form dropdowns, matching Prisma schema
const EventTypes = ['GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'WORKSHOP', 'ORIENTATION', 'FUNDRAISER', 'OTHER'];
const EventStatuses = ['SCHEDULED', 'POSTPONED', 'CANCELLED', 'COMPLETED'];

interface ManageEventsPageClientProps {
  course: CourseInfo;
  initialEvents: EventData[];
  educatorId: string;
  companyId: string;
}

export default function ManageEventsPageClient({
  course,
  initialEvents,
  educatorId,
  companyId,
}: ManageEventsPageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context

  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null); // Null for add, object for edit
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form states for event modal
  const [eventTitle, setEventTitle] = useState('');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventOnlineMeetingLink, setEventOnlineMeetingLink] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [eventVideoUrl, setEventVideoUrl] = useState('');
  const [eventEventType, setEventEventType] = useState(EventTypes[0]);
  const [eventEventStatus, setEventEventStatus] = useState(EventStatuses[0]);
  const [eventIsRegistrationRequired, setEventIsRegistrationRequired] = useState(false);
  const [eventMaxCapacity, setEventMaxCapacity] = useState('');
  const [eventIsPaid, setEventIsPaid] = useState(false);
  const [eventPrice, setEventPrice] = useState('');
  const [eventContactPerson, setEventContactPerson] = useState('');
  const [eventContactEmail, setEventContactEmail] = useState('');
  const [eventContactPhone, setEventContactPhone] = useState('');

  // Update events state when initialEvents prop changes
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventStatus.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  }, [events, searchTerm]);

  const resetForm = useCallback(() => {
    setEventTitle('');
    setEventSummary('');
    setEventDescription('');
    setEventStartDate('');
    setEventStartTime('');
    setEventEndDate('');
    setEventEndTime('');
    setEventLocation('');
    setEventOnlineMeetingLink('');
    setEventImageUrl('');
    setEventVideoUrl('');
    setEventEventType(EventTypes[0]);
    setEventEventStatus(EventStatuses[0]);
    setEventIsRegistrationRequired(false);
    setEventMaxCapacity('');
    setEventIsPaid(false);
    setEventPrice('');
    setEventContactPerson('');
    setEventContactEmail('');
    setEventContactPhone('');
    setEditingEvent(null);
  }, []);

  const handleOpenModal = useCallback((eventToEdit: EventData | null = null) => {
    if (eventToEdit) {
      setEditingEvent(eventToEdit);
      setEventTitle(eventToEdit.title);
      setEventSummary(eventToEdit.summary || '');
      setEventDescription(eventToEdit.description || '');
      setEventStartDate(eventToEdit.startDateTime.split('T')[0]);
      setEventStartTime(new Date(eventToEdit.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setEventEndDate(eventToEdit.endDateTime ? eventToEdit.endDateTime.split('T')[0] : '');
      setEventEndTime(eventToEdit.endDateTime ? new Date(eventToEdit.endDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
      setEventLocation(eventToEdit.location || '');
      setEventOnlineMeetingLink(eventToEdit.onlineMeetingLink || '');
      setEventImageUrl(eventToEdit.imageUrl || '');
      setEventVideoUrl(eventToEdit.videoUrl || '');
      setEventEventType(eventToEdit.eventType);
      setEventEventStatus(eventToEdit.eventStatus);
      setEventIsRegistrationRequired(eventToEdit.isRegistrationRequired);
      setEventMaxCapacity(eventToEdit.maxCapacity !== null ? String(eventToEdit.maxCapacity) : '');
      setEventIsPaid(eventToEdit.isPaid);
      setEventPrice(eventToEdit.price !== null ? String(eventToEdit.price) : '');
      setEventContactPerson(eventToEdit.contactPerson || '');
      setEventContactEmail(eventToEdit.contactEmail || '');
      setEventContactPhone(eventToEdit.contactPhone || '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSaveEvent = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setStatusMessage(null);

    // Combine date and time strings into ISO 8601 DateTime strings
    const fullStartDateTime = `${eventStartDate}T${eventStartTime}:00.000Z`;
    const fullEndDateTime = eventEndDate && eventEndTime ? `${eventEndDate}T${eventEndTime}:00.000Z` : null;

    const payload = {
      id: editingEvent?.id || undefined,
      title: eventTitle,
      summary: eventSummary,
      description: eventDescription,
      startDateTime: fullStartDateTime,
      endDateTime: fullEndDateTime,
      location: eventLocation,
      onlineMeetingLink: eventOnlineMeetingLink,
      imageUrl: eventImageUrl,
      videoUrl: eventVideoUrl,
      eventType: eventEventType,
      eventStatus: eventEventStatus,
      isRegistrationRequired: eventIsRegistrationRequired,
      maxCapacity: eventMaxCapacity,
      isPaid: eventIsPaid,
      price: eventPrice,
      contactPerson: eventContactPerson,
      contactEmail: eventContactEmail,
      contactPhone: eventContactPhone,
      organizerId: educatorId, // The authenticated educator
      companyId: companyId,
      // For course-specific events, ensure targetCourseIds includes the current courseId
      targetCourseIds: [course.id],
      // Other audience fields can be empty arrays or managed through a more complex UI
      targetAcademicLevelIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      courseIdFromRoute: course.id, // Pass courseId from route to API for filtering
    };

    try {
      const res = await fetch(`${apiBaseUrl}/teacher/events`, {
        method: 'POST', // Use POST for upsert
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedEvent: EventData = await res.json();
        setEvents(prevEvents => {
          if (editingEvent) {
            return prevEvents.map(evt =>
              evt.id === savedEvent.id ? savedEvent : evt
            );
          } else {
            return [...prevEvents, savedEvent];
          }
        });
        showStatus('success', `Event "${savedEvent.title}" ${editingEvent ? 'updated' : 'created'} successfully!`);
        handleCloseModal();
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to save event.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [
    loading, eventTitle, eventSummary, eventDescription, eventStartDate, eventStartTime,
    eventEndDate, eventEndTime, eventLocation, eventOnlineMeetingLink, eventImageUrl,
    eventVideoUrl, eventEventType, eventEventStatus, eventIsRegistrationRequired,
    eventMaxCapacity, eventIsPaid, eventPrice, eventContactPerson, eventContactEmail,
    eventContactPhone, educatorId, companyId, course.id, editingEvent, showStatus, handleCloseModal
  ]);

  const handleDeleteConfirm = useCallback((id: string, title: string) => {
    setEventToDelete({ id, title });
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteEvent = useCallback(async () => {
    if (!eventToDelete || loading) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${apiBaseUrl}/teacher/events/${eventToDelete.id}?educatorId=${encodeURIComponent(educatorId)}&companyId=${encodeURIComponent(companyId)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setEvents(prevEvents => prevEvents.filter(evt => evt.id !== eventToDelete.id));
        showStatus('success', `Event "${eventToDelete.title}" deleted successfully!`);
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to delete event.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  }, [eventToDelete, educatorId, companyId, showStatus, loading]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
            disabled={loading}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Manage Events <span style={{ color: primaryColor }}>{course.title}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create, edit, and track events for {course.academicLevelName} - {course.title}.
            </p>
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <button
            onClick={() => handleOpenModal()}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-[${primaryColor}] text-white rounded-md shadow-md
                        hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Event
          </button>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-700">Loading events...</span>
        </div>
      )}

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="max-w-xl mx-auto relative">
        <input
          type="text"
          placeholder="Search events by title, type, or status..."
          className="w-full p-3 pl-10 rounded-full border border-gray-300 shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </motion.div>

      {/* Events List */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event: EventData) => (
            <motion.div
              key={event.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col justify-between
                          hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ease-in-out"
              variants={itemVariants}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                    ${event.eventStatus === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                                      event.eventStatus === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                      event.eventStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'}`}>
                    {event.eventStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{event.summary || event.description}</p>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                    <span>{new Date(event.startDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-gray-500" />
                    <span>
                      {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.onlineMeetingLink && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-5 w-5 text-gray-500" />
                      <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Join Online
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-gray-500" />
                    <span>Type: {event.eventType}</span>
                  </div>
                  {event.isPaid && (
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                      <span>Price: ${event.price?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  {event.isRegistrationRequired && (
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5 text-gray-500" />
                      <span>Registration Required{event.maxCapacity && ` (Max: ${event.maxCapacity})`}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-4 flex gap-3 justify-end">
                <button
                  onClick={() => handleOpenModal(event)}
                  className={`flex-shrink-0 p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Edit Event"
                  disabled={loading}
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteConfirm(event.id, event.title)}
                  className={`flex-shrink-0 p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Delete Event"
                  disabled={loading}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-md border border-gray-200"
            variants={itemVariants}
          >
            <CalendarDaysIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No events found for this course or matching your search.</p>
            <p className="text-sm mt-2">Click "Add New Event" to get started!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal} // Close on overlay click
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent click from closing modal
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <form onSubmit={handleSaveEvent} className="space-y-5">
                {/* Basic Info */}
                <div>
                  <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    id="event-title"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="event-summary" className="block text-sm font-medium text-gray-700 mb-1">Summary (Short)</label>
                  <input
                    type="text"
                    id="event-summary"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Full)</label>
                  <textarea
                    id="event-description"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] resize-y"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    disabled={loading}
                  ></textarea>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      id="event-start-date"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-start-time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      id="event-start-time"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      id="event-end-date"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-end-time" className="block text-sm font-medium text-gray-700 mb-1">End Time (Optional)</label>
                    <input
                      type="time"
                      id="event-end-time"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Location & Links */}
                <div>
                  <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location (e.g., "School Hall A", "Online")</label>
                  <input
                    type="text"
                    id="event-location"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="event-online-meeting-link" className="block text-sm font-medium text-gray-700 mb-1">Online Meeting Link (URL)</label>
                  <input
                    type="url"
                    id="event-online-meeting-link"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventOnlineMeetingLink}
                    onChange={(e) => setEventOnlineMeetingLink(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="event-image-url" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    id="event-image-url"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventImageUrl}
                    onChange={(e) => setEventImageUrl(e.target.value)}
                    placeholder="https://placehold.co/600x400"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="event-video-url" className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                  <input
                    type="url"
                    id="event-video-url"
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                    value={eventVideoUrl}
                    onChange={(e) => setEventVideoUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                    <select
                      id="event-type"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventEventType}
                      onChange={(e) => setEventEventType(e.target.value)}
                      required
                      disabled={loading}
                    >
                      {EventTypes.map(type => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="event-status" className="block text-sm font-medium text-gray-700 mb-1">Event Status</label>
                    <select
                      id="event-status"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventEventStatus}
                      onChange={(e) => setEventEventStatus(e.target.value)}
                      required
                      disabled={loading}
                    >
                      {EventStatuses.map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Registration & Pricing */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="event-registration-required"
                    className={`h-4 w-4 text-[${primaryColor}] border-gray-300 rounded focus:ring-[${accentColor}]`}
                    checked={eventIsRegistrationRequired}
                    onChange={(e) => setEventIsRegistrationRequired(e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="event-registration-required" className="text-sm font-medium text-gray-700">Registration Required</label>
                </div>
                {eventIsRegistrationRequired && (
                  <div>
                    <label htmlFor="event-max-capacity" className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (Optional)</label>
                    <input
                      type="number"
                      id="event-max-capacity"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventMaxCapacity}
                      onChange={(e) => setEventMaxCapacity(e.target.value)}
                      placeholder="e.g., 100"
                      min="1"
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="event-is-paid"
                    className={`h-4 w-4 text-[${primaryColor}] border-gray-300 rounded focus:ring-[${accentColor}]`}
                    checked={eventIsPaid}
                    onChange={(e) => setEventIsPaid(e.target.checked)}
                    disabled={loading}
                  />
                  <label htmlFor="event-is-paid" className="text-sm font-medium text-gray-700">Paid Event</label>
                </div>
                {eventIsPaid && (
                  <div>
                    <label htmlFor="event-price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      id="event-price"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventPrice}
                      onChange={(e) => setEventPrice(e.target.value)}
                      placeholder="e.g., 10.00"
                      step="0.01"
                      required={eventIsPaid}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="event-contact-person" className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      id="event-contact-person"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventContactPerson}
                      onChange={(e) => setEventContactPerson(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-contact-email" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      id="event-contact-email"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventContactEmail}
                      onChange={(e) => setEventContactEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="event-contact-phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      id="event-contact-phone"
                      className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                      value={eventContactPhone}
                      onChange={(e) => setEventContactPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                                hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (editingEvent ? 'Save Changes' : 'Create Event')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the event "<strong>{eventToDelete?.title}</strong>"? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className={`px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md
                              hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
