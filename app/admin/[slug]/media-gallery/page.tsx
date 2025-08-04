// app/admin/[adminSlug]/gallery/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

// Custom loader for Next.js Image component
const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

// Placeholder for your AdminLayout component
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl'
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

// --- Photo Album Form Component for Add/Edit ---
const PhotoAlbumForm = ({ album, onSubmit, onCancel, isSubmitting }) => {
  const [form, setForm] = useState(album || { title: '', description: '' });
  const [files, setFiles] = useState([]);
  const isEditing = !!album;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      onSubmit(form);
    } else {
      onSubmit(form, files);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Album Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
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
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 p-3 transition-colors"
        />
      </div>
      {!isEditing && (
        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-300 mb-1">Photos (Select one or more)</label>
          <input
            type="file"
            id="files"
            name="files"
            onChange={handleFileChange}
            multiple // Allow multiple file selection
            required
            className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-colors"
          />
        </div>
      )}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || (!isEditing && files.length === 0)}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-purple-800 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, item, isSubmitting, isAlbum }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-300 mb-6 text-lg">
        Are you sure you want to delete this {isAlbum ? 'album' : 'photo'}{isAlbum ? ' and all its contents' : ''}? This action cannot be undone.
        <br />
        <strong className="text-white mt-2 block">"{item?.title || 'Selected photo'}"</strong>
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-red-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};

// --- Photo Album Card Component for Grid View ---
const PhotoAlbumCard = ({ album, onEdit, onDelete, onViewAlbum }) => {
  const coverImage = album.photos?.[0]?.imageUrl || 'https://placehold.co/800x600/1e293b/d1d5db?text=No+Photos';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group transform hover:scale-105 transition-transform duration-300 ease-in-out"
    >
      <div className="relative w-full h-56 cursor-pointer" onClick={() => onViewAlbum(album)}>
        <Image 
          src={coverImage} 
          alt={album.title} 
          fill 
          className="object-cover transition-opacity duration-300 group-hover:opacity-60"
          loader={loader}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-white text-lg font-bold">View Album ({album.photos.length})</span>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            onClick={(e) => { e.stopPropagation(); onEdit(album); }}
            className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-indigo-400 hover:bg-indigo-900/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Edit ${album.title}`}
          >
            <PencilIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onDelete(album); }}
            className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Delete ${album.title}`}
          >
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

// --- View Album Modal Component ---
const ViewAlbumModal = ({ isOpen, onClose, album, onPhotoDelete }) => {
  if (!isOpen || !album) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={album.title} size="lg">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {album.photos.map(photo => (
          <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-gray-800">
            <Image
              src={photo.imageUrl}
              alt={album.title}
              width={300}
              height={300}
              className="object-cover w-full h-full"
              loader={loader}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                onClick={() => onPhotoDelete(photo)}
                className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Delete Photo"
              >
                <TrashIcon className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

// --- Main Page Component ---
export default function PhotoGalleryPage() {
  const [photoAlbums, setPhotoAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAlbumDeleteModalOpen, setIsAlbumDeleteModalOpen] = useState(false);
  const [isPhotoDeleteModalOpen, setIsPhotoDeleteModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotoAlbums();
  }, []);

  const fetchPhotoAlbums = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/photo-albums');
      if (!response.ok) {
        throw new Error('Failed to fetch photo albums');
      }
      const fetchedAlbums = await response.json();
      setPhotoAlbums(fetchedAlbums);
    } catch (error) {
      console.error("Failed to fetch photo albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Albums
  const handleUploadAlbum = () => {
    setSelectedAlbum(null);
    setIsUploadModalOpen(true);
  };

  const handleAddPhotoAlbum = async (albumData, files) => {
    setIsSubmitting(true);
    try {
      // In a real application, you would upload files to a service like S3 first
      // and get the URLs. This is a placeholder simulation.
      const photoUrls = files.map((file, index) => 
        `https://placehold.co/800x600/1e293b/d1d5db?text=${encodeURIComponent(albumData.title)}+${index + 1}`
      );
      
      const response = await fetch('/api/photo-albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...albumData, photoUrls }),
      });

      if (!response.ok) {
        throw new Error('Failed to add photo album');
      }
      const addedAlbum = await response.json();
      setPhotoAlbums(prev => [...prev, addedAlbum]);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Failed to add photo album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAlbum = (album) => {
    setSelectedAlbum(album);
    setIsEditModalOpen(true);
  };

  const handleUpdatePhotoAlbum = async (updatedAlbumData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/photo-albums/${updatedAlbumData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAlbumData),
      });

      if (!response.ok) {
        throw new Error('Failed to update photo album');
      }
      const updatedAlbum = await response.json();
      setPhotoAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update photo album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlbum = (album) => {
    setSelectedAlbum(album);
    setIsAlbumDeleteModalOpen(true);
  };
  
  const handleConfirmDeleteAlbum = async () => {
    if (!selectedAlbum) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/photo-albums/${selectedAlbum.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo album');
      }

      setPhotoAlbums(prev => prev.filter(a => a.id !== selectedAlbum.id));
      setIsAlbumDeleteModalOpen(false);
      setSelectedAlbum(null);
    } catch (error) {
      console.error("Failed to delete photo album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Photos
  const handleViewAlbum = (album) => {
    setSelectedAlbum(album);
  };
  
  const handleCloseViewAlbumModal = () => {
    setSelectedAlbum(null);
  };

  const handleDeletePhoto = (photo) => {
    setSelectedPhoto(photo);
    setIsPhotoDeleteModalOpen(true);
  };
  
  const handleConfirmDeletePhoto = async () => {
    if (!selectedPhoto) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/photos/${selectedPhoto.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Update the state to remove the photo from its album
      setPhotoAlbums(prev =>
        prev.map(album => ({
          ...album,
          photos: album.photos.filter(p => p.id !== selectedPhoto.id)
        }))
      );
      setIsPhotoDeleteModalOpen(false);
      setSelectedPhoto(null);
    } catch (error) {
      console.error("Failed to delete photo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Photo <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">Gallery</span>
        </h1>
        <div className="flex space-x-4">
          <motion.button
            onClick={fetchPhotoAlbums}
            className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-300 font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-700/50 hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>
          <motion.button
            onClick={handleUploadAlbum}
            className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Create New Album
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-2xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-3xl animate-pulse h-64"></div>
            ))}
          </div>
        ) : photoAlbums.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <PhotoIcon className="h-24 w-24 text-gray-700 mb-4" />
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">Your gallery is empty.</h2>
            <p className="text-gray-500">Upload your first album to get started!</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {photoAlbums.map((album) => (
                <PhotoAlbumCard
                  key={album.id}
                  album={album}
                  onEdit={handleEditAlbum}
                  onDelete={handleDeleteAlbum}
                  onViewAlbum={handleViewAlbum}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Create New Album">
          <PhotoAlbumForm onSubmit={handleAddPhotoAlbum} onCancel={() => setIsUploadModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Album Details">
          <PhotoAlbumForm album={selectedAlbum} onSubmit={handleUpdatePhotoAlbum} onCancel={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <DeleteConfirmationModal 
          isOpen={isAlbumDeleteModalOpen} 
          onClose={() => setIsAlbumDeleteModalOpen(false)} 
          onConfirm={handleConfirmDeleteAlbum} 
          item={selectedAlbum} 
          isSubmitting={isSubmitting}
          isAlbum={true}
        />
        <ViewAlbumModal 
          isOpen={!!selectedAlbum} 
          onClose={handleCloseViewAlbumModal} 
          album={selectedAlbum} 
          onPhotoDelete={handleDeletePhoto}
        />
        <DeleteConfirmationModal 
          isOpen={isPhotoDeleteModalOpen} 
          onClose={() => setIsPhotoDeleteModalOpen(false)} 
          onConfirm={handleConfirmDeletePhoto} 
          item={selectedPhoto} 
          isSubmitting={isSubmitting}
          isAlbum={false}
        />
      </AnimatePresence>
    </AdminLayout>
  );
}
