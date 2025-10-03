"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  BellAlertIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon,
  MapPinIcon, PencilSquareIcon, PlusCircleIcon, StarIcon, TrashIcon, XMarkIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

import { useParams } from 'next/navigation';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// Define the data structure for a Tour Package
interface TourPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  duration: string;
  price: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'INACTIVE' | 'FEATURED';
  imageUrl: string;
  destinations: Destination[];
}

// Define the data structure for a Destination
interface Destination {
  id: string;
  name: string;
}

// Define props for the TourPackageCard component
interface TourPackageCardProps {
  pkg: TourPackage;
  onEdit: (pkg: TourPackage) => void;
  onDelete: (id: string, name: string) => void;
}

// Define props for the TourPackageModal component
interface TourPackageModalProps {
  pkg: TourPackage | null;
  onSave: (data: TourPackageFormData) => Promise<void>;
  onClose: () => void;
  destinations: Destination[];
  isLoading: boolean;
}

// Define the shape of the form data
interface TourPackageFormData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  duration: string;
  price: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'INACTIVE' | 'FEATURED';
  imageUrl: string;
  destinationIds: string[];
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


// =======================================================================
// Helper component for each package card
// =======================================================================
const TourPackageCard: React.FC<TourPackageCardProps> = ({ pkg, onEdit, onDelete }) => {
  const getStatusColor = (status: TourPackage['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-slate-200 text-slate-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'FEATURED': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 group"
    >
      <div className="relative w-full h-48 rounded-t-[20px] overflow-hidden">
        <Image
          src={pkg.imageUrl || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image'}
          alt={pkg.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
          className="transition-transform duration-500 group-hover:scale-110"
          loader={loader}
        />
        {pkg.status === 'FEATURED' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 flex items-center space-x-1 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-full shadow-lg"
          >
            <StarIcon className="w-4 h-4 text-white" />
            <span>Featured</span>
          </motion.div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pkg.status)}`}>
            {pkg.status}
          </span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              onClick={() => onEdit(pkg)}
              className="p-2 text-indigo-600 transition-colors duration-200 bg-indigo-50 rounded-full hover:bg-indigo-100"
              title="Edit Package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilSquareIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => onDelete(pkg.id, pkg.name)}
              className="p-2 text-red-600 transition-colors duration-200 bg-red-50 rounded-full hover:bg-red-100"
              title="Delete Package"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrashIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 line-clamp-1">{pkg.name}</h3>
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-grow">{pkg.description || 'No description provided.'}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 mt-auto text-slate-700 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium line-clamp-1">{pkg.destinations?.map(d => d.name).join(', ') || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900">{pkg.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================================================
// Helper component for the Add/Edit modal
// =======================================================================
const TourPackageModal: React.FC<TourPackageModalProps> = ({ pkg, onSave, onClose, destinations, isLoading }) => {
  const [formData, setFormData] = useState<TourPackageFormData>({
    name: pkg?.name || '',
    slug: pkg?.slug || '',
    description: pkg?.description || '',
    longDescription: pkg?.longDescription || '',
    duration: pkg?.duration || '',
    price: pkg?.price || 0,
    status: pkg?.status || 'DRAFT',
    imageUrl: pkg?.imageUrl || '',
    destinationIds: pkg?.destinations?.map(d => d.id) || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData(prev => ({ ...prev, destinationIds: selectedOptions }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ ...formData, id: pkg?.id, price: Number(formData.price) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-lg p-8 bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e:any) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute text-slate-400 transition-colors duration-200 top-5 right-5 hover:text-slate-600 p-1"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="mb-6 text-3xl font-bold text-slate-900">
          {pkg ? 'Edit Tour Package' : 'Add New Tour Package'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ... form fields with updated styling */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Package Name</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Luxury Bali Honeymoon" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-1">Slug</label>
            <input type="text" id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g., luxury-bali-honeymoon" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="A brief, captivating description of the package." required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="longDescription" className="block text-sm font-semibold text-slate-700 mb-1">Long Description</label>
            <textarea id="longDescription" name="longDescription" value={formData.longDescription} onChange={handleChange} rows={5} placeholder="A more detailed description for the package page." className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destinationIds" className="block text-sm font-semibold text-slate-700 mb-1">Destinations</label>
              <select
                id="destinationIds"
                name="destinationIds"
                value={formData.destinationIds}
                onChange={handleDestinationChange}
                multiple
                className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none h-32"
              >
                {destinations.map((destination: Destination) => (
                  <option key={destination.id} value={destination.id}>{destination.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-semibold text-slate-700 mb-1">Duration (e.g., "7 Days")</label>
              <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 7 Days, 6 Nights" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1">Price</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 2500" required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange} className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="FEATURED">Featured</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." required className="block w-full px-4 py-3 mt-1 transition-colors border border-slate-300 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none" />
            {formData.imageUrl && (
              <div className="flex items-center justify-center w-full h-40 p-2 mt-4 overflow-hidden bg-slate-100 border border-slate-200 rounded-xl">
                <Image src={formData.imageUrl} alt="Image Preview" width={200} height={120} style={{ objectFit: 'contain' }} className="rounded-lg" unoptimized loader={loader}/>
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold text-slate-700 transition-colors bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className="px-6 py-3 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                pkg ? 'Save Changes' : 'Add Package'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// =======================================================================
// Main component
// =======================================================================
export default function AdminPackages() {
  const params = useParams();
  const slug = params.slug as string;

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPackage, setCurrentPackage] = useState<TourPackage | null>(null);
  const [packageToDeleteId, setPackageToDeleteId] = useState<string | null>(null);
  const [packageToDeleteName, setPackageToDeleteName] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [packagesRes, destinationsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/travel-packages?companyId=${slug}`),
        fetch(`${apiBaseUrl}/admin/destinations?companyId=${slug}`)
      ]);

      const packagesData: TourPackage[] = await packagesRes.json();
      const destinationsData: Destination[] = await destinationsRes.json();

      if (!packagesRes.ok || !destinationsRes.ok) {
        throw new Error('Failed to fetch data');
        // packagesData.message || destinationsData.message || 
      }

      setTourPackages(packagesData);
      setDestinations(destinationsData);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to fetch data: ${error.message}`);
      setTourPackages([]);
      setDestinations([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePackage = async (formData: TourPackageFormData) => {
    setIsModalOpen(false);
    const isEditing = !!formData.id;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/admin/travel-packages/${formData.id}` : `${apiBaseUrl}/admin/travel-packages`;
    const actionText = isEditing ? 'updating' : 'creating';
    const successText = isEditing ? 'updated' : 'added';

    const toastId = toast.loading(`Saving package "${formData.name}"...`);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${actionText} tour package`);
      }

      await fetchData();
      toast.success(`Package "${formData.name}" ${successText} successfully! 🎉`, { id: toastId });
    } catch (error: any) {
      console.error(`Error ${actionText} package:`, error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!packageToDeleteId) return;

    const id = packageToDeleteId;
    const name = packageToDeleteName;

    setPackageToDeleteId(null);
    setPackageToDeleteName(null);

    const toastId = toast.loading(`Deleting package "${name}"...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tour package');
      }

      await fetchData();
      toast.success(`Package "${name}" deleted successfully!`, { id: toastId });

    } catch (error: any) {
      console.error('Error deleting package:', error);
      toast.error(error.message, { id: toastId });
    }
  };

  const openAddModal = () => {
    setCurrentPackage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: TourPackage) => {
    setCurrentPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeletePackage = (id: string, name: string) => {
    setPackageToDeleteId(id);
    setPackageToDeleteName(name);
  };
  
  const handleCancelDelete = () => {
    setPackageToDeleteId(null);
    setPackageToDeleteName(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-slate-50 font-inter">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        Manage Tour Packages
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-slate-600">
            Create, edit, and delete travel packages and tours to showcase on your platform.
          </p>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add New Package</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="p-4 sm:p-8 bg-white shadow-2xl rounded-3xl">
        <h2 className="mb-8 text-3xl font-bold text-slate-900">All Tour Packages</h2>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-200"></div>
              ))}
            </motion.div>
          ) : tourPackages.length > 0 ? (
            <motion.div
              key="packages-list"
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence>
                {tourPackages.map((pkg: TourPackage) => (
                  <TourPackageCard
                    key={pkg.id}
                    pkg={pkg}
                    onEdit={openEditModal}
                    onDelete={handleDeletePackage}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="no-packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-50 rounded-2xl"
            >
              <BriefcaseIcon className="w-16 h-16 text-slate-300" />
              <p className="mt-4 text-xl font-medium">No tour packages found.</p>
              <p className="mt-2 text-sm text-slate-400">Add your first package to get started.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <TourPackageModal
            pkg={currentPackage}
            onSave={handleSavePackage}
            onClose={() => setIsModalOpen(false)}
            destinations={destinations}
            isLoading={isLoading}
          />
        )}
        {/* {packageToDeleteId && (
          <ConfirmationModal
            title="Delete Package"
            message={`Are you sure you want to delete "${packageToDeleteName}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => handleCancelDelete()}
          />
        )} */}
      </AnimatePresence>
    </div>
  );
}