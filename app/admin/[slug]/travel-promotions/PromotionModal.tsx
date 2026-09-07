"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import Image from 'next/image';

// --- S3 UPLOAD HELPER ---
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
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface PromotionData {
  id?: string;
  name: string;
  code: string;
  discount: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT';
  description?: string;
  imageUrl?: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromotionData) => void;
  promotion?: PromotionData | null;
  slug: string;
}

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'] as const;
const PROMOTION_STATUSES = ['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DRAFT'] as const;

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSave, promotion, slug }) => {
  const [name, setName] = useState(promotion?.name || '');
  const [code, setCode] = useState(promotion?.code || '');
  const [discountValue, setDiscountValue] = useState(promotion?.discountValue || 0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>(promotion?.discountType || 'PERCENTAGE');
  const [startDate, setStartDate] = useState(promotion?.startDate || '');
  const [endDate, setEndDate] = useState(promotion?.endDate || '');
  const [status, setStatus] = useState<'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DRAFT'>(promotion?.status || 'SCHEDULED');
  const [description, setDescription] = useState(promotion?.description || '');
  
  // File upload state management
  const [imageUrl, setImageUrl] = useState(promotion?.imageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (promotion) {
      setName(promotion.name);
      setCode(promotion.code);
      setDiscountValue(promotion.discountValue);
      setDiscountType(promotion.discountType);
      setStartDate(promotion.startDate);
      setEndDate(promotion.endDate);
      setStatus(promotion.status);
      setDescription(promotion.description || '');
      setImageUrl(promotion.imageUrl || '');
    } else {
      setName('');
      setCode('');
      setDiscountValue(0);
      setDiscountType('PERCENTAGE');
      setStartDate('');
      setEndDate('');
      setStatus('SCHEDULED');
      setDescription('');
      setImageUrl('');
    }
    setSelectedFile(null);
    setUploadProgress(null);
    setFormError(null);
  }, [promotion, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      // Form temporary localized preview
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (!name || !code || discountValue === undefined || !discountType || !startDate || !endDate || !status) {
      setFormError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Start date cannot be after end date.');
      setLoading(false);
      return;
    }

    const toastId = toast.loading('Preparing data models...');
    let finalImageUrl = imageUrl;

    try {
      // Execute the file upload seamlessly upon submission if a new file is attached
      if (selectedFile) {
        toast.loading(`Uploading media asset...`, { id: toastId });
        const uploadedAssets = await uploadFiles([selectedFile], 'image', (progress) => {
          setUploadProgress(progress);
        });
        if (uploadedAssets && uploadedAssets[0]) {
          finalImageUrl = uploadedAssets[0].url;
        }
      }

      toast.loading(`${promotion ? 'Updating' : 'Creating'} promotion instance...`, { id: toastId });
      
      const method = promotion ? 'PUT' : 'POST';
      const url = promotion 
        ? `${apiBaseUrl}/admin/promotion-discount/${promotion.id}` 
        : `${apiBaseUrl}/admin/promotion-discount?companyId=${slug}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include'
        },
        body: JSON.stringify({
          name,
          code,
          discountValue: Number(discountValue),
          discountType,
          startDate,
          endDate,
          status,
          description: description || null,
          imageUrl: finalImageUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to execute persistence operations.`);
      }

      const savedPromotion: PromotionData = await response.json();
      onSave(savedPromotion);
      onClose();
      toast.success(`Promotion saved successfully!`, { id: toastId });
    } catch (err: any) {
      setFormError(err.message);
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
          {/* Backdrop Blur Layer */}
          <motion.div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 dark:backdrop-blur-xl flex flex-col my-auto max-h-[calc(100vh-2rem)]"
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
          >
            {/* Header Sticky Block */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 px-6 py-4 md:px-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-950 dark:text-white">
                  {promotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Parameters updates sync immediately to active catalog</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-all duration-200"
                aria-label="Close configuration window"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body Container */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-6 grow minimal-scrollbar">
              
              {/* Primary Identity Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Promotion Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                    placeholder="e.g., Seasonal Launch"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="code" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Discount Code</label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                    placeholder="LAUNCH20"
                    required
                  />
                </div>
              </div>

              {/* Value Structuring Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="discountValue" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Discount Value</label>
                  <input
                    type="number"
                    id="discountValue"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                    required
                    min="0"
                    step={discountType === 'PERCENTAGE' ? "0.01" : "1"}
                    placeholder={discountType === 'PERCENTAGE' ? "20.00" : "15"}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Discount Type</span>
                  <div className="flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1 border border-slate-200/60 dark:border-slate-800/60 relative h-10 items-center">
                    {DISCOUNT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDiscountType(type)}
                        className={`flex-1 relative z-10 text-center py-1 rounded-lg text-xs font-semibold transition-colors duration-200 ${
                          discountType === type 
                            ? 'text-white dark:text-slate-900' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {discountType === type && (
                          <motion.div 
                            layoutId="activeDiscountTypeBg"
                            className="absolute inset-0 bg-slate-900 dark:bg-white rounded-lg -z-10"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        {type === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lifecycle Durations Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="endDate" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Status Segment Toggles */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Catalog Status Mapping</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                  {PROMOTION_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`relative z-10 text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                        status === s 
                          ? 'text-white dark:text-slate-950' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {status === s && (
                        <motion.div 
                          layoutId="activeStatusBg"
                          className="absolute inset-0 bg-indigo-600 dark:bg-indigo-400 rounded-lg -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Text Context */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all resize-none"
                  placeholder="Summarize context or constraints rules..."
                />
              </div>
              
              {/* Native Drag & Drop Upload Engine Panel */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Marketing Graphic Cover</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="sm:col-span-3 border-2 border-dashed border-slate-200 hover:border-indigo-500 dark:border-slate-800 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-950 rounded-xl p-5 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2 group group"
                  >
                    <CloudArrowUpIcon className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to replace</span> or drag image asset
                    </div>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG up to 5MB</p>
                  </div>

                  {/* Adaptive Asset Media Preview box */}
                  <div className="sm:col-span-2 flex flex-col items-center justify-center">
                    {imageUrl ? (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group">
                        <Image
                          src={imageUrl}
                          alt="Banner Preview"
                          loader={loader}
                          layout="fill"
                          objectFit="cover"
                          unoptimized={selectedFile !== null}
                          onError={() => setImageUrl('https://placehold.co/400x250/E2E8F0/475569?text=Invalid+Image+Source')}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                        <PhotoIcon className="h-5 w-5" />
                        <span className="text-[10px] tracking-wide mt-1">No asset linked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar tracking upload transformation parameters */}
                {uploadProgress !== null && (
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>Uploading infrastructure asset...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-indigo-600 dark:bg-indigo-400 h-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Warning Alert Block */}
              {formError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-4 py-2.5 rounded-xl text-xs font-medium text-center border border-rose-100 dark:border-rose-900/40"
                >
                  {formError}
                </motion.div>
              )}
            </form>

            {/* Action Bar Base Frame */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 px-6 py-4 md:px-8 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm transition-all flex items-center justify-center min-w-28 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  promotion ? 'Save Changes' : 'Create Promotion'
                )}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PromotionModal;