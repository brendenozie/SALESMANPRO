// app/admin/[adminSlug]/schedule/ScheduleClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { format, parseISO, isValid } from "date-fns";
import Image, { StaticImageData } from "next/image";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

/* ---------------------------
   Types
   --------------------------- */
interface ImageLoaderProps {
  src: string | StaticImageData;
  width: number;
  quality?: number;
}

interface Photo {
  id: string;
  imageUrl: string;
}

interface Video {
  id: string;
  thumbnailUrl: string;
}

interface PhotoAlbum {
  id: string;
  title: string;
  photos: Photo[];
}

interface VideoAlbum {
  id: string;
  title: string;
  videos: Video[];
}

interface BaseContent {
  id: string;
  title: string;
  publishDate: string;
  type: "Article" | "PhotoAlbum" | "VideoAlbum";
}

interface ArticleContent extends BaseContent {
  type: "Article";
}

interface PhotoAlbumContent extends BaseContent {
  type: "PhotoAlbum";
  photoAlbumId: string;
  photoAlbum: PhotoAlbum;
}

interface VideoAlbumContent extends BaseContent {
  type: "VideoAlbum";
  videoAlbumId: string;
  videoAlbum: VideoAlbum;
}

type ScheduledContent = ArticleContent | PhotoAlbumContent | VideoAlbumContent;

interface ScheduleClientProps {
  companyId: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: ScheduledContent | null;
  isSubmitting: boolean;
}

interface ScheduleFormData {
  title: string;
  type: "Article" | "PhotoAlbum" | "VideoAlbum";
  publishDate: string;
  photoAlbumId: string;
  videoAlbumId: string;
}

interface ScheduleFormProps {
  onSubmit: (formData: ScheduleFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  photoAlbums: PhotoAlbum[];
  videoAlbums: VideoAlbum[];
}

interface ContentCardProps {
  content: ScheduledContent;
  onDelete: (content: ScheduledContent) => void;
}

/* Next image loader */
const loader = ({ src, width, quality }: ImageLoaderProps) =>
  `${typeof src === "string" ? src : src.src}?w=${width}&q=${quality || 75}`;

/* Safe date formatter */
function formatDate(iso?: string) {
  if (!iso) return "—";
  const parsed = parseISO(iso);
  return isValid(parsed) ? format(parsed, "MMM d, yyyy h:mm a") : iso;
}

/* Layout Wrapper */
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

/* Reusable Modal */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  const sizeClasses: Record<string, string> = {
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full ${sizeClasses[size]} p-8 transform-gpu`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
          <h3 className="text-3xl font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

/* Delete Confirmation Modal */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, item, isSubmitting }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" size="sm">
      <p className="text-gray-300 mb-6 text-lg">
        Are you sure you want to delete <strong className="text-white">"{item?.title || "this item"}"</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-600">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold ${isSubmitting ? "bg-red-800 text-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
        >
          {isSubmitting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
};

/* Schedule Form Component */
const ScheduleForm: React.FC<ScheduleFormProps> = ({ onSubmit, onCancel, isSubmitting, photoAlbums, videoAlbums }) => {
  const [form, setForm] = useState<ScheduleFormData>({
    title: "",
    type: "Article",
    publishDate: "",
    photoAlbumId: "",
    videoAlbumId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input name="title" value={form.title} onChange={handleChange} required className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Content Type</label>
        <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3">
          <option value="Article">Article</option>
          <option value="PhotoAlbum">Photo Album</option>
          <option value="VideoAlbum">Video Album</option>
        </select>
      </div>

      {form.type === "PhotoAlbum" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Select Photo Album</label>
          <select name="photoAlbumId" value={form.photoAlbumId} onChange={handleChange} required className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3">
            <option value="">-- Select an album --</option>
            {photoAlbums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
      )}

      {form.type === "VideoAlbum" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Select Video Album</label>
          <select name="videoAlbumId" value={form.videoAlbumId} onChange={handleChange} required className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3">
            <option value="">-- Select an album --</option>
            {videoAlbums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Publish Date</label>
        <input name="publishDate" type="datetime-local" value={form.publishDate} onChange={handleChange} required className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3" />
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full bg-gray-700 hover:bg-gray-600">Cancel</button>
        <button type="submit" disabled={isSubmitting} className={`px-6 py-3 rounded-full font-semibold ${isSubmitting ? "bg-indigo-800 text-gray-400" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
          {isSubmitting ? "Scheduling..." : "Schedule Content"}
        </button>
      </div>
    </form>
  );
};

/* Content Cards */
const PhotoAlbumContentCard: React.FC<ContentCardProps> = ({ content, onDelete }) => {
  if (content.type !== "PhotoAlbum") return null;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group">
      <div className="p-6 flex items-center space-x-4">
        <div className="flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden border border-gray-700">
          <Image src={content.photoAlbum?.photos?.[0]?.imageUrl || "https://placehold.co/100x100/1e293b/d1d5db?text=Album"} alt={content.title} fill loader={loader} className="object-cover" />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
          <p className="text-sm text-gray-400 mb-2">Photo Album</p>
          <p className="text-xs text-gray-500">Scheduled for: {formatDate(content.publishDate)}</p>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button onClick={() => onDelete(content)} className="p-2 rounded-full bg-gray-900/70 text-red-400 hover:bg-red-900/50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Delete Album"><TrashIcon className="h-5 w-5" /></motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const VideoAlbumContentCard: React.FC<ContentCardProps> = ({ content, onDelete }) => {
  if (content.type !== "VideoAlbum") return null;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group">
      <div className="p-6 flex items-center space-x-4">
        <div className="flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden border border-gray-700">
          <Image src={content.videoAlbum?.videos?.[0]?.thumbnailUrl || "https://placehold.co/100x100/1e293b/d1d5db?text=Video"} alt={content.title} fill loader={loader} className="object-cover" />
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
          <p className="text-sm text-gray-400 mb-2">Video Album</p>
          <p className="text-xs text-gray-500">Scheduled for: {formatDate(content.publishDate)}</p>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button onClick={() => onDelete(content)} className="p-2 rounded-full bg-gray-900/70 text-red-400 hover:bg-red-900/50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Delete Album"><TrashIcon className="h-5 w-5" /></motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ArticleContentCard: React.FC<ContentCardProps> = ({ content, onDelete }) => {
  if (content.type !== "Article") return null;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group">
      <div className="p-6">
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
          <p className="text-sm text-gray-400 mb-2">Article</p>
          <p className="text-xs text-gray-500">Scheduled for: {formatDate(content.publishDate)}</p>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button onClick={() => onDelete(content)} className="p-2 rounded-full bg-gray-900/70 text-red-400 hover:bg-red-900/50" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Delete Content"><TrashIcon className="h-5 w-5" /></motion.button>
        </div>
      </div>
    </motion.div>
  );
};

/* ---------------------------
   Client Root Component
   --------------------------- */
export default function ScheduleClient({ companyId }: ScheduleClientProps) {
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [photoAlbums, setPhotoAlbums] = useState<PhotoAlbum[]>([]);
  const [videoAlbums, setVideoAlbums] = useState<VideoAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ScheduledContent | null>(null);

  const fetchScheduledContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/content?companyId=${companyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Failed to fetch content");
      const data: ScheduledContent[] = (await res.json()).data || [];
      setScheduledContent(data || []);
    } catch {
      setScheduledContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchAlbums = useCallback(async () => {
    try {
      const [photoRes, videoRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/photos-albums?companyId=${companyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
        fetch(`${apiBaseUrl}/admin/videos-albums?companyId=${companyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }),
      ]);
      if (photoRes.ok) {
        const photos: PhotoAlbum[] = (await photoRes.json()).data || [];
        setPhotoAlbums(photos || []);
      }
      if (videoRes.ok) {
        const videos: VideoAlbum[] = (await videoRes.json()).data || [];
        setVideoAlbums(videos || []);
      }
    } catch {
      setPhotoAlbums([]);
      setVideoAlbums([]);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchScheduledContent();
      fetchAlbums();
    }
  }, [companyId, fetchScheduledContent, fetchAlbums]);

  async function handleAddSchedule(formData: ScheduleFormData) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/content?companyId=${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, companyId }),
      });
      if (!res.ok) throw new Error("Failed to add schedule item");
      const added: ScheduledContent = (await res.json()).data;
      setScheduledContent(prev => [...prev, added]);
      setIsScheduleModalOpen(false);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDeleteContent(content: ScheduledContent) {
    setSelectedContent(content);
    setIsDeleteModalOpen(true);
  }

  async function handleConfirmDeleteContent() {
    if (!selectedContent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/content/${selectedContent.id}?companyId=${companyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete content");
      setScheduledContent(prev => prev.filter(c => c.id !== selectedContent.id));
      setIsDeleteModalOpen(false);
      setSelectedContent(null);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Scheduled <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-600">Content</span>
        </h1>
        <div className="flex space-x-4">
          <motion.button onClick={fetchScheduledContent} className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-300 font-bold rounded-full shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>

          <motion.button onClick={() => setIsScheduleModalOpen(true)} className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <PlusIcon className="h-5 w-5 mr-2" /> Schedule New
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-2xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-800 rounded-3xl animate-pulse h-32" />)}
          </div>
        ) : scheduledContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarIcon className="h-24 w-24 text-gray-700 mb-4" />
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">Nothing is scheduled yet.</h2>
            <p className="text-gray-500">Schedule your first content item to get started!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {scheduledContent.map((content) => {
                if (content.type === "PhotoAlbum") {
                  return <PhotoAlbumContentCard key={content.id} content={content} onDelete={handleDeleteContent} />;
                }
                if (content.type === "VideoAlbum") {
                  return <VideoAlbumContentCard key={content.id} content={content} onDelete={handleDeleteContent} />;
                }
                return <ArticleContentCard key={content.id} content={content} onDelete={handleDeleteContent} />;
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule New Content">
          <ScheduleForm onSubmit={handleAddSchedule} onCancel={() => setIsScheduleModalOpen(false)} isSubmitting={isSubmitting} photoAlbums={photoAlbums} videoAlbums={videoAlbums} />
        </Modal>

        <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDeleteContent} item={selectedContent} isSubmitting={isSubmitting} />
      </AnimatePresence>
    </AdminLayout>
  );
}