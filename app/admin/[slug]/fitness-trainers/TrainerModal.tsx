"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  PhotoIcon,
  SparklesIcon,
  LockClosedIcon, // Added for password fields
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast'; // Import react-hot-toast

// Define the TrainerData interface to match the expected API response
export interface TrainerData {
  id?: string; // Optional for new trainers
  userId?: string; // Optional for new trainers
  name: string | null;
  email: string;
  phone: string | null;
  specialty: string;
  bio: string | null;
  certifications: string[];
  photoUrl: string | null;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

interface TrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trainer: TrainerData) => void;
  trainer?: TrainerData | null; // Trainer data for editing, null for adding
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=75`; // Default quality to 75
};

const TRAINER_STATUSES = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'];

const TrainerModal: React.FC<TrainerModalProps> = ({ isOpen, onClose, onSave, trainer, slug }) => {
  const [name, setName] = useState(trainer?.name || '');
  const [email, setEmail] = useState(trainer?.email || '');
  const [phone, setPhone] = useState(trainer?.phone || '');
  const [specialty, setSpecialty] = useState(trainer?.specialty || '');
  const [bio, setBio] = useState(trainer?.bio || '');
  const [certificationsInput, setCertificationsInput] = useState(trainer?.certifications.join(', ') || '');
  const [photoUrl, setPhotoUrl] = useState(trainer?.photoUrl || '');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>(trainer?.status || 'ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { // Only reset when modal opens
      if (trainer) {
        setName(trainer.name || '');
        setEmail(trainer.email || '');
        setPhone(trainer.phone || '');
        setSpecialty(trainer.specialty || '');
        setBio(trainer.bio || '');
        setCertificationsInput(trainer.certifications.join(', '));
        setPhotoUrl(trainer.photoUrl || '');
        setStatus(trainer.status || 'ACTIVE');
        setPassword(''); // Clear password field on edit
        setConfirmPassword('');
      } else {
        // Reset form for new trainer
        setName('');
        setEmail('');
        setPhone('');
        setSpecialty('');
        setBio('');
        setCertificationsInput('');
        setPhotoUrl('');
        setStatus('ACTIVE');
        setPassword('');
        setConfirmPassword('');
      }
      setFormError(null); // Clear errors on open
    }
  }, [isOpen, trainer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const certificationsArray = certificationsInput.split(',').map(c => c.trim()).filter(c => c !== '');

    // Basic client-side validation
    if (!name || !email || !specialty) {
      setFormError('Name, email, and specialty are required.');
      setLoading(false);
      toast.error('Please fill in all required fields.');
      return;
    }

    if (!trainer && (!password || password.length < 8)) {
      setFormError('Password is required and must be at least 8 characters for new trainers.');
      setLoading(false);
      toast.error('Password is required and must be at least 8 characters for new trainers.');
      return;
    }
    if (!trainer && password !== confirmPassword) {
      setFormError('Passwords do not match.');
      setLoading(false);
      toast.error('Passwords do not match.');
      return;
    }

    const method = trainer ? 'PUT' : 'POST';
    const url = trainer ? `/api/admin/trainers/${trainer.id}` : `/api/admin/trainers?companyId=${slug}`;

    const toastId = toast.loading(`${trainer ? 'Updating' : 'Adding'} trainer...`);

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
          bio: bio || null,
          certifications: certificationsArray,
          photoUrl: photoUrl || null,
          status,
          password: !trainer ? password : undefined, // Only send password for new trainers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${trainer ? 'update' : 'create'} trainer.`);
      }

      const savedTrainer: TrainerData = await response.json();
      onSave(savedTrainer); // Pass the saved trainer data back to the parent
      onClose(); // Close the modal
      toast.success(`Trainer "${savedTrainer.name}" saved successfully!`, { id: toastId });
    } catch (err: any) {
      setFormError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Close modal when clicking outside
      >
        <motion.div
          className="bg-gray-800 text-gray-200 rounded-3xl shadow-2xl p-8 w-full max-w-2xl relative border border-gray-700 max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, y: -50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          onClick={(e:any) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <motion.button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <XMarkIcon className="w-8 h-8" />
          </motion.button>

          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-600 mb-4 text-center drop-shadow-md">
            {trainer ? 'Edit Trainer Profile' : 'Add New Trainer'}
          </h2>
          <p className="text-center text-gray-400 mb-8">
            {trainer ? 'Update the details for this fitness professional.' : 'Fill in the details to onboard a new trainer.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-teal-400" /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., Jane Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-teal-400" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
                  placeholder="e.g., jane.doe@example.com"
                  required
                  disabled={!!trainer} // Disable email edit for existing trainers
                />
                {trainer && <p className="text-xs text-gray-500 mt-1">Email cannot be changed for existing trainers.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <PhoneIcon className="w-5 h-5 mr-2 text-teal-400" /> Phone (Optional)
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., +1 (555) 123-4567"
                />
              </div>
              <div>
                <label htmlFor="specialty" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-teal-400" /> Specialty
                </label>
                <input
                  type="text"
                  id="specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                  placeholder="e.g., Strength Training"
                  required
                />
              </div>
            </div>

            {!trainer && ( // Password fields only for new trainers
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <LockClosedIcon className="w-5 h-5 mr-2 text-teal-400" /> Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                    required={!trainer}
                    minLength={8}
                    placeholder="Minimum 8 characters"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <LockClosedIcon className="w-5 h-5 mr-2 text-teal-400" /> Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                    required={!trainer}
                    minLength={8}
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="bio" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2 text-teal-400" /> Bio (Optional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                placeholder="A brief description of the trainer's background and philosophy."
              ></textarea>
            </div>

            <div>
              <label htmlFor="certifications" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <AcademicCapIcon className="w-5 h-5 mr-2 text-teal-400" /> Certifications (Comma-separated)
              </label>
              <input
                type="text"
                id="certifications"
                value={certificationsInput}
                onChange={(e) => setCertificationsInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                placeholder="e.g., NASM, ACE, CrossFit L1"
              />
            </div>

            <div>
              <label htmlFor="photoUrl" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <PhotoIcon className="w-5 h-5 mr-2 text-teal-400" /> Photo URL (Optional)
              </label>
              <input
                type="url"
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition-colors"
                placeholder="https://example.com/trainer_photo.jpg"
              />
              {photoUrl && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-2">Photo Preview:</p>
                  <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-indigo-500">
                    <Image
                      src={photoUrl}
                      alt="Trainer Photo Preview"
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-110"
                      loader={customLoader}
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/128x128/E0E7FF/4338CA?text=Photo+Error';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <SparklesIcon className="w-5 h-5 mr-2 text-teal-400" /> Status
              </label>
              <div className="flex bg-gray-700 rounded-xl p-1 border border-gray-600">
                {TRAINER_STATUSES.map((s) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s as 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE')}
                    className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === s ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {s.replace('_', ' ')}
                  </motion.button>
                ))}
              </div>
            </div>

            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/30 text-red-300 px-4 py-3 rounded-xl text-sm text-center border border-red-700"
              >
                {formError}
              </motion.div>
            )}

            <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  trainer ? 'Save Changes' : 'Add Trainer'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrainerModal;