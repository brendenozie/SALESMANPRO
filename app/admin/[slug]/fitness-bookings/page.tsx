// app/[adminSlug]/bookings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowsUpDownIcon, CalendarDaysIcon, CheckCircleIcon, ClockIcon, MapIcon, PencilIcon, PlusCircleIcon, TrashIcon, UserCircleIcon
} from '@heroicons/react/24/outline'; // Added PlusCircleIcon, TrashIcon, PencilIcon
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import BookingModal from './BookingModal'; // New BookingModal component

// Define the BookingData interface to match the API response
interface BookingData {
  id: string;
  title: string;
  description: string | null;
  bookingType: 'CLASS' | 'PERSONAL_TRAINING' | 'VIRTUAL_TOUR' | 'OTHER';
  startTime: string; // ISO string for internal use
  endTime: string;   // ISO string for internal use
  date: string;      // Formatted date for display
  time: string;      // Formatted time range for display
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
  clientId: string;
  clientName: string;
  educatorId: string | null;
  educatorName: string;
  locationId: string | null;
  locationName: string;
  notes: string | null;
}

interface BookingsPageProps {
  params: {
    adminSlug: string;
  };
}

const containerVariants = {
  visible: {
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

// Reusable component for a single booking card
const BookingCard = ({ booking, onEdit, onDelete }: { booking: BookingData; onEdit: (booking: BookingData) => void; onDelete: (booking: BookingData) => void; }) => {
  const statusColors = {
    CONFIRMED: 'bg-green-600 text-white',
    CANCELLED: 'bg-red-600 text-white',
    PENDING: 'bg-yellow-400 text-gray-900',
    COMPLETED: 'bg-blue-600 text-white',
  };

  const statusIcons = {
    CONFIRMED: <CheckCircleIcon className='w-5 h-5' />,
    CANCELLED: <XMarkIcon className='w-5 h-5' />, // Using XMark for cancelled
    PENDING: <ArrowsUpDownIcon className="w-5 h-5 animate-spin" />,
    COMPLETED: <CheckCircleIcon className='w-5 h-5' />, // Can be different if desired
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col relative border border-gray-700"
      variants={bookingCardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[booking.status]}`}
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
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDaysIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Date:</span> {booking.date}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <ClockIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Time:</span> {booking.time}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Location:</span> {booking.locationName}</p>
          </div>
          {booking.educatorName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-400">
              <UserCircleIcon className="mr-2 text-indigo-400 w-5 h-5" />
              <p><span className="font-semibold text-gray-300">Trainer:</span> {booking.educatorName}</p>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-400">
            <TagIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Type:</span> {booking.bookingType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          onClick={() => onEdit(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className='w-5 h-5' />
          Edit Booking
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

export default function BookingsPage({ params }: BookingsPageProps) {
  const { adminSlug } = params;

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<BookingData | null>(null);

  // Function to fetch bookings from the API
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/bookings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BookingData[] = await response.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [adminSlug]);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const openAddModal = () => {
    setCurrentBooking(null); // Clear current booking for add mode
    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking: BookingData) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (savedBooking: BookingData) => {
    if (currentBooking) {
      // If editing, update the existing booking in the list
      setBookings(prevBookings => prevBookings.map(b => b.id === savedBooking.id ? savedBooking : b));
      alert(`Booking "${savedBooking.title}" updated successfully.`);
    } else {
      // If adding, prepend the new booking to the list
      setBookings(prevBookings => [savedBooking, ...prevBookings]);
      alert(`Booking "${savedBooking.title}" created successfully.`);
    }
    setIsBookingModalOpen(false);
  };

  const handleDeleteBookingClick = (booking: BookingData) => {
    setBookingToDelete(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete booking "${bookingToDelete.title}".`);
      }

      // If deletion is successful, update the local state
      setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingToDelete.id));
      alert(`Booking "${bookingToDelete.title}" deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting booking: ${err.message}`);
    } finally {
      setLoading(false);
      setBookingToDelete(null); // Clear booking to delete
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-12 drop-shadow-lg"
      >
        Manage Bookings & Schedule
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
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

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl text-gray-400">Loading bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-6 rounded-lg text-center mb-8 border border-red-700">
            <p className="font-bold text-lg">Error loading bookings:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No bookings found. Start by creating one!</p>
          </div>
        ) : (
          <motion.div
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
      </motion.div>

      {/* Add/Edit Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        booking={currentBooking}
        adminSlug={adminSlug}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteBooking}
        title="Confirm Deletion"
        message={`Are you sure you want to delete booking "${bookingToDelete?.title || 'N/A'}" for client "${bookingToDelete?.clientName || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
