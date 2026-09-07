"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarDaysIcon,
  TagIcon,
  UserCircleIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { TravelBookingData } from './page';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

interface TravelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: TravelBookingData) => void;
  booking?: TravelBookingData | null;
  slug: string;
}

const BOOKING_TYPES = ['TOUR_PACKAGE_BOOKING', 'CUSTOM_TRIP_BOOKING', 'ACCOMMODATION_BOOKING', 'FLIGHT_BOOKING', 'OTHER_TRAVEL_SERVICE'];
const BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const TravelBookingModal: React.FC<TravelBookingModalProps> = ({ isOpen, onClose, onSave, booking, slug }) => {
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

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoadingForm(true);
      setError(null);
      try {
        const [clientsRes, tourPackagesRes, destinationsRes] = await Promise.all([
          fetch(`${apiBaseUrl}/admin/travel-users?companyId=${slug}`, { credentials: 'include' }),
          fetch(`${apiBaseUrl}/admin/travel-packages?companyId=${slug}`, { credentials: 'include' }),
          fetch(`${apiBaseUrl}/admin/destinations?companyId=${slug}`, { credentials: 'include' }),
        ]);

        const clientsData = (await clientsRes.json()).data;
        const tourPackagesData = (await tourPackagesRes.json()).data;
        const destinationsData = (await destinationsRes.json()).data.data;

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
  }, [isOpen, slug]);

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
    const toastId = toast.loading(`${booking ? 'Saving structural changes...' : 'Deploying new ledger entry...'}`);
    setError(null);

    if (!title || !bookingType || !startDate || !endDate || totalPrice === undefined || !clientId) {
      toast.error('Please input all required parameters.', { id: toastId });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Temporal mismatch: Start date falls after execution window end.', { id: toastId });
      return;
    }
    if (totalPrice < 0) {
      toast.error('Valuation pricing parameter cannot evaluate negatively.', { id: toastId });
      return;
    }

    const method = booking ? 'PUT' : 'POST';
    const url = booking ? `${apiBaseUrl}/admin/travel-bookings/${booking.id}` : `${apiBaseUrl}/admin/travel-bookings?companyId=${slug}`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
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
        throw new Error(errorData.message || `API rejection state encountered.`);
      }

      const savedBooking: TravelBookingData = await response.json();
      onSave(savedBooking);
      toast.success(`Matrix instance "${savedBooking.title}" synchronized successfully!`, { id: toastId });
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(`Fault: ${err.message}`, { id: toastId });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop Blur Layer */}
          <motion.div
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Premium Glass Shell Layout */}
          <motion.div
            className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative text-slate-800 dark:text-slate-200 backdrop-blur-xl transition-all duration-300 flex flex-col scrollbar-thin"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 140 }}
          >
            {/* Functional Sticky Close Anchor */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:focus:ring-white/10"
              aria-label="Close configuration modal"
            >
              <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Typography Header Group */}
            <div className="mb-6 sm:mb-8 text-left pr-8">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {booking ? 'Modify Booking Configuration' : 'Deploy New Travel Matrix'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {booking ? 'Update processing options, financial constraints, and relational parameters.' : 'Initialize structural properties to seed a clean transaction stream node.'}
              </p>
            </div>

            {loadingForm ? (
              <div className="flex flex-col items-center justify-center py-16 my-auto">
                <div className="w-7 h-7 border-2 border-slate-200 dark:border-slate-800 border-t-indigo-500 dark:border-t-indigo-400 rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Loading Pipeline Assets...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 flex-1">
                {/* Input Matrix Grid (Row 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <CheckBadgeIcon className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> Booking Label *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                      placeholder="e.g., Luxury Serengeti Transit"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="clientId" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <UserCircleIcon className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" /> Client Entity Assignment *
                    </label>
                    <div className="relative">
                      <select
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="text-slate-400 dark:text-slate-600">Select active subscriber</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
                    </div>
                  </div>
                </div>

                {/* Input Matrix Grid (Row 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bookingType" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <TagIcon className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" /> Pipeline Channel Type *
                    </label>
                    <div className="relative">
                      <select
                        id="bookingType"
                        value={bookingType}
                        onChange={(e) => setBookingType(e.target.value as TravelBookingData['bookingType'])}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        required
                      >
                        {BOOKING_TYPES.map((type) => (
                          <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <GlobeAltIcon className="w-4 h-4 mr-2 text-sky-500 dark:text-sky-400" /> Ledger State Status *
                    </label>
                    <div className="relative">
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TravelBookingData['status'])}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        required
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
                    </div>
                  </div>
                </div>

                {/* Input Matrix Grid (Temporal Windows) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <CalendarDaysIcon className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" /> Start Vector *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <CalendarDaysIcon className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" /> Conclusion Vector *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Valuation Config Element */}
                <div>
                  <label htmlFor="totalPrice" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <CurrencyDollarIcon className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" /> Total Ledger Valuation ($) *
                  </label>
                  <input
                    type="number"
                    id="totalPrice"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Optional Configuration Overrides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <div>
                    <label htmlFor="tourPackageId" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <BriefcaseIcon className="w-4 h-4 mr-2 text-orange-500 dark:text-orange-400" /> Tour Package Anchor <span className="text-[10px] font-normal lowercase ml-1 opacity-65">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="tourPackageId"
                        value={tourPackageId}
                        onChange={(e) => setTourPackageId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="text-slate-400 dark:text-slate-600">No packaged dependency</option>
                        {tourPackages.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="destinationId" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <GlobeAltIcon className="w-4 h-4 mr-2 text-teal-500 dark:text-teal-400" /> Geographic Node Mapping <span className="text-[10px] font-normal lowercase ml-1 opacity-65">(optional)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="destinationId"
                        value={destinationId}
                        onChange={(e) => setDestinationId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="text-slate-400 dark:text-slate-600">No destination anchor</option>
                        {destinations.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
                    </div>
                  </div>
                </div>

                {/* Text Context Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="description" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <DocumentTextIcon className="w-4 h-4 mr-2 text-slate-400" /> Public Narrative Overview <span className="text-[10px] font-normal lowercase ml-1 opacity-65">(optional)</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Context logs viewable by downstream routing apps..."
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      <DocumentTextIcon className="w-4 h-4 mr-2 text-slate-400" /> Internal Operational Notes <span className="text-[10px] font-normal lowercase ml-1 opacity-65">(optional)</span>
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Encrypted metadata notes reserved purely for administrative personnel..."
                    />
                  </div>
                </div>

                {/* Dynamic Exception Stream Handler */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl text-xs font-medium border border-rose-100 dark:border-rose-950/40"
                  >
                    <ExclamationCircleIcon className="h-4 w-4 mr-2.5 mt-0.5 shrink-0" />
                    <span><strong className="font-bold">Execution Interrupted:</strong> {error}</span>
                  </motion.div>
                )}

                {/* Bottom Action Substrates */}
                <div className="flex flex-col sm:flex-row justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800/60 pt-5 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto order-2 sm:order-1 px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                  >
                    Cancel Operations
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loadingForm}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto order-1 sm:order-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {booking ? 'Commit Variations' : 'Instantiate Booking'}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TravelBookingModal;