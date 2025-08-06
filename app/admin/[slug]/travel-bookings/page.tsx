// app/[adminSlug]/admin-bookings/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon, EyeIcon, CheckCircleIcon, XCircleIcon, TrashIcon, FunnelIcon, PlusCircleIcon, TagIcon
} from '@heroicons/react/24/solid'; // Changed PlusIcon to PlusCircleIcon, added TagIcon
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import TravelBookingModal from './TravelBookingModal'; // New TravelBookingModal component

// Define the TravelBookingData interface to match the API response
interface TravelBookingData {
  id: string;
  title: string;
  description: string | null;
  bookingType: 'TOUR_PACKAGE_BOOKING' | 'CUSTOM_TRIP_BOOKING' | 'ACCOMMODATION_BOOKING' | 'FLIGHT_BOOKING' | 'OTHER_TRAVEL_SERVICE';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
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

interface AdminBookingsPageProps {
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
const BookingCard = ({ booking, onEdit, onDelete, onUpdateStatus }: {
  booking: TravelBookingData;
  onEdit: (booking: TravelBookingData) => void;
  onDelete: (booking: TravelBookingData) => void;
  onUpdateStatus: (id: string, newStatus: TravelBookingData['status']) => void;
}) => {
  const statusColors = {
    CONFIRMED: 'bg-green-600 text-white',
    PENDING: 'bg-yellow-400 text-gray-900',
    CANCELLED: 'bg-red-600 text-white',
    COMPLETED: 'bg-blue-600 text-white',
  };

  const getStatusIcon = (status: TravelBookingData['status']) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircleIcon className='h-5 w-5' />;
      case 'PENDING': return <ClockIcon className='h-5 w-5 animate-spin' />;
      case 'CANCELLED': return <XCircleIcon className='h-5 w-5' />;
      case 'COMPLETED': return <CheckCircleIcon className='h-5 w-5' />; // Can be a different icon if desired
      default: return null;
    }
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
        {getStatusIcon(booking.status)}
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{booking.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{booking.description || 'No description provided.'}</p>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <UserCircleIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Client:</span> {booking.customerName}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <TagIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Type:</span> {booking.bookingType.replace(/_/g, ' ')}</p>
          </div>
          {booking.tourPackageName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-400">
              <PackageIcon className="mr-2 text-indigo-400 w-5 h-5" /> {/* Assuming PackageIcon exists or use a generic one */}
              <p><span className="font-semibold text-gray-300">Package:</span> {booking.tourPackageName}</p>
            </div>
          )}
          {booking.destinationName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-400">
              <MapIcon className="mr-2 text-indigo-400 w-5 h-5" />
              <p><span className="font-semibold text-gray-300">Destination:</span> {booking.destinationName}</p>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDaysIcon className="mr-2 text-indigo-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Dates:</span> {booking.startDate} to {booking.endDate}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <CurrencyDollarIcon className="mr-2 text-green-400 w-5 h-5" />
            <p><span className="font-semibold text-gray-300">Total:</span> ${booking.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          onClick={() => onEdit(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[48%] py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className='w-5 h-5' />
          Edit
        </motion.button>
        {booking.status === 'PENDING' && (
          <motion.button
            onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[48%] py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className='w-5 h-5' />
            Confirm
          </motion.button>
        )}
        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
          <motion.button
            onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[48%] py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <XCircleIcon className='w-5 h-5' />
            Cancel
          </motion.button>
        )}
        <motion.button
          onClick={() => onDelete(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[48%] py-3 bg-gray-700 text-gray-300 rounded-lg font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <TrashIcon className='w-5 h-5' />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};


export default function AdminBookingsPage({ params }: AdminBookingsPageProps) {
  const { adminSlug } = params;

  const [bookings, setBookings] = useState<TravelBookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TravelBookingData['status'] | 'All'>('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<TravelBookingData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<TravelBookingData | null>(null);

  // Function to fetch bookings from the API
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/${adminSlug}/travel-bookings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TravelBookingData[] = await response.json();
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

  const filteredBookings = bookings.filter(booking =>
    filterStatus === 'All' || booking.status === filterStatus
  );

  const openAddModal = () => {
    setCurrentBooking(null); // Clear current booking for add mode
    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking: TravelBookingData) => {
    setCurrentBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (savedBooking: TravelBookingData) => {
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

  const handleDeleteBookingClick = (booking: TravelBookingData) => {
    setBookingToDelete(booking);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/${adminSlug}/travel-bookings/${bookingToDelete.id}`, {
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

  const handleUpdateBookingStatus = async (id: string, newStatus: TravelBookingData['status']) => {
    setLoading(true);
    setError(null);
    try {
      const bookingToUpdate = bookings.find(b => b.id === id);
      if (!bookingToUpdate) {
        throw new Error('Booking not found.');
      }

      const response = await fetch(`/api/admin/${adminSlug}/travel-bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...bookingToUpdate, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update booking status.`);
      }

      const updatedBooking: TravelBookingData = await response.json();
      setBookings(prevBookings => prevBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      alert(`Booking "${updatedBooking.title}" status updated to ${newStatus}.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 p-8 text-white font-sans">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-12 drop-shadow-lg"
      >
        Manage Travel Bookings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-white">All Bookings</h2>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusCircleIcon className="h-6 w-6" />
              <span>Create New Booking</span>
            </motion.button>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-6 w-6 text-gray-400" />
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TravelBookingData['status'] | 'All')}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <svg className="animate-spin h-10 w-10 text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {!loading && !error && filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No bookings found for the selected filter. Try creating one!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
      </motion.div>

      {/* Add/Edit Booking Modal */}
      <TravelBookingModal
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
        message={`Are you sure you want to delete booking "${bookingToDelete?.title || 'N/A'}" for client "${bookingToDelete?.customerName || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
