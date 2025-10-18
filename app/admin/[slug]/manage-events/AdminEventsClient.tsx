"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon, // For loading spinner
  ExclamationCircleIcon,
  CheckCircleIcon, // For success messages
  XCircleIcon, // For general errors/warnings
} from '@heroicons/react/24/outline';
import { debounce } from 'lodash'; // For debouncing search input
import EventForm from './EventForm'; // Import the EventForm component

import {
  IEvent
} from '@/types/typings';



const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


type Agent = {
  id: string;
  name: string;
   email: string
};

interface AdminEventsProps {

  slug?: string;
  allOrganizers?: Agent[]; 
  allEvents?: IEvent[]
  
  // Optional organizers prop
}

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", damping: 20, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { ease: "easeOut", duration: 0.2 } },
};

// --- Main AdminEvents Component ---
export default function AdminEventsClient({ slug, allOrganizers, allEvents }: AdminEventsProps) {

  // const [events, setEvents] = useState<Event[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<IEvent | null>(null); // For edit/add
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // For modal save button

  // Debounced search term
  const debouncedSearchTerm = useCallback(
    debounce((nextValue: string) => {
      setSearchTerm(nextValue);
    }, 500),
    []
  );

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    debouncedSearchTerm(e.target.value);
  };

  const fetchEvents = useCallback(async () => {
    if (!slug) {
      setError("Admin slug is missing. Cannot fetch events.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null); // Clear errors before fetching
    setSuccessMessage(null); // Clear success messages before fetching
    try {
      const query = new URLSearchParams({
        // search: searchTerm,
        companyId: slug,
      }).toString();

      const response = await fetch(`${apiBaseUrl}/admin/events?${query}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // console.log(data);

      // setEvents(data.events);

    } catch (err: any) {
      setError(err.message || "Failed to fetch events.");
      console.error("Events fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [slug, searchTerm]); // Dependencies for useCallback

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]); // Re-fetch when fetchEvents changes (due to slug/searchTerm)

  // Clear messages after a few seconds
  useEffect(() => {
    if (error && !isModalOpen) { // Only clear global error if modal isn't open
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, isModalOpen]);

  const handleAddEdit = (event?: IEvent) => {
    setCurrentEvent(event || null);
    setError(null); // Clear previous errors when opening the modal
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!slug) {
      setError("Admin slug is missing. Cannot delete event.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true); // Show loading while deleting
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      setSuccessMessage("Event deleted successfully!");
      await fetchEvents(); // Refetch to update the list
    } catch (err: any) {
      setError(err.message || "Failed to delete event.");
      console.error("Delete event error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async (eventData: Partial<IEvent>) => {
    if (!slug) {
      setError("Admin slug is missing. Cannot save event.");
      return;
    }
    setIsSaving(true);
    setError(null); // Clear errors specific to the modal save operation
    try {
      const method = eventData.id ? 'PUT' : 'POST';
      const url = eventData.id ? `${apiBaseUrl}/admin/events/${eventData.id}` : `${apiBaseUrl}/admin/events`;

      // Assign a placeholder organizerId. In a real app, this would come from auth context. organizerId: 'admin_user_placeholder_id'
      const payload = { ...eventData, companyId: slug, };

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setSuccessMessage(`Event ${eventData.id ? 'updated' : 'added'} successfully!`);
      setIsModalOpen(false);
      setCurrentEvent(null);
      await fetchEvents(); // Re-fetch events to update the list
    } catch (err: any) {
      setError(err.message || "Failed to save event."); // This error will be shown in the modal
      console.error("Save event error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6 sm:p-10 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>


      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Hub</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-gray-300 mb-10"
        >
          Your command center for all events. Effortlessly create, modify, and monitor.
        </motion.p>

        <motion.div
          className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search events by title or location..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                onChange={handleSearchInputChange}
                aria-label="Search events"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleAddEdit()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full sm:w-auto justify-center"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Event
            </motion.button>
          </div>

          <AnimatePresence>
            {error && !isModalOpen && ( // Only show global error if modal isn't open
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3"
              >
                <ExclamationCircleIcon className="w-6 h-6" />
                <p><strong>Error:</strong> {error}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-900/50 text-green-300 border border-green-700 p-4 rounded-lg mb-6 flex items-center gap-3"
              >
                <CheckCircleIcon className="w-6 h-6" />
                <p><strong>Success:</strong> {successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-4 text-xl text-gray-400">Fetching your events, please wait...</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar"> {/* Added custom-scrollbar class */}
              <motion.table
                className="min-w-full divide-y divide-gray-700"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <thead className="bg-gray-700 sticky top-0 z-10"> {/* Sticky header */}
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
                  {!allEvents || allEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 whitespace-nowrap text-center text-gray-400 italic">
                        <div className="flex flex-col items-center justify-center">
                          <ExclamationCircleIcon className="w-14 h-14 mb-4 text-gray-600" />
                          <p className="text-xl font-medium">No events found.</p>
                          <p className="text-sm mt-2">Try adjusting your search filters or click "Add New Event" to create one.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (allEvents.length > 0 &&
                    allEvents.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        variants={itemVariants}
                        className="hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <CalendarIcon className="inline-block w-4 h-4 mr-1 text-gray-400" />
                          {new Date(event.startDateTime).toLocaleDateString()}
                          {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleDateString()}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            event.eventStatus === 'SCHEDULED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            // event.eventStatus === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            event.eventStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            event.eventStatus === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400'
                          }`}>
                            {event.eventStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                          {event.isRegistrationRequired ? (
                            <span>{event.ticketsSold?.toLocaleString() || '0'}<span className="text-gray-500">/{event.maxCapacity || '∞'}</span></span>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => alert(`Viewing details for ${event.title}\n\nDescription: ${event.description || 'N/A'}\nSummary: ${event.summary || 'N/A'}\nImage: ${event.imageUrl || 'N/A'}\nType: ${event.eventType}\nRegistration Required: ${event.isRegistrationRequired ? 'Yes' : 'No'}\nMax Capacity: ${event.maxCapacity || 'N/A'}\nPaid: ${event.isPaid ? 'Yes' : 'No'}\nPrice: ${event.price !== null ? `$${event.price}` : 'N/A'}\nContact Person: ${event.contactPerson || 'N/A'}\nContact Email: ${event.contactEmail || 'N/A'}\nContact Phone: ${event.contactPhone || 'N/A'}\nAudience: ${event.audience || 'N/A'}`)}
                              className="text-indigo-400 hover:text-indigo-300 p-2 rounded-full hover:bg-gray-700/50 transition duration-150 ease-in-out"
                              title="View Details"
                              aria-label={`View details for ${event.title}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAddEdit(event)}
                              className="text-purple-400 hover:text-purple-300 p-2 rounded-full hover:bg-gray-700/50 transition duration-150 ease-in-out"
                              title="Edit Event"
                              aria-label={`Edit ${event.title}`}
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-700/50 transition duration-150 ease-in-out"
                              title="Delete Event"
                              aria-label={`Delete ${event.title}`}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </motion.table>
            </div>
          )}
        </motion.div>

        {/* Add/Edit Event Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <EventForm
              event={currentEvent}
              onSave={handleSaveEvent}
              onClose={() => {
                setIsModalOpen(false);
                setCurrentEvent(null);
                setError(null); // Clear modal-specific errors on close
              }}
              companyId={slug || ''}
              allOrganizers={allOrganizers || []}
              // organizerId='admin_user_placeholder_id' // Placeholder, replace with actual user ID from auth context
              isSaving={isSaving}
              apiError={error} // Pass API error to the form
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}