// StaffManager.tsx (Client Component)

"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircleIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon,
  XMarkIcon, EyeIcon,
} from '@heroicons/react/24/solid';
import { StaffTable } from './StaffTable';

const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define the Staff interface based on the expected data from the backend
export interface Staff {
  id: string; // StaffProfile model's ID
  userId: string; // Corresponding User ID
  name: string; // From User model
  email: string; // From User model
  phone?: string; // From User model
  profilePicture?: string; // From User model
  jobTitle: string; // From StaffProfile
  department: string; // From StaffProfile
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED'; // Matches Prisma enum
  startDate?: string; // Formatted date string (YYYY-MM-DD)
  createdAt: string; // Formatted date string
}

// Interface for props passed from the Server Component
interface StaffManagerProps {
  initialStaff: Staff[];
  companyId: string;
}

// Animation variants (kept the same)
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

// Utility function for status color (can be in a utils file)
const getStatusColor = (status: Staff['employmentStatus']) => {
  switch (status) {
    case 'ACTIVE': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'ON_LEAVE': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
    case 'TERMINATED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
  }
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

export const StaffManagerClient: React.FC<StaffManagerProps> = ({ initialStaff, companyId }) => {
  // Initialize state with data from the Server Component
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Staff['employmentStatus']>('All');
  const [loading, setLoading] = useState(false); // Only subsequent searches/CRUD will set this
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // ... (newStaffData, editStaffData state and handlers remain mostly the same)
    const [newStaffData, setNewStaffData] = useState({
      name: '',
      email: '',
      phone: '',
      profilePicture: '',
      jobTitle: '',
      department: '',
      employmentStatus: 'ACTIVE' as Staff['employmentStatus'],
      startDate: '', // YYYY-MM-DD
    });
    
  const [editStaffData, setEditStaffData] = useState<Partial<Staff>>({});

  // --- CRUD/Fetching Logic (Client-side for subsequent interactions) ---

  const fetchStaff = async () => {
    // This function now handles *re-fetching* after initial load, or for search/filter changes.
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      // NOTE: In a real app, you might want to debounce the search term.
      const response = await fetch(
        `${apiBaseUrl}/admin/staff?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch staff members');
      }
      const data: Staff[] = (await response.json()).data;

      if (Array.isArray(data) && data.length > 0) {
        setStaff(data);
      } else {
        setStaff([
          {id: '', userId: '', name: 'No staff found', email: '', jobTitle: '', department: '', employmentStatus: 'ACTIVE', createdAt: ''},
        ]); // Fallback to empty array if data is not an array
      }
    } catch (e: any) {
      console.error("Error fetching staff:", e);
      setError(e.message || "Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };//, [companyId, searchTerm, filterStatus]); // Dependencies trigger re-fetch

  // Re-fetch when search term or filter status changes (excluding initial load)
  // useEffect(() => {
  //     // Small optimization: skip fetch if component just mounted and search/filter is default.
  //     if (staff.length === 0 && initialStaff.length > 0 && searchTerm === '' && filterStatus === 'All') return; 
      
  //     const handler = setTimeout(() => {
  //         fetchStaff();
  //     }, 300); // Debounce search
      
  //     return () => clearTimeout(handler);
      
  // }, [searchTerm, filterStatus]); // Removed fetchStaff from deps to avoid infinite loop due to its own definition changes


  // Handlers for modal interactions
  const handleAddStaffClick = () => {
    setNewStaffData({
      name: '', email: '', phone: '', profilePicture: '',
      jobTitle: '', department: '', employmentStatus: 'ACTIVE', startDate: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    // Format startDate for input type="date"
    const formattedStartDate = staffMember.startDate && staffMember.startDate !== 'N/A'
      ? new Date(staffMember.startDate).toISOString().split('T')[0]
      : '';
    setEditStaffData({ ...staffMember, startDate: formattedStartDate });
    setIsEditModalOpen(true);
  };

  const handleDelete = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsDeleteConfirmOpen(true);
  };

  const handleView = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setIsViewModalOpen(true);
  };

  // CRUD operations via API
  const addNewStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/staff`, {
        method: 'POST',        
        headers: { 
          'Content-Type': 'application/json', 
          credentials: 'include', 
        },
        body: JSON.stringify({ ...newStaffData, companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add staff member');
      }

      setIsAddModalOpen(false);
      fetchStaff(); // Refresh list
    } catch (e: any) {
      console.error("Error adding staff member:", e);
      setError(e.message || "Failed to add new staff member.");
    } finally {
      setLoading(false);
    }
  };

  const updateStaff = async () => {
    if (!selectedStaff) {
      setError("No staff member selected for update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          credentials: 'include', 
        },
        body: JSON.stringify(editStaffData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update staff member');
      }

      setIsEditModalOpen(false);
      fetchStaff(); // Refresh list
    } catch (e: any) {
      console.error("Error updating staff member:", e);
      setError(e.message || "Failed to update staff member.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!selectedStaff) {
      setError("No staff member selected for deletion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/staff/${selectedStaff.id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json', 
          credentials: 'include', 
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete staff member');
      }

      setIsDeleteConfirmOpen(false);
      fetchStaff(); // Refresh list
    } catch (e: any) {
      console.error("Error deleting staff member:", e);
      setError(e.message || "Failed to delete staff member.");
    } finally {
      setLoading(false);
    }
  };

  // --- Render (Client-side UI) ---

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search Input */}
        <div className="relative flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search staff..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Status Filter */}
        <select
          className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'All' | Staff['employmentStatus'])}
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        
        {/* Add Staff Button (Interactivity) */}
        <button
          onClick={() => setIsAddModalOpen(true)} // Simplified handler for brevity
          className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-bold shadow-md hover:from-orange-600 hover:to-red-700 transition-all duration-300"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Staff
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading staff members...</div>
      )}

      {error && (
        <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Staff Table Component */}
      {!loading && !error && (
        <StaffTable 
          staff={staff} 
          getStatusColor={getStatusColor}
          handleView={handleView}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
      
      {/* Modals (Add, Edit, Delete, View - logic remains mostly the same) */}
       {/* Add Staff Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Staff Member">
          <form onSubmit={(e) => { e.preventDefault(); addNewStaff(); }} className="space-y-4">
            <div>
              <label htmlFor="newName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="newName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.name}
                onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="newEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.email}
                onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (Optional)</label>
              <input
                type="tel"
                id="newPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.phone}
                onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="newProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.profilePicture}
                onChange={(e) => setNewStaffData({ ...newStaffData, profilePicture: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="newJobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
              <input
                type="text"
                id="newJobTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.jobTitle}
                onChange={(e) => setNewStaffData({ ...newStaffData, jobTitle: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newDepartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <input
                type="text"
                id="newDepartment"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.department}
                onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="newEmploymentStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Status</label>
              <select
                id="newEmploymentStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.employmentStatus}
                onChange={(e) => setNewStaffData({ ...newStaffData, employmentStatus: e.target.value as Staff['employmentStatus'] })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div>
              <label htmlFor="newStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date (Optional)</label>
              <input
                type="date"
                id="newStartDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newStaffData.startDate}
                onChange={(e) => setNewStaffData({ ...newStaffData, startDate: e.target.value })}
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
                className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              >
                Add Staff
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Staff: ${selectedStaff?.name || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updateStaff(); }} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="editName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.name || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                id="editEmail"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.email || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (Optional)</label>
              <input
                type="tel"
                id="editPhone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.phone || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, phone: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL (Optional)</label>
              <input
                type="url"
                id="editProfilePicture"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.profilePicture || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, profilePicture: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="editJobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
              <input
                type="text"
                id="editJobTitle"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.jobTitle || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, jobTitle: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <input
                type="text"
                id="editDepartment"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.department || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, department: e.target.value })}
                required
              />
            </div>
            <div>
              <label htmlFor="editEmploymentStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employment Status</label>
              <select
                id="editEmploymentStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.employmentStatus || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, employmentStatus: e.target.value as Staff['employmentStatus'] })}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>
            <div>
              <label htmlFor="editStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date (Optional)</label>
              <input
                type="date"
                id="editStartDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editStaffData.startDate || ''}
                onChange={(e) => setEditStaffData({ ...editStaffData, startDate: e.target.value })}
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
            Are you sure you want to delete staff member <span className="font-bold">{selectedStaff?.name}</span> (ID: {selectedStaff?.id})? This action cannot be undone.
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
              onClick={confirmDeleteStaff}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Staff Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Staff Details: ${selectedStaff?.name || ''}`}>
          {selectedStaff && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="flex items-center space-x-4">
                <img
                  className="h-20 w-20 rounded-full object-cover"
                  src={selectedStaff.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${selectedStaff.name ? selectedStaff.name.charAt(0) : '?'}${selectedStaff.name ? selectedStaff.name.charAt(1) : ''}`}
                  alt={selectedStaff.name}
                  onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${selectedStaff.name ? selectedStaff.name.charAt(0) : '?'}${selectedStaff.name ? selectedStaff.name.charAt(1) : ''}`; }}
                />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedStaff.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedStaff.id}</p>
                </div>
              </div>
              <p><strong>Email:</strong> {selectedStaff.email}</p>
              <p><strong>Phone:</strong> {selectedStaff.phone || 'N/A'}</p>
              <p><strong>Job Title:</strong> {selectedStaff.jobTitle}</p>
              <p><strong>Department:</strong> {selectedStaff.department}</p>
              <p><strong>Employment Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedStaff.employmentStatus)}`}>{selectedStaff.employmentStatus}</span></p>
              <p><strong>Start Date:</strong> {selectedStaff.startDate || 'N/A'}</p>
              <p><strong>Account Created:</strong> {selectedStaff.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </motion.div>
  );
};