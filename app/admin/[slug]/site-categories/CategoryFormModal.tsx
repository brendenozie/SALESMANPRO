'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  PhotoIcon, 
  GlobeAltIcon, 
  FaceSmileIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Import your helpers (ensure these are exported from your client page or a utils file)
// For this block, I'm assuming they are available or defined in the same scope.

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

/**
 * Compresses an image file to be under a specific size (default 500KB)
 */
async function compressImage(file: File, maxMb: number = 0.5): Promise<File> {
  const maxSize = maxMb * 1024 * 1024;
  if (file.size <= maxSize) return file; // Skip if already small enough

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Optional: Downscale if resolution is massive (e.g., > 1920px)
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Recursive function to find the right quality
        const getBlob = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (blob.size > maxSize && quality > 0.1) {
                  getBlob(quality - 0.1); // Reduce quality and try again
                } else {
                  resolve(new File([blob], file.name, { type: "image/jpeg" }));
                }
              }
            },
            "image/jpeg",
            quality
          );
        };

        getBlob(0.8); // Start at 80% quality
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

////////////////////////////////////////////////////////////////////////////////
// Upload helper for getting signed URLs and uploading files
////////////////////////////////////////////////////////////////////////////////
async function uploadFile(files: File[], type: "image" | "video" | "book") {
  console.log("Uploading files:", files);
  
  console.log("Starting upload for : ", type);

  if (!files?.length) return [];
  console.log("Starting upload for : ", type);

  const uploads = files.map(async (file, index) => {
    // 1. Request signed URL from your backend
    // const res = await fetch(
    //   `${API_URL}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}`
    // );

    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) throw new Error("Failed to get signed URL");
    const { uploadUrl, publicUrl } = await res.json();

    // 2. Upload directly to S3 via PUT request
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");

    // 3. Return the public CloudFront/S3 URL
    return {
      // The original index is not needed here as we will re-index later
      url: publicUrl,
    };
  });

  return Promise.all(uploads);
}


export default function CategoryFormModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🛒',
    variantName: '',
    link: '',
    description: '',
    previewImage: '',
    tag: 'New'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        icon: initialData.icon || '🛒',
        variantName: initialData.variants?.[0]?.name || '',
        link: initialData.variants?.[0]?.link || '',
        description: initialData.variants?.[0]?.description || '',
        previewImage: initialData.variants?.[0]?.previewImage || '',
        tag: initialData.variants?.[0]?.tag || 'New'
      });
    }
  }, [initialData]);

  // Handle Image Selection, Compression, and Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Compress (from your previous helper)
      // @ts-ignore - assuming compressImage is available globally or imported
      const compressedFile = await compressImage(file, 0.5);
      
      // 2. Upload (from your previous helper)
      // @ts-ignore - assuming uploadFile is available globally or imported
      const [{ url }] = await uploadFile([compressedFile], "image");
      
      setFormData(prev => ({ ...prev, previewImage: url }));
      console.log("✅ Optimized Image Uploaded:", url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name: formData.name,
      icon: formData.icon,
      variants: [
        {
          name: formData.variantName,
          link: formData.link,
          description: formData.description,
          previewImage: formData.previewImage,
          tag: formData.tag
        }
      ]
    };

    await onSave(payload);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {initialData ? 'Edit Industry' : 'Add New Industry'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Define the category and its first template variant.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: INDUSTRY DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <FaceSmileIcon className="h-4 w-4" /> 1. Industry Identity
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 text-center text-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Industry Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-commerce, Consultant"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* SECTION 2: VARIANT DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <GlobeAltIcon className="h-4 w-4" /> 2. Primary Variant (Template)
            </h3>
            
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1 text-center">Preview Screenshot (Auto-compressed to &lt;500KB)</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative h-48 w-full rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  formData.previewImage ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-white'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">Optimizing...</span>
                  </div>
                ) : formData.previewImage ? (
                  <>
                    <img src={formData.previewImage} className="absolute inset-0 w-full h-full object-cover rounded-[2rem] opacity-40 group-hover:opacity-20 transition-opacity" />
                    <div className="z-10 flex flex-col items-center gap-1">
                      <CheckIcon className="h-8 w-8 text-indigo-600 bg-white rounded-full p-1 shadow-md" />
                      <span className="text-xs font-bold text-indigo-900 bg-white/80 px-3 py-1 rounded-full">Change Screenshot</span>
                    </div>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-10 w-10 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    <p className="text-sm font-bold text-gray-400 group-hover:text-indigo-600">Click to upload screenshot</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Variant Name</label>
                <input
                  type="text"
                  required
                  placeholder="Modern Shop (v1)"
                  value={formData.variantName}
                  onChange={(e) => setFormData({...formData, variantName: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Tag</label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                >
                  <option>New</option>
                  <option>Popular</option>
                  <option>Standard</option>
                  <option>Beta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Live Preview URL</label>
              <div className="relative">
                <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  type="url"
                  required
                  placeholder="https://template.salesmanpro.site"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all text-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Description</label>
              <textarea
                rows={3}
                placeholder="A brief summary..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  {initialData ? 'Update Category' : 'Create Industry'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}