"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircleIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon,
  BriefcaseIcon, XMarkIcon, UserIcon // UserIcon for general person representation
} from '@heroicons/react/24/solid';

// Define the Doctor interface based on the expected data from the backend
interface Doctor {
  id: string; // Doctor model's ID
  userId: string; // Corresponding User ID
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  specialty: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'; // Matches Prisma enum
  createdAt: string; // Formatted date string
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Custom Modal Component (re-used from previous pages)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative"
        variants={modalVariants}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

export default function AdminDoctorsPage({ params }: { params: { slug: string } }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Doctor['status']>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Mock companyId for demonstration. In a real app, this would come from auth/session.
  // IMPORTANT: Replace with a valid ObjectId from your database for testing.
  const companyId = params.slug || "654321098765432109876543";

  const [newDoctorData, setNewDoctorData] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    specialty: '',
    status: 'ACTIVE' as Doctor['status'],
  });

  const [editDoctorData, setEditDoctorData] = useState<Partial<Doctor>>({});

  // Fetch doctors from the backend API
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      const response = await fetch(`/api/admin/doctors?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch doctors');
      }
      const data: Doctor[] = await response.json();
      setDoctors(data);
    } catch (e: any) {
      console.error("Error fetching doctors:", e);
      setError(e.message || "Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  }, [companyId, searchTerm, filterStatus]);

  // Initial fetch on component mount and when search/filter changes
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Handlers for modal interactions
  const handleAddDoctorClick = () => {
    setNewDoctorData({
      name: '', email: '', phone: '', profilePicture: '', specialty: '', status: 'ACTIVE',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditDoctorData({ ...doctor });
    setIsEditModalOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteConfirmOpen(true);
  };

  const handleView = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsViewModalOpen(true);
  };

  // CRUD operations via API
  const addNewDoctor = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newDoctorData, companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add doctor');
      }

      setIsAddModalOpen(false);
      fetchDoctors(); // Refresh list
    } catch (e: any) {
      console.error("Error adding doctor:", e);
      setError(e.message || "Failed to add new doctor.");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctor = async () => {
    if (!selectedDoctor) {
      setError("No doctor selected for update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editDoctorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update doctor');
      }

      setIsEditModalOpen(false);
      fetchDoctors(); // Refresh list
    } catch (e: any) {
      console.error("Error updating doctor:", e);
      setError(e.message || "Failed to update doctor.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteDoctor = async () => {
    if (!selectedDoctor) {
      setError("No doctor selected for deletion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/doctors/${selectedDoctor.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete doctor');
      }

      setIsDeleteConfirmOpen(false);
      fetchDoctors(); // Refresh list
    } catch (e: any) {
      console.error("Error deleting doctor:", e);
      setError(e.message || "Failed to delete doctor.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Doctor['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'ON_LEAVE': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
      case 'INACTIVE': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
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
          Manage information and availability of your medical team. (Company ID: {companyId})
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
              onChange={(e) => setFilterStatus(e.target.value as 'All' | Doctor['status'])}
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <button
              onClick={handleAddDoctorClick}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-bold shadow-md hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Doctor
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading doctors...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specialty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact (Email)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        No doctors found.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={doctor.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctor.name ? doctor.name.charAt(0) : '?'}${doctor.name ? doctor.name.charAt(1) : ''}`}
                                alt={doctor.name}
                                onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctor.name ? doctor.name.charAt(0) : '?'}${doctor.name ? doctor.name.charAt(1) : ''}`; }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{doctor.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {doctor.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{doctor.specialty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doctor.email} {doctor.phone && `(${doctor.phone})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doctor.status)}`}>
                            {doctor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(doctor)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`View ${doctor.name}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(doctor)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Edit ${doctor.name}`}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(doctor)}
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
          )}
        </motion.div>
      </div>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Doctor">
          <form onSubmit={(e) => { e.preventDefault(); addNewDoctor(); }} className="space-y-4">
            <div>
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="newName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.name}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="newEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.email}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (Optional)</label>
              <input
                type="tel"
                id="newPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.phone}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="newProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.profilePicture}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, profilePicture: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newSpecialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
              <input
                type="text"
                id="newSpecialty"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.specialty}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, specialty: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="newStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newDoctorData.status}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, status: e.target.value as Doctor['status'] })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Add Doctor
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Doctor Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Doctor: ${selectedDoctor?.name || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updateDoctor(); }} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="editName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.name || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="editEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.email || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (Optional)</label>
              <input
                type="tel"
                id="editPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.phone || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="editProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.profilePicture || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, profilePicture: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editSpecialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
              <input
                type="text"
                id="editSpecialty"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.specialty || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, specialty: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="editStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editDoctorData.status || ''}
                onChange={(e) => setEditDoctorData({ ...editDoctorData, status: e.target.value as Doctor['status'] })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete doctor <span className="font-bold">{selectedDoctor?.name}</span> (ID: {selectedDoctor?.id})? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteDoctor}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Doctor Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Doctor Details: ${selectedDoctor?.name || ''}`}>
          {selectedDoctor && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-4">
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={selectedDoctor.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${selectedDoctor.name ? selectedDoctor.name.charAt(0) : '?'}${selectedDoctor.name ? selectedDoctor.name.charAt(1) : ''}`}
                  alt={selectedDoctor.name}
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${selectedDoctor.name ? selectedDoctor.name.charAt(0) : '?'}${selectedDoctor.name ? selectedDoctor.name.charAt(1) : ''}`; }}
                />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedDoctor.id}</p>
                </div>
              </div>
              <p><strong>Email:</strong> {selectedDoctor.email}</p>
              <p><strong>Phone:</strong> {selectedDoctor.phone || 'N/A'}</p>
              <p><strong>Specialty:</strong> {selectedDoctor.specialty}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedDoctor.status)}`}>{selectedDoctor.status}</span></p>
              <p><strong>Account Created:</strong> {selectedDoctor.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}
