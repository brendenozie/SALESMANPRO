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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

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

const AddEditLessonModal = ({ isOpen, onClose, moduleId, onAdded, editData, course }: any) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [objectives, setObjectives] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setDuration(editData.duration?.toString() || "");
      setDescription(editData.description || "");
      setContent(editData.content || "");
      setTeacherNotes(editData.teacherNotes || "");
      setVideoUrl(editData.videoUrl || "");
      setObjectives(editData.objectives?.join("\n") || "");
      setIsPublished(editData.isPublished || false);
      setIsFreePreview(editData.isFreePreview || false);
    } else {
      setTitle("");
      setDuration("");
      setDescription("");
      setContent("");
      setTeacherNotes("");
      setVideoUrl("");
      setObjectives("");
      setIsPublished(false);
      setIsFreePreview(false);
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editData 
        ? `${apiBaseUrl}/admin/fitness-curriculum/lesson/${editData.id}`
        : `${apiBaseUrl}/admin/fitness-curriculum/lesson`;

      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
              title,
              moduleId,
              duration: Number(duration),
              order:
                editData?.order ??
                ((course?.modules
                  ?.find((m: any) => m.id === moduleId)
                  ?.lessons?.length || 0) + 1),

              description,
              content,
              teacherNotes,
              videoUrl,

              objectives: objectives
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),

              isPublished,
              isFreePreview,
            })
      });
      const data = await res.json();
      if (data.success) { onAdded(); onClose(); setTitle(""); setDuration(""); }
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{editData ? "Modify Lesson Schema" : "Create Instructional Lesson"}</h3>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><XMarkIcon className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lesson Name</label>
              <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="e.g., Form Foundations: Deadlift" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Expected Duration (Minutes)</label>
              <input type="number" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="15" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Video URL
                </label>

                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Learning Objectives
                </label>

                <textarea
                  rows={4}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="One objective per line"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Teacher Notes
                </label>

                <textarea
                  rows={4}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Full Lesson Content
                </label>

                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  Published
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isFreePreview}
                    onChange={(e) => setIsFreePreview(e.target.checked)}
                  />
                  Free Preview
                </label>
              </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
              <button disabled={isSubmitting} className="inline-flex min-w-[100px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {isSubmitting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : editData ? "Save Record Modifications" : "Save Lesson"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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

// --- MAIN CRUD DETAILS CLIENT VIEW ---
export default function ProgramDetailsClient({ programId }: { slug: string; programId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Base Course Details Form Edit State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaTargetAudience, setMetaTargetAudience] = useState("");
  const [metaDifficultyLevel, setMetaDifficultyLevel] = useState("BEGINNER");
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);

  // Modals Controller Context states
  const [isModuleModalOpen, setModuleModalOpen] = useState(false);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<any | null>(null);
  
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<any | null>(null);
  const [isLessonModalOpen, setLessonModalOpen] = useState(false);
  
  const [activeLessonForResource, setActiveLessonForResource] = useState<string | null>(null);

  // Destructive Prompt Control Hooks
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-programs/${programId}`, {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        setCourse(json.data);
        setMetaTitle(json.data.title || "");
        setMetaDescription(json.data.description || "");
        setMetaTargetAudience(json.data.targetAudience || "");
        setMetaDifficultyLevel(json.data.difficultyLevel || "BEGINNER");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => { fetchDetails(); }, [programId]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMeta(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-programs/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metaTitle,
          description: metaDescription,
          targetAudience: metaTargetAudience,
          difficultyLevel: metaDifficultyLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingMetadata(false);
        fetchDetails();
      } else {
        alert(`Failed to save details: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  // Delete Core Action Workers
  const handleDeleteNode = async (id: string, type: "module" | "lesson" | "material") => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/${type}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setIsDeletingId(null);
        fetchDetails();
      } else {
        alert(`Deletion error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center gap-3">
        <ArrowPathIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Dynamic Schema Container...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-8 flex items-center justify-center">
        <div className="text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 max-w-sm shadow-sm">
          <p className="font-bold text-lg">Program Structural Layer Missing</p>
          <p className="text-sm text-slate-500 mt-1">The structural record identity requested is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Workspace Base Header Segment */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase">Academic Core Blueprint</span>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl mt-0.5">{course.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
          {course.code && (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800">
              {course.code}
            </span>
          )}

          {course.status && (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
              {course.status}
            </span>
          )}

          {course.duration && (
            <span className="text-xs text-slate-500">
              {course.duration}
            </span>
          )}

          {course.price && (
            <span className="text-xs text-slate-500">
              ${course.price}
            </span>
          )}
        </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditingMetadata(!isEditingMetadata)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              {isEditingMetadata ? "View Structure" : "Edit Details"}
            </button>
            <button onClick={() => { setSelectedModuleForEdit(null); setModuleModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">
              <PlusCircleIcon className="w-5 h-5" />
              Add Module
            </button>
          </div>
        </div>

        {/* Dynamic Program Metadata Workspace Panel */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800/60 dark:bg-slate-900 transition-all duration-200">
          {isEditingMetadata ? (
            <form onSubmit={handleUpdateMetadata} className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <AcademicCapIcon className="w-4 h-4" /> Program Metadata Configurations
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Program Title</label>
                  <input required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Target Audience</label>
                  <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="e.g., Post-partum mothers, Athletes" value={metaTargetAudience} onChange={(e) => setMetaTargetAudience(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Difficulty Tier</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800" value={metaDifficultyLevel} onChange={(e) => setMetaDifficultyLevel(e.target.value)}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Comprehensive Overview Summary</label>
                  <textarea rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white dark:border-slate-700 dark:bg-slate-800" placeholder="Describe the curriculum milestones..." value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditingMetadata(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">Cancel</button>
                <button disabled={isUpdatingMeta} className="inline-flex min-w-[120px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                  {isUpdatingMeta ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 grid grid-cols-1 gap-6 sm:grid-cols-3 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview / Focus Scope</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {course.description || "No descriptive baseline mapping has been recorded for this curriculum structure container yet."}
                  </p>
                </div>
              </div>
              <div className="space-y-4 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6 dark:border-slate-800">
                {/* <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Segment</h4>
                  <span className="mt-1 inline-block text-sm font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {course.targetAudience || "General Public"}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Difficulty Tier</h4>
                  <span className={`mt-1 inline-block text-xs font-bold px-2.5 py-1 rounded-md ${
                    course.difficultyLevel === "ADVANCED" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" :
                    course.difficultyLevel === "INTERMEDIATE" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  }`}>
                    {course.difficultyLevel || "BEGINNER"}
                  </span>
                </div> */}
              </div>
            </div>
          )}
        </div>

        {/* Structural Workspace Accordion Hub */}
        <div className="mt-8 space-y-4">
          {course.modules?.map((mod) => (
            <div key={mod.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xs dark:border-slate-800/60 dark:bg-slate-900 transition-all duration-200">
              
              {/* Module Header Strip */}
              <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/40 border-b border-transparent dark:border-transparent">
                <div onClick={() => toggleModule(mod.id)} className="flex items-center gap-3 truncate pr-4 cursor-pointer flex-1 min-w-0">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg flex-shrink-0">
                    <BookOpenIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{mod.title}</h3>
                </div>
                
                {/* Management Utilities Matrix for Module Container */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button title="Edit Module Content" onClick={() => { setSelectedModuleForEdit(mod); setModuleModalOpen(true); }} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-indigo-400 transition">
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  
                  {isDeletingId === mod.id ? (
                    <div className="flex items-center border border-rose-200 dark:border-rose-900/50 rounded-lg overflow-hidden bg-rose-50 dark:bg-rose-950/20">
                      <button onClick={() => handleDeleteNode(mod.id, "module")} className="px-2.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center gap-0.5">
                        <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" /> Verify
                      </button>
                      <button onClick={() => setIsDeletingId(null)} className="px-2 py-1 text-xs font-semibold text-slate-500 border-l border-rose-200 dark:border-rose-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button title="Delete Module Block" onClick={() => setIsDeletingId(mod.id)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500 dark:hover:text-rose-400 transition">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}

                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
                  
                  <motion.div onClick={() => toggleModule(mod.id)} className="p-1 cursor-pointer" animate={{ rotate: expandedModules[mod.id] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                  </motion.div>
                </div>
              </div>

              {/* Nested Lessons Structural Expansion Mapping */}
              <AnimatePresence initial={false}>
                {expandedModules[mod.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                    <div className="border-t border-slate-100 p-5 space-y-4 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20">
                      
                      {mod.lessons?.map((lesson) => (
                        <div key={lesson.id} className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/40 dark:border-slate-800/40 dark:bg-slate-950/20">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                  {lesson.description}
                                </p>
                              )}
                              {lesson.videoUrl && (
                                <a
                                  href={lesson.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400"
                                >
                                  <VideoCameraIcon className="w-3.5 h-3.5" />
                                  Watch Lesson Video
                                </a>
                              )}
                              {lesson.objectives?.length > 0 && (
                                <div className="pt-2 space-y-1">
                                  {lesson.objectives.map((objective, idx) => (
                                    <div
                                      key={idx}
                                      className="text-[11px] text-slate-500 dark:text-slate-400"
                                    >
                                      • {objective}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-2 py-0.5 rounded-md">
                                <ClockIcon className="w-3 h-3 text-slate-400" />
                                <span>{lesson.duration}m</span>
                              </div>
                            </div>
                            
                            {/* Inner Asset Attachment Sub-Badges */}
                            {lesson.materials && lesson.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {lesson.materials.map((mat) => (
                                  <div key={mat.id} className="group relative inline-flex items-center gap-1.5 text-[11px] font-medium bg-white border border-slate-200 text-slate-700 pr-1 pl-2 py-0.5 rounded-md dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 shadow-xs transition hover:border-slate-300 dark:hover:border-slate-700">
                                    {mat.type === "VIDEO" ? (
                                      <VideoCameraIcon className="w-3 h-3 text-sky-500 flex-shrink-0" />
                                    ) : mat.type === "LINK" ? (
                                      <LinkIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                      <DocumentTextIcon className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                    )}
                                    <span className="truncate max-w-[110px]">{mat.title}</span>
                                    
                                    {/* Inline Instant Material Disposal Control */}
                                    <button onClick={() => handleDeleteNode(mat.id, "material")} className="p-0.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition">
                                      <XMarkIcon className="w-3 h-3 stroke-[2.5]" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Button Set per Lesson Unit */}
                          <div className="flex items-center gap-2 self-end md:self-start flex-shrink-0">
                            <button onClick={() => setActiveLessonForResource(lesson.id)} className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-indigo-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition dark:bg-slate-900 dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800 shadow-xs">
                              <PaperClipIcon className="w-3.5 h-3.5" />
                              Attach
                            </button>
                            
                            <button title="Edit Lesson Parameter Values" onClick={() => { setSelectedLessonForEdit(lesson); setActiveModuleForLesson(mod.id); setLessonModalOpen(true); }} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-indigo-400 transition shadow-xs">
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>

                            {isDeletingId === lesson.id ? (
                              <div className="flex items-center border border-rose-200 dark:border-rose-900/50 rounded-lg overflow-hidden bg-rose-50 dark:bg-rose-950/20 shadow-xs">
                                <button onClick={() => handleDeleteNode(lesson.id, "lesson")} className="px-2 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition">
                                  Confirm
                                </button>
                                <button onClick={() => setIsDeletingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border-l border-rose-200 dark:border-rose-900/50">
                                  <XMarkIcon className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button title="Delete Lesson Node" onClick={() => setIsDeletingId(lesson.id)} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 dark:border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 dark:hover:text-rose-400 transition shadow-xs">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Handle Trigger Box */}
                      <button onClick={() => { setSelectedLessonForEdit(null); setActiveModuleForLesson(mod.id); setLessonModalOpen(true); }} className="w-full py-2.5 border border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:border-indigo-500/50 dark:border-slate-800 dark:text-slate-400 dark:hover:text-indigo-400 transition flex items-center justify-center gap-1.5 bg-slate-50/20 dark:bg-slate-950/10">
                        <PlusCircleIcon className="w-4 h-4" />
                        Add Instructional Lesson
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CONFIGURATIONS INJECTION IN LAYOUT PORTAL */}
      <AddEditModuleModal isOpen={isModuleModalOpen} onClose={() => { setModuleModalOpen(false); setSelectedModuleForEdit(null); }} courseId={programId} companyId={course.companyId} onAdded={fetchDetails} editData={selectedModuleForEdit} />
      <AddEditLessonModal isOpen={isLessonModalOpen} onClose={() => { setLessonModalOpen(false); setSelectedLessonForEdit(null); }} moduleId={activeModuleForLesson} onAdded={fetchDetails} editData={selectedLessonForEdit} />
      <AddResourceModal isOpen={activeLessonForResource !== null} onClose={() => setActiveLessonForResource(null)} courseId={programId} lessonId={activeLessonForResource} onAdded={fetchDetails} />
    </div>
  );
}