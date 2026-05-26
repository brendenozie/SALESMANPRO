"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDaysIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  PhotoIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

interface Program {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: "active" | "draft" | "inactive";
  type: "class" | "program";
  instructor: string;
  instructorId?: string;
  duration: string;
  price: number;
}

interface TrainerSelectOption {
  id: string;
  name: string;
  specialty?: string;
}

interface Props {
  slug: string;
}

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

// --- Card Component ---
const ProgramCard = ({ 
  program, 
  slug, 
  onEdit, 
  onDelete 
}: { 
  program: Program; 
  slug: string; 
  onEdit: () => void; 
  onDelete: () => void; 
}) => {
  const router = useRouter();

  const statusStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    draft: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    inactive: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  };

  const typeStyles = {
    program: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    class: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  };

  const handleCardClick = () => {
    router.push(`/admin/${slug}/fitness-classes/${program.id}`);
  };

  return (
    <motion.div
      layout
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/50 dark:bg-slate-900"
      whileHover={{ y: -4 }}
    >
      {/* Media Cover Graphic Container */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-950 flex-shrink-0 overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
        {program.imageUrl ? (
          <img 
            src={program.imageUrl} 
            alt={program.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600">
            <PhotoIcon className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}
        
        {/* Badges Stack Overlap */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${typeStyles[program.type] || typeStyles.program}`}>
            {program.type === "class" ? "Class Block" : "Program"}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${statusStyles[program.status] || statusStyles.draft}`}>
            {program.status}
          </span>
        </div>
      </div>

      {/* Content Meta Space */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1.5">
            {program.name}
          </h4>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
            {program.description}
          </p>
          
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <UserIcon className="mr-2.5 w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{program.instructor || "Unassigned Specialist"}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <CalendarDaysIcon className="mr-2.5 w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium">{program.duration}</span>
            </div>
          </div>
        </div>

        {/* Pricing & Control Matrix Row */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Valuation</span>
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
              ${Number(program.price).toFixed(2)}
            </span>
          </div>
          
          <div className="flex gap-1.5">
            <button 
              onClick={handleCardClick}
              className="p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-xl text-slate-600 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-500/10 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-indigo-400 transition"
              title="Curriculum Structure"
            >
              <AcademicCapIcon className="w-4 h-4 stroke-[2]" />
            </button>
            <button 
              onClick={onEdit}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-white transition"
              title="Modify Details"
            >
              <PencilIcon className="w-4 h-4 stroke-[2]" />
            </button>
            <button 
              onClick={onDelete}
              className="p-2 bg-rose-50/60 hover:bg-rose-100 border border-rose-100 rounded-xl text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/10 dark:text-rose-400 transition"
              title="Purge Offering"
            >
              <TrashIcon className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Polymorphic Form Modal Component (Handles Create & Update) ---
const ProgramFormModal = ({ isOpen, onClose, onSave, program, slug }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    duration: "",
    price: 0,
    instructorId: "",
    instructor: "",
    status: "draft" as "active" | "draft" | "inactive",
    type: "program" as "class" | "program",
    imageUrl: "",
    companyId: slug
  });
  
  const [trainers, setTrainers] = useState<TrainerSelectOption[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dynamic trainer listings matching Company Id context constraints
  useEffect(() => {
    if (isOpen && slug) {
      const fetchTrainers = async () => {
        setLoadingTrainers(true);
        try {
          const res = await fetch(`${apiBaseUrl}/admin/trainers?companyId=${slug}`, { credentials: "include" });
          if (res.ok) {
            const result = await res.json();
            setTrainers(result.data || []);
          }
        } catch (error) {
          console.error("Error loading profile identities roster mapping paths", error);
        } finally {
          setLoadingTrainers(false);
        }
      };
      fetchTrainers();
    }
  }, [isOpen, slug]);

  useEffect(() => {
    if (program) {
      setFormData({
        id: program.id || "",
        name: program.name || "",
        description: program.description || "",
        duration: program.duration || "",
        price: program.price || 0,
        instructorId: program.instructorId || "",
        instructor: program.instructor || "",
        status: program.status || "draft",
        type: program.type || "program",
        imageUrl: program.imageUrl || "",
        companyId: slug
      });
    } else {
      setFormData({
        id: "",
        name: "",
        description: "",
        duration: "",
        price: 0,
        instructorId: "",
        instructor: "",
        status: "draft",
        type: "program",
        imageUrl: "",
        companyId: slug
      });
    }
    setSelectedFile(null);
    setUploadProgress(null);
  }, [program, isOpen, slug]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTrainerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData(prev => ({ ...prev, instructorId: "", instructor: "" }));
      return;
    }
    const matchingTrainer = trainers.find(t => t.id === selectedId);
    setFormData(prev => ({
      ...prev,
      instructorId: selectedId,
      instructor: matchingTrainer ? matchingTrainer.name : ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let currentImageUrl = formData.imageUrl;

      if (selectedFile) {
        setUploadProgress(0);
        const uploadResult = await uploadFiles([selectedFile], "image", (progress) => {
          setUploadProgress(progress);
        });
        if (uploadResult && uploadResult.length > 0) {
          currentImageUrl = uploadResult[0].url;
        }
      }

      const payload = {
        ...formData,
        imageUrl: currentImageUrl,
      };

      const url = program 
        ? `${apiBaseUrl}/admin/fitness-classes/${program.id}?id=${slug}`
        : `${apiBaseUrl}/admin/fitness-classes?id=${slug}`;
        
      const method = program ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (responseData.success || responseData.data) {
        onSave(responseData.data || { ...payload, id: program?.id });
        onClose();
      } else {
        alert(`Server Error: ${responseData.message || "Action failed validation checks."}`);
      }
    } catch (error) {
      console.error("Critical submission failure encountered", error);
      alert("Failed to preserve configuration rules.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="relative z-10 flex h-full max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {program ? "Modify Existing Program" : "Create New Track Offering"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure public catalog and structure parameters.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Context */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Asset Cover Field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Asset Cover Graphic</label>
              <div className="flex gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800 dark:bg-slate-900 flex-shrink-0 relative">
                  {selectedFile ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Current" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoIcon className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-grow">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-sm font-semibold rounded-xl text-slate-700 transition shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Select New Image
                  </button>
                  {selectedFile && <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 truncate max-w-xs">{selectedFile.name}</p>}
                  {uploadProgress !== null && (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-1 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Config Meta Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status Visibility</label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
                  >
                    <option value="draft">Draft Mode</option>
                    <option value="active">Active Listing</option>
                    <option value="inactive">Archived / Inactive</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3.5 top-3 w-4 h-4 pointer-events-none text-slate-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Structural Variant</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400"
                  >
                    <option value="program">Program Structure</option>
                    <option value="class">Class Session Block</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3.5 top-3 w-4 h-4 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>

            {/* Title Identity field */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Program Title</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                placeholder="e.g. Advanced Hypertrophy Track"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Scope description text space */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scope Summary Summary</label>
              <textarea
                required
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 resize-none"
                placeholder="Provide a breakdown of what participants will achieve..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Structural metrics layout block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Timeline Duration</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  placeholder="e.g. 12 Weeks"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Valuation Price ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Dynamic Trainer API Selection Dropdown */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Instructor Lead</label>
              <div className="relative">
                <select
                  value={formData.instructorId}
                  onChange={handleTrainerChange}
                  disabled={loadingTrainers}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="">-- {loadingTrainers ? "Syncing Roster..." : "Select Active Instructor"} --</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} {trainer.specialty ? `(${trainer.specialty})` : ""}
                    </option>
                  ))}
                </select>
                {loadingTrainers ? (
                  <ArrowPathIcon className="absolute right-3.5 top-3 w-4 h-4 animate-spin text-indigo-500" />
                ) : (
                  <ChevronDownIcon className="absolute right-3.5 top-3 w-4 h-4 pointer-events-none text-slate-400" />
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {formData.instructorId ? `Mapped Identity Key Reference: ${formData.instructorId}` : "Instructors are derived automatically from your active team directory."}
              </p>
            </div>
          </form>

          {/* Sticky Actions Footer Layout Context */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 min-w-[120px]">
              {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : program ? "Save Changes" : "Publish Program"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- Main Client Component Area Layout Engine ---
export default function ProgramsClient({ slug }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/admin/fitness-classes?id=${slug}`, { credentials: "include" });
        const json = await res.json();
        setPrograms(json.data || []);
      } catch (error) {
        console.error("Failed to load programs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [slug]);

  const handleOpenAddModal = () => {
    setEditingProgram(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleSaveProgram = (savedProgram: Program) => {
    if (editingProgram) {
      setPrograms((prev) => prev.map((p) => p.id === savedProgram.id ? savedProgram : p));
    } else {
      setPrograms((prev) => [savedProgram, ...prev]);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm("Are you absolutely sure you want to terminate this operational program module path?")) return;

    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-classes/${programId}?id=${slug}`, {
        method: "DELETE"
      });
      const responseData = await res.json();

      if (responseData.success || res.ok) {
        setPrograms((prev) => prev.filter((p) => p.id !== programId));
      } else {
        alert(`Delete Failed: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Failure executing delete mutation", error);
      alert("Encountered connection exceptions clearing data references.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Navigation Action Dashboard Row */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Programs & Sessions</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 text-balance">
              Manage custom user tracks, pricing levels, and assign team rosters to operational nodes.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Add New Offering
          </button>
        </div>

        {/* Content Section Grid Board */}
        <main className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {programs.map((p) => (
                  <ProgramCard 
                    key={p.id} 
                    program={p} 
                    slug={slug} 
                    onEdit={() => handleOpenEditModal(p)}
                    onDelete={() => handleDeleteProgram(p.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && programs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800 max-w-xl mx-auto mt-10">
              <AcademicCapIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Catalog Empty</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Create your first commercial fitness course or single session class metric block to populate your public storefront.
              </p>
            </div>
          )}
        </main>
      </div>

      <ProgramFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProgram}
        program={editingProgram}
        slug={slug}
      />
    </div>
  );
}