// PrescriptionManager.tsx (Client Component)

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircleIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon,
  EyeIcon, XMarkIcon, UserIcon 
} from '@heroicons/react/24/solid';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// Define the Prescription interface based on the expected data from the backend
interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedDate: string; // Format: YYYY-MM-DD
  expiryDate?: string; // Format: YYYY-MM-DD
  status: 'PENDING' | 'DISPENSED' | 'EXPIRED'; // Matches Prisma enum
  notes?: string;
  createdAt: string; // Formatted date string
}

// Interface for Patient options in dropdowns (from /api/admin/patients)
interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

// Interface for Doctor options in dropdowns (from /api/admin/doctors)
interface DoctorOption {
  id: string; // Doctor ID
  name: string;
  userId: string; // Corresponding User ID
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


interface ManagerProps {
  initialPrescriptions: Prescription[];
  initialPatients: PatientOption[];
  initialDoctors: DoctorOption[];
  companyId: string;
}

// Utility function (from original file)
const getStatusColor = (status: Prescription['status']) => {
  switch (status) {
    case 'PENDING': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
    case 'DISPENSED': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'EXPIRED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
  }
};


export const PrescriptionManager: React.FC<ManagerProps> = ({ 
  initialPrescriptions, 
  initialPatients, 
  initialDoctors, 
  companyId 
}) => {
  // Initialize state with server-fetched data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [patients, setPatients] = useState<PatientOption[]>(initialPatients);
  const [doctors, setDoctors] = useState<DoctorOption[]>(initialDoctors);
  
  // Interactivity state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Prescription['status']>('All');
  const [loading, setLoading] = useState(false); // Only subsequent loads set this
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // Form State (copied from original)
  const [newPrescriptionData, setNewPrescriptionData] = useState({
    patientId: '',
    doctorId: '',
    medication: '',
    dosage: '',
    instructions: '',
    issuedDate: '', // YYYY-MM-DD
    expiryDate: '', // YYYY-MM-DD
    notes: '',
    status: 'PENDING' as Prescription['status'],
  });

  const [editPrescriptionData, setEditPrescriptionData] = useState<Partial<Prescription>>({});

  // --- Client-side Refetch Logic (for search/filter/CRUD refresh) ---
  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: This now handles *re-fetching* after the initial server-side load
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      // In a real app, this should debounce to prevent rapid fire API calls
      const response = await fetch(`${apiBaseUrl}/admin/prescriptions?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prescriptions');
      }
      const data: Prescription[] = await response.json();
      setPrescriptions(data);
    } catch (e: any) {
      console.error("Error fetching prescriptions:", e);
      setError(e.message || "Failed to load prescription data.");
    } finally {
      setLoading(false);
    }
  };//, [companyId, searchTerm, filterStatus]);

  // Trigger refetch when search term or filter status changes (excluding initial load)
  // useEffect(() => {
  //   // Skip initial fetch since data is already populated
  //   if (prescriptions.length === 0 && initialPrescriptions.length > 0 && searchTerm === '' && filterStatus === 'All') return; 
    
  //   const handler = setTimeout(() => {
  //       fetchPrescriptions();
  //   }, 300); // Debounce search
    
  //   return () => clearTimeout(handler);
    
  // }, [searchTerm, filterStatus]); 

  // --- Handlers & CRUD operations (mostly the same as original, calling fetchPrescriptions to refresh) ---
 
  // Handlers for modal interactions
  const handleAddPrescriptionClick = () => {
    setNewPrescriptionData({
      patientId: '', doctorId: '', medication: '', dosage: '', instructions: '',
      issuedDate: new Date().toISOString().split('T')[0], // Default to today
      expiryDate: '', notes: '', status: 'PENDING',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    // Format dates for input type="date"
    const formattedIssuedDate = prescription.issuedDate || '';
    const formattedExpiryDate = prescription.expiryDate || '';

    setEditPrescriptionData({
      ...prescription,
      issuedDate: formattedIssuedDate,
      expiryDate: formattedExpiryDate,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDeleteConfirmOpen(true);
  };

  const handleView = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsViewModalOpen(true);
  };

  // CRUD operations via API
  const addNewPrescription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newPrescriptionData, companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add prescription');
      }

      setIsAddModalOpen(false);
      fetchPrescriptions(); // Refresh list
    } catch (e: any) {
      console.error("Error adding prescription:", e);
      setError(e.message || "Failed to add new prescription.");
    } finally {
      setLoading(false);
    }
  };

  const updatePrescription = async () => {
    if (!selectedPrescription) {
      setError("No prescription selected for update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/prescriptions/${selectedPrescription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPrescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prescription');
      }

      setIsEditModalOpen(false);
      fetchPrescriptions(); // Refresh list
    } catch (e: any) {
      console.error("Error updating prescription:", e);
      setError(e.message || "Failed to update prescription.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePrescription = async () => {
    if (!selectedPrescription) {
      setError("No prescription selected for deletion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/prescriptions/${selectedPrescription.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prescription');
      }

      setIsDeleteConfirmOpen(false);
      fetchPrescriptions(); // Refresh list
    } catch (e: any) {
      console.error("Error deleting prescription:", e);
      setError(e.message || "Failed to delete prescription.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render (Interactive UI and Table) ---
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay: 0.4 }}
    >
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
                  onChange={(e) => setFilterStatus(e.target.value as 'All' | Prescription['status'])}
                >
                  <option value="All">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="DISPENSED">Dispensed</option>
                  <option value="EXPIRED">Expired</option>
                </select>
                <button
                  onClick={handleAddPrescriptionClick}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full font-bold shadow-md hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Prescription
                </button>
              </div>

              {loading && (
                <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading prescriptions...</div>
              )}
              {error && (
                <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
              )}

              {/* Prescription Table (Visual and Interactive) */}
              {!loading && !error && (
                <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
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
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        No prescriptions found.
                      </td>
                    </tr>
                  ) : (
                prescriptions.length > 0 && prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{rx.patientName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                            <div className="text-sm text-gray-900 dark:text-white">{rx.doctorName}</div>
                          </div>
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
                              onClick={() => handleView(rx)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`View prescription ${rx.id}`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(rx)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Edit prescription ${rx.id}`}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rx)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Delete prescription ${rx.id}`}
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
          
      {/* Add Prescription Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Prescription">
          <form onSubmit={(e) => { e.preventDefault(); addNewPrescription(); }} className="space-y-4">
            <div>
              <label htmlFor="newPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="newPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.patientId}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newDoctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
              <select
                id="newDoctor"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.doctorId}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, doctorId: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newMedication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medication</label>
              <input
                type="text"
                id="newMedication"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.medication}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, medication: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newDosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label>
              <input
                type="text"
                id="newDosage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.dosage}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, dosage: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructions (Optional)</label>
              <textarea
                id="newInstructions"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.instructions}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, instructions: e.target.value })}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="newIssuedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issued Date</label>
                <input
                  type="date"
                  id="newIssuedDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPrescriptionData.issuedDate}
                  onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, issuedDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="newExpiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (Optional)</label>
                <input
                  type="date"
                  id="newExpiryDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newPrescriptionData.expiryDate}
                  onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="newNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea
                id="newNotes"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.notes}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, notes: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="newStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newPrescriptionData.status}
                onChange={(e) => setNewPrescriptionData({ ...newPrescriptionData, status: e.target.value as Prescription['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="DISPENSED">Dispensed</option>
                <option value="EXPIRED">Expired</option>
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
                className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                Add Prescription
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Prescription Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Prescription: ${selectedPrescription?.medication || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updatePrescription(); }} className="space-y-4">
            <div>
              <label htmlFor="editPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="editPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.patientId || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, patientId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editDoctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
              <select
                id="editDoctor"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.doctorId || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, doctorId: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editMedication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medication</label>
              <input
                type="text"
                id="editMedication"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.medication || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, medication: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editDosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label>
              <input
                type="text"
                id="editDosage"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.dosage || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, dosage: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructions (Optional)</label>
              <textarea
                id="editInstructions"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.instructions || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, instructions: e.target.value })}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editIssuedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issued Date</label>
                <input
                  type="date"
                  id="editIssuedDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editPrescriptionData.issuedDate || ''}
                  onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, issuedDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="editExpiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (Optional)</label>
                <input
                  type="date"
                  id="editExpiryDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editPrescriptionData.expiryDate || ''}
                  onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="editNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea
                id="editNotes"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.notes || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, notes: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="editStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editPrescriptionData.status || ''}
                onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, status: e.target.value as Prescription['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="DISPENSED">Dispensed</option>
                <option value="EXPIRED">Expired</option>
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
            Are you sure you want to delete the prescription for <span className="font-bold">{selectedPrescription?.patientName}</span> ({selectedPrescription?.medication})? This action cannot be undone.
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
              onClick={confirmDeletePrescription}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Prescription Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Prescription Details: ${selectedPrescription?.medication || ''}`}>
          {selectedPrescription && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>Patient:</strong> {selectedPrescription.patientName}</p>
              <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
              <p><strong>Medication:</strong> {selectedPrescription.medication}</p>
              <p><strong>Dosage:</strong> {selectedPrescription.dosage}</p>
              <p><strong>Instructions:</strong> {selectedPrescription.instructions || 'N/A'}</p>
              <p><strong>Issued Date:</strong> {selectedPrescription.issuedDate}</p>
              <p><strong>Expiry Date:</strong> {selectedPrescription.expiryDate || 'N/A'}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedPrescription.status)}`}>{selectedPrescription.status}</span></p>
              <p><strong>Notes:</strong> {selectedPrescription.notes || 'N/A'}</p>
              <p><strong>Prescription ID:</strong> {selectedPrescription.id}</p>
              <p><strong>Created At:</strong> {selectedPrescription.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
      
    </motion.div>
  );
};