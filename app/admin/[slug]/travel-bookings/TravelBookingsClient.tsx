// app/admin/[slug]/travel-bookings/TravelBookingsClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  FunnelIcon,
  PlusIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
  PencilIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '@/components/ConfirmationModal';
import TravelBookingModal from './TravelBookingModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export interface TravelBookingData {
  id: string;
  title: string;
  description: string | null;
  bookingType: 'TOUR_PACKAGE_BOOKING' | 'CUSTOM_TRIP_BOOKING' | 'ACCOMMODATION_BOOKING' | 'FLIGHT_BOOKING' | 'OTHER_TRAVEL_SERVICE';
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  notes: string | null;
  clientId: string;
  customerName: string;
  customerEmail: string;
  tourPackageId: string | null;
  tourPackageName: string;
  destinationId: string | null;
  destinationName: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  }
};

// --- REDESIGNED COMPACT SUB-CARD COMPONENT ---
const BookingCard = ({ booking, onEdit, onDelete, onUpdateStatus }: {
  booking: TravelBookingData;
  onEdit: (booking: TravelBookingData) => void;
  onDelete: (booking: TravelBookingData) => void;
  onUpdateStatus: (id: string, newStatus: TravelBookingData['status']) => void;
}) => {
  const statusStyles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-emerald-600/10 dark:ring-emerald-500/20',
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-amber-600/10 dark:ring-amber-500/20',
    CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-rose-600/10 dark:ring-rose-500/20',
    COMPLETED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 ring-sky-600/10 dark:ring-sky-500/20',
  };

  const getStatusIcon = (status: TravelBookingData['status']) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircleIcon className='h-3.5 w-3.5' />;
      case 'PENDING': return <ClockIcon className='h-3.5 w-3.5 animate-pulse' />;
      case 'CANCELLED': return <XCircleIcon className='h-3.5 w-3.5' />;
      case 'COMPLETED': return <CheckCircleIcon className='h-3.5 w-3.5' />;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-sm relative overflow-hidden group"
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {booking.title}
          </h3>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ring-inset ${statusStyles[booking.status]}`}>
            {getStatusIcon(booking.status)}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
          </span>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-4 h-8">
          {booking.description || 'No descriptive context parameters provided.'}
        </p>

        <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800/60 pt-4 mb-4">
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <UserIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate"><strong className="text-slate-700 dark:text-slate-300 font-medium">Client:</strong> {booking.customerName}</span>
          </div>

          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <TagIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate"><strong className="text-slate-700 dark:text-slate-300 font-medium">Type:</strong> {booking.bookingType.replace(/_/g, ' ')}</span>
          </div>

          {booking.tourPackageName !== 'N/A' && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <BriefcaseIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate"><strong className="text-slate-700 dark:text-slate-300 font-medium">Package:</strong> {booking.tourPackageName}</span>
            </div>
          )}

          {booking.destinationName !== 'N/A' && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
              <MapPinIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate"><strong className="text-slate-700 dark:text-slate-300 font-medium">Route:</strong> {booking.destinationName}</span>
            </div>
          )}

          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
            <CalendarDaysIcon className="w-4 h-4 mr-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span><strong className="text-slate-700 dark:text-slate-300 font-medium">Window:</strong> {booking.startDate} → {booking.endDate}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Aggregate Valuation</span>
          <div className="flex items-center font-mono font-bold text-base text-emerald-600 dark:text-emerald-400">
            <CurrencyDollarIcon className="w-4 h-4 mr-0.5 shrink-0" />
            <span>{booking.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(booking)}
            className="inline-flex items-center justify-center gap-1.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-xl font-bold text-xs border border-slate-200/40 dark:border-slate-700/30 transition-all active:scale-[0.98]"
          >
            <PencilIcon className='w-3.5 h-3.5 stroke-[2]' />
            Modify
          </button>

          {booking.status === 'PENDING' && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
              className="inline-flex items-center justify-center gap-1.5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
            >
              <CheckCircleIcon className='w-3.5 h-3.5 stroke-[2]' />
              Authorize
            </button>
          )}

          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'PENDING' && (
            <button
              onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
              className="inline-flex items-center justify-center gap-1.5 py-2 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-xl font-bold text-xs transition-all active:scale-[0.98]"
            >
              <XCircleIcon className='w-3.5 h-3.5 stroke-[2]' />
              Revoke
            </button>
          )}

          <button
            onClick={() => onDelete(booking)}
            className="col-span-1 inline-flex items-center justify-center gap-1.5 py-2 bg-white text-slate-400 dark:bg-slate-900 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl font-bold text-xs border border-transparent hover:border-red-100 dark:hover:border-red-950/50 transition-all active:scale-[0.98]"
          >
            <TrashIcon className='w-3.5 h-3.5' />
            Erase
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface TravelBookingsClientProps {
  slug: string;
  companyId: string;
}

export default function TravelBookingsClient({ slug, companyId }: TravelBookingsClientProps) {
  const [bookings, setBookings] = useState<TravelBookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TravelBookingData['status'] | 'All'>('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<TravelBookingData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<TravelBookingData | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings?companyId=${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });
      if (!response.ok) {
        throw new Error(`HTTP network error rejection code: ${response.status}`);
      }
      const data: TravelBookingData[] = (await response.json()).data;
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed structural synchronization fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(booking =>
    filterStatus === 'All' || booking.status === filterStatus
  );

  const openAddModal = () => {
    setCurrentBooking(null);
    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking: TravelBookingData) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (savedBooking: TravelBookingData) => {
    if (currentBooking) {
      setBookings(prev => prev.map(b => b.id === savedBooking.id ? savedBooking : b));
      toast.success(`Booking ledger parameter mapping updated.`);
    } else {
      setBookings(prev => [savedBooking, ...prev]);
      toast.success(`New booking index deployed successfully!`);
    }
    setIsBookingModalOpen(false);
  };

  const handleDeleteBookingClick = (booking: TravelBookingData) => {
    setBookingToDelete(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Erasure cycle executing for "${bookingToDelete.title}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Operational abort.`);
      }

      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      toast.success(`Booking node unmapped from storage array.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Erasure failed: ${err.message}`, { id: toastId });
    } finally {
      setBookingToDelete(null);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: TravelBookingData['status']) => {
    const bookingToUpdate = bookings.find(b => b.id === id);
    if (!bookingToUpdate) return;

    const toastId = toast.loading(`Patching status mapping values...`);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify({ ...bookingToUpdate, status: newStatus }),
      });

      if (!response.ok) throw new Error(`Operational modification mismatch layout.`);

      const updatedBooking: TravelBookingData = await response.json();
      setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      toast.success(`State updated to ${newStatus}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Status sync update failed.`, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 text-slate-800 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Travel Bookings Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              System dashboard architecture for managing enterprise transit configurations, client package matrix states, and financial transactions.
            </p>
          </div>

          <motion.button
            onClick={openAddModal}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs py-3 px-5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95"
          >
            <PlusIcon className="h-4 w-4 stroke-[2.5]" />
            <span>Generate Booking Entry</span>
          </motion.button>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter Pipeline</span>
          </div>

          <div className="relative w-full sm:w-48">
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TravelBookingData['status'] | 'All')}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold py-2.5 pl-4 pr-8 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-950/10 dark:focus:ring-white/10 focus:border-slate-400 transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Ledger Matrices</option>
              <option value="CONFIRMED">Confirmed Transits</option>
              <option value="PENDING">Pending Approval</option>
              <option value="CANCELLED">Revoked / Cancelled</option>
              <option value="COMPLETED">Fulfilled / Completed</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 dark:border-t-slate-400 w-0 h-0" />
          </div>
        </div>

        <main className="min-h-[40vh] relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center py-20"
              >
                <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Synchronizing pipeline data objects...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-2xl text-center"
              >
                <p className="font-bold text-sm mb-1">Operational Integration Block Failure</p>
                <p className="text-xs font-mono opacity-80">{error}</p>
              </motion.div>
            ) : filteredBookings.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl py-20 text-center bg-white dark:bg-transparent"
              >
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  No tracking vectors matching the selected metrics are active.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="bookings"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
              >
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onEdit={openEditModal}
                    onDelete={handleDeleteBookingClick}
                    onUpdateStatus={handleUpdateBookingStatus}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <TravelBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        booking={currentBooking}
        slug={slug as string}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBooking}
        title="Confirm Index Deletion"
        message={`Are you completely sure you want to permanently unmap booking index reference "${bookingToDelete?.title || 'N/A'}"? This action modifies production indices.`}
        confirmText="Confirm Erasure"
      />
    </div>
  );
}