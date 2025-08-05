"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Booking, getBookingsData } from '@/constant/Data';
import { ArrowsUpDownIcon, CalendarDateRangeIcon, CheckCircleIcon, ClockIcon, MapIcon, PencilIcon, PlusIcon, UserCircleIcon } from '@heroicons/react/24/outline';


interface BookingsProps {
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
const BookingCard = ({ booking }: { booking: Booking }) => {
  const statusColors = {
    confirmed: 'bg-green-600 text-white',
    cancelled: 'bg-red-600 text-white',
    pending: 'bg-yellow-400 text-gray-900',
  };

  const statusIcons = {
    confirmed: <CheckCircleIcon className='w-6 h-6' />,
    cancelled: <ClockIcon className='w-6 h-6' />,
    pending: <ArrowsUpDownIcon className="w-6 h-6 animate-spin" />,
  };

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col relative"
      variants={bookingCardVariants}
      whileHover="hover"
    >
      {/* Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusColors[booking.status]}`}
      >
        {statusIcons[booking.status]}
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <UserCircleIcon className="text-indigo-400 w-6 h-6" />
          <h4 className="text-lg font-bold text-white leading-tight">{booking.clientName}</h4>
        </div>
        <p className="text-sm text-gray-400 mb-4">{booking.type} - {booking.item}</p>
        
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <CalendarDateRangeIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <p>Date: {booking.date}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <ClockIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <p>Time: {booking.time}</p>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapIcon className="mr-2 text-indigo-400 w-6 h-6" />
            <p>Location: {booking.location}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <PencilIcon className='w-6 h-6' />
            Edit Booking
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function BookingsPage({ params }: BookingsProps) {
  const { adminSlug } = params;
  const bookingsData: Booking[] = getBookingsData(adminSlug);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Bookings & Schedule</h1>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className='w-6 h-6' />
          New Booking
        </motion.button>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {bookingsData.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </motion.div>
    </div>
  );
}