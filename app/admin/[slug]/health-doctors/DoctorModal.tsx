"use client";

import { XMarkIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";

function DoctorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  // 1. Define the Backdrop and Modal Animation Variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalVariants = {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // 2. Backdrop with Animation
          className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-[1050] p-0 sm:p-4 overflow-hidden"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose} // Allows clicking outside to close
        >
          <motion.div
            // 3. Modal Container with Responsive Styling and Animation
            className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-indigo-500/30 w-full max-w-lg p-6 relative
                       // Mobile-first: Full width, height auto, stuck to the bottom
                       h-auto max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* --- Header & Close Button --- */}
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                🚀 Welcome New Clinician!
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
            <form className="space-y-5">
              
              {/* Name Field with modern focus ring */}
              <div className="flex flex-col">
                <label htmlFor="doctor-name" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Doctor's Full Name
                </label>
                <input 
                  id="doctor-name"
                  type="text" 
                  placeholder="e.g., Dr. Evelyn Reed"
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150" 
                />
              </div>

              {/* Specialty Field with icon-like label */}
              <div className="flex flex-col">
                <label htmlFor="doctor-specialty" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  🩺 Specialty / Department
                </label>
                <input 
                  id="doctor-specialty"
                  type="text" 
                  placeholder="e.g., Cardiology, Pediatrics"
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150"
                />
              </div>

              {/* Email and Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col">
                  <label htmlFor="doctor-email" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    ✉️ Email Address
                  </label>
                  <input 
                    id="doctor-email"
                    type="email" 
                    placeholder="email@clinic.com"
                    className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                               shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150" 
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="doctor-phone" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    📞 Phone Number
                  </label>
                  <input 
                    id="doctor-phone"
                    type="tel" 
                    placeholder="(555) 123-4567"
                    className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                               shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150"
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="doctor-status" className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Current Status
                </label>
                <select 
                  id="doctor-status"
                  className="p-3 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white 
                             shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition duration-150 appearance-none cursor-pointer"
                >
                  <option value="ACTIVE" className="bg-white dark:bg-gray-800 text-green-600">🟢 Active</option>
                  <option value="ON_LEAVE" className="bg-white dark:bg-gray-800 text-yellow-600">🟡 On Leave</option>
                  <option value="INACTIVE" className="bg-white dark:bg-gray-800 text-red-600">🔴 Inactive</option>
                </select>
              </div>

              {/* --- Action Buttons --- */}
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full 
                             hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 shadow-md"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-200 shadow-lg shadow-indigo-500/40"
                >
                  ➕ Register Doctor
                </button>
              </div>
            </form>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DoctorModal;