"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  XMarkIcon, 
  CloudArrowUpIcon, 
  PhotoIcon,
  MusicalNoteIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { IStoreCategory } from "@/types/typings";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// S3 File Upload Handler
export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      const res = await fetch(
        `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress, file);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error(`Network error during upload for ${file.name}`));
        xhr.send(file);
      });

      return { url: publicUrl, key, contentType };
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
}

type Podcast = {
  _id: string;
  creatorId: string;
  creatorType: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; 
  episodeNumber: number;
  releaseDate: string; 
  categories: string; // Comma separated IDs or array configuration strings
  tags: string[]; 
  coverImageUrl: string;
  isFeatured: boolean;
  isPremium?: boolean;
  price?: number;
  currency?: string;
  previewDuration?: number;
  companyId: string; 
  createdAt: string;
  updatedAt: string;
};

interface AddToPodcastModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  podcastToEdit: Podcast | null; 
  companyId: string;
  categories: IStoreCategory[]; 
  onSuccess?: () => void; 
}

export default function AddToPodcastModal({
  showModal,
  setShowModal,
  podcastToEdit,
  companyId,
  categories,
  onSuccess,
}: AddToPodcastModalProps) {
  const [formData, setFormData] = useState<Partial<Podcast>>({
    title: "",
    description: "",
    audioUrl: "",
    duration: 0,
    episodeNumber: 1,
    releaseDate: new Date().toISOString().split("T")[0],
    categories: '', 
    tags: [],
    coverImageUrl: "",
    isFeatured: false,
    isPremium: false,
    price: 0,
    currency: "KES",
    previewDuration: 30,
    companyId: companyId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom states for handling file visual uploading progress
  const [audioProgress, setAudioProgress] = useState<number | null>(null);
  const [imageProgress, setImageProgress] = useState<number | null>(null);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (podcastToEdit) {
      setFormData({
        title: podcastToEdit.title,
        description: podcastToEdit.description,
        audioUrl: podcastToEdit.audioUrl,
        duration: podcastToEdit.duration,
        episodeNumber: podcastToEdit.episodeNumber,
        releaseDate: podcastToEdit.releaseDate?.split("T")[0],
        categories: podcastToEdit.categories || '', 
        tags: podcastToEdit.tags || [],
        coverImageUrl: podcastToEdit.coverImageUrl,
        isFeatured: podcastToEdit.isFeatured,
        isPremium: (podcastToEdit as any).isPremium || false,
        price: (podcastToEdit as any).price || 0,
        currency: (podcastToEdit as any).currency || "KES",
        previewDuration: (podcastToEdit as any).previewDuration ?? 30,
        companyId: companyId,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        audioUrl: "",
        duration: 0,
        episodeNumber: 1,
        releaseDate: new Date().toISOString().split("T")[0],
        categories: '', 
        tags: [],
        coverImageUrl: "",
        companyId: companyId,
        isFeatured: false,
        isPremium: false,
        price: 0,
        currency: "KES",
        previewDuration: 30,
      });
    }
    setError(null);
    setAudioProgress(null);
    setImageProgress(null);
  }, [podcastToEdit, showModal, companyId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "duration" || name === "episodeNumber") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Modern handling toggle selector for mapping backend categories arrays securely
  const handleCategoryToggle = (catId: string) => {
    const activeCategories = formData.categories ? formData.categories.split(",").filter(Boolean) : [];
    let updated: string[];
    
    if (activeCategories.includes(catId)) {
      updated = activeCategories.filter(id => id !== catId);
    } else {
      updated = [...activeCategories, catId];
    }
    
    setFormData(prev => ({ ...prev, categories: updated.join(",") }));
  };

  // Direct Audio Picker Upload Pipeline + Duration Reader Context
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAudioProgress(0);
      setError(null);
      
      // Auto-extract audio length metrics before pushing up stream pipeline
      const audioUrlObjectURL = URL.createObjectURL(file);
      const audioContextElement = new Audio(audioUrlObjectURL);
      audioContextElement.addEventListener("loadedmetadata", () => {
        setFormData(prev => ({ ...prev, duration: Math.round(audioContextElement.duration) }));
      });

      const uploadedFiles = await uploadFiles([file], "video", (progress) => {
        setAudioProgress(progress);
      });

      if (uploadedFiles.length > 0) {
        setFormData(prev => ({ ...prev, audioUrl: uploadedFiles[0].url }));
      }
    } catch (err: any) {
      setError(`Audio upload failed: ${err.message}`);
    } finally {
      setAudioProgress(null);
    }
  };

  // Cover Imagery Picker Pipeline
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageProgress(0);
      setError(null);
      const uploadedFiles = await uploadFiles([file], "image", (progress) => {
        setImageProgress(progress);
      });

      if (uploadedFiles.length > 0) {
        setFormData(prev => ({ ...prev, coverImageUrl: uploadedFiles[0].url }));
      }
    } catch (err: any) {
      setError(`Cover image upload failed: ${err.message}`);
    } finally {
      setImageProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title || !formData.description || !formData.audioUrl || !formData.duration || !formData.releaseDate) {
      setError("Please fill out all mandatory components: Upload Audio File, set Title, Description and Release dates.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const payload = {
        ...formData,
        creatorId: companyId,
        creatorType: "admin",
        podcastId: podcastToEdit?.podcastId || `pod_${Date.now()}`,
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };

      if (podcastToEdit) {
        response = await fetch(`${apiBaseUrl}/admin/podcasts/${podcastToEdit._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${apiBaseUrl}/admin/podcasts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update directory stream parameters.");
      }

      setShowModal(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected dynamic pipeline issue error code raised.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const currentSelectedCategoryIds = formData.categories ? formData.categories.split(",").filter(Boolean) : [];

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      
      {/* Container Frame Content Window */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden transform scale-100 transition-all">
        
        {/* Header Ribbon bar elements */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">
              {podcastToEdit ? "Modify Episode Track" : "Publish Dynamic Audio Content"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure meta indices parameters securely.</p>
          </div>
          <button 
            onClick={() => setShowModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Scroll Content Body Window wrapper viewport */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-100 dark:border-rose-900/30">
              {error}
            </div>
          )}

          {/* S3 Media Processing Dashboard Drops strip layout framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Audio Dropzone component setup implementation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Audio Publication Track *
              </label>
              <input 
                type="file" 
                accept="audio/*" 
                ref={audioInputRef} 
                className="hidden" 
                onChange={handleAudioUpload} 
              />
              <div 
                onClick={() => audioInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[120px] transition ${
                  formData.audioUrl 
                    ? "border-emerald-500/40 bg-emerald-50/10" 
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-500"
                }`}
              >
                {audioProgress !== null ? (
                  <div className="w-full px-4">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${audioProgress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold mt-2 inline-block text-indigo-500">Uploading File Index ({audioProgress}%)</span>
                  </div>
                ) : formData.audioUrl ? (
                  <>
                    <MusicalNoteIcon className="h-6 w-6 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Audio Payload Synchronized</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 px-4">{formData.audioUrl}</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Click to import Master WAV / MP3</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Length timing calculated instantly</span>
                  </>
                )}
              </div>
            </div>

            {/* Poster Artwork Cover file dropping processing component setup layout implementation */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Cover Art Card Container
              </label>
              <input 
                type="file" 
                accept="image/*" 
                ref={imageInputRef} 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <div 
                onClick={() => imageInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[120px] transition ${
                  formData.coverImageUrl 
                    ? "border-emerald-500/40 bg-emerald-50/10" 
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-500"
                }`}
              >
                {imageProgress !== null ? (
                  <div className="w-full px-4">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${imageProgress}%` }} />
                    </div>
                    <span className="text-[11px] font-bold mt-2 inline-block text-indigo-500">Uploading Artwork ({imageProgress}%)</span>
                  </div>
                ) : formData.coverImageUrl ? (
                  <div className="flex items-center space-x-3 text-left w-full px-2">
                    <img src={formData.coverImageUrl} className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700" alt="Preview cover" />
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Cover Mounted</span>
                      <span className="text-[10px] text-slate-400 truncate block">{formData.coverImageUrl}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Upload high-res square JPG</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Recommended scale metrics 1:1 format</span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Form Matrix Controls Layout mapping schema */}
          <form id="podcastFormSubmissionElement" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Episode Title Header *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="The Future of AI Architecture Hub..."
                className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 outline-none transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Summary Abstract Description *</label>
              <textarea
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="A brief high-level breakdown structural log description indexing current updates..."
                className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Episode Position Counter Index</label>
              <input
                type="number"
                name="episodeNumber"
                min={1}
                value={formData.episodeNumber}
                onChange={handleInputChange}
                className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Synchronized Sync Release Date</label>
              <input
                type="date"
                name="releaseDate"
                required
                value={formData.releaseDate}
                onChange={handleInputChange}
                className="w-full p-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 outline-none transition"
              />
            </div>

            {/* Optimized Chip Multi-Selector Logic mapping directly against IStoreCategory layout items */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Associate Topic Category Channels 🏷️
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-36 overflow-y-auto">
                {categories.map((cat) => {
                  const targetId = cat.categoryId || (cat as any)._id || (cat as any).id;
                  const isChecked = currentSelectedCategoryIds.includes(targetId);
                  
                  return (
                    <button
                      type="button"
                      key={targetId}
                      onClick={() => handleCategoryToggle(targetId)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                        isChecked
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {isChecked && <CheckIcon className="h-3 w-3 mr-1.5 stroke-[3]" />}
                      {cat.displayName || (cat as any).name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Anchor toggle switch */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/60 mt-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Promote Clip onto Feature Showcase Reel</span>
                <span className="text-[11px] text-slate-400 block">Pin record matrix directly on dashboard hero layers.</span>
              </div>
              <input
                type="checkbox"
                name="isFeatured"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500/20 border-slate-300 dark:border-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Paywall & Monetization Card */}
            <div className="sm:col-span-2 p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    🔒 Premium Episode Paywall Gated
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Require listeners to pay before streaming the full episode.
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="isPremium"
                  id="isPremium"
                  checked={!!formData.isPremium}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500/20 border-slate-300 dark:border-slate-800 rounded cursor-pointer"
                />
              </div>

              {formData.isPremium && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-500/20">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency || "KES"}
                      onChange={handleInputChange}
                      className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="KES">KES</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unlock Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      min={0}
                      step="any"
                      value={formData.price ?? 0}
                      onChange={handleInputChange}
                      className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none font-bold"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Free Preview (Seconds)
                    </label>
                    <input
                      type="number"
                      name="previewDuration"
                      min={0}
                      value={formData.previewDuration ?? 30}
                      onChange={handleInputChange}
                      className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                      placeholder="30"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer actions row bar operations */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 flex justify-end space-x-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            Cancel Operations
          </button>
          <button
            type="submit"
            form="podcastFormSubmissionElement"
            disabled={loading || audioProgress !== null || imageProgress !== null}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition disabled:opacity-50 flex items-center"
          >
            {loading ? "Syncing Parameters..." : podcastToEdit ? "Apply Modifications" : "Deploy Publication"}
          </button>
        </div>

      </div>
    </div>
  );
}