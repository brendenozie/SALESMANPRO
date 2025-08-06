// components/TravelBookingModal.tsx
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

interface TourPackageOption {
  id: string;
  name: string;
}

interface DestinationOption {
  id: string;
  name: string;
}

// Define the BookingData interface to match the expected API response
interface TravelBookingData {
  id?: string; // Optional for new bookings
  title: string;
  description: string | null;
  bookingType: 'TOUR_PACKAGE_BOOKING' | 'CUSTOM_TRIP_BOOKING' | 'ACCOMMODATION_BOOKING' | 'FLIGHT_BOOKING' | 'OTHER_TRAVEL_SERVICE';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  totalPrice: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  clientId: string;
  customerName?: string; // For display
  tourPackageId: string | null;
  tourPackageName?: string; // For display
  destinationId: string | null;
  destinationName?: string; // For display
  notes: string | null;
}

interface TravelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: TravelBookingData) => void;
  booking?: TravelBookingData | null; // Booking data for editing, null for adding
  adminSlug: string;
}

const BOOKING_TYPES = ['TOUR_PACKAGE_BOOKING', 'CUSTOM_TRIP_BOOKING', 'ACCOMMODATION_BOOKING', 'FLIGHT_BOOKING', 'OTHER_TRAVEL_SERVICE'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const TravelBookingModal: React.FC<TravelBookingModalProps> = ({ isOpen, onClose, onSave, booking, adminSlug }) => {
  const [title, setTitle] = useState(booking?.title || '');
  const [description, setDescription] = useState(booking?.description || '');
  const [bookingType, setBookingType] = useState<TravelBookingData['bookingType']>(booking?.bookingType || 'TOUR_PACKAGE_BOOKING');
  const [startDate, setStartDate] = useState(booking?.startDate || '');
  const [endDate, setEndDate] = useState(booking?.endDate || '');
  const [totalPrice, setTotalPrice] = useState(booking?.totalPrice || 0);
  const [status, setStatus] = useState<TravelBookingData['status']>(booking?.status || 'PENDING');
  const [clientId, setClientId] = useState(booking?.clientId || '');
  const [tourPackageId, setTourPackageId] = useState(booking?.tourPackageId || '');
  const [destinationId, setDestinationId] = useState(booking?.destinationId || '');
  const [notes, setNotes] = useState(booking?.notes || '');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackageOption[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);

  const [loadingForm, setLoadingForm] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data (clients, tour packages, destinations)
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingForm(true);
      setError(null);
      try {
        const [clientsRes, tourPackagesRes, destinationsRes] = await Promise.all([
          fetch(`/api/admin/${adminSlug}/clients`),
          fetch(`/api/admin/${adminSlug}/tour-packages`), // Assuming you have this API
          fetch(`/api/admin/${adminSlug}/destinations`), // Assuming you have this API
        ]);

        const clientsData = await clientsRes.json();
        const tourPackagesData = await tourPackagesRes.json();
        const destinationsData = await destinationsRes.json();

        if (!clientsRes.ok) throw new Error(clientsData.message || 'Failed to fetch clients');
        if (!tourPackagesRes.ok) throw new Error(tourPackagesData.message || 'Failed to fetch tour packages');
        if (!destinationsRes.ok) throw new Error(destinationsData.message || 'Failed to fetch destinations');

        setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name, email: c.email })));
        setTourPackages(tourPackagesData.map((p: any) => ({ id: p.id, name: p.name })));
        setDestinations(destinationsData.map((d: any) => ({ id: d.id, name: d.name })));

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
      setStartDate(booking.startDate);
      setEndDate(booking.endDate);
      setTotalPrice(booking.totalPrice);
      setStatus(booking.status);
      setClientId(booking.clientId);
      setTourPackageId(booking.tourPackageId || '');
      setDestinationId(booking.destinationId || '');
      setNotes(booking.notes || '');
    } else {
      // Reset form for new booking
      setTitle('');
      setDescription('');
      setBookingType('TOUR_PACKAGE_BOOKING');
      setStartDate('');
      setEndDate('');
      setTotalPrice(0);
      setStatus('PENDING');
      setClientId('');
      setTourPackageId('');
      setDestinationId('');
      setNotes('');
    }
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true); // Use loadingForm for form submission
    setError(null);

    // Basic client-side validation
    if (!title || !bookingType || !startDate || !endDate || totalPrice === undefined || !clientId) {
      setError('Title, booking type, start date, end date, total price, and client are required.');
      setLoadingForm(false);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      setLoadingForm(false);
      return;
    }
    if (totalPrice < 0) {
      setError('Total price cannot be negative.');
      setLoadingForm(false);
      return;
    }

    const method = booking ? 'PUT' : 'POST';
    const url = booking ? `/api/admin/${adminSlug}/travel-bookings/${booking.id}` : `/api/admin/${adminSlug}/travel-bookings`;

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
          startDate,
          endDate,
          totalPrice,
          status,
          clientId,
          tourPackageId: tourPackageId || null,
          destinationId: destinationId || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${booking ? 'update' : 'create'} booking.`);
      }

      const savedBooking: TravelBookingData = await response.json();
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
            {booking ? 'Edit Travel Booking' : 'Create New Travel Booking'}
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
                  onChange={(e) => setBookingType(e.target.value as TravelBookingData['bookingType'])}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {BOOKING_TYPES.map((type) => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">Total Price ($)</label>
                <input
                  type="number"
                  id="totalPrice"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label htmlFor="tourPackageId" className="block text-sm font-medium text-gray-700 mb-1">Tour Package (Optional)</label>
                <select
                  id="tourPackageId"
                  value={tourPackageId}
                  onChange={(e) => setTourPackageId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a Tour Package</option>
                  {tourPackages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="destinationId" className="block text-sm font-medium text-gray-700 mb-1">Destination (Optional)</label>
                <select
                  id="destinationId"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a Destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TravelBookingData['status'])}
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

export default TravelBookingModal;
