"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  QrCodeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Define Data Types
type Event = {
  id: string;
  title: string;
  startDateTime: string;
};

type Attendee = {
  id: string; // registrationId
  name: string;
  email: string;
  ticketType: string;
  checkedIn: boolean;
};

type Message = {
  type: 'success' | 'error';
  text: string;
};

// Framer Motion variants
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const attendeeCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

interface Props {
  adminSlug: string;
  // This data is pre-fetched on the server
  initialEvents: Event[];
}

export default function AdminCheckinClient({ adminSlug, initialEvents }: Props) {
  // Use initial data passed from Server Component
  const [events] = useState<Event[]>(initialEvents); 
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to fetch attendees for the currently selected event and search term
  const fetchAttendeesForEvent = async () => {
    if (!selectedEventId) {
      setAttendees([]);
      return;
    }
    setIsLoadingAttendees(true);
    setError(null);
    try {
      // Use relative path for client-side API calls
      const query = new URLSearchParams({
        search: searchTerm,
      }).toString();
      
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/events/${selectedEventId}/check-in-attendees?${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data: Attendee[] = await response.json();
      setAttendees(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendees for event.");
      console.error("Attendees check-in fetch error:", err);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  // Debounced effect to refetch attendees when the event or search term changes
  useEffect(() => {
    const handler = setTimeout(() => {
      if (selectedEventId && adminSlug) {
        fetchAttendeesForEvent();
      } else {
        setAttendees([]); 
      }
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [selectedEventId, adminSlug, searchTerm]); 

  // Message timeout effect
  useEffect(() => {
    if (message) {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      messageTimeoutRef.current = setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, [message]);

  const handleToggleCheckIn = async (registrationId: string, currentCheckedInStatus: boolean) => {
    setIsLoadingAttendees(true);
    setError(null);
    try {
      const newStatus = currentCheckedInStatus ? "REGISTERED" : "ATTENDED";
      const response = await fetch(`${apiBaseUrl}/admin/${adminSlug}/check-in/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage({
        type: result.attendee.checkedIn ? 'success' : 'error',
        text: result.message
      });
      
      // Update the local state directly for immediate visual feedback
      setAttendees(prevAttendees => 
        prevAttendees.map(att => 
          att.id === registrationId 
            ? { ...att, checkedIn: result.attendee.checkedIn } 
            : att
        )
      );

    } catch (err: any) {
      setError(err.message || "Failed to update check-in status.");
      setMessage({ type: 'error', text: err.message || "Failed to update check-in status." });
      console.error("Toggle check-in error:", err);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  const hasEventsToSelect = events.length > 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-8 sm:p-12 font-sans relative overflow-hidden">
      {/* Decorative Background Elements and Styles */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>

      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Check-in</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Efficiently check in attendees at your event entrance.
        </motion.p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative w-full sm:w-1/2">
              <label htmlFor="event-select" className="sr-only">Select Event</label>
              <select
                id="event-select"
                value={selectedEventId}
                onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setSearchTerm(''); // Clear search when event changes
                }}
                className="block w-full bg-gray-900 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-indigo-500 appearance-none"
              >
                <option value="">
                  {hasEventsToSelect ? '-- Select an Event --' : '-- No Events Available --'}
                </option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title} ({new Date(event.startDateTime).toLocaleDateString()})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <div className="relative w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Search attendee by name or email..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedEventId || isLoadingAttendees}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-4 rounded-lg mb-6 flex items-center gap-3">
              <ExclamationCircleIcon className="w-6 h-6" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}
            >
              {message.type === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <XCircleIcon className="w-6 h-6" />}
              <p>{message.text}</p>
            </motion.div>
          )}

          {/* Conditional Rendering based on state */}
          {!hasEventsToSelect ? (
            <div className="text-center py-10 text-gray-400 italic flex flex-col items-center">
              <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
              <p>No events available for check-in.</p>
              <p className="text-sm">Please create events in the "Events" section.</p>
            </div>
          ) : !selectedEventId ? (
            <div className="text-center py-10 text-gray-400 italic flex flex-col items-center">
              <CalendarIcon className="w-12 h-12 mb-4 text-gray-600" />
              <p>Please select an event from the dropdown to view attendees.</p>
            </div>
          ) : isLoadingAttendees ? (
            <div className="text-center py-10">
              <ArrowPathIcon className="w-16 h-16 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-4 text-xl text-gray-400">Loading attendees for this event...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendees.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700">
                  <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                  <p>No attendees found for this event or matching your search.</p>
                  <p className="text-sm">Ensure attendees have registered for this event.</p>
                </div>
              ) : (
                attendees.map((attendee, index) => (
                  <motion.div
                    key={attendee.id}
                    variants={attendeeCardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-700 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
                        <UsersIcon className="w-6 h-6 mr-2 text-purple-400" /> {attendee.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-1">{attendee.email}</p>
                      <p className="text-gray-500 text-xs mb-4">{attendee.ticketType}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        attendee.checkedIn ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
                      </span>
                      <button
                        onClick={() => handleToggleCheckIn(attendee.id, attendee.checkedIn)}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-colors duration-200 flex items-center gap-2
                          ${attendee.checkedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        disabled={isLoadingAttendees}
                      >
                        {isLoadingAttendees ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : attendee.checkedIn ? 'Check Out' : 'Check In'}
                        {!isLoadingAttendees && (attendee.checkedIn ? <XCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />)}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
