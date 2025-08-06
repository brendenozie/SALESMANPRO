// components/ClientModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Define the ClientData interface to match the expected API response
interface ClientData {
  id?: string; // Optional for new clients
  userId?: string; // Optional for new clients
  name: string | null;
  email: string;
  phone: string | null;
  membershipType: string;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING';
  joinDate?: string; // Optional for new clients (set by backend)
  lastActive?: string; // Optional for new clients (set by backend)
  photoUrl: string | null;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: ClientData) => void;
  client?: ClientData | null; // Client data for editing, null for adding
  adminSlug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const MEMBERSHIP_TYPES = ['Premium', 'Standard', 'Trial', 'VIP']; // Example types
const CLIENT_STATUSES = ['ACTIVE', 'EXPIRED', 'FROZEN', 'PENDING'];

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave, client, adminSlug }) => {
  const [name, setName] = useState(client?.name || '');
  const [email, setEmail] = useState(client?.email || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [membershipType, setMembershipType] = useState(client?.membershipType || 'Standard');
  const [membershipStatus, setMembershipStatus] = useState<'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING'>(client?.membershipStatus || 'PENDING');
  const [photoUrl, setPhotoUrl] = useState(client?.photoUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setMembershipType(client.membershipType || 'Standard');
      setMembershipStatus(client.membershipStatus || 'PENDING');
      setPhotoUrl(client.photoUrl || '');
      setPassword(''); // Clear password field on edit
      setConfirmPassword('');
    } else {
      // Reset form for new client
      setName('');
      setEmail('');
      setPhone('');
      setMembershipType('Standard');
      setMembershipStatus('PENDING');
      setPhotoUrl('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!name || !email || !membershipType || !membershipStatus) {
      setError('Name, email, membership type, and status are required.');
      setLoading(false);
      return;
    }

    if (!client && (!password || password.length < 8)) {
      setError('Password is required and must be at least 8 characters for new clients.');
      setLoading(false);
      return;
    }
    if (!client && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const method = client ? 'PUT' : 'POST';
    const url = client ? `/api/admin/${adminSlug}/clients/${client.id}` : `/api/admin/${adminSlug}/clients`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          membershipType,
          membershipStatus,
          photoUrl: photoUrl || null,
          password: !client ? password : undefined, // Only send password for new clients
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${client ? 'update' : 'create'} client.`);
      }

      const savedClient: ClientData = await response.json();
      onSave(savedClient); // Pass the saved client data back to the parent
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
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
          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative text-gray-900"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={!!client} // Disable email edit for existing clients
              />
              {client && <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly here for existing clients.</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
              <input
                type="text"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {!client && ( // Password fields only for new clients
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required={!client}
                    minLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required={!client}
                    minLength={8}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
              <select
                id="membershipType"
                value={membershipType}
                onChange={(e) => setMembershipType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {MEMBERSHIP_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="membershipStatus" className="block text-sm font-medium text-gray-700 mb-1">Membership Status</label>
              <select
                id="membershipStatus"
                value={membershipStatus}
                onChange={(e) => setMembershipStatus(e.target.value as 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'PENDING')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {CLIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-1">Photo URL (Optional)</label>
              <input
                type="url"
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {photoUrl && (
                <div className="mt-2 text-center">
                  <Image src={photoUrl} alt="Preview" width={80} height={80} objectFit="cover" className="rounded-full" loader={customLoader} />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  client ? 'Save Changes' : 'Add Client'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientModal;
