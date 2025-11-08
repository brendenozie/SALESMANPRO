"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;
// Define the Patient interface based on the expected data from the backend
interface Patient {
  id: string; // Consumer ID
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  dob?: string; // Format: YYYY-MM-DD
  gender?: 'Male' | 'Female' | 'Other';
  lastVisit?: string; // Formatted date string
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

// Custom Modal Component
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


// ✅ You now pass in initialPatients + companyId as props
interface AdminPatientsPageClientProps {
  initialPatients: Patient[];
  companyId: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  lastVisit?: string;
  createdAt: string;
}

export default function AdminPatientsPageClient({
  initialPatients,
  companyId,
}: AdminPatientsPageClientProps) {
  
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
    const [editPatientData, setEditPatientData] = useState<Partial<Patient>>({});
  
    const [newPatientData, setNewPatientData] = useState({
      name: "",
      email: "",
      phone: "",
      dob: "", // YYYY-MM-DD format
      gender: "",
      profilePicture: "",
    });
  
    // Fetch patients from the backend API
    const fetchPatients = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
  
        const response = await fetch(
          `${apiBaseUrl}/admin/patients?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}`,
          {
            method: "GET",
            credentials: "include", // ensures NextAuth session cookies are sent
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch patients');
        }
        const data: Patient[] = (await response.json()).data;
        setPatients(data);
      } catch (e: any) {
        console.error("Error fetching patients:", e);
        setError(e.message || "Failed to load patient data.");
      } finally {
        setLoading(false);
      }
    }, [companyId, searchTerm]); // Re-fetch when companyId or searchTerm changes
  
    // Initial fetch on component mount and when search term changes
    // useEffect(() => {
    //   fetchPatients();
    // }, [fetchPatients]);
  
    // Handlers for modal interactions
    const handleAddPatientClick = () => {
      setNewPatientData({ name: '', email: '', phone: '', dob: '', gender: '', profilePicture: '' });
      setIsAddModalOpen(true);
    };
  
    const handleEdit = (patient: Patient) => {
      setSelectedPatient(patient);
      // Ensure DOB is in YYYY-MM-DD format for input type="date"
      const formattedDob = patient.dob && patient.dob !== 'N/A' ? new Date(patient.dob).toISOString().split('T')[0] : '';
      setEditPatientData({ ...patient, dob: formattedDob });
      setIsEditModalOpen(true);
    };
  
    const handleDelete = (patient: Patient) => {
      setSelectedPatient(patient);
      setIsDeleteConfirmOpen(true);
    };
  
    const handleView = (patient: Patient) => {
      setSelectedPatient(patient);
      setIsViewModalOpen(true);
    };
  
    // CRUD operations via API
    const addNewPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/patients`, {
          method: "POST",
          credentials: "include", // 🔑 ensures NextAuth cookies are sent
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...newPatientData, companyId }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add patient');
        }
  
        setIsAddModalOpen(false);
        fetchPatients(); // Refresh list
      } catch (e: any) {
        console.error("Error adding patient:", e);
        setError(e.message || "Failed to add new patient.");
      } finally {
        setLoading(false);
      }
    };
  
    const updatePatient = async () => {
      if (!selectedPatient) {
        setError("No patient selected for update.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/patients/${selectedPatient.id}`, {
          method: 'PUT',
          credentials: "include", // 🔑 ensures NextAuth cookies are sent
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editPatientData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update patient');
        }
  
        setIsEditModalOpen(false);
        fetchPatients(); // Refresh list
      } catch (e: any) {
        console.error("Error updating patient:", e);
        setError(e.message || "Failed to update patient.");
      } finally {
        setLoading(false);
      }
    };
  
    const confirmDeletePatient = async () => {
      if (!selectedPatient) {
        setError("No patient selected for deletion.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/patients/${selectedPatient.id}`, {
          method: 'DELETE',
          credentials: "include", // 🔑 ensures NextAuth cookies are sent
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete patient');
        }
  
        setIsDeleteConfirmOpen(false);
        fetchPatients(); // Refresh list
      } catch (e: any) {
        console.error("Error deleting patient:", e);
        setError(e.message || "Failed to delete patient.");
      } finally {
        setLoading(false);
      }
    };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Patient Management
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          View and manage all patient records.
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
                placeholder="Search patients..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <button
              onClick={handleAddPatientClick}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Patient
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading patients...</div>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DOB</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact (Email)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Visit</th>
                    <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={patient.profilePicture} alt={patient.name} onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${patient.name ? patient.name.charAt(0) : '?'}${patient.name ? patient.name.charAt(1) : ''}`; }} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {patient.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{patient.dob}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{patient.gender}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {patient.email} {patient.phone && `(${patient.phone})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {patient.lastVisit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(patient)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`View ${patient.name}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(patient)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Edit ${patient.name}`}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(patient)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Delete ${patient.name}`}
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

      {/* Add Patient Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Patient">
          <form onSubmit={(e) => { e.preventDefault(); addNewPatient(); }} className="space-y-4">
            <div>
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="newName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="newEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.email}
                onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                id="newPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.phone}
                onChange={(e) => setNewPatientData({ ...newPatientData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newDob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <input
                type="date"
                id="newDob"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.dob}
                onChange={(e) => setNewPatientData({ ...newPatientData, dob: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <select
                id="newGender"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.gender}
                onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="newProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="newProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPatientData.profilePicture}
                onChange={(e) => setNewPatientData({ ...newPatientData, profilePicture: e.target.value })}
              />
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
                Add Patient
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Patient Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Patient: ${selectedPatient?.name || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updatePatient(); }} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="editName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.name || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="editEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.email || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input
                type="tel"
                id="editPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.phone || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editDob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <input
                type="date"
                id="editDob"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.dob || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, dob: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editGender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <select
                id="editGender"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.gender || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="editProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="editProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPatientData.profilePicture || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, profilePicture: e.target.value })}
              />
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
            Are you sure you want to delete patient <span className="font-bold">{selectedPatient?.name}</span> (ID: {selectedPatient?.id})? This action cannot be undone.
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
              onClick={confirmDeletePatient}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Patient Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Patient Details: ${selectedPatient?.name || ''}`}>
          {selectedPatient && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-4">
                <img className="h-20 w-20 rounded-full object-cover" src={selectedPatient.profilePicture} alt={selectedPatient.name} onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${selectedPatient.name ? selectedPatient.name.charAt(0) : '?'}${selectedPatient.name ? selectedPatient.name.charAt(1) : ''}`; }} />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedPatient.id}</p>
                </div>
              </div>
              <p><strong>Email:</strong> {selectedPatient.email}</p>
              <p><strong>Phone:</strong> {selectedPatient.phone || 'N/A'}</p>
              <p><strong>Date of Birth:</strong> {selectedPatient.dob || 'N/A'}</p>
              <p><strong>Gender:</strong> {selectedPatient.gender || 'N/A'}</p>
              <p><strong>Last Visit:</strong> {selectedPatient.lastVisit || 'N/A'}</p>
              <p><strong>Account Created:</strong> {selectedPatient.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>
  );
}
