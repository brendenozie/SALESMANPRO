"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- UTILS: S3 UPLOAD HELPER ---
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
      throw new Error(`Failed to get signed URL: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    const xhr = new XMLHttpRequest();
    return new Promise<{ url: string; key: string; contentType: string }>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve({ url: publicUrl, key, contentType });
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });
  });

  return Promise.all(uploads);
}

export interface LocationData {
  id?: string;
  name: string;
  slug?: string;
  address: string;
  city: string;
  state: string | null;
  zipCode: string | null;
  country: string;
  description: string | null;
  imageUrl: string | null;
  phone: string | null;
  email: string | null;
  capacity: number | null;
  openHours: string | null;
  status: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: LocationData) => void;
  location?: LocationData | null;
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const LOCATION_STATUSES = ['OPEN', 'CLOSED', 'MAINTENANCE'] as const;

const statusBadgeColors = {
  OPEN: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  CLOSED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  MAINTENANCE: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
};

const FieldGroup = motion.div;

const inputClasses = "w-full px-4 py-3 mt-1.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/60 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200";
const labelClasses = "block text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-zinc-400";

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSave, location, slug }) => {
  const [name, setName] = useState(location?.name || '');
  const [address, setAddress] = useState(location?.address || '');
  const [city, setCity] = useState(location?.city || '');
  const [state, setState] = useState(location?.state || '');
  const [zipCode, setZipCode] = useState(location?.zipCode || '');
  const [country, setCountry] = useState(location?.country || '');
  const [description, setDescription] = useState(location?.description || '');
  const [imageUrl, setImageUrl] = useState(location?.imageUrl || '');
  const [phone, setPhone] = useState(location?.phone || '');
  const [email, setEmail] = useState(location?.email || '');
  const [capacity, setCapacity] = useState<number | null>(location?.capacity || null);
  const [openHours, setOpenHours] = useState(location?.openHours || '');
  const [status, setStatus] = useState<LocationData['status']>(location?.status || 'OPEN');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address);
      setCity(location.city);
      setState(location.state || '');
      setZipCode(location.zipCode || '');
      setCountry(location.country);
      setDescription(location.description || '');
      setImageUrl(location.imageUrl || '');
      setPhone(location.phone || '');
      setEmail(location.email || '');
      setCapacity(location.capacity || 0);
      setOpenHours(location.openHours || '');
      setStatus(location.status || 'OPEN');
    } else {
      setName('');
      setAddress('');
      setCity('');
      setState('');
      setZipCode('');
      setCountry('');
      setDescription('');
      setImageUrl('');
      setPhone('');
      setEmail('');
      setCapacity(0);
      setOpenHours('');
      setStatus('OPEN');
    }
  }, [location, isOpen]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const results = await uploadFiles([file], 'image', (progress) => {
        setUploadProgress(progress);
      });
      
      if (results && results.length > 0) {
        setImageUrl(results[0].url);
        toast.success('Image uploaded successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(location ? 'Saving changes...' : 'Adding new location...');

    if (!name || !address || !city || !country) {
      toast.error('Name, address, city, and country are required.', { id: toastId });
      setLoading(false);
      return;
    }

    const method = location ? 'PUT' : 'POST';
    const url = location ? `${apiBaseUrl}/admin/locationsv2/${location.id}` : `${apiBaseUrl}/admin/locationsv2?companyId=${slug}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, address, city, country,
          state: state || null,
          zipCode: zipCode || null,
          description: description || null,
          imageUrl: imageUrl || null,
          phone: phone || null,
          email: email || null,
          capacity: capacity || null,
          openHours: openHours || null,
          status,
          companyId: slug
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to balance action context.`);
      }

      const savedLocation: LocationData = await response.json();
      onSave(savedLocation);
      toast.success(`Location "${savedLocation.name}" saved securely.`, { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const panelVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.98 },
    visible: { 
      y: 0, opacity: 1, scale: 1,
      transition: { type: "spring", duration: 0.4, bounce: 0.15 }
    },
    exit: { 
      y: 20, opacity: 0, scale: 0.98,
      transition: { duration: 0.25 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-zinc-950/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-100 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 relative h-full sm:h-auto max-h-100 sm:max-h-[85vh] flex flex-col overflow-hidden"
            variants={panelVariants}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-purple-500">
                  {location ? 'Edit Location' : 'Add New Location'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                  {location ? 'Update your parameters for this branch.' : 'Set up a new operational domain node.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Core Fields */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <form id="location-modal-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Visual Cover Asset Upload Area */}
                <FieldGroup>
                  <label className={labelClasses}>Location Banner Showcase</label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-1.5 relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group overflow-hidden h-44 ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10' 
                        : imageUrl 
                          ? 'border-gray-200 dark:border-zinc-700/60' 
                          : 'border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 bg-gray-50/50 dark:bg-zinc-800/20'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={(e) => handleFileUpload(e.target.files)} 
                      className="hidden" 
                      accept="image/*"
                    />

                    {uploading ? (
                      <div className="flex flex-col items-center space-y-3 z-10">
                        <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">Uploading metadata context ({uploadProgress}%)</span>
                        <div className="w-32 bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      </div>
                    ) : imageUrl ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt="Uploaded asset presentation"
                          layout="fill"
                          objectFit="cover"
                          loader={customLoader}
                          unoptimized
                          className="group-hover:scale-[1.02] transition-transform duration-300 brightness-[0.85] dark:brightness-[0.7]"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/1F2937/9CA3AF?text=Image+Not+Found';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-200">
                          <div className="bg-white/90 dark:bg-zinc-900/90 px-4 py-2 rounded-xl text-xs font-semibold shadow flex items-center gap-2 text-gray-800 dark:text-zinc-200">
                            <CloudArrowUpIcon className="w-4 h-4" /> Replace Image
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageUrl('');
                          }}
                          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur text-white p-1.5 rounded-lg z-10 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center flex flex-col items-center">
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 mb-3 group-hover:scale-105 transition-transform duration-200">
                          <PhotoIcon className="w-6 h-6 text-gray-400 dark:text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                          Drag and drop your image, or <span className="text-blue-600 dark:text-blue-400 font-semibold">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Supports high-res PNG, JPG, WebP up to 5MB</p>
                      </div>
                    )}
                  </div>
                </FieldGroup>

                {/* Primary Information Split Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup>
                    <label htmlFor="name" className={labelClasses}>Location Identity *</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                      placeholder="Downtown Workspace / Gym Center"
                      required
                    />
                  </FieldGroup>
                  
                  <FieldGroup>
                    <label htmlFor="status" className={labelClasses}>Operational Status</label>
                    <div className="relative">
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as LocationData['status'])}
                        className={`${inputClasses} appearance-none pr-24 font-medium`}
                        required
                      >
                        {LOCATION_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100">{s}</option>
                        ))}
                      </select>
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-bold ${statusBadgeColors[status]}`}>
                        {status}
                      </div>
                    </div>
                  </FieldGroup>
                </div>

                {/* Address Field */}
                <FieldGroup>
                  <label htmlFor="address" className={labelClasses}>Physical Address Structure *</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClasses}
                    placeholder="Street name, suite or building identifier"
                    required
                  />
                </FieldGroup>

                {/* Regional Geo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="city" className={labelClasses}>City *</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClasses}
                      placeholder="Nairobi"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className={labelClasses}>State/Prov.</label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={inputClasses}
                      placeholder="Nairobi County"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className={labelClasses}>Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className={inputClasses}
                      placeholder="00100"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label htmlFor="country" className={labelClasses}>Country *</label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputClasses}
                      placeholder="Kenya"
                      required
                    />
                  </div>
                </div>

                {/* Description Segment */}
                <FieldGroup>
                  <label htmlFor="description" className={labelClasses}>Context Description</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`${inputClasses} resize-none`}
                    placeholder="Describe facility logistics, dynamic parameters, or access points..."
                  ></textarea>
                </FieldGroup>

                {/* Secondary Meta Information Field Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup>
                    <label htmlFor="phone" className={labelClasses}>Comms Contact Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClasses}
                      placeholder="+254 700 000000"
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <label htmlFor="email" className={labelClasses}>Support Email Node</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClasses}
                      placeholder="hq@salesmanpro.com"
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <label htmlFor="openHours" className={labelClasses}>Operational Schedule Hours</label>
                    <input
                      type="text"
                      id="openHours"
                      value={openHours}
                      onChange={(e) => setOpenHours(e.target.value)}
                      className={inputClasses}
                      placeholder="Mon - Fri: 06:00 AM - 09:00 PM"
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <label htmlFor="capacity" className={labelClasses}>Maximum Tenant Capacity Threshold</label>
                    <input
                      type="number"
                      id="capacity"
                      value={capacity || ''}
                      onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : null)}
                      className={inputClasses}
                      min="0"
                      placeholder="Unlimited if unassigned"
                    />
                  </FieldGroup>
                </div>
              </form>
            </div>

            {/* Bottom Form Actions Control Panel */}
            <div className="p-6 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-end gap-3 shrink-0 bg-gray-50/50 dark:bg-zinc-900/30 backdrop-blur-md">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                disabled={loading || uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="location-modal-form"
                disabled={loading || uploading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-600 dark:hover:to-purple-700 text-white shadow-md shadow-blue-500/10 dark:shadow-none transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving Target...</span>
                  </>
                ) : (
                  <span>{location ? 'Save Changes' : 'Publish Location'}</span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationModal;