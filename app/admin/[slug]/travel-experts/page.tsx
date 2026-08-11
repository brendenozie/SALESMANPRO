"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon, 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  BriefcaseIcon, 
  GlobeAltIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import ExpertModal, { ExpertData } from './ExpertModal';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
};

interface pageProps{
  params: Promise<{ slug: string }>;
}

export default async function AdminExpertsPage({ params }: pageProps) {
  const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<ExpertData | null>(null);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/experts?companyId=${companyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });
      if (!response.ok) throw new Error(`Error server response: status ${response.status}`);
      const data: ExpertData[] = (await response.json()).data.data;
      setExperts(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while loading experts.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const openAddModal = () => {
    setCurrentExpert(null);
    setIsExpertModalOpen(true);
  };

  const openEditModal = (expert: ExpertData) => {
    setCurrentExpert(expert);
    setIsExpertModalOpen(true);
  };

  const handleSaveExpert = (savedExpert: ExpertData) => {
    if (currentExpert) {
      setExperts(experts.map(e => e.id === savedExpert.id ? savedExpert : e));
    } else {
      setExperts([savedExpert, ...experts]);
    }
    setIsExpertModalOpen(false);
  };

  const handleDeleteExpertClick = (expert: ExpertData) => {
    setExpertToDelete(expert);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteExpert = async () => {
    if (!expertToDelete) return;
    setIsConfirmModalOpen(false);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/experts/${expertToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' }
      });
      if (!response.ok) {
        const errorData = (await response.json()).data;
        throw new Error(errorData.message || `Failed to completely remove profile.`);
      }
      setExperts(prev => prev.filter(e => e.id !== expertToDelete.id));
    } catch (err: any) {
      console.error("Deletion failure path:", err);
    } finally {
      setExpertToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 px-4 py-8 sm:p-8 md:p-12 selection:bg-indigo-500 selection:text-white">
      
      {/* Header Viewport */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white">
            Team Experts Hub
          </h1>
          <p className="text-sm mt-1 text-slate-500 dark:text-slate-400 font-medium">
            Manage, audit, and provision company expert assignment profiles.
          </p>
        </div>
        <motion.button
          onClick={openAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 group"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusCircleIcon className="h-5 w-5 text-indigo-200 group-hover:text-white transition-colors" />
          <span>Add Expert Profile</span>
        </motion.button>
      </header>

      {/* Main Framework Dashboard Panel */}
      <main className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* Loading Grid Skeleton */}
          {loading && (
            <motion.div 
              key="loading-skeleton"
              variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 p-6 rounded-3xl space-y-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                </div>
              ))}
            </motion.div>
          )}

          {/* Error Adaptive Feedback UI */}
          {error && (
            <motion.div
              key="error-state" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-xl mx-auto bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-3xl flex flex-col items-center text-center gap-3 shadow-xl"
            >
              <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400">
                <ExclamationTriangleIcon className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg text-rose-900 dark:text-rose-300">Data Fetching Aborted</h3>
              <p className="text-sm text-rose-700/80 dark:text-rose-400/80">{error}</p>
              <button onClick={fetchExperts} className="mt-2 text-xs font-semibold bg-rose-900 dark:bg-rose-500 text-white px-4 py-2 rounded-xl hover:opacity-90 transition">
                Retry Connection
              </button>
            </motion.div>
          )}

          {/* Empty Records State */}
          {!loading && !error && experts && experts.length === 0 && (
            <motion.div
              key="empty-state" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-20 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/50 rounded-3xl shadow-sm p-8"
            >
              <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4">
                <UserGroupIcon className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Expert Logs Verified</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm mt-1 mb-6">
                Your directory ecosystem is currently unpopulated. Provision system entries by creating profiles.
              </p>
              <button onClick={openAddModal} className="text-sm inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-medium transition">
                <span>Instantiate Directory</span>
              </button>
            </motion.div>
          )}

          {/* Active Populated View Matrix */}
          {!loading && !error && experts && experts.length > 0 && (
            <motion.div
              key="content-display" initial="hidden" animate="visible" variants={containerVariants}
              className="space-y-6"
            >
              {/* Responsive Matrix Grid view for Mobile & Tablets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {experts.map((expert) => (
                  <motion.div
                    key={expert.id} variants={cardVariants} layout
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Top Action Layer */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800">
                          <Image
                            src={expert.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo'}
                            alt={expert.name || 'Expert'}
                            layout="fill" objectFit="cover" loader={customLoader}
                          />
                        </div>
                        
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          expert.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                          expert.status === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                          'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                        }`}>
                          {expert.status}
                        </span>
                      </div>

                      {/* Profile Metadata */}
                      <h4 className="font-bold text-base text-slate-900 dark:text-white tracking-tight">{expert.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">{expert.email}</p>
                      
                      <div className="inline-block bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                        {expert.specialty}
                      </div>

                      {/* Key Value Metric Readouts */}
                      <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-100 dark:border-slate-800/80 py-3 mb-4 text-xs">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                          <span>{expert.experienceYears} Yrs Experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                          <span>{expert.travelsCompleted} Journeys</span>
                        </div>
                      </div>

                      {/* Secondary Contact Details */}
                      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 break-all">
                        {expert.contactEmail && (
                          <div className="flex items-center gap-2">
                            <EnvelopeIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{expert.contactEmail}</span>
                          </div>
                        )}
                        {expert.contactPhone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{expert.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Action Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                      <button
                        onClick={() => openEditModal(expert)}
                        className="p-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 rounded-xl transition-all"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpertClick(expert)}
                        className="p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/50 rounded-xl transition-all"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Large Desktop Tabular Structure */}
              <div className="hidden lg:block bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="px-6 py-4">Expert Profile</th>
                      <th className="px-6 py-4">Specialty Area</th>
                      <th className="px-6 py-4">Direct Channels</th>
                      <th className="px-6 py-4">Metrics Tracked</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                    {experts.map((expert) => (
                      <motion.tr
                        key={expert.id} variants={cardVariants} layout
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/60 transition-colors"
                      >
                        {/* Primary Image and Identification */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-inner">
                              <Image
                                src={expert.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo'}
                                alt={expert.name || 'Expert'}
                                layout="fill" objectFit="cover" loader={customLoader}
                                className="group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {expert.name}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-500">{expert.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Specialty Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-xs">
                            {expert.specialty}
                          </span>
                        </td>

                        {/* Secondary Channels Contact Card Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          {expert.contactEmail && (
                            <div className="flex items-center gap-1.5">
                              <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" />
                              <span>{expert.contactEmail}</span>
                            </div>
                          )}
                          {expert.contactPhone && (
                            <div className="flex items-center gap-1.5">
                              <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                              <span>{expert.contactPhone}</span>
                            </div>
                          )}
                        </td>

                        {/* Activity Analytics Column */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <BriefcaseIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium">{expert.experienceYears} Years Tenure</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GlobeAltIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span>{expert.travelsCompleted} Tours Completed</span>
                          </div>
                        </td>

                        {/* State Pill Status Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full tracking-wide ${
                            expert.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            expert.status === 'PENDING' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                            'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                          }`}>
                            {expert.status}
                          </span>
                        </td>

                        {/* Functional Action Stack */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(expert)}
                              className="p-2 text-slate-700 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Edit Profile"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpertClick(expert)}
                              className="p-2 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                              title="Destroy Log Record"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Profile Modification Overlay Component */}
      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        onSave={handleSaveExpert}
        expert={currentExpert}
        slug={slug}
      />

      {/* Record Erasure Modal Component */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteExpert}
        title="Confirm Record Erasure"
        message={`Are you certain you want to permanently delete expert "${expertToDelete?.name || 'N/A'}" from database storage? This action is absolute and cannot be undone.`}
        confirmText="Confirm Erasure"
      />
    </div>
  );
}