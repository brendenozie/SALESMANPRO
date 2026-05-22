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
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

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

export interface BookingData {
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
  date: string;
  time: string;
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

// Reusable Input Field Component
const FormFieldWrapper = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 w-full">
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
      {label}
    </label>
    <div className="relative group rounded-xl transition-all duration-300">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors duration-200">
        {icon}
      </div>
      {children}
      <div className="absolute inset-0 rounded-xl border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 group-focus-within:border-purple-500/50 pointer-events-none transition-all duration-300" />
    </div>
  </div>
);

const FormInput = ({ label, icon, ...props }: any) => (
  <FormFieldWrapper label={label} icon={icon}>
    <input
      {...props}
      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 backdrop-blur-md py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-medium text-sm tracking-wide transition-all duration-200 shadow-inner"
    />
  </FormFieldWrapper>
);

const FormSelect = ({ label, icon, options, ...props }: any) => (
  <FormFieldWrapper label={label} icon={icon}>
    <select
      {...props}
      className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 backdrop-blur-md py-3.5 pl-12 pr-10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-medium text-sm tracking-wide transition-all duration-200 appearance-none shadow-inner cursor-pointer"
    >
      {options}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500">
      <ChevronDownIcon className="h-4 w-4" />
    </div>
  </FormFieldWrapper>
);

const FormTextarea = ({ label, icon, ...props }: any) => (
  <div className="flex flex-col space-y-1.5 w-full">
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">
      {label}
    </label>
    <div className="relative group rounded-xl transition-all duration-300">
      <div className="absolute top-3.5 left-0 flex items-center pl-4 pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors duration-200">
        {icon}
      </div>
      <textarea
        {...props}
        className="w-full rounded-xl bg-slate-50 dark:bg-slate-900/40 backdrop-blur-md py-3.5 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 font-medium text-sm tracking-wide transition-all duration-200 shadow-inner resize-none"
      />
      <div className="absolute inset-0 rounded-xl border border-slate-200 dark:border-white/5 group-hover:border-slate-300 dark:group-hover:border-white/10 group-focus-within:border-purple-500/50 pointer-events-none transition-all duration-300" />
    </div>
  </div>
);

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, booking, slug }) => {
  const [title, setTitle] = useState(booking?.title || '');
  const [description, setDescription] = useState(booking?.description || '');
  const [bookingType, setBookingType] = useState<BookingData['bookingType']>(booking?.bookingType || 'PERSONAL_TRAINING');
  const [startTime, setStartTime] = useState(booking?.startTime ? new Date(booking.startTime).toISOString().slice(0, 16) : '');
  const [endTime, setEndTime] = useState(booking?.endTime ? new Date(booking.endTime).toISOString().slice(0, 16) : '');
  const [status, setStatus] = useState<BookingData['status']>(booking?.status || 'PENDING');
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
          fetch(`${apiBaseUrl}/admin/fitness-clients?companyId=${slug}`),
          fetch(`${apiBaseUrl}/admin/trainers?companyId=${slug}`),
          fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${slug}`),
        ]);

        const clientsData = (await clientsRes.json()).data || [];
        const educatorsData = (await educatorsRes.json()).data || [];
        const locationsData = (await locationsRes.json()).data.data || [];

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
    const url = booking ? `${apiBaseUrl}/admin/fitness-bookings/${booking.id}` : `${apiBaseUrl}/admin/fitness-bookings?companyId=${slug}`;
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

  const getStatusBadgeColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl relative my-auto border border-slate-100 dark:border-white/10 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 15, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.1 }}
          >
            {/* Ambient Background Glow Effect */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-48 h-48 bg-purple-500/5 dark:bg-purple-500/10 blur-[80px] pointer-events-none rounded-full" />
            <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-48 h-48 bg-pink-500/5 dark:bg-pink-500/10 blur-[80px] pointer-events-none rounded-full" />

            {/* Absolute Close Control */}
            <motion.button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 p-2 rounded-xl border border-slate-200 dark:border-white/5"
              aria-label="Close modal"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>

            {/* Modal Header */}
            <div className="text-center mb-8 relative">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                {booking ? 'Edit Appointment' : 'Schedule Booking'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {booking ? (
                  <span>Modifying slot for <span className="text-purple-600 dark:text-purple-400 font-medium">{booking.clientName}</span></span>
                ) : (
                  'Assign clients, setup dates, and attach managers dynamically.'
                )}
              </p>
            </div>

            {loadingForm ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-600 dark:border-t-purple-500 animate-spin" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">Syncing environment pools...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                
                {/* Title */}
                <FormInput
                  label="Booking Title"
                  id="title"
                  type="text"
                  placeholder="e.g., Elite Performance Core Training"
                  value={title}
                  onChange={(e: any) => setTitle(e.target.value)}
                  icon={<DocumentTextIcon className="h-5 w-5" />}
                  required
                />

                {/* Core Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormSelect
                    label="Client Allocation"
                    id="clientId"
                    value={clientId}
                    onChange={(e: any) => setClientId(e.target.value)}
                    icon={<UserCircleIcon className="h-5 w-5" />}
                    required
                    options={
                      <>
                        <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">Select target client</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{c.name} ({c.email})</option>
                        ))}
                      </>
                    }
                  />

                  <FormSelect
                    label="Activity Category"
                    id="bookingType"
                    value={bookingType}
                    onChange={(e: any) => setBookingType(e.target.value)}
                    icon={<TagIcon className="h-5 w-5" />}
                    required
                    options={
                      BOOKING_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                          {type.replace('_', ' ')}
                        </option>
                      ))
                    }
                  />
                </div>

                {/* Timeline Window Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput
                    label="Start Timeframe"
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e: any) => setStartTime(e.target.value)}
                    icon={<CalendarDaysIcon className="h-5 w-5" />}
                    required
                  />
                  <FormInput
                    label="End Timeframe"
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e: any) => setEndTime(e.target.value)}
                    icon={<ClockIcon className="h-5 w-5" />}
                    required
                  />
                </div>

                {/* Staff & Location Resource Track */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormSelect
                    label="Assigned Trainer"
                    id="educatorId"
                    value={educatorId}
                    onChange={(e: any) => setEducatorId(e.target.value)}
                    icon={<UserCircleIcon className="h-5 w-5" />}
                    options={
                      <>
                        <option value="" className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">Unassigned (Open Pool)</option>
                        {educators.map((e) => (
                          <option key={e.id} value={e.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{e.name}</option>
                        ))}
                      </>
                    }
                  />
                  <FormSelect
                    label="Facility Node"
                    id="locationId"
                    value={locationId}
                    onChange={(e: any) => setLocationId(e.target.value)}
                    icon={<MapPinIcon className="h-5 w-5" />}
                    options={
                      <>
                        <option value="" className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">Digital / Remote Layer</option>
                        {locations.map((l) => (
                          <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">{l.name}</option>
                        ))}
                      </>
                    }
                  />
                </div>

                {/* Conditional Status System Selector */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase ml-1">Lifecycle Status</label>
                  <div className="flex flex-wrap gap-2.5 p-2 bg-slate-100 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
                    {BOOKING_STATUSES.map((s) => {
                      const isSelected = status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s as any)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide border uppercase transition-all duration-200 flex-1 min-w-[100px] ${
                            isSelected 
                              ? getStatusBadgeColor(s) + ' shadow-sm scale-[1.02] bg-white dark:bg-transparent' 
                              : 'bg-transparent text-slate-400 dark:text-slate-500 border-transparent hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          {s.toLowerCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Fields */}
                <FormTextarea
                  label="Public Description"
                  id="description"
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Provide context regarding expectations, outfits, or prerequisite goals..."
                  icon={<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />}
                />

                <FormTextarea
                  label="Internal Operations Notes"
                  id="notes"
                  value={notes}
                  onChange={(e: any) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Private infrastructure logs, custom constraints, or trainer warnings..."
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                />

                {/* Action Controls */}
                <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-100 dark:border-white/5 mt-8">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Dismiss
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="relative px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 shadow-lg shadow-purple-900/20 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center min-w-[140px]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <span>{booking ? 'Commit Changes' : 'Initialize Booking'}</span>
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