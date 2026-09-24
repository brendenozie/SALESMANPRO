"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  ClockIcon,
  GlobeAltIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';
import LocationModal, { LocationData } from './LocationModal';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 },
  },
};

const LocationCard = ({
  location,
  onEdit,
  onDelete,
}: {
  location: LocationData;
  onEdit: (location: LocationData) => void;
  onDelete: (location: LocationData) => void;
}) => {
  const statusStyles = {
    OPEN: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    CLOSED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    MAINTENANCE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900"
    >
      {/* Image / Header Media Section */}
      <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {location.imageUrl ? (
          <Image
            src={location.imageUrl}
            alt={location.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loader={customLoader}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x400/27272a/a1a1aa?text=No+Image+Found';
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GlobeAltIcon className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
          </div>
        )}
        <div className={`absolute top-3 left-3 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide shadow-sm backdrop-blur-md ${statusStyles[location.status] || statusStyles.OPEN}`}>
          {location.status.charAt(0).toUpperCase() + location.status.slice(1).toLowerCase()}
        </div>
      </div>

      {/* Main Core Metadata */}
      <div className="flex flex-1 flex-col">
        <h4 className="line-clamp-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">{location.name}</h4>
        
        <div className="mt-1.5 flex items-start gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="line-clamp-1">{location.address}, {location.city}</p>
        </div>

        {/* Dynamic Secondary Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-50/50 p-3 text-xs dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Capacity</p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{location.capacity || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <div className="overflow-hidden">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Hours</p>
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">{location.openHours || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Essential Contact Information Node */}
        <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-xs text-zinc-600 dark:border-zinc-800/60 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate">{location.phone || 'No phone registration'}</span>
          </div>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span className="truncate">{location.email || 'No email configuration'}</span>
          </div>
        </div>

        {/* Actions Dock */}
        <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800/60">
          <button
            onClick={() => onEdit(location)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(location)}
            className="flex items-center justify-center rounded-lg border border-transparent bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const LocationCardSkeleton = () => (
  <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
    <div className="mb-5 h-44 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
    <div className="h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    <div className="mt-2 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800/40">
      <div className="h-8 rounded bg-zinc-200 dark:bg-zinc-800"></div>
      <div className="h-8 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    </div>
    <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
      <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    </div>
    <div className="mt-5 flex gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
      <div className="h-8 flex-1 rounded bg-zinc-200 dark:bg-zinc-800"></div>
      <div className="h-8 w-10 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    </div>
  </div>
);

interface LocationsClientProps {
  companyId: string;
  slug: string;
}

export default function LocationsClient({ companyId, slug }: LocationsClientProps) {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<LocationData | null>(null);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawResponse = await response.json();
      const data: LocationData[] = rawResponse.data?.data || [];
      setLocations(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to load locations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const openAddModal = () => {
    setCurrentLocation(null);
    setIsLocationModalOpen(true);
  };

  const openEditModal = (location: LocationData) => {
    setCurrentLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = (savedLocation: LocationData) => {
    if (currentLocation) {
      setLocations(prev => prev.map(loc => loc.id === savedLocation.id ? savedLocation : loc));
      toast.success(`Location "${savedLocation.name}" updated successfully.`);
    } else {
      setLocations(prev => [savedLocation, ...prev]);
      toast.success(`Location "${savedLocation.name}" added successfully.`);
    }
    setIsLocationModalOpen(false);
  };

  const handleDeleteLocationClick = (location: LocationData) => {
    setLocationToDelete(location);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;

    setIsConfirmModalOpen(false);
    const toastId = toast.loading(`Deleting "${locationToDelete.name}"...`);
    
    try {
      const response = await fetch(`${apiBaseUrl}/admin/locationsv2/${locationToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = (await response.json()).data || {};
        throw new Error(errorData.message || 'Deletion failed.');
      }

      setLocations(prev => prev.filter(loc => loc.id !== locationToDelete.id));
      toast.success(`Location deleted successfully.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error removing location: ${err.message}`, { id: toastId });
    } finally {
      setLocationToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Semantic Header Group */}
        <header className="flex flex-col gap-4 border-b border-zinc-200/60 pb-6 dark:border-zinc-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Facilities
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage physical branch infrastructure operational configurations.
            </p>
          </div>
          <motion.button
            onClick={openAddModal}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PlusIcon className="h-4 w-4 stroke-[2.5]" />
            Add Location
          </motion.button>
        </header>

        <main className="mt-8">
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <LocationCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-500/10 dark:bg-rose-500/5">
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">Error connecting to cloud gateway</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
              <button 
                onClick={fetchLocations}
                className="mt-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
              >
                Retry Request
              </button>
            </div>
          )}

          {!loading && !error && locations.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <GlobeAltIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">No facilities discovered</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Get started by creating your primary operating location.</p>
            </div>
          )}

          {!loading && !error && locations.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {locations.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onEdit={openEditModal}
                    onDelete={handleDeleteLocationClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveLocation}
        location={currentLocation}
        slug={slug}
        companyId={companyId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteLocation}
        title="Remove Facility Mapping"
        message={`Are you completely sure you want to delete "${locationToDelete?.name}"? All associated endpoint distributions will become instantly unreachable.`}
        confirmText="Confirm Deletion"
      />
    </div>
  );
}