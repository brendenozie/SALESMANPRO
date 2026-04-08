"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import Image, { ImageLoaderProps } from 'next/image';
import { useParams } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Type Definitions ---
type SponsorStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

interface Sponsor {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string; // Optional property
  websiteUrl: string;
  logoUrl?: string; // Optional property
  status: SponsorStatus;
  companyId: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface SponsorFormProps {
  sponsor?: Sponsor; // Optional for the add form
  onSubmit: (sponsorData: Omit<Sponsor, 'id' | 'companyId'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  item: Sponsor | null;
  isSubmitting: boolean;
}

interface SponsorCardProps {
  sponsor: Sponsor;
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (sponsor: Sponsor) => void;
}

// Placeholder for your AdminLayout component
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

// Custom loader for Next.js Image component
const loader = ({ src, width, quality }: ImageLoaderProps) => `${src}?w=${width}&q=${quality || 75}`;

// --- Reusable Modal Component ---
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full ${sizeClasses[size]} p-8 transform-gpu`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
          <h3 className="text-3xl font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// --- Sponsor Form Component for Add/Edit ---
const SponsorForm: React.FC<SponsorFormProps> = ({ sponsor, onSubmit, onCancel, isSubmitting }) => {
  const [form, setForm] = useState<Omit<Sponsor, 'id' | 'companyId'> & { id?: string }>(sponsor || {
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    logoUrl: '',
    status: 'ACTIVE',
  });
  const isEditing = !!sponsor;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-300 mb-1">Website URL</label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-300 mb-1">Contact Person</label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={form.contactEmail}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={form.contactPhone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-300 mb-1">Logo URL</label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
          >
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-purple-800 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, item, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-300 mb-6 text-lg">
        Are you sure you want to delete the sponsor <strong className="text-white">"{item?.companyName}"</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-red-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};

// --- Sponsor Card Component for Grid View ---
const SponsorCard: React.FC<SponsorCardProps> = ({ sponsor, onEdit, onDelete }) => {
  const statusColor = sponsor.status === 'ACTIVE'
    ? 'text-green-400 bg-green-900/50'
    : sponsor.status === 'PENDING'
    ? 'text-yellow-400 bg-yellow-900/50'
    : 'text-red-400 bg-red-900/50';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl p-6 relative group transform hover:scale-105 transition-transform duration-300 ease-in-out"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-shrink-0 h-20 w-20 relative rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center p-2">
          {sponsor.logoUrl ? (
            <Image src={sponsor.logoUrl} alt={sponsor.companyName} fill className="object-contain" loader={loader} />
          ) : (
            <BuildingOffice2Icon className="h-12 w-12 text-gray-600" />
          )}
        </div>
        <div className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${statusColor}`}>
          {sponsor.status}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{sponsor.companyName}</h3>
      <div className="space-y-2 text-gray-400 text-sm mb-4">
        <div className="flex items-center">
          <UserCircleIcon className="h-4 w-4 mr-2 text-purple-400" />
          <span>{sponsor.contactName || 'N/A'}</span>
        </div>
        <a href={`mailto:${sponsor.contactEmail}`} className="flex items-center hover:text-white transition-colors">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-purple-400" />
          <span>{sponsor.contactEmail}</span>
        </a>
        {sponsor.contactPhone && (
          <a href={`tel:${sponsor.contactPhone}`} className="flex items-center hover:text-white transition-colors">
            <PhoneIcon className="h-4 w-4 mr-2 text-purple-400" />
            <span>{sponsor.contactPhone}</span>
          </a>
        )}
      </div>
      <a
        href={sponsor.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors"
      >
        <GlobeAltIcon className="h-4 w-4 mr-1" />
        Visit Website
      </a>
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={() => onEdit(sponsor)}
          className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-indigo-400 hover:bg-indigo-900/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Edit ${sponsor.companyName}`}
        >
          <PencilIcon className="h-5 w-5" />
        </motion.button>
        <motion.button
          onClick={() => onDelete(sponsor)}
          className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Delete ${sponsor.companyName}`}
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
};


// --- Main Page Component ---
export default function SponsorsPage() {
  
    const params = useParams();
    const companyId = params.slug as string;

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    fetchSponsors();
  }, [companyId]); // Add companyId to the dependency array

  const fetchSponsors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/sponsors?companyId=${companyId}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch sponsors');
      }
      const fetchedSponsors: Sponsor[] = (await response.json()).data || [];
      setSponsors(fetchedSponsors);
    } catch (error) {
      // console.log("Failed to fetch sponsors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSponsor = async (sponsorData: Omit<Sponsor, 'id' | 'companyId'> & { id?: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/sponsors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify({...sponsorData, companyId}),
      });

      if (!response.ok) {
        throw new Error('Failed to add sponsor');
      }
      const newSponsor: Sponsor = await response.json();
      setSponsors(prev => [...prev, newSponsor]);
      setIsAddModalOpen(false);
    } catch (error) {
      // console.log("Failed to add sponsor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsEditModalOpen(true);
  };

  const handleUpdateSponsor = async (updatedSponsorData: Omit<Sponsor, 'id' | 'companyId'> & { id?: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/sponsors/${updatedSponsorData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(updatedSponsorData),
      });

      if (!response.ok) {
        throw new Error('Failed to update sponsor');
      }
      const updatedSponsor: Sponsor = (await response.json()).data;
      setSponsors(prev => prev.map(s => s.id === updatedSponsor.id ? updatedSponsor : s));
      setIsEditModalOpen(false);
    } catch (error) {
      // console.log("Failed to update sponsor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsor = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteSponsor = async () => {
    if (!selectedSponsor) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/sponsors/${selectedSponsor.id}`, {
        method: 'DELETE',
        headers: { 'Credentials': 'include' }
      });

      if (!response.ok) {
        throw new Error('Failed to delete sponsor');
      }

      setSponsors(prev => prev.filter(s => s.id !== selectedSponsor.id));
      setIsDeleteModalOpen(false);
      setSelectedSponsor(null);
    } catch (error) {
      // console.log("Failed to delete sponsor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Sponsors & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Partnerships</span>
        </h1>
        <div className="flex space-x-4">
          <motion.button
            onClick={fetchSponsors}
            className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-300 font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-700/50 hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Add New Sponsor
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-2xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-3xl animate-pulse h-64"></div>
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BuildingOffice2Icon className="h-24 w-24 text-gray-700 mb-4" />
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">No sponsors found.</h2>
            <p className="text-gray-500">Add your first sponsor to get started!</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {sponsors.map((sponsor) => (
                <SponsorCard
                  key={sponsor.id}
                  sponsor={sponsor}
                  onEdit={handleEditSponsor}
                  onDelete={handleDeleteSponsor}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Sponsor">
          <SponsorForm onSubmit={handleAddSponsor} onCancel={() => setIsAddModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Sponsor Details">
          <SponsorForm sponsor={selectedSponsor || undefined} onSubmit={handleUpdateSponsor} onCancel={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDeleteSponsor}
          item={selectedSponsor}
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </AdminLayout>
  );
}