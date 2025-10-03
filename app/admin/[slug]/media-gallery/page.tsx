// app/admin/[adminSlug]/gallery/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Image, { ImageLoaderProps } from "next/image";
import { useParams } from "next/navigation";  


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


/* ---------------------------
   Types
   --------------------------- */
interface Photo {
  id: string;
  imageUrl: string;
  title?: string;
}

interface Album {
  id: string;
  title: string;
  description?: string;
  photos: Photo[];
}

/* ---------------------------
   Utilities & constants
   --------------------------- */
const FALLBACK_IMAGE = "https://placehold.co/800x600/4B5563/F3F4F6?text=Image+Not+Found";

const imageLoader = ({ src, width, quality }: ImageLoaderProps) =>
  `${src}?w=${width}&q=${quality ?? 75}`;

/* A small wrapper around next/image to handle onError fallback by swapping local src state */
const NextImageWithFallback: React.FC<
  React.ComponentProps<typeof Image> & { fallback?: string }
> = ({ src, fallback = FALLBACK_IMAGE, ...rest }) => {
  const [currentSrc, setCurrentSrc] = useState<string>(
    typeof src === "string" ? src : (src as any)?.src ?? fallback
  );

  // Update when src prop changes
  useEffect(() => {
    setCurrentSrc(typeof src === "string" ? src : (src as any)?.src ?? fallback);
  }, [src, fallback]);

  return (
    // `onError` exists on the Image element and calling setCurrentSrc triggers a re-render
    <Image
      {...(rest as any)}
      src={currentSrc}
      onError={() => setCurrentSrc(fallback)}
      loader={imageLoader}
      unoptimized={false}
    />
  );
};

/* ---------------------------
   Layout & Reusable UI
   --------------------------- */
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

type ModalSize = "sm" | "md" | "lg" | "xl";
const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-7xl",
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: ModalSize;
}> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full ${sizeMap[size]} p-8`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
          <h3 className="text-3xl font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

/* ---------------------------
   PhotoAlbumForm
   - onSubmit: when creating -> (albumData, files)
               when editing  -> (albumData)
   --------------------------- */
type PhotoAlbumFormCreateSubmit = (albumData: { title: string; description?: string }, files: File[]) => Promise<void> | void;
type PhotoAlbumFormEditSubmit = (updatedAlbum: Partial<Album> & { id: string }) => Promise<void> | void;

const PhotoAlbumForm: React.FC<{
  album?: Album | null;
  onSubmit: PhotoAlbumFormCreateSubmit | PhotoAlbumFormEditSubmit;
  onCancel: () => void;
  isSubmitting?: boolean;
}> = ({ album, onSubmit, onCancel, isSubmitting = false }) => {
  const isEditing = Boolean(album);
  const [form, setForm] = useState<{ title: string; description: string }>(
    { title: album?.title ?? "", description: album?.description ?? "" }
  );
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setForm({ title: album?.title ?? "", description: album?.description ?? "" });
  }, [album]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      // @ts-ignore - caller is expected to accept updatedAlbum shape
      (onSubmit as PhotoAlbumFormEditSubmit)({ id: album!.id, ...form });
    } else {
      (onSubmit as PhotoAlbumFormCreateSubmit)(form, files);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Album Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-3"
        />
      </div>

      {!isEditing && (
        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-300 mb-1">Photos (one or more)</label>
          <input
            id="files"
            name="files"
            type="file"
            onChange={handleFileChange}
            multiple
            required
            className="mt-1 block w-full text-sm text-gray-400"
          />
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full bg-gray-700 text-white">Cancel</button>
        <button
          type="submit"
          disabled={isSubmitting || (!isEditing && files.length === 0)}
          className={`px-6 py-3 rounded-full font-semibold ${isSubmitting ? "bg-purple-800 text-gray-400" : "bg-purple-600 text-white"}`}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

/* ---------------------------
   DeleteConfirmationModal
   --------------------------- */
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemTitle?: string;
  isSubmitting?: boolean;
  isAlbum?: boolean;
}> = ({ isOpen, onClose, onConfirm, itemTitle, isSubmitting = false, isAlbum = true }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-300 mb-6">
        Are you sure you want to delete this {isAlbum ? "album" : "photo"}{isAlbum ? " and its contents" : ""}? This action cannot be undone.
      </p>
      <p className="text-white font-semibold mb-6">"{itemTitle ?? "Selected item"}"</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="px-6 py-3 rounded-full bg-gray-700 text-white">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold ${isSubmitting ? "bg-red-800 text-gray-400" : "bg-red-600 text-white"}`}
        >
          {isSubmitting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
};

/* ---------------------------
   PhotoAlbumCard
   --------------------------- */
const PhotoAlbumCard: React.FC<{
  album: Album;
  onView: (a: Album) => void;
  onEdit: (a: Album) => void;
  onDelete: (a: Album) => void;
}> = ({ album, onView, onEdit, onDelete }) => {
  const cover = album.photos?.[0]?.imageUrl ?? "https://placehold.co/800x600/1e293b/d1d5db?text=No+Photos";
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group">
      <div className="relative w-full h-56 cursor-pointer" onClick={() => onView(album)}>
        <NextImageWithFallback src={cover} alt={album.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-lg font-bold">View Album ({album.photos.length})</span>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button onClick={(e:any) => { e.stopPropagation(); onEdit(album); }} className="p-2 rounded-full bg-gray-900/70 text-indigo-400">
            <PencilIcon className="h-5 w-5" />
          </motion.button>
          <motion.button onClick={(e:any) => { e.stopPropagation(); onDelete(album); }} className="p-2 rounded-full bg-gray-900/70 text-red-400">
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{album.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{album.description}</p>
      </div>
    </motion.div>
  );
};

/* ---------------------------
   ViewAlbumModal
   --------------------------- */
const ViewAlbumModal: React.FC<{
  isOpen: boolean;
  album?: Album | null;
  onClose: () => void;
  onPhotoDelete: (photo: Photo) => void;
}> = ({ isOpen, album, onClose, onPhotoDelete }) => {
  if (!isOpen || !album) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={album.title} size="lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {album.photos.map((photo) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-gray-800">
            <NextImageWithFallback src={photo.imageUrl} alt={photo.title ?? "Photo"} width={300} height={300} className="object-cover w-full h-full" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <motion.button onClick={() => onPhotoDelete(photo)} className="p-2 rounded-full bg-gray-900/70 text-red-400">
                <TrashIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

/* ---------------------------
   Main Page
   --------------------------- */
export default function PhotoGalleryPage(): JSX.Element {
  const params = useParams();
  const adminSlug = params?.slug || "";

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal / selection state (separated)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [albumBeingEdited, setAlbumBeingEdited] = useState<Album | null>(null);
  const [albumBeingViewed, setAlbumBeingViewed] = useState<Album | null>(null);
  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  const [isAlbumDeleteOpen, setIsAlbumDeleteOpen] = useState(false);
  const [isPhotoDeleteOpen, setIsPhotoDeleteOpen] = useState(false);

  /* Fetch albums */
  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/photo-albums`, {
        method: "GET",
        headers: { "Content-Type": "application/json", },
        credentials: "include",  // include cookies for authentication
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Album[] = (await res.json()).data || [];
      console.log("Fetched albums:", data);
      setAlbums(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  /* Create album */
  const handleAddAlbum: PhotoAlbumFormCreateSubmit = async (albumData, files) => {
    setSubmitting(true);
    try {
      // In a real app: upload files to S3 & get URLs. Here we simulate placeholder URLs.
      const photoUrls = files.map((f, i) => `https://placehold.co/800x600/1e293b/d1d5db?text=${encodeURIComponent(albumData.title)}+${i + 1}`);
      const res = await fetch(`${apiBaseUrl}/admin/photo-albums`, {
        method: "POST",
        headers: { "Content-Type": "application/json", 'Credentials': 'include' },
        body: JSON.stringify({ ...albumData, photoUrls }),
      });
      if (!res.ok) throw new Error("Failed to add album");
      const added: Album = (  await res.json()).data;
      setAlbums(prev => [...prev, added]);
      setIsUploadOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* Open edit modal */
  const handleEditAlbum = (album: Album) => {
    setAlbumBeingEdited(album);
    setIsEditOpen(true);
  };

  /* Update album */
  const handleUpdateAlbum: PhotoAlbumFormEditSubmit = async (updated) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/photo-albums/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'Credentials': 'include' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update album");
      const updatedAlbum: Album = (await res.json()).data;
      setAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));
      setIsEditOpen(false);
      setAlbumBeingEdited(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* View album */
  const handleViewAlbum = (album: Album) => {
    setAlbumBeingViewed(album);
    setIsViewOpen(true);
  };

  const closeView = () => {
    setAlbumBeingViewed(null);
    setIsViewOpen(false);
  };

  /* Delete album */
  const handleDeleteAlbum = (album: Album) => {
    setAlbumToDelete(album);
    setIsAlbumDeleteOpen(true);
  };

  const confirmDeleteAlbum = async () => {
    if (!albumToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/photo-albums/${albumToDelete.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete");
      setAlbums(prev => prev.filter(a => a.id !== albumToDelete.id));
      setAlbumToDelete(null);
      setIsAlbumDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  /* Delete photo (from current viewed album) */
  const handleDeletePhoto = (photo: Photo) => {
    setPhotoToDelete(photo);
    setIsPhotoDeleteOpen(true);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete || !albumBeingViewed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/photos/${photoToDelete.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete photo");
      setAlbums(prev => prev.map(a => ({
        ...a,
        photos: a.photos.filter(p => p.id !== photoToDelete.id)
      })));
      // also update viewed album object if it's the same album
      setAlbumBeingViewed(prev => prev ? { ...prev, photos: prev.photos.filter(p => p.id !== photoToDelete.id) } : prev);
      setPhotoToDelete(null);
      setIsPhotoDeleteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-0">
          Photo <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">Gallery</span>
        </h1>
        <div className="flex space-x-4">
          <motion.button onClick={fetchAlbums} className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-300 rounded-full" whileHover={{ scale: 1.05 }}>
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>
          <motion.button onClick={() => setIsUploadOpen(true)} className="inline-flex items-center px-8 py-3 bg-purple-600 text-white rounded-full" whileHover={{ scale: 1.05 }}>
            <PlusIcon className="h-5 w-5 mr-2" /> Create New Album
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-2xl p-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-800 rounded-3xl animate-pulse h-64" />)}
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <PhotoIcon className="h-24 w-24 text-gray-700 mb-4" />
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">Your gallery is empty.</h2>
            <p className="text-gray-500">Upload your first album to get started!</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {albums.map(a => (
                <PhotoAlbumCard key={a.id} album={a} onView={handleViewAlbum} onEdit={handleEditAlbum} onDelete={handleDeleteAlbum} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Create New Album">
          <PhotoAlbumForm onSubmit={handleAddAlbum} onCancel={() => setIsUploadOpen(false)} isSubmitting={submitting} />
        </Modal>

        <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setAlbumBeingEdited(null); }} title="Edit Album">
          <PhotoAlbumForm album={albumBeingEdited ?? undefined} onSubmit={handleUpdateAlbum} onCancel={() => { setIsEditOpen(false); setAlbumBeingEdited(null); }} isSubmitting={submitting} />
        </Modal>

        <DeleteConfirmationModal isOpen={isAlbumDeleteOpen} onClose={() => setIsAlbumDeleteOpen(false)} onConfirm={confirmDeleteAlbum} itemTitle={albumToDelete?.title} isSubmitting={submitting} isAlbum />

        <ViewAlbumModal isOpen={isViewOpen} album={albumBeingViewed} onClose={closeView} onPhotoDelete={handleDeletePhoto} />

        <DeleteConfirmationModal isOpen={isPhotoDeleteOpen} onClose={() => setIsPhotoDeleteOpen(false)} onConfirm={confirmDeletePhoto} itemTitle={photoToDelete?.title} isSubmitting={submitting} isAlbum={false} />
      </AnimatePresence>
    </AdminLayout>
  );
}
