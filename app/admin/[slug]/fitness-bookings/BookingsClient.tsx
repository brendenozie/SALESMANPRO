"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowsRightLeftIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, 
  MapPinIcon, PencilIcon, PlusCircleIcon, TrashIcon, UserCircleIcon, 
  XMarkIcon, TagIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '@/components/ConfirmationModal';
import BookingModal, { BookingData } from './BookingModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const bookingCardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const statusColors = {
  CONFIRMED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  COMPLETED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
};

const statusIcons = {
  CONFIRMED: <CheckCircleIcon className='w-4 h-4' />,
  CANCELLED: <XMarkIcon className='w-4 h-4' />,
  PENDING: <ArrowsRightLeftIcon className="w-4 h-4 animate-spin" />,
  COMPLETED: <CheckCircleIcon className='w-4 h-4' />,
};

const BookingCard = ({ 
  booking, 
  onEdit, 
  onDelete 
}: { 
  booking: BookingData; 
  onEdit: (booking: BookingData) => void; 
  onDelete: (booking: BookingData) => void; 
}) => {
  return (
    <motion.div
      className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl dark:hover:shadow-zinc-950/40 hover:border-blue-500/40 dark:hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between group h-full"
      variants={bookingCardVariants}
      layout
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            {booking.title}
          </h3>
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap tracking-wide ${statusColors[booking.status]}`}>
            {statusIcons[booking.status]}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5 line-clamp-2 leading-relaxed">
          {booking.description || 'No description provided.'}
        </p>

        <div className="space-y-2.5 border-t border-gray-50 dark:border-zinc-800/60 pt-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
            <UserCircleIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
            <p className="truncate"><span className="font-medium text-gray-400 dark:text-zinc-500">Client:</span> <span className="text-gray-800 dark:text-zinc-200 font-semibold">{booking.clientName}</span></p>
          </div>
          
          {booking.educatorName && booking.educatorName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
              <UserCircleIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
              <p className="truncate"><span className="font-medium text-gray-400 dark:text-zinc-500">Trainer:</span> <span className="text-gray-800 dark:text-zinc-200 font-medium">{booking.educatorName}</span></p>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
            <CalendarDaysIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
            <p className="truncate"><span className="font-medium text-gray-400 dark:text-zinc-500">Date:</span> <span className="text-gray-800 dark:text-zinc-200">{booking.date}</span></p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
            <ClockIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
            <p className="truncate"><span className="font-medium text-gray-400 dark:text-zinc-500">Time:</span> <span className="text-gray-800 dark:text-zinc-200">{booking.time}</span></p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
            <MapPinIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
            <p className="truncate"><span className="font-medium text-gray-400 dark:text-zinc-500">Location:</span> <span className="text-gray-800 dark:text-zinc-200">{booking.locationName}</span></p>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-zinc-400">
            <TagIcon className="mr-2.5 text-gray-400 dark:text-zinc-500 w-4 h-4 shrink-0" />
            <p className="truncate">
              <span className="font-medium text-gray-400 dark:text-zinc-500">Type:</span>{' '}
              <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                {booking.bookingType.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800/60 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(booking)}
          className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200/50 dark:border-zinc-700/50"
        >
          <PencilIcon className='w-4 h-4' />
          Edit
        </button>
        <button
          onClick={() => onDelete(booking)}
          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center border border-rose-100 dark:border-rose-900/30"
          aria-label="Delete booking"
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>
    </motion.div>
  );
};

interface BookingsClientProps {
  companyId: string;
  slug: string;
}

export default function BookingsClient({ companyId, slug }: BookingsClientProps) {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<BookingData | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/fitness-bookings?companyId=${companyId}`, { 
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BookingData[] = (await response.json()).data || [];
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to load bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openAddModal = () => {
    setCurrentBooking(null);
    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking: BookingData) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (savedBooking: BookingData) => {
    if (currentBooking) {
      setBookings(prevBookings => prevBookings.map(b => b.id === savedBooking.id ? savedBooking : b));
      toast.success(`Booking updated successfully.`);
    } else {
      setBookings(prevBookings => [savedBooking, ...prevBookings]);
      toast.success(`Booking created successfully.`);
    }
    setIsBookingModalOpen(false);
  };

  const handleDeleteBookingClick = (booking: BookingData) => {
    setBookingToDelete(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting booking...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/fitness-bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = (await response.json()).data || {};
        throw new Error(errorData.message || `Failed to complete deletion process.`);
      }

      setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingToDelete.id));
      toast.success(`Booking removed successfully.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error deleting booking: ${err.message}`, { id: toastId });
    } finally {
      setBookingToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent dark:from-purple-950/10 dark:via-transparent dark:to-transparent px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      
      {/* Container wrapper */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Row Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200/60 dark:border-zinc-800/60">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Schedule & Bookings
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Manage slots, assign educators, and monitor workflow operations in real-time.
            </p>
          </div>
          
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700 text-white shadow-md shadow-blue-500/10 dark:shadow-none transition-all duration-200 active:scale-[0.98] shrink-0"
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>New Booking Slot</span>
          </button>
        </div>

        {/* Dynamic View Engine */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-4"
            >
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-blue-500/20 dark:border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 dark:border-purple-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 tracking-wide">Syncing layout context data...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-rose-50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400 p-5 rounded-2xl text-center border border-rose-100 dark:border-rose-900/20 max-w-md mx-auto flex flex-col items-center gap-3"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
              <div>
                <p className="font-bold">Operational Pipeline Error</p>
                <p className="text-xs opacity-90 mt-1">{error}</p>
              </div>
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              key="no-bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-zinc-900/10"
            >
              <CalendarDaysIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-zinc-600 mb-3" />
              <p className="text-base font-semibold text-gray-700 dark:text-zinc-300">No active bookings found</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500 mt-0.5 mb-4">Get started by building your first structured agenda node.</p>
              <button 
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
              >
                Add initial node
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="booking-list"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onEdit={openEditModal}
                  onDelete={handleDeleteBookingClick}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals Pipeline */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        booking={currentBooking}
        slug={slug}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBooking}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the booking for "${bookingToDelete?.clientName || 'N/A'}"? This process permanently drops the database entity.`}
        confirmText="Delete Entity"
      />
    </div>
  );
}