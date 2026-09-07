"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ClockIcon,
  PaperClipIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

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

// --- TYPES ---
interface Material {
  id: string;
  title: string;
  type: "DOCUMENT" | "VIDEO" | "LINK";
  fileUrl?: string;
  linkUrl?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;

  isFreePreview: boolean;
  isPublished: boolean;

  teacherNotes?: string;
  objectives: string[];

  materials: Material[];
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;

  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;

  code: string;
  price?: number;
  duration?: string;
  rating?: number;

  status: string;

  companyId: string;

  modules: Module[];
}

// --- MODALS ---
const AddEditModuleModal = ({ isOpen, onClose, courseId, companyId, onAdded, editData, course }: any) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) setTitle(editData.title);
    else setTitle("");
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editData 
        ? `${apiBaseUrl}/admin/fitness-curriculum/module/${editData.id}`
        : `${apiBaseUrl}/admin/fitness-curriculum/module`;
      
      const method = editData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, courseId, companyId, order: editData?.order ?? ((course?.modules?.length || 0) + 1) }),
      });
      const data = await res.json();
      if (data.success) { onAdded(); onClose(); setTitle(""); }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60" />
        <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{editData ? "Modify Module Setup" : "Create Module Container"}</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><XMarkIcon className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Module Title</label>
              <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-indigo-400" placeholder="e.g., Phase 1: Metabolic Adaptation" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
              <button disabled={isSubmitting} className="inline-flex min-w-[100px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {isSubmitting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : editData ? "Apply Structural Changes" : "Save Module"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditModuleModal;