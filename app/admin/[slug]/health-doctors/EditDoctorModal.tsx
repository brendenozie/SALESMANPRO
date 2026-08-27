"use client";

import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React, { useState, useEffect } from 'react';

// Define a placeholder type for the Doctor data structure
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  profilePicture?: string;
}

// Default placeholder data for demonstration
const MOCK_DOCTOR: Doctor = {
  id: "d123",
  name: "Dr. Evelyn Reed",
  specialty: "Cardiology",
  email: "evelyn.reed@clinic.com",
  phone: "(555) 123-4567",
  status: 'ACTIVE',
  profilePicture: "https://placehold.co/150x150/4f46e5/ffffff?text=ER", // Placeholder for initial avatar
};

// --- EditDoctorModal Component ---

interface EditDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // In a real app, you would pass the doctor object and the save handler
  doctorToEdit: Doctor | null;
  onSave: (editedData: Doctor) => void; 
}

function EditDoctorModal({ isOpen, onClose, doctorToEdit, onSave }: EditDoctorModalProps) {
  
  // State to hold the data currently being edited (initialized with the doctorToEdit data)
  const [editedData, setEditedData] = useState<Doctor | null>(doctorToEdit);
  const [isSaving, setIsSaving] = useState(false);

  // Sync internal state when a new doctorToEdit is passed or the modal is opened
  useEffect(() => {
    if (isOpen) {
      setEditedData(doctorToEdit);
    }
  }, [doctorToEdit, isOpen]);


  // 1. Define the Backdrop and Modal Animation Variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants: Variants = {
    hidden: {
      y: "100%", // Start off-screen (bottom-sheet effect for mobile)
      opacity: 0,
      scale: 0.85, // Slightly smaller for desktop
    },
    visible: {
      y: "0%", // Slide up for mobile
      opacity: 1,
      scale: 1, // Full size for desktop
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 200,
        when: "beforeChildren", // Ensures container is visible before content
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
  };
  
  // Generic handler for input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditedData(prev => ({
      ...prev,
      [e.target.id.replace('edit-', '')]: e.target.value
    }) as Doctor);
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
        if (editedData) {
        onSave(editedData);

        setIsSaving(false);
        onClose();
      }
    }, 800);
  };
  
  // Only for demonstration purposes, use MOCK_DOCTOR if the prop is missing
  const currentDoctor = doctorToEdit || MOCK_DOCTOR;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        // 2. Backdrop with Animation and Click Handler
        className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1050] p-0 sm:p-4 overflow-hidden"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose} // Allows clicking outside to close
      >
        <motion.div
          // 3. Modal Container with Increased Width for Edit Form
          className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-indigo-500/30 w-full max-w-lg sm:max-w-3xl p-6 relative
                     h-auto max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent closing when clicking inside
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* --- Header & Close Button (Sticky for long content) --- */}
          <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h2 id="modal-title" className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center space-x-2">
              <PencilSquareIcon className="w-6 h-6" />
              <span>Edit Clinician Profile</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mt-1 -mr-1 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition duration-200"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* --- Form Content --- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Visual Header/Image Preview */}
            <div className="flex items-center space-x-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                <img
                    src={editedData?.profilePicture || "https://placehold.co/150x150/4f46e5/ffffff?text=NA"}
                    alt={`${currentDoctor.name}'s profile`}
                    className="w-16 h-16 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-700 shadow-lg"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/150x150/4f46e5/ffffff?text=NA"; }}
                />
                <div className="flex flex-col">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentDoctor.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Profile ID: {currentDoctor.id}
                    </p>
                </div>
            </div>

            {/* Name and Specialty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label htmlFor="edit-name" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Doctor's Full Name
                </label>
                <input 
                  id="edit-name"
                  type="text" 
                  placeholder="e.g., Dr. Evelyn Reed"
                  value={editedData?.name}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150" 
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="edit-specialty" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  🩺 Specialty / Department
                </label>
                <input 
                  id="edit-specialty"
                  type="text" 
                  placeholder="e.g., Cardiology, Pediatrics"
                  value={editedData?.specialty}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150"
                  required
                />
              </div>
            </div>

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label htmlFor="edit-email" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  ✉️ Email Address
                </label>
                <input 
                  id="edit-email"
                  type="email" 
                  placeholder="email@clinic.com"
                  value={editedData?.email}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150" 
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="edit-phone" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  📞 Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input 
                  id="edit-phone"
                  type="tel" 
                  placeholder="(555) 123-4567"
                  value={editedData?.phone}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150"
                />
              </div>
            </div>
            
            {/* Picture URL and Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col">
                <label htmlFor="edit-profilePicture" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  🖼️ Profile Picture URL <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input 
                  id="edit-profilePicture"
                  type="url" 
                  placeholder="Paste image link here"
                  value={editedData?.profilePicture}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150"
                />
              </div>
              
              {/* Status Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="edit-status" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Current Status
                </label>
                <select 
                  id="edit-status"
                  value={editedData?.status}
                  onChange={handleChange}
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150 appearance-none cursor-pointer"
                  required
                >
                  <option value="ACTIVE" className="bg-white dark:bg-gray-800 text-green-600">🟢 Active</option>
                  <option value="ON_LEAVE" className="bg-white dark:bg-gray-800 text-yellow-600">🟡 On Leave</option>
                  <option value="INACTIVE" className="bg-white dark:bg-gray-800 text-red-600">🔴 Inactive</option>
                </select>
              </div>
            </div>

            {/* --- Action Buttons (Footer) --- */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700 -mx-6 px-6 -mb-6 pb-6 bg-white dark:bg-gray-900 sticky bottom-0 sm:static">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full 
                           hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 shadow-md"
                disabled={isSaving}
              >
                Discard
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200 shadow-lg shadow-blue-500/40 disabled:bg-gray-400 disabled:shadow-none"
                disabled={isSaving}
              >
                {isSaving ? (
                    <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    "💾 Save Changes"
                )}
              </button>
            </div>
          </form>
          
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Export the component and the mock data for testing
export { EditDoctorModal, MOCK_DOCTOR };
