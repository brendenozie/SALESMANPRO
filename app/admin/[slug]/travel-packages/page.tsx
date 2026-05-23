"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  BriefcaseIcon, CheckCircleIcon, ClockIcon, MapPinIcon, 
  PencilSquareIcon, PlusIcon, StarIcon, TrashIcon, 
  XMarkIcon, CloudArrowUpIcon, PhotoIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// --- S3 UPLOAD HELPER CORE ---
async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to secure signed URL context: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Asset pipeline upload failed: ${file.name}`));
      };

      xhr.onerror = () => reject(new Error(`Network exception during transmission.`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}

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

interface Destination {
  id: string;
  name: string;
}

interface TourPackageCardProps {
  pkg: TourPackage;
  onEdit: (pkg: TourPackage) => void;
  onDelete: (id: string, name: string) => void;
}

interface TourPackageModalProps {
  pkg: TourPackage | null;
  onSave: (data: TourPackageFormData, attachedFile: File | null) => Promise<void>;
  onClose: () => void;
  destinations: Destination[];
  isLoading: boolean;
}

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
// TourPackageCard Component
// =======================================================================
const TourPackageCard: React.FC<TourPackageCardProps> = ({ pkg, onEdit, onDelete }) => {
  const getStatusStyle = (status: TourPackage['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'FEATURED': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'DRAFT': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'ARCHIVED': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'INACTIVE': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/70 dark:backdrop-blur-md dark:hover:border-slate-700"
    >
      <div>
        {/* Banner Image Frame */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
          <Image
            src={pkg.imageUrl || 'https://placehold.co/600x400/E5E7EB/A5A9AE?text=No+Image'}
            alt={pkg.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loader={loader}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top floating chips */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${getStatusStyle(pkg.status)}`}>
              {pkg.status}
            </span>
            {pkg.status === 'FEATURED' && (
              <div className="flex items-center rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg shadow-amber-500/20">
                <StarIcon className="mr-1 h-3 w-3" />
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Card Body Context */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {pkg.name}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2rem]">
            {pkg.description || 'No descriptive overview provided.'}
          </p>

          {/* Destination Pills Grid */}
          <div className="mt-4 flex flex-wrap gap-1">
            {pkg.destinations?.length > 0 ? (
              pkg.destinations.map((d) => (
                <span key={d.id} className="inline-flex items-center rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800/60">
                  <MapPinIcon className="mr-0.5 h-2.5 w-2.5 text-slate-400" />
                  {d.name}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400 italic">No locations bound</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Meta Bar */}
      <div className="mt-auto border-t border-slate-100 px-5 py-3.5 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
          <div className="flex items-center text-xs">
            <ClockIcon className="mr-1 h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{pkg.duration}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-sm font-black text-slate-950 dark:text-white">
            {pkg.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </span>
        </div>

        {/* Inline Management Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(pkg)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="Modify Package configurations"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(pkg.id, pkg.name)}
            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Purge Package Instance"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =======================================================================
// TourPackageModal Component
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDestinationToggle = (id: string) => {
    setFormData(prev => {
      const exists = prev.destinationIds.includes(id);
      const updated = exists 
        ? prev.destinationIds.filter(item => item !== id)
        : [...prev.destinationIds, id];
      return { ...prev, destinationIds: updated };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ ...formData, id: pkg?.id, price: Number(formData.price) }, selectedFile);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col my-auto max-h-[calc(100vh-2rem)]"
      >
        {/* Sticky Header Box */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 md:px-8 bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              {pkg ? 'Modify Tour Experience' : 'Form New Tour Experience'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Parameters map straight into client search feeds</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 dark:text-slate-500 dark:hover:bg-slate-800/50 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body Input Panels */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-5 grow minimal-scrollbar">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Package Title</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Luxury Bali Escape" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unique URI Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="luxury-bali-escape" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Teaser Summary</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="A short, captivating snippet for listings card views..." required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Extended Itinerary details</label>
            <textarea name="longDescription" value={formData.longDescription} onChange={handleChange} rows={4} placeholder="Comprehensive day-by-day sequence breakdowns and package inclusions..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
          </div>

          {/* Destination Nodes Multi-Checkbox Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Destinations Bound</label>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-950/30">
              {destinations.map((dest) => {
                const isSelected = formData.destinationIds.includes(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleDestinationToggle(dest.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                    }`}
                  >
                    {dest.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Duration Tag</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 7 Days, 6 Nights" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Base Price (USD)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 1850" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Visibility Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="FEATURED">Featured</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {/* Custom Dropzone Component Block */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Display Cover Photo</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="sm:col-span-3 border-2 border-dashed border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-1"
              >
                <CloudArrowUpIcon className="h-6 w-6 text-slate-400" />
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Upload new image</span> or drop file
                </div>
                <p className="text-[10px] text-slate-400">Landscape high-res aspect ratio preferred</p>
              </div>

              <div className="sm:col-span-2 flex items-center justify-center">
                {formData.imageUrl ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                    <Image src={formData.imageUrl} alt="Preview canvas" fill className="object-cover" loader={loader} unoptimized={selectedFile !== null} />
                  </div>
                ) : (
                  <div className="w-full h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-950">
                    <PhotoIcon className="h-5 w-5" />
                    <span className="text-[10px] mt-1">No media preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </form>

        {/* Footer Action Strip */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 md:px-8 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-end gap-3 z-10">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" disabled={isLoading}>
            Cancel
          </button>
          <button
            type="button"
            onClick={(e: any) => {
              const formElement = e.currentTarget.closest('motion.div')?.querySelector('form');
              if (formElement) formElement.requestSubmit();
            }}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md transition-all flex items-center justify-center min-w-28 disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              pkg ? 'Save Changes' : 'Publish Experience'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// =======================================================================
// Main AdminPackages View Page
// =======================================================================
export default function AdminPackages() {
  const params = useParams();
  const slug = params.slug as string;

  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPackage, setCurrentPackage] = useState<TourPackage | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Danger zone confirmations states
  const [packageToDeleteId, setPackageToDeleteId] = useState<string | null>(null);
  const [packageToDeleteName, setPackageToDeleteName] = useState<string | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [packagesRes, destinationsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/travel-packages?companyId=${slug}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/destinations?companyId=${slug}`, { credentials: 'include' }),
      ]);

      const packagesData = await packagesRes.json();
      const destinationsData = await destinationsRes.json();

      if (!packagesRes.ok || !destinationsRes.ok) {
        throw new Error('Platform microservices failed to collect state assets.');
      }

      setTourPackages(packagesData.data || []);
      setDestinations(destinationsData.data?.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error sync parsing global data stores.');
      setTourPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePackage = async (formData: TourPackageFormData, attachedFile: File | null) => {
    setIsLoading(true);
    const isEditing = !!formData.id;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/admin/travel-packages/${formData.id}` : `${apiBaseUrl}/admin/travel-packages?companyId=${slug}`;
    
    const toastId = toast.loading(attachedFile ? "Uploading image asset..." : "Saving catalog configuration...");

    try {
      let finalImageUrl = formData.imageUrl;

      // Intercept execution path if local media configuration payload needs pushing
      if (attachedFile) {
        const uploadResult = await uploadFiles([attachedFile], 'image');
        if (uploadResult && uploadResult[0]) {
          finalImageUrl = uploadResult[0].url;
        }
      }

      const submissionPayload = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API engine rejected update parameters payload.');
      }

      toast.success(isEditing ? 'Package parameters updated!' : 'Package configuration live!', { id: toastId });
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmationInput !== 'DELETE') {
      toast.error("Please match confirmation string to authorize process.");
      return;
    }
    
    const id = packageToDeleteId;
    const name = packageToDeleteName;
    
    setPackageToDeleteId(null);
    setPackageToDeleteName(null);
    setDeleteConfirmationInput('');

    const toastId = toast.loading(`Purging "${name}" instance files...`);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/travel-packages/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
      });

      if (!response.ok) throw new Error('Data reference removal block rejected execution.');

      toast.success('Experience record deleted from database.', { id: toastId });
      await fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  // Filter Pipeline matching
  const filteredPackages = tourPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 md:p-8 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Banner Control Section */}
      <div className="mx-auto max-w-7xl border border-slate-200/60 bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/40 rounded-[28px] p-6 backdrop-blur-md mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
              Tour Catalog Intelligence
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure corporate travel experiences, bound geographical nodes, and review visibility scopes.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentPackage(null); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all"
          >
            <PlusIcon className="h-4 w-4 stroke-[3]" />
            Add Experience Instance
          </motion.button>
        </div>

        {/* Search Filtration Utilities */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search catalog titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/40 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'ACTIVE', 'FEATURED', 'DRAFT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Inventory Block Grid */}
      <div className="mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl bg-slate-200/60 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 animate-pulse" />
              ))}
            </motion.div>
          ) : filteredPackages.length > 0 ? (
            <motion.div key="active-grid" layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPackages.map((pkg) => (
                <TourPackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onEdit={(p) => { setCurrentPackage(p); setIsModalOpen(true); }}
                  onDelete={(id, name) => { setPackageToDeleteId(id); setPackageToDeleteName(name); }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty-slate" className="flex flex-col items-center justify-center py-20 text-center rounded-[32px] border border-dashed border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-900/20">
              <BriefcaseIcon className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">No matching records found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Adjust filtration scopes or append a completely new instance matrix into the system.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Containers Portals */}
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

        {/* Inline Destruction Guard Mechanism */}
        {packageToDeleteId && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60" onClick={() => setPackageToDeleteId(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Authorize Action Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">To drop <span className="font-semibold text-slate-800 dark:text-slate-300 font-mono">"{packageToDeleteName}"</span> write <span className="font-bold text-rose-500">DELETE</span> below.</p>
              
              <input 
                type="text" 
                value={deleteConfirmationInput} 
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold tracking-widest mt-4 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              
              <div className="flex justify-end gap-2 mt-5">
                <button type="button" onClick={() => setPackageToDeleteId(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Abort</button>
                <button type="button" onClick={confirmDelete} className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40" disabled={deleteConfirmationInput !== 'DELETE'}>Confirm Drop</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}