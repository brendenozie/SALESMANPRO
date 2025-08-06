"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarDaysIcon,
  TagIcon,
  UserCircleIcon,
  GlobeAltIcon,
  CubeTransparentIcon as PackageIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

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
          fetch(`/api/admin/${adminSlug}/tour-packages`),
          fetch(`/api/admin/${adminSlug}/destinations`),
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
    const toastId = toast.loading(`${booking ? 'Saving changes...' : 'Creating new booking...'}`);
    setError(null);

    if (!title || !bookingType || !startDate || !endDate || totalPrice === undefined || !clientId) {
      toast.error('Please fill in all required fields.', { id: toastId });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.', { id: toastId });
      return;
    }
    if (totalPrice < 0) {
      toast.error('Total price cannot be negative.', { id: toastId });
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
      onSave(savedBooking);
      toast.success(`Booking "${savedBooking.title}" ${booking ? 'updated' : 'created'} successfully!`, { id: toastId });
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
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
          className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative text-gray-200 border border-gray-700"
          initial={{ y: -50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 100
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-200 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-2 text-center drop-shadow">
            {booking ? 'Edit Travel Booking' : 'Create New Booking'}
          </h2>
          <p className="text-center text-gray-400 mb-8">
            {booking ? 'Update the details for this travel booking.' : 'Fill in the details below to create a new travel booking.'}
          </p>

          {loadingForm && (
            <div className="text-center py-12">
              <svg className="animate-spin h-10 w-10 text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-gray-400 mt-2">Fetching data...</p>
            </div>
          )}
          {!loadingForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <CheckBadgeIcon className="w-5 h-5 mr-2 text-teal-400" /> Booking Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    placeholder="e.g., 'Paris Dream Trip'"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="clientId" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <UserCircleIcon className="w-5 h-5 mr-2 text-teal-400" /> Client
                  </label>
                  <select
                    id="clientId"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                    required
                  >
                    <option value="" className="text-gray-500">Select a Client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bookingType" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <TagIcon className="w-5 h-5 mr-2 text-purple-400" /> Booking Type
                  </label>
                  <select
                    id="bookingType"
                    value={bookingType}
                    onChange={(e) => setBookingType(e.target.value as TravelBookingData['bookingType'])}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                    required
                  >
                    {BOOKING_TYPES.map((type) => (
                      <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-blue-400" /> Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TravelBookingData['status'])}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                    required
                  >
                    {BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-yellow-400" /> Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-yellow-400" /> End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="totalPrice" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-400" /> Total Price ($)
                </label>
                <input
                  type="number"
                  id="totalPrice"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="e.g., 1500.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tourPackageId" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <PackageIcon className="w-5 h-5 mr-2 text-orange-400" /> Tour Package (Optional)
                  </label>
                  <select
                    id="tourPackageId"
                    value={tourPackageId}
                    onChange={(e) => setTourPackageId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" className="text-gray-500">Select a Tour Package</option>
                    {tourPackages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="destinationId" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <GlobeAltIcon className="w-5 h-5 mr-2 text-sky-400" /> Destination (Optional)
                  </label>
                  <select
                    id="destinationId"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" className="text-gray-500">Select a Destination</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" /> Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="Enter a brief description of the booking..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-400" /> Internal Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  placeholder="Add private notes for the team..."
                ></textarea>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center bg-red-900 bg-opacity-30 text-red-200 px-4 py-3 rounded-xl text-sm border border-red-700"
                >
                  <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                  {error}
                </motion.div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loadingForm}
                >
                  {booking ? 'Save Changes' : 'Create Booking'}
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