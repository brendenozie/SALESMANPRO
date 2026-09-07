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

const AddResourceModal = ({ isOpen, onClose, courseId, lessonId, onAdded }: any) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DOCUMENT");
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const session = useSession();
  const educatorId = session.data?.user?.id || "65f1a2b3c4d5e6f7a8b9c0d1";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalUrl = externalUrl;

      if (type !== "LINK" && selectedFile) {
        const uploadType = type === "VIDEO" ? "video" : "book";
        const uploadResult = await uploadFiles([selectedFile], uploadType, (progress) => {
          setUploadProgress(progress);
        });
        if (uploadResult && uploadResult.length > 0) {
          finalUrl = uploadResult[0].url;
        }
      }

      const payload = {
        title,
        type,
        fileUrl: type !== "LINK" ? finalUrl : undefined,
        linkUrl: type === "LINK" ? finalUrl : undefined,
        courseId,
        lessonId,
        uploadedById: educatorId
      };

      const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        onAdded();
        onClose();
        setTitle("");
        setExternalUrl("");
        setSelectedFile(null);
        setUploadProgress(null);
        setType("DOCUMENT");
      } else {
        alert(`Error saving asset: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Attach Resource Asset</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><XMarkIcon className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Asset Display Label</label>
              <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="e.g., Macro Calculation Blueprint" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resource Category Type</label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" value={type} onChange={(e) => { setType(e.target.value); setSelectedFile(null); setExternalUrl(""); }}>
                <option value="DOCUMENT">Document (PDF / Guide Guide Upload)</option>
                <option value="VIDEO">Video Vault Stream Asset (MP4 / MOV)</option>
                <option value="LINK">External Link Resource Location</option>
              </select>
            </div>

            {type === "LINK" ? (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resource Destination URL</label>
                <input required type="url" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="https://example.com/vault" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">File Payload Storage Attachment</label>
                <div className="group relative border-2 border-dashed border-slate-200 hover:border-indigo-500/60 dark:border-slate-700 dark:hover:border-indigo-400/50 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 transition">
                  <input required={!selectedFile} type="file" accept={type === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,.epub"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                  <CloudArrowUpIcon className="w-7 h-7 text-slate-400 mx-auto mb-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium truncate max-w-xs mx-auto">
                    {selectedFile ? selectedFile.name : `Drop or select item file`}
                  </span>
                </div>
              </div>
            )}

            {uploadProgress !== null && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
              <button disabled={isSubmitting} className="inline-flex min-w-[130px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    {uploadProgress !== null ? `${uploadProgress}%` : "Processing"}
                  </span>
                ) : (
                  "Attach Resource"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddResourceModal;