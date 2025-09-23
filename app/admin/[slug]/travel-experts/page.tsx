"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon, PlusCircleIcon, PencilIcon, TrashIcon, BriefcaseIcon, GlobeAltIcon, EnvelopeIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';
import ExpertModal, { ExpertData } from './ExpertModal';
// import { toast } from 'react-toastify'; // Use a toast library for better feedback
// import 'react-toastify/dist/ReactToastify.css'; // Don't forget to import the CSS

// Define the ExpertData interface to match the API response
// interface ExpertData {
//   id: string;
//   userId: string;
//   name: string | null;
//   email: string;
//   phone: string | null;
//   specialty: string;
//   experienceYears: number;
//   travelsCompleted: number;
//   photoUrl: string | null;
//   bio: string | null;
//   contactEmail: string | null;
//   contactPhone: string | null;
//   status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
// }

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Define Framer Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function AdminExpertsPage() {
  const params = useParams();
  const slug = params.slug as string;

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
      const response = await fetch(`/api/admin/experts?companyId=${slug}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ExpertData[] = await response.json();
      setExperts(data);
    } catch (err: any) {
      setError(err.message);
      // toast.error('Failed to fetch experts. Please try again.');
      console.error("Failed to fetch experts:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

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
      // toast.success(`Expert ${savedExpert.name} updated successfully! 🎉`);
    } else {
      setExperts([savedExpert, ...experts]);
      // toast.success(`Expert ${savedExpert.name} added successfully! 🚀`);
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
    // toast.info('Deleting expert...');
    
    try {
      const response = await fetch(`/api/admin/experts/${expertToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete expert ${expertToDelete.name}.`);
      }

      setExperts(prevExperts => prevExperts.filter(e => e.id !== expertToDelete.id));
      // toast.success(`Expert ${expertToDelete.name} deleted successfully!`);
    } catch (err: any) {
      // toast.error(`Error deleting expert: ${err.message}`);
      console.error("Deletion error:", err);
    } finally {
      setExpertToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Meet the Experts
          </h1>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Expert</span>
          </motion.button>
        </header>
      </motion.div>

      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <p className="text-lg text-gray-500 animate-pulse">
                Fetching travel experts... 🌍
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-lg text-center my-8"
            >
              <p className="font-bold">Oops! Something went wrong.</p>
              <p className="mt-2">{error}</p>
            </motion.div>
          )}

          {!loading && !error && experts.length === 0 && (
            <motion.div
              key="no-experts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="flex justify-center mb-4">
                <UserGroupIcon className="h-20 w-20 text-indigo-200" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Experts Yet</h3>
              <p className="text-gray-500">
                It looks like there are no experts to display. Click the button above to add your first expert!
              </p>
            </motion.div>
          )}

          {!loading && !error && experts.length > 0 && (
            <motion.div
              key="experts-list"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="overflow-x-auto"
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tl-xl">Photo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Specialty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {experts.map((expert) => (
                      <motion.tr
                        key={expert.id}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-indigo-400 transition-colors duration-200">
                            <Image
                              src={expert.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo'}
                              alt={expert.name || 'Expert'}
                              layout="fill"
                              objectFit="cover"
                              loader={customLoader}
                              className="group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{expert.name}</span>
                            <span className="text-xs text-gray-500">{expert.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                          <div className="flex flex-col space-y-1">
                            <span className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{expert.contactEmail || 'N/A'}</span>
                            </span>
                            <span className="flex items-center">
                              <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{expert.contactPhone || 'N/A'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                          {expert.specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                          <div className="flex flex-col space-y-1">
                            <span className="flex items-center">
                              <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{expert.experienceYears} years</span>
                            </span>
                            <span className="flex items-center">
                              <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-gray-700">{expert.travelsCompleted} trips</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            expert.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            expert.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {expert.status.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2 justify-end">
                            <motion.button
                              onClick={() => openEditModal(expert)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                              title="Edit Expert"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <PencilIcon className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteExpertClick(expert)}
                              className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                              title="Delete Expert"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        onSave={handleSaveExpert}
        expert={currentExpert}
        slug={slug}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteExpert}
        title="Confirm Deletion"
        message={`Are you sure you want to delete expert "${expertToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}