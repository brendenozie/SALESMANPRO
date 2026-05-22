"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  BellAlertIcon, EnvelopeIcon, PhoneIcon, PlusCircleIcon, UserCircleIcon, PencilIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import TrainerModal, { TrainerData } from './TrainerModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const TrainerCard = ({ 
  trainer, 
  onEdit, 
  onDelete 
}: { 
  trainer: TrainerData; 
  onEdit: (trainer: TrainerData) => void; 
  onDelete: (trainer: TrainerData) => void; 
}) => {
  const statusStyles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    ON_LEAVE: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    INACTIVE: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  };

  return (
    <motion.div
      layout
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900"
      whileHover={{ y: -4 }}
    >
      <div>
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-full border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
            {trainer.photoUrl ? (
              <Image
                src={trainer.photoUrl}
                alt={trainer.name || 'Trainer'}
                fill
                sizes="64px"
                loader={loader}
                className="rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-full w-full text-slate-400 dark:text-slate-600" />
            )}
          </div>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${statusStyles[trainer.status]}`}>
            {trainer.status.replace('_', ' ')}
          </span>
        </div>

        {/* Identity & Bio */}
        <div className="mb-4">
          <h4 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {trainer.name}
          </h4>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {trainer.specialty}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-3 dark:text-slate-400">
            {trainer.bio || "No biography provided yet."}
          </p>
        </div>

        {/* Technical Attributes */}
        <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800/60">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <EnvelopeIcon className="h-4 w-4 text-slate-400" />
            <span className="truncate">{trainer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <PhoneIcon className="h-4 w-4 text-slate-400" />
            <span>{trainer.phone || 'No phone record'}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
            <BellAlertIcon className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
            <p className="line-clamp-2">
              <span className="font-medium text-slate-800 dark:text-slate-200">Certifications:</span>{' '}
              {trainer.certifications.length > 0 ? trainer.certifications.join(', ') : 'None listed'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/60">
        <button
          onClick={() => onEdit(trainer)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/60"
        >
          <PencilIcon className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(trainer)}
          className="flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-600 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          aria-label="Delete Trainer"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default function TrainersPage() {
  const { slug } = useParams();
  const [trainers, setTrainers] = useState<TrainerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<TrainerData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState<TrainerData | null>(null);

  const fetchTrainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/trainers?companyId=${slug}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Error status code: ${response.status}`);
      const data: TrainerData[] = (await response.json()).data || [];
      setTrainers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const openAddModal = () => { setCurrentTrainer(null); setIsTrainerModalOpen(true); };
  const openEditModal = (trainer: TrainerData) => { setCurrentTrainer(trainer); setIsTrainerModalOpen(true); };

  const handleSaveTrainer = (savedTrainer: TrainerData) => {
    if (currentTrainer) {
      setTrainers(prev => prev.map(t => t.id === savedTrainer.id ? savedTrainer : t));
      toast.success(`Profile updated.`);
    } else {
      setTrainers(prev => [savedTrainer, ...prev]);
      toast.success(`Trainer successfully onboarded.`);
    }
    setIsTrainerModalOpen(false);
  };

  const handleDeleteTrainerClick = (trainer: TrainerData) => {
    setTrainerToDelete(trainer);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteTrainer = async () => {
    if (!trainerToDelete) return;
    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Removing record...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/trainers/${trainerToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Could not drop data endpoint entry.");
      setTrainers(prev => prev.filter(t => t.id !== trainerToDelete.id));
      toast.success(`Data purged successfully.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setTrainerToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Profile Dashboard Overview */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Fitness Roster</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage system access permissions, visual showcase details, and specialist credentials.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add New Trainer
          </button>
        </div>

        {/* Content Board */}
        <main className="mt-8">
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/10 dark:bg-rose-500/5">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-400">Failed loading records: {error}</p>
            </div>
          )}

          {!loading && !error && trainers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-800">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No instructors found on the roster.</p>
            </div>
          )}

          {!loading && !error && trainers.length > 0 && (
            <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {trainers.map((trainer) => (
                  <TrainerCard
                    key={trainer.id}
                    trainer={trainer}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTrainerClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      <TrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => setIsTrainerModalOpen(false)}
        onSave={handleSaveTrainer}
        trainer={currentTrainer}
        slug={slug?.toString() || ''}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteTrainer}
        title="Confirm Deletion"
        message={`Are you sure you want to delete trainer "${trainerToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}