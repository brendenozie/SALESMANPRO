"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon, CheckCircleIcon, LockClosedIcon
} from '@heroicons/react/24/solid'; // Added more specific icons
import toast from 'react-hot-toast'; // Using react-hot-toast

// Define the UserData interface to match the expected output
interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  registered: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: UserData) => void;
  slug: string;
}

// Define the available roles and statuses based on your Prisma schema enums
const ROLES = [
  'USER', 'CONSUMER', 'AGENT', 'CLIENT', 'ADMIN', 'STUDENT', 'EDUCATOR',
  'HEADTEACHER', 'PARENT', 'JUNIOR', 'SENIOR', 'SOPHOMORE', 'FRESHMAN',
  'WRITER', 'STAFF', 'MODERATOR', 'PATIENT', 'DOCTOR', 'EXPERT'
];

const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated, slug }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('USER');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form fields when the modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPhone('');
      setRole('USER');
      setStatus('ACTIVE');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation with react-hot-toast
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Creating new user...');

    try {
      const response = await fetch(`/api/admin/travel-users?companyId=${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          role,
          status,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user.');
      }

      const newUser: UserData = await response.json();
      onUserCreated(newUser);
      toast.success(`User "${newUser.name}" created successfully! 🎉`, { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
      console.error("User creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative text-gray-900 max-h-[90vh] overflow-y-auto"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          <header className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Create New User
            </h2>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Fill in the details below to add a new user to your system.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-group">
              <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <UserIcon className="w-5 h-5 mr-2 text-indigo-500" /> Full Name
              </label>
              <input
                type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <EnvelopeIcon className="w-5 h-5 mr-2 text-indigo-500" /> Email
              </label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <PhoneIcon className="w-5 h-5 mr-2 text-indigo-500" /> Phone (Optional)
              </label>
              <input
                type="text" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <label htmlFor="role" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-indigo-500" /> Role
                </label>
                <select
                  id="role" value={role} onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="capitalize">{r.toLowerCase()}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-indigo-500" /> Status
                </label>
                <select
                  id="status" value={status} onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                  required
                >
                  {USER_STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <LockClosedIcon className="w-5 h-5 mr-2 text-indigo-500" /> Password
              </label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-700 mb-1">
                <LockClosedIcon className="w-5 h-5 mr-2 text-indigo-500" /> Confirm Password
              </label>
              <input
                type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required minLength={8}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <motion.button
                type="button" onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit" disabled={loading}
                className="px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: loading ? 1 : 1.05 }} whileTap={{ scale: loading ? 1 : 0.95 }}
              >
                {loading ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Create User'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateUserModal;