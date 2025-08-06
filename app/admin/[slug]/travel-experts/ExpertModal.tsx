// components/ExpertModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

// Define the ExpertData interface to match the expected API response
interface ExpertData {
  id?: string; // Optional for new experts
  userId?: string; // Optional for new experts
  name: string | null;
  email: string;
  phone: string | null;
  specialty: string;
  experienceYears: number;
  travelsCompleted: number;
  photoUrl: string | null;
  bio: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

interface ExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expert: ExpertData) => void;
  expert?: ExpertData | null; // Expert data for editing, null for adding
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const EXPERT_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING'];

const ExpertModal: React.FC<ExpertModalProps> = ({ isOpen, onClose, onSave, expert, slug }) => {
  const [name, setName] = useState(expert?.name || '');
  const [email, setEmail] = useState(expert?.email || '');
  const [phone, setPhone] = useState(expert?.phone || '');
  const [specialty, setSpecialty] = useState(expert?.specialty || '');
  const [experienceYears, setExperienceYears] = useState(expert?.experienceYears || 0);
  const [travelsCompleted, setTravelsCompleted] = useState(expert?.travelsCompleted || 0);
  const [photoUrl, setPhotoUrl] = useState(expert?.photoUrl || '');
  const [bio, setBio] = useState(expert?.bio || '');
  const [contactEmail, setContactEmail] = useState(expert?.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(expert?.contactPhone || '');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'PENDING'>(expert?.status || 'ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expert) {
      setName(expert.name || '');
      setEmail(expert.email || '');
      setPhone(expert.phone || '');
      setSpecialty(expert.specialty || '');
      setExperienceYears(expert.experienceYears || 0);
      setTravelsCompleted(expert.travelsCompleted || 0);
      setPhotoUrl(expert.photoUrl || '');
      setBio(expert.bio || '');
      setContactEmail(expert.contactEmail || '');
      setContactPhone(expert.contactPhone || '');
      setStatus(expert.status || 'ACTIVE');
      setPassword(''); // Clear password field on edit
      setConfirmPassword('');
    } else {
      // Reset form for new expert
      setName('');
      setEmail('');
      setPhone('');
      setSpecialty('');
      setExperienceYears(0);
      setTravelsCompleted(0);
      setPhotoUrl('');
      setBio('');
      setContactEmail('');
      setContactPhone('');
      setStatus('ACTIVE');
      setPassword('');
      setConfirmPassword('');
    }
  }, [expert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (!name || !email || !specialty || experienceYears === undefined || travelsCompleted === undefined) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!expert && (!password || password.length < 8)) {
      setError('Password is required and must be at least 8 characters for new experts.');
      setLoading(false);
      return;
    }
    if (!expert && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const method = expert ? 'PUT' : 'POST';
    const url = expert ? `/api/admin/experts/${expert.id}` : `/api/admin/experts?companyId=${slug}`;

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
          specialty,
          experienceYears: Number(experienceYears),
          travelsCompleted: Number(travelsCompleted),
          photoUrl: photoUrl || null,
          bio: bio || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
          status,
          password: !expert ? password : undefined, // Only send password for new experts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${expert ? 'update' : 'create'} expert.`);
      }

      const savedExpert: ExpertData = await response.json();
      onSave(savedExpert); // Pass the saved expert data back to the parent
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
            {expert ? 'Edit Expert' : 'Add New Expert'}
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
                disabled={!!expert} // Disable email edit for existing experts (or handle carefully)
              />
              {expert && <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly here for existing experts.</p>}
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

            {!expert && ( // Password fields only for new experts
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    required={!expert}
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
                    required={!expert}
                    minLength={8}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
              <input
                type="text"
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                id="experienceYears"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min="0"
              />
            </div>
            <div>
              <label htmlFor="travelsCompleted" className="block text-sm font-medium text-gray-700 mb-1">Travels Completed</label>
              <input
                type="number"
                id="travelsCompleted"
                value={travelsCompleted}
                onChange={(e) => setTravelsCompleted(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
                min="0"
              />
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
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email (Optional)</label>
              <input
                type="email"
                id="contactEmail"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone (Optional)</label>
              <input
                type="text"
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'PENDING')}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {EXPERT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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
                  expert ? 'Save Changes' : 'Add Expert'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExpertModal;
