// app/admin/[slug]/events/EventFormModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrashIcon
} from '@heroicons/react/24/outline';



// utils/uploadFiles.ts
export async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    try {
      // ✅ Step 1: Request a signed upload URL from your API
      const res = await fetch(
        `/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to get signed URL: ${text}`);
      }

      const { uploadUrl, publicUrl, key, contentType } = await res.json();

      // ✅ Step 2: Upload directly to S3
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

      console.log(`✅ Uploaded: ${file.name} (${contentType}) → ${publicUrl}`);
      return { url: publicUrl, key, contentType };
    } catch (err) {
      console.error("❌ Upload error:", err);
      throw err;
    }
  });

  return Promise.all(uploads);
}

// --- Type Definitions ---
export type EventData = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  startDateTime: string; 
  endDateTime: string | null; 
  location: string | null;
  onlineMeetingLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  eventType: 'GENERAL' | 'HOLIDAY'| 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'WORKSHOP' | 'ORIENTATION' | 'FUNDRAISER' | 'OTHER';
  eventStatus: 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  companyId: string;
  companyName: string;
  audience: 'ALL' | 'ACADEMIC_LEVEL' | 'COURSE' | 'EDUCATOR' | 'STUDENT' | 'DEPARTMENT' | 'STAFF' | 'PARENT';
  targetAcademicLevelIds: string[];
  targetCourseIds: string[];
  targetEducatorIds: string[];
  targetStudentIds: string[];
  targetDepartmentIds: string[];
  targetParentIds: string[];
  isRegistrationRequired: boolean;
  maxCapacity: number | null;
  isPaid: boolean;
  price: number | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AcademicLevelOption = { id: string; name: string };
export type CourseOption = { id: string; title: string };
export type EducatorOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };
export type DepartmentOption = { id: string; name: string };
export type ParentOption = { id: string; name: string; email: string };
export type OrganizerOption = { id: string; name: string; email: string };

type EventFormModalProps = {
  eventData: EventData | null; 
  onClose: () => void;
  onSave: (data: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  companyId: string;
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allOrganizers: OrganizerOption[];
};

export default function EventFormModal({
  eventData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  companyId,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allOrganizers,
}: EventFormModalProps) {
  
  const [formData, setFormData] = useState<Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>>(
    eventData || {
      id: '',
      title: '',
      summary: null,
      description: null,
      startDateTime: new Date().toISOString().slice(0, 16), 
      endDateTime: null,
      location: null,
      onlineMeetingLink: null,
      imageUrl: null,
      videoUrl: null,
      eventType: 'GENERAL',
      eventStatus: 'SCHEDULED',
      organizerId: '', 
      companyId: companyId,
      audience: 'ALL',
      targetAcademicLevelIds: [],
      targetCourseIds: [],
      targetEducatorIds: [],
      targetStudentIds: [],
      targetDepartmentIds: [],
      targetParentIds: [],
      isRegistrationRequired: false,
      maxCapacity: null,
      isPaid: false,
      price: null,
      contactPerson: null,
      contactEmail: null,
      contactPhone: null,
    }
  );

  // Upload Progress States
  const [imageProgress, setImageProgress] = useState<number | null>(null);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({ ...prev, [name]: selectedValues }));
  };

  // --- Upload Handlers with Explicit File Constraints ---
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    // Image Validation: Limit to less than 500KB
    if (file.size > 500 * 1024) {
      setUploadError("Image verification failed: File size must be less than 500KB.");
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    try {
      setImageProgress(0);
      const result = await uploadFiles([file], 'image', (progress) => {
        setImageProgress(progress);
      });
      if (result.length > 0) {
        setFormData(prev => ({ ...prev, imageUrl: result[0].url }));
      }
    } catch (err) {
      setUploadError("Failed to safely upload image asset to destination storage layer.");
    } finally {
      setImageProgress(null);
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    // Video Validation: Limit to less than 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Video verification failed: File size must be less than 5MB.");
      if (videoInputRef.current) videoInputRef.current.value = '';
      return;
    }

    try {
      setVideoProgress(0);
      const result = await uploadFiles([file], 'video', (progress) => {
        setVideoProgress(progress);
      });
      if (result.length > 0) {
        setFormData(prev => ({ ...prev, videoUrl: result[0].url }));
      }
    } catch (err) {
      setUploadError("Failed to safely upload video asset to destination storage layer.");
    } finally {
      setVideoProgress(null);
    }
  };

  const removeMedia = (type: 'image' | 'video') => {
    if (type === 'image') {
      setFormData(prev => ({ ...prev, imageUrl: null }));
      if (imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setFormData(prev => ({ ...prev, videoUrl: null }));
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();
    setUploadError(null);

    if (imageProgress !== null || videoProgress !== null) {
      alert("Please wait for all asset upload operations to finish synchronization.");
      return;
    }

    if (!formData.title || !formData.startDateTime || !formData.eventType || !formData.eventStatus || !formData.organizerId || !formData.audience) {
      alert("Please fill all required operational tokens.");
      return;
    }

    const startDt = new Date(formData.startDateTime);
    if (isNaN(startDt.getTime())) {
      alert("Invalid Start Timestamp schema structured.");
      return;
    }
    if (formData.endDateTime) {
      const endDt = new Date(formData.endDateTime);
      if (isNaN(endDt.getTime())) {
        alert("Invalid End Timestamp schema structured.");
        return;
      }
      if (endDt <= startDt) {
        alert("Temporal sequence violation: End parameters must execute post Start timeline.");
        return;
      }
    }

    if (formData.isPaid && (formData.price === null || isNaN(formData.price) || formData.price < 0)) {
      alert("Please balance structural ledger with a valid positive configuration price.");
      return;
    }
    if (!formData.isPaid) {
      formData.price = null; 
    }

    onSave(formData);
  };

  const isEdit = !!eventData;

  return (
        // Backdrop wrapper keeps full control of positioning context
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 animate-fadeIn">
      
      {/* Structural Card Container: Controlled via max-h-[90vh] and overflow-hidden */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-4xl transform transition-all relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Strip */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">System Configuration Modal</div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {isEdit ? `Modify Logs: ${eventData?.title}` : 'Initialize Dynamic Event Framework'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            title="Terminate Context"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body Viewport */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin">
          
          {/* Error Alert Display Grid */}
          {(error || uploadError) && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 text-rose-800 dark:text-rose-400 p-4 rounded-xl flex items-start justify-between text-xs font-semibold animate-shake">
              <div className="flex gap-2">
                <InformationCircleIcon className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <span>{error || uploadError}</span>
              </div>
              <button type="button" onClick={() => { resetError(); setUploadError(null); }} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Section 1: Core Identifiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <InformationCircleIcon className="h-4 w-4 text-indigo-500" /> General Descriptive Registry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Event Title <span className="text-rose-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Summary Header</label>
                <input type="text" name="summary" value={formData.summary || ''} onChange={handleChange} placeholder="Brief encapsulation matrix..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Detailed Description Meta</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} placeholder="Full contextual database markdown parameters..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Classification Type <span className="text-rose-500">*</span></label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                >
                  <option value="GENERAL">General</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="SPORTS">Sports</option>
                  <option value="CULTURAL">Cultural</option>
                  <option value="MEETING">Meeting</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="ORIENTATION">Orientation</option>
                  <option value="FUNDRAISER">Fundraiser</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Operational Lifecycle Status <span className="text-rose-500">*</span></label>
                <select name="eventStatus" value={formData.eventStatus} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="POSTPONED">Postponed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Temporal & Spatial Grid */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <CalendarDaysIcon className="h-4 w-4 text-emerald-500" /> Temporal & Spatial Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Start Execution Timestamp <span className="text-rose-500">*</span></label>
                <input type="datetime-local" name="startDateTime" value={formData.startDateTime.slice(0, 16)} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Termination Timestamp (Optional)</label>
                <input type="datetime-local" name="endDateTime" value={formData.endDateTime ? formData.endDateTime.slice(0, 16) : ''} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Physical Location Coordinates</label>
                <div className="relative">
                  <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder='e.g., "Main Stadium Hall"'
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
                  <MapPinIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Virtual Sync Meeting Channel URL</label>
                <input type="url" name="onlineMeetingLink" value={formData.onlineMeetingLink || ''} onChange={handleChange} placeholder="https://teams.microsoft.com/..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all" />
              </div>
            </div>
          </div>

          {/* Section 3: High-Fidelity Asset Upload Center */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <PhotoIcon className="h-4 w-4 text-purple-500" /> Media & Rich Asset Synchronization
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Image Cloud Dropzone (< 500KB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Promotional Image Cover <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Max 500KB)</span></label>
                
                {formData.imageUrl ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group bg-slate-50 dark:bg-slate-950 p-2">
                    <img src={formData.imageUrl} alt="Uploaded Track Cover" className="w-full h-36 object-contain rounded-xl bg-white dark:bg-slate-900" />
                    <button
                      type="button"
                      onClick={() => removeMedia('image')}
                      className="absolute top-4 right-4 bg-rose-600 text-white p-1.5 rounded-xl shadow-md hover:bg-rose-700 active:scale-90 transition-all opacity-90 group-hover:opacity-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[144px]
                      ${imageProgress !== null ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
                  >
                    <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
                    {imageProgress !== null ? (
                      <div className="space-y-2">
                        <ArrowPathIcon className="animate-spin h-6 w-6 text-indigo-500 mx-auto" />
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Syncing Media: {imageProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <PhotoIcon className="h-7 w-7 text-slate-400 dark:text-slate-500 mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload brand image cover</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Supports PNG, JPEG, WEBP up to 500KB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Video Cloud Dropzone (< 5MB) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Trailer / Explainer Video <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Max 5MB)</span></label>
                
                {formData.videoUrl ? (
                  <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group bg-slate-50 dark:bg-slate-950 p-2">
                    <video src={formData.videoUrl} controls className="w-full h-36 rounded-xl bg-black" />
                    <button
                      type="button"
                      onClick={() => removeMedia('video')}
                      className="absolute top-4 right-4 bg-rose-600 text-white p-1.5 rounded-xl shadow-md hover:bg-rose-700 active:scale-90 transition-all opacity-90 group-hover:opacity-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => videoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[144px]
                      ${videoProgress !== null ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}
                  >
                    <input type="file" ref={videoInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
                    {videoProgress !== null ? (
                      <div className="space-y-2">
                        <ArrowPathIcon className="animate-spin h-6 w-6 text-indigo-500 mx-auto" />
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Streaming Packet: {videoProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <VideoCameraIcon className="h-7 w-7 text-slate-400 dark:text-slate-500 mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload feature video log</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Supports MP4, WebM up to 5MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 4: Architecture Core Entities */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <UserGroupIcon className="h-4 w-4 text-purple-500" /> Governance & Scope Allocation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Administrative Coordinator <span className="text-rose-500">*</span></label>
                <select name="organizerId" value={formData.organizerId} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select Active Record --</option>
                  {allOrganizers.map(organizer => (
                    <option key={organizer.id} value={organizer.id}>{organizer.name} ({organizer.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Target Audience Segment <span className="text-rose-500">*</span></label>
                <select name="audience" value={formData.audience} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Select Vector Scope --</option>
                  <option value="ALL">All Users</option>
                  <option value="ACADEMIC_LEVEL">Academic Level(s)</option>
                  <option value="COURSE">Course(s)</option>
                  <option value="EDUCATOR">Educator(s)</option>
                  <option value="STUDENT">Student(s)</option>
                  <option value="DEPARTMENT">Department(s)</option>
                  <option value="STAFF">Staff Only</option>
                  <option value="PARENT">Parent(s)</option>
                </select>
              </div>

              {/* Dynamic Target Matrix Selectors */}
              {formData.audience === 'ACADEMIC_LEVEL' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Academic Framework Levers <span className="text-rose-500">*</span></label>
                  <select multiple name="targetAcademicLevelIds" value={formData.targetAcademicLevelIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allAcademicLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.audience === 'COURSE' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Dynamic Course Entities <span className="text-rose-500">*</span></label>
                  <select multiple name="targetCourseIds" value={formData.targetCourseIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.audience === 'EDUCATOR' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Mentorship/Educator Staff <span className="text-rose-500">*</span></label>
                  <select multiple name="targetEducatorIds" value={formData.targetEducatorIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allEducators.map(educator => (
                      <option key={educator.id} value={educator.id}>{educator.name} ({educator.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.audience === 'STUDENT' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Enrolled Students <span className="text-rose-500">*</span></label>
                  <select multiple name="targetStudentIds" value={formData.targetStudentIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allStudents.map(student => (
                      <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.audience === 'DEPARTMENT' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Departments <span className="text-rose-500">*</span></label>
                  <select multiple name="targetDepartmentIds" value={formData.targetDepartmentIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.audience === 'PARENT' && (
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Target Guardians/Parents <span className="text-rose-500">*</span></label>
                  <select multiple name="targetParentIds" value={formData.targetParentIds} onChange={handleMultiSelectChange} required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs h-28 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    {allParents.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Ledger Balance & Cap */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <CurrencyDollarIcon className="h-4 w-4 text-amber-500" /> Transactional & Gate Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-950/30 p-5 border border-slate-100 dark:border-slate-800 rounded-2xl">
              
              {/* Registration Settings */}
              <div className="space-y-3">
                <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer selection:bg-transparent">
                  <input type="checkbox" name="isRegistrationRequired" checked={formData.isRegistrationRequired} onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-slate-200 dark:border-slate-700 rounded focus:ring-indigo-500 cursor-pointer bg-white dark:bg-slate-800" />
                  <span className="ml-2">Require Prior Access Registration</span>
                </label>
                
                {formData.isRegistrationRequired && (
                  <div className="animate-fadeIn">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Max Cap Gatekeeper Limit</label>
                    <input type="number" name="maxCapacity" value={formData.maxCapacity || ''} onChange={handleChange} min="1" placeholder="Infinite nodes if blank"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm" />
                  </div>
                )}
              </div>

              {/* Pricing Core Logic */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                <label className="flex items-center text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer selection:bg-transparent">
                  <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-slate-200 dark:border-slate-700 rounded focus:ring-indigo-500 cursor-pointer bg-white dark:bg-slate-800" />
                  <span className="ml-2">Require Microtransaction Gate</span>
                </label>
                
                {formData.isPaid && (
                  <div className="animate-fadeIn">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Value Asset Cost (USD) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input type="number" name="price" value={formData.price || ''} onChange={handleChange} min="0" step="0.01" required={formData.isPaid} placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm" />
                      <span className="text-xs font-bold text-slate-400 absolute left-3 top-2.5">$</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 6: Secondary Contact Node Logs */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 select-none">
              <InformationCircleIcon className="h-4 w-4 text-slate-400" /> Public Inquiry Contact Anchors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Delegate Fullname</label>
                <input type="text" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Secure Contact Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Inquiry Phone Channel</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
            </div>
          </div>

        </form>

        {/* Footer Submits Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            disabled={isLoading}
          >
            Cancel Pipeline
          </button>
          
          <button
            type="submit"
            onClick={(e) => {
              // Redirect click execution directly into submission scheme triggers
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            disabled={isLoading || imageProgress !== null || videoProgress !== null}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin h-4 w-4" />
                <span>Synchronizing Commit...</span>
              </>
            ) : (
              <span>{isEdit ? 'Save Framework Changes' : 'Publish New Event Log'}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}