// app/admin/[adminSlug]/riders/RidersClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  // New icons for modal form
  UserCircleIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  BookOpenIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  MapIcon,           // Used for Service Area (Regions replacement)
  TruckIcon,         // Used for Total Deliveries (Listings replacement)
  BoltIcon,          // Used for Successful Deliveries (Deals replacement)
  IdentificationIcon, // Used for Vehicle Type (Specialties replacement)
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { RiderDocumentUpload } from '@/components/media/RiderDocumentUpload';

// Assuming this is still used from the outer component's type definition
// export type Rider = { /* ... */ }; 
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Basic Modal Component (Kept same) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
        {children}
      </div>
    </div>
  );
};

// --- Type Definitions (Updated for Riders) ---
export type RiderProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string; // Brief description, e.g., 'Reliable and fast'
  profileImageUrl?: string;
  isActive: boolean; // Is the rider currently available/active?
  vehicleType: string[]; // e.g., ["Motorbike", "Car", "Bicycle"]
  serviceArea: string[]; // e.g., ["Nairobi CBD", "Westlands", "Ruiru"]
  totalDeliveries: number;
  successfulDeliveries: number; // Similar to closed deals
  joinedAt: string;
};

// --- Sample Data Generation (Updated for Riders) ---
const generateSampleRiders = (): RiderProfile[] => [
  {
    id: 'RDR001',
    name: 'Aisha Hassan',
    email: 'aisha.hassan@example.com',
    phone: '+254712345678',
    bio: 'Experienced motorbike rider with a focus on express package delivery in the city center and surrounding suburbs. Highly reliable and great with urgent tasks.',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a3dd78721d6?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: true,
    vehicleType: ['Motorbike', 'Scooter'],
    serviceArea: ['Nairobi CBD', 'Kilimani', 'Upper Hill'],
    totalDeliveries: 450,
    successfulDeliveries: 445,
    joinedAt: new Date('2023-01-15T09:00:00Z').toISOString(),
  },
  {
    id: 'RDR002',
    name: 'David Kimani',
    email: 'david.kimani@example.com',
    phone: '+254723456789',
    bio: 'Professional van driver specializing in bulk and large-item logistics. Operates primarily in industrial areas and business parks.',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: true,
    vehicleType: ['Van', 'Lorry (Small)'],
    serviceArea: ['Industrial Area', 'Athi River', 'Thika'],
    totalDeliveries: 120,
    successfulDeliveries: 118,
    joinedAt: new Date('2022-11-01T10:30:00Z').toISOString(),
  },
  {
    id: 'RDR003',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@example.com',
    phone: '+254734567890',
    bio: 'Bicycle messenger covering short-distance, quick deliveries within the high-traffic Westlands and Kileleshwa zones.',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: true,
    vehicleType: ['Bicycle'],
    serviceArea: ['Westlands', 'Kileleshwa', 'Lavington'],
    totalDeliveries: 780,
    successfulDeliveries: 765,
    joinedAt: new Date('2023-04-20T11:00:00Z').toISOString(),
  },
  {
    id: 'RDR004',
    name: 'Peter Mugo',
    email: 'peter.mugo@example.com',
    phone: '+254701234567',
    bio: 'Currently on a leave of absence. Previously a reliable car-based courier for general packages.',
    profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: false, // Inactive rider
    vehicleType: ['Car'],
    serviceArea: ['Ruaraka', 'Madaraka'],
    totalDeliveries: 210,
    successfulDeliveries: 200,
    joinedAt: new Date('2023-09-01T14:00:00Z').toISOString(),
  },
];

// --- Helper Components (Reusable Modals & Cards) ---

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  riderName: string; // Renamed
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, riderName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-600 mb-7">
        Are you sure you want to delete rider <span className="font-bold text-red-600">"{riderName}"</span>?
        This action is irreversible and will permanently remove all associated delivery data.
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}
          {isSubmitting ? "Deleting..." : "Delete Rider"}
        </button>
      </div>
    </div>
  </Modal>
);

// Renamed and updated icons/color
interface RiderSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const RiderSummaryCard: React.FC<RiderSummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-center justify-center text-center`}>
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

// Rider Profile Card for the list view
interface RiderProfileCardProps {
  rider: RiderProfile; // Renamed type
  adminSlug: string;
  onEdit: (rider: RiderProfile) => void;
  onDelete: (rider: RiderProfile) => void;
}

const RiderProfileCard: React.FC<RiderProfileCardProps> = ({ rider, adminSlug, onEdit, onDelete }) => { // Renamed prop
  const joinedDate = useMemo(() => {
    const date = new Date(rider.joinedAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [rider.joinedAt]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 mr-4">
          <Image
            className="h-20 w-20 rounded-full object-cover border-2 border-indigo-400 shadow-md"
            src={rider.profileImageUrl || `https://ui-avatars.com/api/?name=${rider.name}&background=random&color=fff`}
            alt={`${rider.name}'s profile`}
            width={80}
            height={80}
            loader={loader}
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{rider.name}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <EnvelopeIcon className="h-4 w-4 mr-1" /> {rider.email}
          </p>
          <p className="text-sm text-gray-500 flex items-center mt-0.5">
            <PhoneIcon className="h-4 w-4 mr-1" /> {rider.phone}
          </p>
          <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold ${
            rider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {rider.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{rider.bio}</p>

      <div className="mb-4">
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <IdentificationIcon className="h-4 w-4 mr-2" /> {/* Updated Icon */}
          <span className="font-semibold">Vehicle Type:</span> {rider.vehicleType?.join(', ') || 'N/A'}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapIcon className="h-4 w-4 mr-2" /> {/* Updated Icon */}
          <span className="font-semibold">Service Area:</span> {rider.serviceArea?.join(', ') || 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Total Deliveries:</span>
          <span className="text-indigo-600 text-lg font-bold">{rider.totalDeliveries || 0}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Successful Deliveries:</span>
          <span className="text-green-600 text-lg font-bold">{rider.successfulDeliveries || 0}</span>
        </div>
      </div>

      <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(rider)} // Now opens modal
          className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          onClick={() => onDelete(rider)}
          className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};

// --- Add/Edit Rider Modal Component ---
interface AddEditRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider?: RiderProfile | null; // Renamed prop and type
  onSave: (riderData: Partial<RiderProfile>) => Promise<void>; // Renamed prop
  isSubmitting: boolean;
}

const AddEditRiderModal: React.FC<AddEditRiderModalProps> = ({ isOpen, onClose, rider, onSave, isSubmitting }) => { // Renamed prop
  const [formData, setFormData] = useState<Partial<any>>({});

  useEffect(() => {
    // Initialize form data when modal opens or rider prop changes
    if (rider) {
      setFormData({
        id: rider.id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        bio: rider.bio,
        profileImageUrl: rider.profileImageUrl,
        isActive: rider.isActive,
        vehicleType: rider.vehicleType, // Renamed
        serviceArea: rider.serviceArea,   // Renamed
        totalDeliveries: rider.totalDeliveries, // Pre-fill for editing
        successfulDeliveries: rider.successfulDeliveries,     // Pre-fill for editing
        joinedAt: rider.joinedAt,           // Pre-fill for editing
      });
    } else {
      // Reset for adding new rider
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        profileImageUrl: '',
        isActive: true, // Default to active
        vehicleType: [], // Renamed
        serviceArea: [],   // Renamed
        totalDeliveries: 0,
        successfulDeliveries: 0,
        joinedAt: new Date().toISOString(),
      });
    }
  }, [rider, isOpen]); // Depend on rider and isOpen to re-initialize

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'vehicleType' | 'serviceArea') => { // Renamed fields
    const value = e.target.value;
    // Split by comma, trim spaces, filter out empty strings
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.bio) {
      toast.error("Please fill in all required fields.");
      return;
    }
    await onSave(formData as Partial<RiderProfile>);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {rider ? "Edit Rider Profile" : "Add New Rider"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Rider Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="jane.doe@example.com"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="+2547XXXXXXXX"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <RiderDocumentUpload
              label="Driver Profile Photo"
              sublabel="Upload a clear portrait photo for customer and store identification"
              value={formData.profileImageUrl || ""}
              onChange={(url) => setFormData((prev) => ({ ...prev, profileImageUrl: url }))}
              maxSizeBytes={5 * 1024 * 1024}
              mediaType="image"
              accept={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio / Rider Summary</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                <BookOpenIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                placeholder="e.g., Highly rated for prompt food delivery and navigating busy city traffic."
                rows={4}
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
          </div>

          {/* Vehicle Type (comma-separated) */}
          <div>
            <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type(s) (comma-separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" /> {/* Updated Icon */}
              </div>
              <input
                type="text"
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType?.join(', ') || ""}
                onChange={(e) => handleArrayChange(e, 'vehicleType')}
                placeholder="e.g., Motorbike, Van, Bicycle"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Separate multiple vehicle types with commas.</p>
          </div>

          {/* Service Areas (comma-separated) */}
          <div>
            <label htmlFor="serviceArea" className="block text-sm font-medium text-gray-700 mb-1">Service Areas (comma-separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapIcon className="h-5 w-5 text-gray-400" /> {/* Updated Icon */}
              </div>
              <input
                type="text"
                id="serviceArea"
                name="serviceArea"
                value={formData.serviceArea?.join(', ') || ""}
                onChange={(e) => handleArrayChange(e, 'serviceArea')}
                placeholder="e.g., Nairobi CBD, Westlands, Rongai"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Separate multiple service areas with commas.</p>
          </div>

          {/* Is Active Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Rider is Currently Active
            </label>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {isSubmitting ? "Saving..." : (rider ? "Save Changes" : "Add Rider")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Main RidersPage Component ---
interface RidersPageProps { // Renamed
  params: {
    companyId: string;
    ridersData: any[]; // Renamed
  };
}

export default function RidersPage({ params }: RidersPageProps) { // Renamed
  const { companyId, ridersData } = params;
  const [riders, setRiders] = useState<RiderProfile[]>(ridersData || generateSampleRiders()); // Renamed and initialized
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRider, setEditingRider] = useState<RiderProfile | null>(null); // Renamed
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [riderToDelete, setRiderToDelete] = useState<RiderProfile | null>(null); // Renamed

  const fetchRiders = useCallback(async () => { // Renamed
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call with a delay
      const res = await fetch(`${apiBaseUrl}/admin/riders?companyId=${companyId}`, { method: 'GET' }); // Updated endpoint
      if (!res.ok) throw new Error(`Error fetching riders: ${res.statusText}`);
      const rawData = await res.json();
      let data = Array.isArray(rawData.data) ? rawData.data : [];
      if (data.length === 0) {
        // If no data from API, use sample data for demo purposes
        data = generateSampleRiders();
      }
      setRiders(data);
    } catch (err: any) {
      console.error("Error fetching riders:", err);
      setError(err.message || "Failed to load riders.");
      toast.error(err.message || "Failed to load riders.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]); // Dependency added for future real API calls

  // --- Handlers for Modals ---
  const handleAddRider = () => { // Renamed
    setEditingRider(null);
    setShowAddEditModal(true);
  };

  const handleEditRider = (rider: RiderProfile) => { // Renamed
    setEditingRider(rider);
    setShowAddEditModal(true);
  };

  const handleSaveRider = async (formData: Partial<RiderProfile>) => { // Renamed
    setIsSubmitting(true);
    const toastId = toast.loading(editingRider ? 'Updating rider...' : 'Adding rider...');

    try {
      // await new Promise(resolve => setTimeout(resolve, 1200));

      const res = await fetch(`${apiBaseUrl}/admin/riders`, {
        method: editingRider ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, 
          phoneNumber: formData.phone, 
          companyId }),
      });

      if (!res.ok) throw new Error(`Error ${editingRider ? 'updating' : 'adding'} rider: ${res.statusText}`);

      const savedRider = (await res.json()).data;

      if (editingRider) {
        // Update existing rider in state
        setRiders(prev => prev.map(r => r.id === savedRider.id ? savedRider : r));
        toast.success('Rider updated successfully!', { id: toastId });
      } else {
        // Add new rider to state
        setRiders(prev => [savedRider, ...prev]);
        toast.success('Rider added successfully!', { id: toastId });
      }
      
      setShowAddEditModal(false);
    } catch (error: any) {
      console.error("Error saving rider:", error);
      toast.error(error.message || `Failed to ${editingRider ? 'update' : 'add'} rider.`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (rider: RiderProfile) => { // Renamed
    setRiderToDelete(rider);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!riderToDelete) return;

    setIsSubmitting(true);
    setShowDeleteConfirmModal(false);
    const deleteToastId = toast.loading(`Deleting ${riderToDelete.name}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRiders(prev => prev.filter(r => r.id !== riderToDelete.id));
      toast.success(`${riderToDelete.name} deleted successfully!`, { id: deleteToastId });
      setRiderToDelete(null);
    } catch (err: any) {
      console.error("Error deleting rider:", err);
      toast.error(err.message || "Failed to delete rider.", { id: deleteToastId });
      setError(err.message || "Failed to delete rider.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRiders = useMemo(() => {
    return riders.filter(rider => {
      const matchesSearch = rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rider.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rider.vehicleType.some((s: any) => s.toLowerCase().includes(searchTerm.toLowerCase())) || // Updated field
                            rider.serviceArea.some((r: any) => r.toLowerCase().includes(searchTerm.toLowerCase())); // Updated field
      const matchesActive = filterActive === 'All' ||
                            (filterActive === 'true' && rider.isActive) ||
                            (filterActive === 'false' && !rider.isActive);
      return matchesSearch && matchesActive;
    });
  }, [riders, searchTerm, filterActive]); // Renamed dependency

  const totalRiders = riders.length; // Renamed
  const activeRiders = riders.filter(rider => rider.isActive).length; // Renamed
  const totalDeliveriesOverall = riders.reduce((sum, rider) => sum + rider.totalDeliveries, 0); // Updated field
  const successfulDeliveriesOverall = riders.reduce((sum, rider) => sum + rider.successfulDeliveries, 0); // Updated field


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Riders <span className="ml-2 text-purple-600 text-base sm:text-xl">🛵</span> {/* Updated emoji */}
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Oversee your delivery team, track service areas, and manage profiles. {/* Updated text */}
          </p>
        </div>
        <button
          onClick={handleAddRider}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Rider
        </button>
      </div>

      {/* Summary Cards (Updated titles and icons) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <RiderSummaryCard title="Total Riders" value={totalRiders || 0} icon={UsersIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <RiderSummaryCard title="Active Riders" value={activeRiders || 0} icon={CheckCircleIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <RiderSummaryCard title="Total Deliveries" value={totalDeliveriesOverall || 0} icon={TruckIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" /> {/* Updated Icon/Title */}
        <RiderSummaryCard title="Successful Deliveries" value={successfulDeliveriesOverall || 0} icon={BoltIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" /> {/* Updated Icon/Title */}
      </div>

      {/* Loading and Error Indicators (Kept same) */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching rider data, please wait...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Oops! Error:</strong>
            <span className="block sm:inline ml-2">{error} Please try refreshing the page.</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters (Updated placeholder text) */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Riders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, vehicle type, service area..." /* Updated placeholder */
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div>
              <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
              <select
                id="status-filter"
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {/* Future: Add more sophisticated filters here (e.g., multi-select for vehicle type, service area) */}
          </div>
        </div>
      )}

      {/* Riders List/Grid */}
      {!isLoading && !error && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Rider Directory</h2> {/* Updated title */}
          {filteredRiders.length === 0 ? (
            <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
              <p className="text-2xl text-gray-500 font-semibold">No riders found matching your search and filter criteria. 😞</p>
              {(searchTerm || filterActive !== 'All') && (
                <button
                  onClick={() => { setSearchTerm(''); setFilterActive('All'); }}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRiders.map((rider) => ( // Renamed map variable
                <RiderProfileCard
                  key={rider.id}
                  rider={rider} // Renamed prop
                  adminSlug={companyId}
                  onEdit={handleEditRider}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add/Edit Rider Modal */}
      <AddEditRiderModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        rider={editingRider} // Renamed prop
        onSave={handleSaveRider}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {riderToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={confirmDelete}
          riderName={riderToDelete.name} // Renamed prop
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}