// components/DonorForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define types for Donor, User, and Company based on your Prisma schema
// You might need to adjust these imports based on your project structure
// For example, if you generate types from Prisma:
// import { Donor, User, Company } from '@prisma/client';

// Placeholder types if you don't have Prisma client types directly available here
interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Company {
  id: string;
  name: string;
}

interface Donor {
  id: string;
  userId: string;
  phoneNumber: string | null;
  companyId: string | null;
  user?: User; // Optional, as it might be included or not
  company?: Company; // Optional
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the data structure for form submission
interface DonorFormData {
  userId: string;
  phoneNumber: string | null;
  companyId: string | null;
}

// Props for the DonorForm component
interface DonorFormProps {
  initialData?: Donor; // Optional: Donor object for editing existing donor
  onSubmit: (data: DonorFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
  users: User[]; // List of available users to link
  companies: Company[]; // List of available companies to link
}

const DonorForm: React.FC<DonorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  users,
  companies,
}) => {
  const [userId, setUserId] = useState<string>(initialData?.userId || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(initialData?.phoneNumber || '');
  const [companyId, setCompanyId] = useState<string>(initialData?.companyId || '');
  const [formError, setFormError] = useState<string | null>(null);

  // Validation state for specific fields
  const [userError, setUserError] = useState<string | null>(null);

  // Determine if we are in edit mode
  const isEditMode = !!initialData;
  const formTitle = isEditMode ? 'Edit Donor Profile' : 'Create New Donor Profile';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Create Donor';

  // Populate form fields if in edit mode
  useEffect(() => {
    if (initialData) {
      setUserId(initialData.userId);
      setPhoneNumber(initialData.phoneNumber || '');
      setCompanyId(initialData.companyId || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setUserError(null);

    let hasError = false;

    if (!userId) {
      setUserError('Please select a user to link this donor profile to.');
      hasError = true;
    }

    if (hasError) {
      setFormError('Please correct the highlighted fields.');
      return;
    }

    onSubmit({
      userId,
      phoneNumber: phoneNumber || null,
      companyId: companyId || null,
    });
  };

  // Common Tailwind classes for inputs and labels
  const baseInputClasses = "mt-1 block w-full p-3 border rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 shadow-sm";
  const validInputClasses = "border-gray-700 focus:ring-teal-500 focus:border-teal-500";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const labelClasses = "block text-sm font-semibold text-gray-300 mb-1";
  const optionalLabelClasses = "text-gray-400 font-normal ml-2 text-xs"; // For optional field labels

  // Dynamic class for user select based on validation
  const getUserSelectClasses = () => `${baseInputClasses} ${userError ? errorInputClasses : validInputClasses}`;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8 p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-3xl font-extrabold text-white text-center mb-8 tracking-tight">
        {formTitle}
      </h2>

      <AnimatePresence>
        {formError && (
          <motion.div
            className="bg-red-900 bg-opacity-40 border border-red-700 text-red-300 text-sm p-4 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {formError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Selection (Required) */}
      <div>
        <label htmlFor="userId" className={labelClasses}>
          Linked User <span className="text-red-500">*</span>
        </label>
        <select
          id="userId"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setUserError(null); // Clear error on change
          }}
          className={getUserSelectClasses()}
          required
          disabled={isEditMode} // Prevent changing linked user in edit mode
        >
          <option value="" disabled>Select a user to link</option>
          {users.length > 0 ? (
            users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name || 'No Name'} ({user.email})
              </option>
            ))
          ) : (
            <option value="" disabled>No users available</option>
          )}
        </select>
        {isEditMode && (
          <p className="mt-1 text-teal-400 text-xs">
            User cannot be changed after creation.
          </p>
        )}
        {userError && <p className="mt-1 text-red-400 text-xs">{userError}</p>}
      </div>

      {/* Phone Number (Optional) */}
      <div>
        <label htmlFor="phoneNumber" className={labelClasses}>
          Phone Number <span className={optionalLabelClasses}>(Optional)</span>
        </label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={baseInputClasses + ' ' + validInputClasses}
          placeholder="e.g., +254712345678"
        />
        <p className="mt-1 text-gray-500 text-xs">Contact number for the donor.</p>
      </div>

      {/* Company (Optional) */}
      <div>
        <label htmlFor="companyId" className={labelClasses}>
          Company <span className={optionalLabelClasses}>(Optional)</span>
        </label>
        <select
          id="companyId"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className={baseInputClasses + ' ' + validInputClasses}
        >
          <option value="">None (Individual Donor)</option>
          {companies.length > 0 ? (
            companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No companies available</option>
          )}
        </select>
        <p className="mt-1 text-gray-500 text-xs">Associate donor with a company.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 bg-gray-700 text-gray-200 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 ease-in-out font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-in-out font-bold flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {submitButtonText}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
};

export default DonorForm;