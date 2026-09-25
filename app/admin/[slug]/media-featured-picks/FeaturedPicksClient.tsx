'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';

export type VideoType = 'Video' | 'Article' | 'Series' | 'Interview';

export interface Video {
  id: string;
  title: string;
  type: VideoType;
  imageUrl: string;
  isFeatured: boolean;
  companyId: string;
  userId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToastData {
  message: string;
  type: 'add' | 'remove' | 'error';
}

interface FeaturedPicksClientProps {
  companyId: string;
}

// ------------------- UI Helpers -------------------
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-6 lg:p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

const fallbackImageUrl = 'https://placehold.co/400x300/4B5563/F3F4F6?text=Image+Not+Found';
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Toast Component ---
const Toast: React.FC<{ message: string; type: ToastData['type']; onClose: () => void }> = ({ message, type, onClose }) => {
  const icon = type === 'add' ? <StarIcon /> : <TrashIcon />;
  const iconColor = type === 'add' ? 'text-yellow-400' : 'text-red-400';
  const bgColor = type === 'add' ? 'bg-green-600' : 'bg-red-600';

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-white z-50 ${bgColor}`}
    >
      <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// --- Modal Component ---
const AddPickModal: React.FC<{ onClose: () => void; onAdd: (pick: { title: string; type: string; imageUrl: string }) => Promise<void> }> = ({
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<string>('Article');
  const [imageUrl, setImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && type && imageUrl) {
      setIsAdding(true);
      await onAdd({ title, type, imageUrl });
      setIsAdding(false);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6">Add New Content Pick</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-2.5 focus:border-rose-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-2.5 focus:border-rose-500 focus:outline-none"
              required
            >
              <option value="Article">Article</option>
              <option value="Video">Video</option>
            </select>
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Cover Image URL</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white p-2.5 focus:border-rose-500 focus:outline-none"
              required
            />
          </div>
          <motion.button
            type="submit"
            disabled={isAdding}
            className={`w-full py-3 mt-4 text-white font-semibold rounded-xl shadow-lg transition-colors ${
              isAdding ? 'bg-rose-800 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'
            }`}
            whileHover={{ scale: isAdding ? 1 : 1.02 }}
            whileTap={{ scale: isAdding ? 1 : 0.98 }}
          >
            {isAdding ? 'Adding...' : 'Add Featured Pick'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Featured Card Component ---
const FeaturedPickCard: React.FC<{
  pick: Video;
  onToggle: (pick: Video) => Promise<void>;
  showToast: (toast: ToastData) => void;
}> = ({ pick, onToggle, showToast }) => {
  const { title, type, imageUrl, isFeatured } = pick;

  const handleToggle = async () => {
    try {
      await onToggle(pick);
      showToast({
        message: `${isFeatured ? 'Removed' : 'Added'} "${title}" to Featured Picks.`,
        type: isFeatured ? 'remove' : 'add',
      });
    } catch {
      showToast({ message: `Failed to update status for "${title}".`, type: 'error' });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300 border ${
        isFeatured ? 'bg-gray-900 border-rose-500/80 shadow-rose-950/40 ring-1 ring-rose-500/50' : 'bg-gray-900/60 border-gray-800'
      }`}
    >
      <div className="relative w-full h-48 bg-gray-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            loader={loader}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImageUrl;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent"></div>
        {isFeatured && (
          <div className="absolute top-4 left-4 p-2 bg-rose-600 rounded-full shadow-lg">
            <StarIcon className="h-5 w-5 text-yellow-300" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">{type}</p>
        <div className="flex justify-end">
          <motion.button
            onClick={handleToggle}
            className={`p-3 rounded-full shadow-lg transition-colors duration-200 ${
              isFeatured ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`${isFeatured ? 'Remove from' : 'Add to'} featured`}
          >
            {isFeatured ? <TrashIcon className="h-5 w-5" /> : <StarIcon className="h-5 w-5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ------------------- Client Root Component -------------------
export default function FeaturedPicksClient({ companyId }: FeaturedPicksClientProps) {
  const [contentList, setContentList] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/media-featured-picks?companyId=${companyId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch content picks');
      const json = await res.json();
      if (json.success && json.data) {
        setContentList(json.data);
      }
    } catch {
      setError('Failed to fetch featured picks from server.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleToggleFeatured = async (pick: Video) => {
    const res = await fetch('/api/admin/media-featured-picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: pick.id,
        type: pick.type,
        isFeatured: !pick.isFeatured,
        companyId,
      }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    await fetchContent();
  };

  const handleAddPick = async (newPick: { title: string; type: string; imageUrl: string }) => {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: newPick.title,
        type: newPick.type,
        thumbnailUrl: newPick.imageUrl,
        published: true,
        status: 'Published',
        companyId,
        tags: ['featured'],
      }),
    });
    if (!res.ok) throw new Error('Failed to add pick');
    await fetchContent();
    setToast({ message: `Successfully added "${newPick.title}"!`, type: 'add' });
  };

  const featuredContent = contentList.filter((p) => p.isFeatured);
  const nonFeaturedContent = contentList.filter((p) => !p.isFeatured);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Featured & Top <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-indigo-500">Picks</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Control which content items appear in hero carousels and top-picks sections across your storefront.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => fetchContent()}
            className="p-3 bg-gray-900 border border-gray-800 rounded-full hover:bg-gray-800 text-gray-300 transition"
            title="Refresh"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <motion.button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-full shadow-lg transition-colors active:scale-95"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Add New Pick
          </motion.button>
        </div>
      </motion.div>

      {/* Loading/Error States */}
      {loading && (
        <div className="flex justify-center items-center h-48 bg-gray-900 border border-gray-800 rounded-3xl mb-10">
          <ArrowPathIcon className="w-8 h-8 text-rose-500 animate-spin mr-3" />
          <p className="text-lg text-gray-400">Loading featured picks...</p>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-48 bg-gray-900 border border-red-900/50 rounded-3xl mb-10">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

      {/* Featured Picks Section */}
      {!loading && !error && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <StarIcon className="h-6 w-6 mr-3 text-yellow-400" /> Currently Featured ({featuredContent.length})
          </h2>
          {featuredContent.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {featuredContent.map((pick) => (
                  <FeaturedPickCard key={pick.id} pick={pick} onToggle={handleToggleFeatured} showToast={setToast} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col justify-center items-center h-48 bg-gray-900 border border-gray-800 border-dashed rounded-3xl text-gray-500 p-6 text-center">
              <StarIcon className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-base text-gray-400 font-medium">No items are currently featured.</p>
              <p className="text-xs text-gray-500 mt-1">Click the star button on any item below to promote it to your storefront.</p>
            </div>
          )}
        </section>
      )}

      {/* All Content Section */}
      {!loading && !error && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CheckCircleIcon className="h-6 w-6 mr-3 text-emerald-400" /> Available Library Items ({nonFeaturedContent.length})
          </h2>
          {nonFeaturedContent.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {nonFeaturedContent.map((pick) => (
                  <FeaturedPickCard key={pick.id} pick={pick} onToggle={handleToggleFeatured} showToast={setToast} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-32 bg-gray-900 rounded-3xl border border-gray-800 text-gray-500">
              <p className="text-sm">All available content items are currently featured!</p>
            </div>
          )}
        </section>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && <AddPickModal onClose={() => setShowModal(false)} onAdd={handleAddPick} />}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </AdminLayout>
  );
}