"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowUpTrayIcon, FilmIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

export interface VirtualTourData {
  id?: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  description?: string;
  published?: boolean;
}

interface VirtualTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tour: VirtualTourData) => void;
  tour?: VirtualTourData | null;
  slug: string;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

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

const VirtualTourModal: React.FC<VirtualTourModalProps> = ({ isOpen, onClose, onSave, tour, slug }) => {
  const [title, setTitle] = useState(tour?.title || '');
  const [location, setLocation] = useState(tour?.location || '');
  const [duration, setDuration] = useState(tour?.duration || '');
  const [category, setCategory] = useState(tour?.category || '');
  const [videoUrl, setVideoUrl] = useState(tour?.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(tour?.thumbnailUrl || '');
  const [description, setDescription] = useState(tour?.description || '');
  const [published, setPublished] = useState(tour?.published || false);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tour) {
      setTitle(tour.title);
      setLocation(tour.location);
      setDuration(tour.duration);
      setCategory(tour.category);
      setVideoUrl(tour.videoUrl);
      setThumbnailUrl(tour.thumbnailUrl);
      setDescription(tour.description || '');
      setPublished(tour.published || false);
    } else {
      setTitle('');
      setLocation('');
      setDuration('');
      setCategory('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDescription('');
      setPublished(false);
    }
    setFormError(null);
    setImageProgress(0);
    setVideoProgress(0);
  }, [tour, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageUploading(true);
    setImageProgress(0);
    try {
      const results = await uploadFiles(files, "image", (progress) => {
        setImageProgress(progress);
      });
      if (results.length > 0) {
        setThumbnailUrl(results[0].url);
        toast.success("Thumbnail frame updated successfully.");
      }
    } catch (err: any) {
      toast.error(`Image processing fault: ${err.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setVideoUploading(true);
    setVideoProgress(0);
    try {
      const results = await uploadFiles(files, "video", (progress) => {
        setVideoProgress(progress);
      });
      if (results.length > 0) {
        setVideoUrl(results[0].url);
        toast.success("Video environment baseline uploaded.");
      }
    } catch (err: any) {
      toast.error(`Video pipeline storage fault: ${err.message}`);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    if (!title || !location || !duration || !category || !videoUrl || !thumbnailUrl) {
      setFormError('Please complete all mandatory context nodes.');
      setLoading(false);
      return;
    }

    const method = tour ? 'PUT' : 'POST';
    const url = tour ? `${apiBaseUrl}/admin/virtual-tours/${tour.id}` : `${apiBaseUrl}/admin/virtual-tours?companyId=${slug}`;
    const toastId = toast.loading(`${tour ? 'Updating' : 'Writing'} spatial records...`);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          location,
          duration,
          category,
          videoUrl,
          thumbnailUrl,
          description: description || null,
          published,
          companyId: slug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to modify virtual catalog.`);
      }

      const savedTour: VirtualTourData = await response.json();
      onSave(savedTour);
      onClose();
      toast.success(`Virtual tour "${savedTour.title}" saved accurately!`, { id: toastId });
    } catch (err: any) {
      setFormError(err.message);
      toast.error(`Transaction failure: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-md bg-slate-950/60 flex items-center justify-center z-[1000] p-4 sm:p-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl my-auto max-h-[90vh] overflow-y-auto p-6 sm:p-8 w-full max-w-2xl relative border border-slate-200 dark:border-slate-800 transition-colors duration-300"
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e : React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {/* Top Dismiss Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Dismiss Modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <header className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tour ? 'Modify Virtual Space' : 'Provision Immersive Space'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure parameters, mapping telemetry, and deployment assets below.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Context Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Staging Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g., Penthouse Suite Experience"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Spatial Coordinates</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g., Kilimani, Nairobi"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Playback Duration</label>
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g., 4 min 20s"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Context Categorization</label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  placeholder="e.g., Architecture Exploration"
                  required
                />
              </div>
            </div>

            {/* Core Media Ingestion Pipelines */}
            <div className="space-y-4 pt-2">
              
              {/* Asset Pipeline A: Thumbnail Image Mapping */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Staging Thumbnail Frame</span>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {thumbnailUrl ? (
                    <div className="relative w-32 aspect-video rounded-lg overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                      <Image
                        src={thumbnailUrl}
                        alt="Staging Configuration Frame"
                        fill
                        unoptimized
                        className="object-cover"
                        loader={customLoader}
                      />
                    </div>
                  ) : (
                    <div className="w-32 aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                      <PhotoIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="w-full flex-1">
                    <input 
                      type="file" 
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden" 
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                        placeholder="Paste remote frame URL or select file"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={imageUploading}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-medium text-xs transition"
                      >
                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                        <span>Browse</span>
                      </button>
                    </div>

                    {/* Progress Indicator */}
                    <AnimatePresence>
                      {imageUploading && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                          <motion.div className="bg-indigo-600 h-1" animate={{ width: `${imageProgress}%` }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Asset Pipeline B: Immersive Video Payload */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Streaming Stream Vector</span>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-32 aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                    <FilmIcon className={`w-6 h-6 ${videoUrl ? 'text-indigo-500' : ''}`} />
                  </div>

                  <div className="w-full flex-1">
                    <input 
                      type="file" 
                      ref={videoInputRef}
                      onChange={handleVideoUpload}
                      accept="video/*"
                      className="hidden" 
                    />
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs"
                        placeholder="Paste streaming layout reference or drop stream file"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={videoUploading}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-medium text-xs transition"
                      >
                        <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                        <span>Browse</span>
                      </button>
                    </div>

                    {/* Progress Indicator */}
                    <AnimatePresence>
                      {videoUploading && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                          <motion.div className="bg-indigo-600 h-1" animate={{ width: `${videoProgress}%` }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Textual Description Annotation Block */}
              <div>
                <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Staging Core Abstract (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                  placeholder="Structural context annotations..."
                ></textarea>
              </div>
            </div>

            {/* Publishing Staging Rules */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded dark:bg-slate-800"
              />
              <label htmlFor="published" className="ml-2.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expose space instantly within global public layout indexes
              </label>
            </div>

            {/* Form Validation Diagnostics */}
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-xs font-medium border border-rose-100 dark:border-rose-900/40 text-center"
              >
                {formError}
              </motion.div>
            )}

            {/* Mutation Command Controls */}
            <footer className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Abort Changes
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                disabled={loading || imageUploading || videoUploading}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  tour ? 'Commit Node Updates' : 'Deploy Spatial Layer'
                )}
              </button>
            </footer>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VirtualTourModal;