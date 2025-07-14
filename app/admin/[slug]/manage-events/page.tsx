"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon, // For loading spinner
} from '@heroicons/react/24/outline';

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function AdminEvents({ adminSlug = 'your-org-slug' }: { adminSlug?: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any | null>(null); // For edit/add
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        search: searchTerm,
        // Add other filters if you implement them in the UI
      }).toString();

      const response = await fetch(`/api/admin/${adminSlug}/events?${query}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data.events);
    } catch (err: any) {
      setError(err.message || "Failed to fetch events.");
      console.error("Events fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (adminSlug) {
      fetchEvents();
    }
  }, [adminSlug, searchTerm]); // Re-fetch when adminSlug or search term changes

  const handleAddEdit = (event?: any) => {
    setCurrentEvent(event || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true); // Show loading while deleting
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      // If successful, refetch events to update the list
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Failed to delete event.");
      console.error("Delete event error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async (eventData: any) => {
    setIsSaving(true);
    setError(null);
    try {
      const method = eventData.id ? 'PUT' : 'POST';
      const url = eventData.id ? `/api/admin/${adminSlug}/events/${eventData.id}` : `/api/admin/${adminSlug}/events`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, organizerId: 'your_admin_user_id' }), // Replace with actual admin user ID
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchEvents(); // Re-fetch events to update the list
      setIsModalOpen(false);
      setCurrentEvent(null);
    } catch (err: any) {
      setError(err.message || "Failed to save event.");
      console.error("Save event error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Events</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Create, edit, and oversee all your events from one central place.
        </motion.p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleAddEdit()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto justify-center"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Event
            </motion.button>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6" />
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-4 text-xl text-gray-400">Loading events...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">Event Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tickets Sold</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-400 italic">
                        <div className="flex flex-col items-center justify-center py-8">
                          <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                          <p>No events found.</p>
                          <p className="text-sm">Try adjusting your search or add a new event.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    events.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(event.startDateTime).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.eventStatus === 'SCHEDULED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            event.eventStatus === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'
                          }`}>
                            {event.eventStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.ticketsSold?.toLocaleString() || 'N/A'}</td> {/* Using ticketsSold from API */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => alert(`Viewing details for ${event.title}`)} // Replace with actual view modal/page
                              className="text-indigo-400 hover:text-indigo-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="View Details"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAddEdit(event)}
                              className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="Edit Event"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-700/50 transition"
                              title="Delete Event"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 w-full max-w-lg"
            >
              <h3 className="text-2xl font-bold text-white mb-6">{currentEvent ? 'Edit Event' : 'Add New Event'}</h3>
              {error && isSaving && ( // Show error in modal if saving failed
                <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSaveEvent({
                  id: currentEvent?.id,
                  title: formData.get('title'),
                  startDateTime: formData.get('startDateTime'),
                  endDateTime: formData.get('endDateTime'),
                  location: formData.get('location'),
                  eventStatus: formData.get('eventStatus'),
                  description: formData.get('description'),
                  summary: formData.get('summary'),
                  imageUrl: formData.get('imageUrl'),
                  eventType: formData.get('eventType'),
                  isRegistrationRequired: formData.get('isRegistrationRequired') === 'true',
                  maxCapacity: parseInt(formData.get('maxCapacity') as string) || null,
                  isPaid: formData.get('isPaid') === 'true',
                  price: parseFloat(formData.get('price') as string) || null,
                  contactEmail: formData.get('contactEmail'),
                  contactPerson: formData.get('contactPerson'),
                  contactPhone: formData.get('contactPhone'),
                  audience: formData.get('audience'),
                  // Add other fields as needed from your schema
                });
              }}>
                <div className="mb-4">
                  <label htmlFor="eventTitle" className="block text-gray-300 text-sm font-bold mb-2">Event Title</label>
                  <input
                    type="text"
                    id="eventTitle"
                    name="title"
                    defaultValue={currentEvent?.title || ''}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="eventDescription" className="block text-gray-300 text-sm font-bold mb-2">Description</label>
                  <textarea
                    id="eventDescription"
                    name="description"
                    defaultValue={currentEvent?.description || ''}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="eventStartDate" className="block text-gray-300 text-sm font-bold mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      id="eventStartDate"
                      name="startDateTime"
                      defaultValue={currentEvent?.startDateTime ? new Date(currentEvent.startDateTime).toISOString().slice(0, 16) : ''}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="eventEndDate" className="block text-gray-300 text-sm font-bold mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      id="eventEndDate"
                      name="endDateTime"
                      defaultValue={currentEvent?.endDateTime ? new Date(currentEvent.endDateTime).toISOString().slice(0, 16) : ''}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="eventLocation" className="block text-gray-300 text-sm font-bold mb-2">Location</label>
                  <input
                    type="text"
                    id="eventLocation"
                    name="location"
                    defaultValue={currentEvent?.location || ''}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="eventStatus" className="block text-gray-300 text-sm font-bold mb-2">Status</label>
                  <select
                    id="eventStatus"
                    name="eventStatus"
                    defaultValue={currentEvent?.eventStatus || 'DRAFT'}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DRAFT">Draft</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="POSTPONED">Postponed</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label htmlFor="eventType" className="block text-gray-300 text-sm font-bold mb-2">Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    defaultValue={currentEvent?.eventType || 'GENERAL'}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="SPORTS">Sports</option>
                    <option value="BUSINESS">Business</option>
                  </select>
                </div>
                {/* Add more fields from your Event schema as needed */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-colors duration-300"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          </div>
        )}
      </div>
    </div>
  );
}
