import React from 'react';
import { motion } from 'framer-motion';
import { Booking, getBookingsData } from '@/constant/Data';

interface BookingsProps {
  params: {
    adminSlug: string;
  };
}

const bookingRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function BookingsPage({ params }: BookingsProps) {
  const { adminSlug } = params;
  const bookingsData: Booking[] = getBookingsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bookings & Schedule</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Upcoming & Recent Bookings</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + New Booking
        </motion.button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item/Trainer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <motion.tbody
            className="bg-white divide-y divide-gray-200"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {bookingsData.map((booking) => (
              <motion.tr key={booking.id} variants={bookingRowVariants}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{booking.item}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date} at {booking.time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}