// components/BookingModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Define interfaces for data fetched by the modal
interface ClientOption {
  id: string;
  name: string;
  email: string;
}

interface EducatorOption {
  id: string;
  name: string;
}

interface LocationOption {
  id: string;
  name: string;
}

// Define the BookingData interface to match the expected API response
interface BookingData {
  id?: string; // Optional for new bookings
  title: string;
  description: string | null;
  bookingType: 'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER';
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  clientId: string;
  clientName?: string; // For display
  educatorId: string | null;
  educatorName?: string; // For display
  locationId: string | null;
  locationName?: string; // For display
  notes: string | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingData) => void;
  booking?: BookingData | null; // Booking data for editing, null for adding
  adminSlug: string;
}

const BOOKING_TYPES = ['CLASS', 'PERSONAL_TRAINING', 'VIRTUAL_TOUR', 'OTHER'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, booking, adminSlug }) => {
  const [title, setTitle] = useState(booking?.title || '');
  const [description, setDescription] = useState(booking?.description || '');
  const [bookingType, setBookingType] = useState<'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER'>(booking?.bookingType || 'PERSONAL_TRAINING');
  const [startTime, setStartTime] = useState(booking?.startTime ? new Date(booking.startTime).toISOString().slice(0, 16) : ''); // YYYY-MM-DDTHH:MM
  const [endTime, setEndTime] = useState(booking?.endTime ? new Date(booking.endTime).toISOString().slice(0, 16) : '');     // YYYY-MM-DDTHH:MM
  const [status, setStatus] = useState<'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'>(booking?.status || 'PENDING');
  const [clientId, setClientId] = useState(booking?.clientId || '');
  const [educatorId, setEducatorId] = useState(booking?.educatorId || '');
  const [locationId, setLocationId] = useState(booking?.locationId || '');
  const [notes, setNotes] = useState(booking?.notes || '');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [educators, setEducators] = useState<EducatorOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);

  const [loadingForm, setLoadingForm] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data (clients, educators, locations)
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingForm(true);
      setError(null);
      try {
        const [clientsRes, educatorsRes, locationsRes] = await Promise.all([
          fetch(`/api/admin/${adminSlug}/clients`),
          fetch(`/api/admin/${adminSlug}/trainers`), // Trainers are Educators
          fetch(`/api/admin/${adminSlug}/locations`),
        ]);

        const clientsData = await clientsRes.json();
        const educatorsData = await educatorsRes.json();
        const locationsData = await locationsRes.json();

        if (!clientsRes.ok) throw new Error(clientsData.message || 'Failed to fetch clients');
        if (!educatorsRes.ok) throw new Error(educatorsData.message || 'Failed to fetch educators');
        if (!locationsRes.ok) throw new Error(locationsData.message || 'Failed to fetch locations');

        setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
        setEducators(educatorsData.map((e: any) => ({ id: e.id, name: e.name })));
        setLocations(locationsData.map((l: any) => ({ id: l.id, name: l.name })));

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching dropdown data:", err);
      } finally {
        setLoadingForm(false);
      }
    };

    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen, adminSlug]);

  // Update form fields when booking prop changes (for edit mode)
  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setDescription(booking.description || '');
      setBookingType(booking.bookingType);
      setStartTime(new Date(booking.startTime).toISOString().slice(0, 16));
      setEndTime(new Date(booking.endTime).toISOString().slice(0, 16));
      setStatus(booking.status);
      setClientId(booking.clientId);
      setEducatorId(booking.educatorId || '');
      setLocationId(booking.locationId || '');
      setNotes(booking.notes || '');
    } else {
      // Reset form for new booking
      setTitle('');
      setDescription('');
      setBookingType('PERSONAL_TRAINING');
      setStartTime('');
      setEndTime('');
      setStatus('PENDING');
      setClientId('');
      setEducatorId('');
      setLocationId('');
      setNotes('');
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true); // Use loadingForm for form submission
    setError(null);

    // Basic client-side validation
    if (!title || !bookingType || !startTime || !endTime || !clientId) {
      setError('Title, booking type, start time, end time, and client are required.');
      setLoadingForm(false);
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setError('Start time must be before end time.');
      setLoadingForm(false);
      return;
    }

    const method = booking ? 'PUT' : 'POST';
    const url = booking ? `/api/admin/${adminSlug}/bookings/${booking.id}` : `/api/admin/${adminSlug}/bookings`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || null,
          bookingType,
          startTime,
          endTime,
          status,
          clientId,
          educatorId: educatorId || null,
          locationId: locationId || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${booking ? 'update' : 'create'} booking.`);
      }

      const savedBooking: BookingData = await response.json();
      onSave(savedBooking); // Pass the saved booking data back to the parent
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative text-gray-900"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {booking ? 'Edit Booking' : 'Create New Booking'}
          </h2>
          {loadingForm && (
            <div className="text-center py-4">
              <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-600 mt-2">Loading form data...</p>
            </div>
          )}
          {!loadingForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Booking Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bookingType" className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                <select
                  id="bookingType"
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as 'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {BOOKING_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="educatorId" className="block text-sm font-medium text-gray-700 mb-1">Assigned Trainer (Optional)</label>
                <select
                  id="educatorId"
                  value={educatorId}
                  onChange={(e) => setEducatorId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No Trainer</option>
                  {educators.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                <select
                  id="locationId"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">No Specific Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Internal Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3 mt-6">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loadingForm}
                >
                  {loadingForm ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    booking ? 'Save Changes' : 'Create Booking'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
