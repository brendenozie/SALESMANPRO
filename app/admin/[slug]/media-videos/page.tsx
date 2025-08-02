"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, PlayCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// This is a placeholder for your AdminLayout component.
// It's assumed to provide the basic page structure and background.
const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </div>
);

// --- API Functions for Integration ---
// These functions will now call your real API endpoints.
// Replace the URLs with your actual API server addresses if they are different.
const api = {
  fetchVideos: () => fetch('http://127.0.0.1:3000/api/admin/videos').then(res => {
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  }),
  addVideo: (video) => fetch('http://127.0.0.1:3000/api/admin/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(video),
  }).then(res => {
    if (!res.ok) throw new Error('Failed to add video');
    return res.json();
  }),
  updateVideo: (id, updates) => fetch(`http://127.0.0.1:3000/api/admin/videos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).then(res => {
    if (!res.ok) throw new Error('Failed to update video');
    return res.json();
  }),
  deleteVideo: (id) => fetch(`http://127.0.0.1:3000/api/admin/videos/${id}`, {
    method: 'DELETE',
  }).then(res => {
    if (!res.ok) throw new Error('Failed to delete video');
    return res.status;
  }),
  uploadFile: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return fetch('/api/upload', {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) throw new Error('File upload failed');
      return res.json();
    });
  }
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8"
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-6">
          <h3 className="text-3xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// --- Video Form Component for Add/Edit ---
const VideoForm = ({ video, onSubmit, onCancel, isSubmitting }) => {
  const [form, setForm] = useState(video || { title: '', duration: '', status: 'DRAFT', date: new Date().toISOString().slice(0, 10), imageUrl: '' });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(form, file);
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
          className="mt-1 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3"
        />
      </div>
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (e.g., 10:15)</label>
        <input
          type="text"
          id="duration"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      {!video && ( // Only show file input for new uploads
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-1">Video Thumbnail File</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            required
            className="mt-1 block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-red-50 file:text-red-700
              hover:file:bg-red-100 transition-colors"
          />
        </div>
      )}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-red-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, video, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-300 mb-6 text-lg">
        Are you sure you want to delete the video: <strong className="text-white">"{video?.title}"</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-gray-600 text-white hover:bg-gray-500 transition-colors font-semibold"
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

// --- Video Card Component for Grid View ---
const VideoCard = ({ video, onEdit, onDelete, onPreview }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden relative group transform hover:scale-105 transition-transform duration-200"
    >
      <div className="relative w-full h-48 cursor-pointer" onClick={() => onPreview(video.id)}>
        <Image 
          src={video.imageUrl} 
          alt={video.title} 
          fill 
          className="object-cover transition-opacity duration-300 group-hover:opacity-75"
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
          loader={loader}
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
        >
          <PlayCircleIcon className="w-16 h-16 text-white" />
        </motion.div>
        <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
          {video.duration}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">{video.title}</h3>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            video.status === 'Published' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
          }`}>
            {video.status}
          </span>
          <span>{video.date}</span>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <motion.button
            onClick={() => onEdit(video)}
            className="p-2 rounded-full bg-gray-700 text-indigo-400 hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Edit ${video.title}`}
          >
            <PencilIcon className="h-5 w-5" />
          </motion.button>
          <motion.button
            onClick={() => onDelete(video)}
            className="p-2 rounded-full bg-gray-700 text-red-400 hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Delete ${video.title}`}
          >
            <TrashIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Shimmer effect for placeholder while loading images ---
const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function VideoManagementPage() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Fetch videos on component mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const fetchedVideos = await api.fetchVideos();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadVideo = () => {
    setSelectedVideo(null);
    setIsUploadModalOpen(true);
  };

  const handleAddVideo = async (newVideoData, file) => {
    setIsSubmitting(true);
    try {
      // Step 1: Upload the file to S3
      const uploadResponse = await api.uploadFile(file, 'image'); // Assuming thumbnail is an image
      const imageUrl = uploadResponse.url;

      // Step 2: Add video metadata to the database
      const videoDataWithImage = { ...newVideoData, imageUrl };
      const addedVideo = await api.addVideo(videoDataWithImage);
      
      setVideos(prev => [...prev, addedVideo]);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error("Failed to add video:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setIsEditModalOpen(true);
  };

  const handleUpdateVideo = async (updatedVideoData) => {
    setIsSubmitting(true);
    try {
      const updatedVideo = await api.updateVideo(updatedVideoData.id, updatedVideoData);
      setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update video:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (video) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedVideo) return;
    setIsSubmitting(true);
    try {
      await api.deleteVideo(selectedVideo.id);
      setVideos(prev => prev.filter(v => v.id !== selectedVideo.id));
      setIsDeleteModalOpen(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error("Failed to delete video:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = (id) => {
    // Implement a video player modal here
    console.log(`Previewing video ${id}`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 sm:mb-0">Video Management</h1>
        <motion.button
          onClick={handleUploadVideo}
          className="inline-flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Upload New Video
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-3xl shadow-2xl p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-700 rounded-2xl animate-pulse h-64"></div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl text-gray-400 font-semibold mb-2">No videos found.</h2>
            <p className="text-gray-500">Click the button above to upload your first video.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Video">
          <VideoForm onSubmit={handleAddVideo} onCancel={() => setIsUploadModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Video">
          <VideoForm video={selectedVideo} onSubmit={handleUpdateVideo} onCancel={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={handleConfirmDelete} 
          video={selectedVideo} 
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </AdminLayout>
  );
}
