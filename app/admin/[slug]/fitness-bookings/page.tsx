"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowsRightLeftIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, MapPinIcon, PencilIcon, PlusCircleIcon, TrashIcon, UserCircleIcon, XMarkIcon, TagIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import BookingModal, { BookingData } from './BookingModal';
import toast from 'react-hot-toast';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Define the BookingData interface to match the API response
// interface BookingData {
  // id: string;
  // title: string;
  // description: string | null;
  // bookingType: 'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER';
  // startTime: string; // ISO string for internal use
  // endTime: string;   // ISO string for internal use
  // date: string;      // Formatted date for display
  // time: string;      // Formatted time range for display
  // status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  // clientId: string;
  // clientName: string;
  // educatorId: string | null;
  // educatorName: string;
  // locationId: string | null;
  // locationName: string;
  // notes: string | null;
// }

interface BookingsPageProps {
  params:Promise<{ slug: string }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const bookingCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
    },
  },
};

const statusBadgeColors = {
  CONFIRMED: 'bg-green-600 text-white',
  CANCELLED: 'bg-red-600 text-white',
  PENDING: 'bg-yellow-400 text-gray-900',
  COMPLETED: 'bg-blue-600 text-white',
};

const statusIcons = {
  CONFIRMED: <CheckCircleIcon className='w-5 h-5' />,
  CANCELLED: <XMarkIcon className='w-5 h-5' />,
  PENDING: <ArrowsRightLeftIcon className="w-5 h-5 animate-spin" />,
  COMPLETED: <CheckCircleIcon className='w-5 h-5' />,
};

const BookingCard = ({ booking, onEdit, onDelete }: { booking: BookingData; onEdit: (booking: BookingData) => void; onDelete: (booking: BookingData) => void; }) => {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col relative border border-gray-700 hover:border-indigo-500 transition-colors duration-300"
      variants={bookingCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusBadgeColors[booking.status]}`}
      >
        {statusIcons[booking.status]}
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{booking.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{booking.description || 'No description provided.'}</p>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <UserCircleIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Client:</span> {booking.clientName}</p>
          </div>
          {booking.educatorName && booking.educatorName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-400">
              <UserCircleIcon className="mr-2 text-indigo-400 w-5 h-5" />
              <p><span className="font-semibold text-gray-300">Trainer:</span> {booking.educatorName}</p>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDaysIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Date:</span> {booking.date}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <ClockIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Time:</span> {booking.time}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapPinIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Location:</span> {booking.locationName}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <TagIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Type:</span> {booking.bookingType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          onClick={() => onEdit(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className='w-5 h-5' />
          Edit
        </motion.button>
        <motion.button
          onClick={() => onDelete(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
        >
          <TrashIcon className='w-5 h-5' />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function BookingsPage() {
  const { slug } = useParams();

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
      const response = await fetch(`${apiBaseUrl}/admin/fitness-bookings?companyId=${slug}`
        , { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BookingData[] = (await response.json()).data || [];
      setBookings(data);
      toast.success("Bookings loaded successfully!", { duration: 3000 });
    } catch (err: any) {
      setError(err.message);
      // console.error("Failed to fetch bookings:", err);
      toast.error(`Failed to load bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [slug]);

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
      toast.success(`Booking "${savedBooking.title}" updated successfully.`);
    } else {
      setBookings(prevBookings => [savedBooking, ...prevBookings]);
      toast.success(`Booking "${savedBooking.title}" created successfully.`);
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
    const toastId = toast.loading(`Deleting booking "${bookingToDelete.title}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/fitness-bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = (await response.json()).data || {};
        throw new Error(errorData.message || `Failed to delete booking "${bookingToDelete.title}".`);
      }

      setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingToDelete.id));
      toast.success(`Booking "${bookingToDelete.title}" deleted successfully.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error deleting booking: ${err.message}`, { id: toastId });
    } finally {
      setBookingToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-12 drop-shadow-lg"
      >
        Manage Bookings & Schedule 🗓️
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h2 className="text-3xl font-bold text-white">All Bookings</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span>New Booking</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <svg className="animate-spin h-10 w-10 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-xl text-gray-400">Loading bookings...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-900/50 text-red-300 p-6 rounded-xl text-center border border-red-700"
            >
              <p className="font-bold text-lg">Error loading bookings:</p>
              <p className="text-sm">{error}</p>
            </motion.div>
          ) : bookings.length === 0 ? (
            <motion.div
              key="no-bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-xl text-gray-400">No bookings found. Start by creating one! 🚀</p>
            </motion.div>
          ) : (
            <motion.div
              key="booking-list"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
      </motion.div>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        booking={currentBooking}
        slug={slug?.toString() || ''}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBooking}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the booking for "${bookingToDelete?.clientName || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}