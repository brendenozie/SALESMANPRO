"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon, UserCircleIcon, EnvelopeIcon, PhoneIcon,
  BriefcaseIcon, ChatBubbleBottomCenterTextIcon, AcademicCapIcon,
  PhotoIcon, SparklesIcon, LockClosedIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface TrainerData {
  id?: string;
  userId?: string;
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
  trainer?: TrainerData | null;
  slug: string;
}

const customLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;
const TRAINER_STATUSES = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'];

const TrainerModal: React.FC<TrainerModalProps> = ({ isOpen, onClose, onSave, trainer, slug }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [certificationsInput, setCertificationsInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(trainer?.name || '');
      setEmail(trainer?.email || '');
      setPhone(trainer?.phone || '');
      setSpecialty(trainer?.specialty || '');
      setBio(trainer?.bio || '');
      setCertificationsInput(trainer?.certifications.join(', ') || '');
      setPhotoUrl(trainer?.photoUrl || '');
      setStatus(trainer?.status || 'ACTIVE');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, trainer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !specialty) {
      toast.error('Please complete all required baseline text parameters.');
      setLoading(false);
      return;
    }

    if (!trainer && (password.length < 8 || password !== confirmPassword)) {
      toast.error('Please confirm passwords match and contain 8+ characters.');
      setLoading(false);
      return;
    }

    const certificationsArray = certificationsInput.split(',').map(c => c.trim()).filter(Boolean);
    const method = trainer ? 'PUT' : 'POST';
    const url = trainer ? `${apiBaseUrl}/admin/trainers/${trainer.id}` : `${apiBaseUrl}/admin/trainers?companyId=${slug}`;
    const toastId = toast.loading('Syncing data properties...');

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify({
          name, email, phone: phone || null, specialty, bio: bio || null,
          certifications: certificationsArray, photoUrl: photoUrl || null, status,
          password: !trainer ? password : undefined,
        }),
      });

      if (!response.ok) throw new Error('Endpoint configuration transmission failure.');
      const savedTrainer: TrainerData = await response.json();
      onSave(savedTrainer);
      onClose();
      toast.success('Roster modifications saved.', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop Mask */}
        <motion.div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Sheet container */}
        <motion.div
          className="relative z-10 flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {trainer ? 'Edit Trainer Profile' : 'Onboard Instructor'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure catalog information details.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!trainer} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400" placeholder="jane@domain.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Phone String</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Core Specialty</label>
                <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="Cardio / Strength" />
              </div>
            </div>

            {!trainer && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Access Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="••••••••" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verify Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="••••••••" />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Biography</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="Brief statement detailing baseline professional history metrics..." />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Certifications (Comma separated)</label>
              <input type="text" value={certificationsInput} onChange={e => setCertificationsInput(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="NASM, CrossFit L2, ACE" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">External Photo URL</label>
              <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="https://images.unsplash.com/photo..." />
              {photoUrl && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border bg-white dark:border-slate-700">
                    <Image src={photoUrl} alt="Avatar Preview" fill sizes="48px" loader={customLoader} className="object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100?text=Error'; }} />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{photoUrl}</span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Roster Status</label>
              <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {TRAINER_STATUSES.map((s) => (
                  <button
                    key={s} type="button" onClick={() => setStatus(s as any)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase tracking-wider transition ${status === s ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Sticky Actions Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {loading ? 'Processing...' : trainer ? 'Save Changes' : 'Add Trainer'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrainerModal;