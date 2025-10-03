"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircleIcon, MagnifyingGlassIcon
  } from '@heroicons/react/24/solid';
import Modal from '@/components/Modal';
import DoctorModal from './DoctorModal';
import DoctorsTable from './DoctorsTable';
import { EditDoctorModal } from './EditDoctorModal';
  

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '127.0.0.1:3000/api';

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  specialty: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  createdAt: string;
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

function DoctorsClient({ initialDoctors, companyId }: { initialDoctors: Doctor[]; companyId: string }) {
  
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | Doctor["status"]>("All");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
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
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      const response = await fetch(`${apiBaseUrl}/admin/doctors?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
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
  };

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
      const response = await fetch(`${apiBaseUrl}/admin/doctors`, {
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
      const response = await fetch(`${apiBaseUrl}/admin/doctors/${selectedDoctor.id}`, {
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
      const response = await fetch(`${apiBaseUrl}/admin/doctors/${selectedDoctor.id}`, {
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

  return (
    <div>
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
              <DoctorsTable 
              doctors={doctors} searchTerm={searchTerm} filterStatus={filterStatus} 
              handleView={handleView} handleEdit={handleEdit} handleDelete={handleDelete} />
          )}

      {/* Add Modal */}
      <DoctorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doctorToEdit={selectedDoctor}
        onSave={updateDoctor}
      />
  
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
    </motion.div>
    </div>
  );
}

export default DoctorsClient;