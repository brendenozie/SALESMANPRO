"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, PlusCircleIcon, MagnifyingGlassIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  issuedDate: string;
  status: 'Pending' | 'Dispensed' | 'Expired';
}

const samplePrescriptions: Prescription[] = [
  { id: 'pr001', patientName: 'Alice Wonderland', doctorName: 'Dr. Smith', medication: 'Amoxicillin', dosage: '250mg, 3x daily', issuedDate: '2023-07-01', status: 'Dispensed' },
  { id: 'pr002', patientName: 'Bob The Builder', doctorName: 'Dr. Johnson', medication: 'Ibuprofen', dosage: '200mg, as needed', issuedDate: '2023-07-10', status: 'Pending' },
  { id: 'pr003', patientName: 'Charlie Chaplin', doctorName: 'Dr. Davis', medication: 'Loratadine', dosage: '10mg, daily', issuedDate: '2023-06-15', status: 'Expired' },
  { id: 'pr004', patientName: 'Diana Prince', doctorName: 'Dr. Smith', medication: 'Vitamin D', dosage: '1000 IU, daily', issuedDate: '2023-07-12', status: 'Pending' },
];

export default function AdminPrescriptionsPage({ params }: { params: { adminSlug: string } }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(samplePrescriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredPrescriptions = prescriptions.filter(rx =>
    (filterStatus === 'All' || rx.status === filterStatus) &&
    (rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     rx.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
     rx.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updatePrescriptionStatus = (id: string, newStatus: Prescription['status']) => {
    setPrescriptions(prev => prev.map(rx => rx.id === id ? { ...rx, status: newStatus } : rx));
    alert(`Prescription ${id} status updated to ${newStatus}. (Mock Action)`);
  };

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'Pending': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'Dispensed': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'Expired': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Prescription Management
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Manage and track patient prescriptions.
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
                placeholder="Search prescriptions..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Dispensed">Dispensed</option>
              <option value="Expired">Expired</option>
            </select>
            <button
              onClick={() => alert('Add new prescription form (Mock Action)')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold shadow-md hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Prescription
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Patient</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Medication</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosage</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      No prescriptions found.
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{rx.patientName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Dr. {rx.doctorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{rx.medication}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {rx.dosage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {rx.issuedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rx.status)}`}>
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => alert(`Viewing prescription details for: ${rx.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`View prescription ${rx.id}`}
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {rx.status === 'Pending' && (
                            <button
                              onClick={() => updatePrescriptionStatus(rx.id, 'Dispensed')}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-2 rounded-full hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Mark prescription ${rx.id} as dispensed`}
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          {/* Add other actions like 'Edit' or 'Cancel' */}
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
