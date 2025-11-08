"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDaysIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  FunnelIcon,
  PlusCircleIcon,
  TagIcon,
  ClockIcon, // Added icon
  UserCircleIcon, // Added icon
  PencilIcon, // Added icon
  CurrencyDollarIcon, // Added icon
  MapIcon, // Added icon
  CubeTransparentIcon as PackageIcon // Using a different icon as 'PackageIcon' is not standard
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import TravelBookingModal from './TravelBookingModal';
import toast from 'react-hot-toast'; // Replaced native alerts with a modern toast library

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define the TravelBookingData interface to match the API response
export interface TravelBookingData {
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.01, -0.05, 0.95],
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.5)",
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
    CONFIRMED: 'bg-green-500 text-white',
    PENDING: 'bg-yellow-400 text-gray-900',
    CANCELLED: 'bg-red-500 text-white',
    COMPLETED: 'bg-blue-500 text-white',
  };

  const getStatusIcon = (status: TravelBookingData['status']) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircleIcon className='h-5 w-5' />;
      case 'PENDING': return <ClockIcon className='h-5 w-5 animate-pulse' />;
      case 'CANCELLED': return <XCircleIcon className='h-5 w-5' />;
      case 'COMPLETED': return <CheckCircleIcon className='h-5 w-5' />;
      default: return null;
    }
  };

  return (
    <motion.div
      className="bg-gray-900 p-6 rounded-3xl shadow-xl flex flex-col relative border border-gray-700 hover:border-indigo-500 transition-colors duration-200"
      // variants={bookingCardVariants}
      // whileHover="hover"
      // initial="hidden"
      // animate="visible"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-6 right-6 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 drop-shadow-md ${statusColors[booking.status]}`}
      >
        {getStatusIcon(booking.status)}
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase()}
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{booking.title}</h3>
        <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{booking.description || 'No description provided.'}</p>

        <div className="border-t border-gray-800 pt-6 space-y-4">
          <div className="flex items-center text-sm text-gray-300">
            <UserCircleIcon className="mr-3 text-teal-400 w-5 h-5" />
            <p><span className="font-semibold text-white">Client:</span> {booking.customerName}</p>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <TagIcon className="mr-3 text-purple-400 w-5 h-5" />
            <p><span className="font-semibold text-white">Type:</span> {booking.bookingType.replace(/_/g, ' ')}</p>
          </div>
          {booking.tourPackageName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-300">
              <PackageIcon className="mr-3 text-indigo-400 w-5 h-5" />
              <p><span className="font-semibold text-white">Package:</span> {booking.tourPackageName}</p>
            </div>
          )}
          {booking.destinationName !== 'N/A' && (
            <div className="flex items-center text-sm text-gray-300">
              <MapIcon className="mr-3 text-blue-400 w-5 h-5" />
              <p><span className="font-semibold text-white">Destination:</span> {booking.destinationName}</p>
            </div>
          )}
          <div className="flex items-center text-sm text-gray-300">
            <CalendarDaysIcon className="mr-3 text-yellow-400 w-5 h-5" />
            <p><span className="font-semibold text-white">Dates:</span> {booking.startDate} to {booking.endDate}</p>
          </div>
          <div className="flex items-center text-lg font-bold text-green-400">
            <CurrencyDollarIcon className="mr-3 w-6 h-6" />
            <p>Total: ${booking.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-800">
        <motion.button
          onClick={() => onEdit(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[calc(50%-6px)] py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <PencilIcon className='w-4 h-4' />
          Edit
        </motion.button>
        {booking.status === 'PENDING' && (
          <motion.button
            onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[calc(50%-6px)] py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <CheckCircleIcon className='w-4 h-4' />
            Confirm
          </motion.button>
        )}
        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
          <motion.button
            onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 min-w-[calc(50%-6px)] py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <XCircleIcon className='w-4 h-4' />
            Cancel
          </motion.button>
        )}
        <motion.button
          onClick={() => onDelete(booking)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 min-w-[calc(50%-6px)] py-3 bg-gray-700 text-gray-300 rounded-xl font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <TrashIcon className='w-4 h-4' />
          Delete
        </motion.button>
      </div>
    </motion.div>
  );
};


export default function AdminBookingsPage() {
  const { slug } = useParams();

  const [bookings, setBookings] = useState<TravelBookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<TravelBookingData['status'] | 'All'>('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<TravelBookingData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<TravelBookingData | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings?companyId=${slug}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TravelBookingData[] = (await response.json()).data;
      console.log("Fetched bookings:", data);
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch bookings:", err);
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
      setBookings(prevBookings => prevBookings.map(b => b.id === savedBooking.id ? savedBooking : b));
      toast.success(`Booking "${savedBooking.title}" updated successfully.`);
    } else {
      setBookings(prevBookings => [savedBooking, ...prevBookings]);
      toast.success(`Booking "${savedBooking.title}" created successfully! 🎉`);
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
    const toastId = toast.loading(`Deleting booking "${bookingToDelete.title}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings/${bookingToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });

      if (!response.ok) {
        const errorData = await response.json();
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

  const handleUpdateBookingStatus = async (id: string, newStatus: TravelBookingData['status']) => {
    const bookingToUpdate = bookings.find(b => b.id === id);
    if (!bookingToUpdate) {
      toast.error('Booking not found.');
      return;
    }

    const toastId = toast.loading(`Updating status for "${bookingToUpdate.title}"...`);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include'
        },
        body: JSON.stringify({ ...bookingToUpdate, status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update booking status.`);
      }

      const updatedBooking: TravelBookingData = await response.json();
      setBookings(prevBookings => prevBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      toast.success(`Booking "${updatedBooking.title}" status updated to ${newStatus}.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error updating status: ${err.message}`, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-blue-950 p-8 text-white font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex flex-col items-center mb-16">
          <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 mb-4 drop-shadow-lg leading-tight">
            Travel Bookings Dashboard
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl text-center">
            Effortlessly manage, track, and update all travel arrangements and bookings for your company.
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900 rounded-3xl shadow-2xl p-8 mb-12 border border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <h2 className="text-3xl font-bold text-white">All Bookings</h2>
            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                onClick={openAddModal}
                className="flex items-center space-x-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-teal-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusCircleIcon className="h-6 w-6" />
                <span>Create New Booking</span>
              </motion.button>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TravelBookingData['status'] | 'All')}
                  className="bg-gray-800 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-6 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
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

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <svg className="animate-spin h-12 w-12 text-teal-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="bg-red-900 bg-opacity-30 text-red-200 p-8 rounded-2xl text-center mb-8 border border-red-700"
              >
                <p className="font-bold text-xl mb-2">Error loading bookings:</p>
                <p className="text-sm">{error}</p>
              </motion.div>
            ) : filteredBookings.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <p className="text-xl text-gray-400">No bookings found for this filter. Try creating one! 🚀</p>
              </motion.div>
            ) : (
              <motion.div
                key="bookings"
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
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Add/Edit Booking Modal */}
      <TravelBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        booking={currentBooking}
        slug={slug as string}
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