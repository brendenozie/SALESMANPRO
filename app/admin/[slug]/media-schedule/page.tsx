// app/admin/[adminSlug]/schedule/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, TrashIcon, CalendarIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { format, parseISO } from 'date-fns';
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

// --- Schedule Form Component ---
const ScheduleForm = ({ onSubmit, onCancel, isSubmitting, photoAlbums, videoAlbums }) => {
  const [form, setForm] = useState({
    title: '',
    type: 'Article',
    publishDate: '',
    photoAlbumId: '',
    videoAlbumId: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">Content Type</label>
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-colors"
        >
          <option value="Article">Article</option>
          <option value="PhotoAlbum">Photo Album</option>
          <option value="VideoAlbum">Video Album</option>
        </select>
      </div>

      {form.type === 'PhotoAlbum' && (
        <div>
          <label htmlFor="photoAlbumId" className="block text-sm font-medium text-gray-300 mb-1">Select Photo Album</label>
          <select
            id="photoAlbumId"
            name="photoAlbumId"
            value={form.photoAlbumId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-colors"
          >
            <option value="">-- Select an album --</option>
            {photoAlbums.map(album => (
              <option key={album.id} value={album.id}>{album.title}</option>
            ))}
          </select>
        </div>
      )}

      {form.type === 'VideoAlbum' && (
        <div>
          <label htmlFor="videoAlbumId" className="block text-sm font-medium text-gray-300 mb-1">Select Video Album</label>
          <select
            id="videoAlbumId"
            name="videoAlbumId"
            value={form.videoAlbumId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-colors"
          >
            <option value="">-- Select an album --</option>
            {videoAlbums.map(album => (
              <option key={album.id} value={album.id}>{album.title}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium text-gray-300 mb-1">Publish Date</label>
        <input
          type="datetime-local"
          id="publishDate"
          name="publishDate"
          value={form.publishDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 transition-colors"
        />
      </div>

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
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-indigo-800 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Content'}
        </button>
      </div>
    </form>
  );
};

// --- Content Card Components ---
const PhotoAlbumContentCard = ({ content, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group"
  >
    <div className="p-6 flex items-center space-x-4">
      <div className="flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden border border-gray-700">
        <Image
          src={content.photoAlbum?.photos?.[0]?.imageUrl || 'https://placehold.co/100x100/1e293b/d1d5db?text=Album'}
          alt={content.title}
          fill
          loader={loader}
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
        <p className="text-sm text-gray-400 mb-2">Photo Album</p>
        <p className="text-xs text-gray-500">Scheduled for: {format(parseISO(content.publishDate), 'MMM d, yyyy h:mm a')}</p>
      </div>
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={() => onDelete(content)}
          className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Delete Album"
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const VideoAlbumContentCard = ({ content, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group"
  >
    <div className="p-6 flex items-center space-x-4">
      <div className="flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden border border-gray-700">
        <Image
          src={content.videoAlbum?.videos?.[0]?.thumbnailUrl || 'https://placehold.co/100x100/1e293b/d1d5db?text=Video'}
          alt={content.title}
          fill
          loader={loader}
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
        <p className="text-sm text-gray-400 mb-2">Video Album</p>
        <p className="text-xs text-gray-500">Scheduled for: {format(parseISO(content.publishDate), 'MMM d, yyyy h:mm a')}</p>
      </div>
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={() => onDelete(content)}
          className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Delete Album"
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const ArticleContentCard = ({ content, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden relative group"
  >
    <div className="p-6">
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-white mb-1">{content.title}</h3>
        <p className="text-sm text-gray-400 mb-2">Article</p>
        <p className="text-xs text-gray-500">Scheduled for: {format(parseISO(content.publishDate), 'MMM d, yyyy h:mm a')}</p>
      </div>
      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          onClick={() => onDelete(content)}
          className="p-2 rounded-full bg-gray-900/70 backdrop-blur-sm text-red-400 hover:bg-red-900/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Delete Content"
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// --- Main Page Component ---
export default function SchedulePage() {
  const [scheduledContent, setScheduledContent] = useState([]);
  const [photoAlbums, setPhotoAlbums] = useState([]);
  const [videoAlbums, setVideoAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    fetchScheduledContent();
    fetchAlbums();
  }, []);

  const fetchScheduledContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const fetchedContent = await response.json();
      setScheduledContent(fetchedContent);
    } catch (error) {
      console.error("Failed to fetch scheduled content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const photoResponse = await fetch('/api/admin/photo-albums?companyId=${adminSlug}');
      const videoResponse = await fetch('/api/admin/video-albums?companyId=${adminSlug}');
      if (photoResponse.ok) {
        const photos = await photoResponse.json();
        setPhotoAlbums(photos);
      }
      if (videoResponse.ok) {
        const videos = await videoResponse.json();
        setVideoAlbums(videos);
      }
    } catch (error) {
      console.error("Failed to fetch albums:", error);
    }
  };

  const handleOpenScheduleModal = () => {
    setIsScheduleModalOpen(true);
  };

  const handleAddSchedule = async (contentData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        throw new Error('Failed to add schedule item');
      }
      const addedContent = await response.json();
      setScheduledContent(prev => [...prev, addedContent]);
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error("Failed to add schedule item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = (content) => {
    setSelectedContent(content);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDeleteContent = async () => {
    if (!selectedContent) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`api/admin/content/${selectedContent.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      setScheduledContent(prev => prev.filter(item => item.id !== selectedContent.id));
      setIsDeleteModalOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error("Failed to delete content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Scheduled <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-600">Content</span>
        </h1>
        <div className="flex space-x-4">
          <motion.button
            onClick={fetchScheduledContent}
            className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-300 font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-700/50 hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>
          <motion.button
            onClick={handleOpenScheduleModal}
            className="inline-flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Schedule New
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-3xl shadow-2xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-3xl animate-pulse h-32"></div>
            ))}
          </div>
        ) : scheduledContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarIcon className="h-24 w-24 text-gray-700 mb-4" />
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">Nothing is scheduled yet.</h2>
            <p className="text-gray-500">Schedule your first content item to get started!</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence>
              {scheduledContent.map((content) => {
                if (content.type === 'PhotoAlbum' && content.photoAlbum) {
                  return <PhotoAlbumContentCard key={content.id} content={content} onDelete={handleDeleteContent} />;
                }
                if (content.type === 'VideoAlbum' && content.videoAlbum) {
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
          <ScheduleForm 
            onSubmit={handleAddSchedule} 
            onCancel={() => setIsScheduleModalOpen(false)} 
            isSubmitting={isSubmitting} 
            photoAlbums={photoAlbums}
            videoAlbums={videoAlbums}
          />
        </Modal>
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={handleConfirmDeleteContent} 
          item={selectedContent} 
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </AdminLayout>
  );
}
