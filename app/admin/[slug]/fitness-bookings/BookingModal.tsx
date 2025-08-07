"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  MapPinIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
  id?: string;
  title: string;
  description: string | null;
  bookingType: 'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER';
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  clientId: string;
  clientName?: string;
  educatorId: string | null;
  educatorName?: string;
  locationId: string | null;
  locationName?: string;
  notes: string | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingData) => void;
  booking?: BookingData | null;
  slug: string;
}

const BOOKING_TYPES = ['CLASS', 'PERSONAL_TRAINING', 'VIRTUAL_TOUR', 'OTHER'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

// Reusable input component for better styling
const FormInput = ({ label, icon, ...props }: any) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-200 mb-1">{label}</label>
    <div className="relative rounded-lg shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <input
        {...props}
        className="block w-full rounded-lg border-none bg-gray-700/50 py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 sm:text-sm transition-all"
      />
    </div>
  </div>
);

// Reusable select component with icon
const FormSelect = ({ label, icon, options, ...props }: any) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-200 mb-1">{label}</label>
    <div className="relative rounded-lg shadow-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <select
        {...props}
        className="block w-full rounded-lg border-none bg-gray-700/50 py-3 pl-11 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 sm:text-sm transition-all appearance-none"
      >
        {options}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <ArrowsRightLeftIcon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const FormTextarea = ({ label, icon, ...props }: any) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-200 mb-1">{label}</label>
    <div className="relative rounded-lg shadow-sm">
      <div className="pointer-events-none absolute top-3 left-0 flex items-center pl-3">
        {icon}
      </div>
      <textarea
        {...props}
        className="block w-full rounded-lg border-none bg-gray-700/50 py-3 pl-11 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-gray-700 sm:text-sm transition-all"
      ></textarea>
    </div>
  </div>
);

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, booking, slug }) => {
  const [title, setTitle] = useState(booking?.title || '');
  const [description, setDescription] = useState(booking?.description || '');
  const [bookingType, setBookingType] = useState<'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER'>(booking?.bookingType || 'PERSONAL_TRAINING');
  const [startTime, setStartTime] = useState(booking?.startTime ? new Date(booking.startTime).toISOString().slice(0, 16) : '');
  const [endTime, setEndTime] = useState(booking?.endTime ? new Date(booking.endTime).toISOString().slice(0, 16) : '');
  const [status, setStatus] = useState<'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'>(booking?.status || 'PENDING');
  const [clientId, setClientId] = useState(booking?.clientId || '');
  const [educatorId, setEducatorId] = useState(booking?.educatorId || '');
  const [locationId, setLocationId] = useState(booking?.locationId || '');
  const [notes, setNotes] = useState(booking?.notes || '');

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [educators, setEducators] = useState<EducatorOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);

  const [loadingForm, setLoadingForm] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
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
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingForm(true);
      try {
        const [clientsRes, educatorsRes, locationsRes] = await Promise.all([
          fetch(`/api/admin/fitness-clients?companyId=${slug}`),
          fetch(`/api/admin/trainers?companyId=${slug}`),
          fetch(`/api/admin/locationsv2?companyId=${slug}`),
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
        toast.error(`Error loading form data: ${err.message}`);
      } finally {
        setLoadingForm(false);
      }
    };

    if (isOpen) {
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
        resetForm();
      }
      fetchDropdownData();
    }
  }, [isOpen, slug, booking, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!title || !bookingType || !startTime || !endTime || !clientId) {
      toast.error('Title, type, start/end times, and client are required.');
      setSubmitting(false);
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error('Start time must be before end time.');
      setSubmitting(false);
      return;
    }

    const method = booking ? 'PUT' : 'POST';
    const url = booking ? `/api/admin/fitness-bookings/${booking.id}` : `/api/admin/fitness-bookings?companyId=${slug}`;

    const toastId = toast.loading(booking ? 'Updating booking...' : 'Creating booking...');

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description: description || null, bookingType, startTime, endTime, status, clientId,
          educatorId: educatorId || null, locationId: locationId || null, notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${booking ? 'update' : 'create'} booking.`);
      }

      const savedBooking: BookingData = await response.json();
      onSave(savedBooking);
      onClose();
      toast.success(`Booking "${savedBooking.title}" ${booking ? 'updated' : 'created'} successfully!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto border border-gray-700 text-white"
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors bg-gray-800 p-2 rounded-full"
              aria-label="Close modal"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <XMarkIcon className="w-7 h-7" />
            </motion.button>

            <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
              {booking ? 'Edit Booking' : 'Create New Booking'}
            </h2>
            <p className="text-center text-gray-400 mb-8">
              {booking ? `Modifying booking for ${booking.clientName}` : 'Fill out the details to schedule a new booking.'}
            </p>

            {loadingForm ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-10 w-10 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg text-gray-400 mt-2">Fetching client, trainer, and location data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                  label="Booking Title"
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e: any) => setTitle(e.target.value)}
                  icon={<DocumentTextIcon className="h-5 w-5 text-gray-400" />}
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormSelect
                    label="Client"
                    id="clientId"
                    value={clientId}
                    onChange={(e: any) => setClientId(e.target.value)}
                    icon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
                    required
                    options={
                      <>
                        <option value="" disabled className="bg-gray-800">Select a Client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id} className="bg-gray-800">{c.name} ({c.email})</option>
                        ))}
                      </>
                    }
                  />

                  <FormSelect
                    label="Booking Type"
                    id="bookingType"
                    value={bookingType}
                    onChange={(e: any) => setBookingType(e.target.value)}
                    icon={<TagIcon className="h-5 w-5 text-gray-400" />}
                    required
                    options={
                      BOOKING_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-gray-800">{type.replace('_', ' ')}</option>
                      ))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormInput
                    label="Start Time"
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e: any) => setStartTime(e.target.value)}
                    icon={<ClockIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                  <FormInput
                    label="End Time"
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e: any) => setEndTime(e.target.value)}
                    icon={<ClockIcon className="h-5 w-5 text-gray-400" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormSelect
                    label="Assigned Trainer (Optional)"
                    id="educatorId"
                    value={educatorId}
                    onChange={(e: any) => setEducatorId(e.target.value)}
                    icon={<UserCircleIcon className="h-5 w-5 text-gray-400" />}
                    options={
                      <>
                        <option value="" className="bg-gray-800">No Trainer</option>
                        {educators.map((e) => (
                          <option key={e.id} value={e.id} className="bg-gray-800">{e.name}</option>
                        ))}
                      </>
                    }
                  />
                  <FormSelect
                    label="Location (Optional)"
                    id="locationId"
                    value={locationId}
                    onChange={(e: any) => setLocationId(e.target.value)}
                    icon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
                    options={
                      <>
                        <option value="" className="bg-gray-800">No Specific Location</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id} className="bg-gray-800">{l.name}</option>
                        ))}
                      </>
                    }
                  />
                </div>

                <FormSelect
                  label="Status"
                  id="status"
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  icon={<CheckCircleIcon className="h-5 w-5 text-gray-400" />}
                  required
                  options={
                    BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-gray-800">{s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}</option>
                    ))
                  }
                />

                <FormTextarea
                  label="Description (Optional)"
                  id="description"
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  rows={3}
                  icon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-gray-400" />}
                />

                <FormTextarea
                  label="Internal Notes (Optional)"
                  id="notes"
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  rows={2}
                  icon={<DocumentTextIcon className="h-5 w-5 text-gray-400" />}
                />

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-lg font-bold text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={submitting}
                  >
                    {submitting ? (
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
      )}
    </AnimatePresence>
  );
};

export default BookingModal;