// AdminBookings.jsx
"use client";

import React, { useState } from 'react';
import {
  CalendarDaysIcon, EyeIcon, CheckCircleIcon, XCircleIcon, TrashIcon, FunnelIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// Dummy Data
const initialBookings = [
  { id: 'BKG001', customer: 'Alice Smith', destination: 'Bali Retreat', date: '2025-08-15', status: 'Confirmed', total: 1200 },
  { id: 'BKG002', customer: 'Bob Johnson', destination: 'Alaskan Adventure', date: '2025-09-01', status: 'Pending', total: 2500 },
  { id: 'BKG003', customer: 'Charlie Brown', destination: 'Parisian Escape', date: '2025-08-20', status: 'Cancelled', total: 950 },
  { id: 'BKG004', customer: 'Diana Prince', destination: 'Safari Serengeti', date: '2025-10-10', status: 'Confirmed', total: 3800 },
  { id: 'BKG005', customer: 'Eve Adams', destination: 'Kyoto Tour', date: '2025-09-25', status: 'Pending', total: 1800 },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredBookings = bookings.filter(booking =>
    filterStatus === 'All' || booking.status === filterStatus
  );

  const handleUpdateStatus = (id, newStatus) => {
    setBookings(bookings.map(booking =>
      booking.id === id ? { ...booking, status: newStatus } : booking
    ));
    alert(`Booking ${id} status updated to ${newStatus}`);
  };

  const handleDeleteBooking = (id) => {
    if (confirm(`Are you sure you want to delete booking ${id}?`)) {
      setBookings(bookings.filter(booking => booking.id !== id));
      alert(`Booking ${id} deleted.`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Bookings
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <FunnelIcon className="h-6 w-6 text-gray-500" />
          <label htmlFor="statusFilter" className="font-medium text-gray-700">Filter by Status:</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="All">All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${booking.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => alert(`Viewing details for ${booking.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="View Details"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </motion.button>
                        {booking.status === 'Pending' && (
                          <motion.button
                            onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition"
                            title="Confirm Booking"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        {booking.status !== 'Cancelled' && (
                          <motion.button
                            onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                            title="Cancel Booking"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete Booking"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}