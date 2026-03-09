'use client';

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  PhotoIcon, 
  GlobeAltIcon, 
  TagIcon,
  FaceSmileIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function CategoryFormModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🛒',
    variantName: '',
    link: '',
    description: '',
    previewImage: '',
    tag: 'New'
  });

  

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        icon: initialData.icon || '🛒',
        variantName: initialData.variants?.[0]?.name || '',
        link: initialData.variants?.[0]?.link || '',
        description: initialData.variants?.[0]?.description || '',
        previewImage: initialData.variants?.[0]?.previewImage || '',
        tag: initialData.variants?.[0]?.tag || 'New'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      name: formData.name,
      icon: formData.icon,
      variants: [
        {
          name: formData.variantName,
          link: formData.link,
          description: formData.description,
          previewImage: formData.previewImage,
          tag: formData.tag
        }
      ]
    };

    await onSave(payload);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {initialData ? 'Edit Industry' : 'Add New Industry'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">Define the category and its first template variant.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: INDUSTRY DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <FaceSmileIcon className="h-4 w-4" /> 1. Industry Identity
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Icon</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 text-center text-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Industry Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., E-commerce, Consultant"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* SECTION 2: VARIANT DETAILS */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
              <GlobeAltIcon className="h-4 w-4" /> 2. Primary Variant (Template)
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Variant Name</label>
                <input
                  type="text"
                  required
                  placeholder="Modern Shop (v1)"
                  value={formData.variantName}
                  onChange={(e) => setFormData({...formData, variantName: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Tag</label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({...formData, tag: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                >
                  <option>New</option>
                  <option>Popular</option>
                  <option>Standard</option>
                  <option>Beta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Live Preview URL</label>
              <div className="relative">
                <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  type="url"
                  required
                  placeholder="https://template.salesmanpro.site"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all text-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Preview Image URL (Screenshot)</label>
              <div className="relative">
                <PhotoIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input
                  type="text"
                  placeholder="https://storage.google.com/..."
                  value={formData.previewImage}
                  onChange={(e) => setFormData({...formData, previewImage: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 px-1">Description</label>
              <textarea
                rows={3}
                placeholder="A brief summary of what makes this variant unique..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  {initialData ? 'Update Category' : 'Create Industry'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}