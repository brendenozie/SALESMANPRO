"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircleIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  status: 'Active' | 'On Leave';
  imageUrl: string;
}

const sampleDoctors: Doctor[] = [
  { id: 'd001', name: 'Dr. Alice Smith', specialty: 'Pediatrics', contact: 'alice.smith@clinic.com', status: 'Active', imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 'd002', name: 'Dr. Robert Johnson', specialty: 'General Practice', contact: 'robert.j@clinic.com', status: 'Active', imageUrl: 'https://randomuser.me/api/portraits/men/44.jpg' },
  { id: 'd003', name: 'Dr. Emily Davis', specialty: 'Dermatology', contact: 'emily.d@clinic.com', status: 'Active', imageUrl: 'https://randomuser.me/api/portraits/women/79.jpg' },
  { id: 'd004', name: 'Dr. Michael Brown', specialty: 'Orthopedics', contact: 'michael.b@clinic.com', status: 'On Leave', imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg' },
  { id: 'd005', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', contact: 'sarah.w@clinic.com', status: 'Active', imageUrl: 'https://randomuser.me/api/portraits/women/55.jpg' },
];

export default function AdminDoctorsPage({ params }: { params: { adminSlug: string } }) {
  const [doctors, setDoctors] = useState<Doctor[]>(sampleDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredDoctors = doctors.filter(doctor =>
    (filterStatus === 'All' || doctor.status === filterStatus) &&
    (doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (id: string) => {
    alert(`Editing doctor: ${id} (Mock Action)`);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete doctor ${id}?`)) {
      setDoctors(prev => prev.filter(d => d.id !== id));
      alert(`Doctor ${id} deleted.`);
    }
  };

  const handleView = (id: string) => {
    alert(`Viewing doctor profile for: ${id} (Mock Action)`);
  };

  const getStatusColor = (status: Doctor['status']) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'On Leave': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Doctor Management
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Manage information and availability of your medical team.
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
                placeholder="Search doctors..."
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
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
            <button
              onClick={() => alert('Add new doctor form (Mock Action)')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-bold shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Doctor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specialty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={doctor.imageUrl} alt={doctor.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{doctor.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{doctor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{doctor.specialty}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {doctor.contact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doctor.status)}`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleView(doctor.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`View ${doctor.name}`}
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(doctor.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Edit ${doctor.name}`}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Delete ${doctor.name}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
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
