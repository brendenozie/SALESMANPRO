// app/[slug]/experts/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserGroupIcon, PlusCircleIcon, PencilIcon, TrashIcon, BriefcaseIcon, GlobeAltIcon, EnvelopeIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation'; // For App Router params
import ConfirmationModal from '@/components/ConfirmationModal'; // Re-use this
import ExpertModal from './ExpertModal'; // New ExpertModal component

// Define the ExpertData interface to match the API response
interface ExpertData {
  id: string;
  userId: string;
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

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function AdminExpertsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertData | null>(null); // For edit mode
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expertToDelete, setExpertToDelete] = useState<ExpertData | null>(null);

  // Function to fetch experts from the API
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
      console.error("Failed to fetch experts:", err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Fetch experts on component mount
  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const openAddModal = () => {
    setCurrentExpert(null); // Clear current expert for add mode
    setIsExpertModalOpen(true);
  };

  const openEditModal = (expert: ExpertData) => {
    setCurrentExpert(expert);
    setIsExpertModalOpen(true);
  };

  const handleSaveExpert = (savedExpert: ExpertData) => {
    if (currentExpert) {
      // If editing, update the existing expert in the list
      setExperts(experts.map(e => e.id === savedExpert.id ? savedExpert : e));
      alert(`Expert ${savedExpert.name} updated successfully.`);
    } else {
      // If adding, prepend the new expert to the list
      setExperts([savedExpert, ...experts]);
      alert(`Expert ${savedExpert.name} added successfully.`);
    }
    setIsExpertModalOpen(false);
  };

  const handleDeleteExpertClick = (expert: ExpertData) => {
    setExpertToDelete(expert);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteExpert = async () => {
    if (!expertToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/experts/${expertToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete expert ${expertToDelete.name}.`);
      }

      // If deletion is successful, update the local state
      setExperts(prevExperts => prevExperts.filter(e => e.id !== expertToDelete.id));
      alert(`Expert ${expertToDelete.name} deleted successfully.`);
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting expert: ${err.message}`);
    } finally {
      setLoading(false);
      setExpertToDelete(null); // Clear expert to delete
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Travel Experts
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Experts</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Expert</span>
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Loading experts...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && experts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">No experts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {experts.map((expert) => (
                  <tr key={expert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image src={expert.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo'} alt={expert.name || 'Expert'} layout="fill" objectFit="cover" loader={customLoader} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expert.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {expert.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expert.specialty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {expert.experienceYears} yrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {expert.travelsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        expert.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        expert.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {expert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(expert)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteExpertClick(expert)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Expert Modal */}
      <ExpertModal
        isOpen={isExpertModalOpen}
        onClose={() => setIsExpertModalOpen(false)}
        onSave={handleSaveExpert}
        expert={currentExpert}
        slug={slug}
      />

      {/* Confirmation Modal for Deletion */}
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
