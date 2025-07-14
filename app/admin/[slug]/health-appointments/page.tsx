"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, PlusCircleIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  service: string;
}

const sampleAppointments: Appointment[] = [
  { id: 'a001', patientName: 'Alice Wonderland', doctorName: 'Dr. Smith', date: '2023-07-15', time: '10:00 AM', status: 'Scheduled', service: 'General Check-up' },
  { id: 'a002', patientName: 'Bob The Builder', doctorName: 'Dr. Johnson', date: '2023-07-15', time: '11:30 AM', status: 'Scheduled', service: 'Follow-up' },
  { id: 'a003', patientName: 'Charlie Chaplin', doctorName: 'Dr. Davis', date: '2023-07-14', time: '09:00 AM', status: 'Completed', service: 'Dermatology Consult' },
  { id: 'a004', patientName: 'Diana Prince', doctorName: 'Dr. Smith', date: '2023-07-16', time: '02:00 PM', status: 'Scheduled', service: 'Vaccination' },
  { id: 'a005', patientName: 'Eve Harrington', doctorName: 'Dr. Johnson', date: '2023-07-14', time: '03:00 PM', status: 'Cancelled', service: 'Physiotherapy' },
];

export default function AdminAppointmentsPage({ params }: { params: { adminSlug: string } }) {
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredAppointments = appointments.filter(appt =>
    (filterStatus === 'All' || appt.status === filterStatus) &&
    (appt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appt.service.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status: newStatus } : appt));
    alert(`Appointment ${id} status updated to ${newStatus}. (Mock Action)`);
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Scheduled': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'Completed': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'Cancelled': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Appointment Schedule
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Manage and track all patient appointments.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Appointment['status'] | 'All')}
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => alert('Open new appointment booking form (Mock Action)')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-bold shadow-md hover:from-teal-600 hover:to-blue-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Appointment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-6 h-6 text-gray-500 mr-2" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{appt.patientName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="w-6 h-6 text-gray-500 mr-2" />
                          <div className="text-sm text-gray-900 dark:text-white">{appt.doctorName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{appt.date}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{appt.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {appt.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {appt.status === 'Scheduled' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, 'Completed')}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                                aria-label={`Mark appointment ${appt.id} as completed`}
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                                aria-label={`Cancel appointment ${appt.id}`}
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          {/* Add other actions like 'Reschedule' or 'View Details' */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
