'use client';

import React, { useState, useCallback } from 'react';
import { 
  XMarkIcon, 
  CloudArrowUpIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export default function ResourceUploadModal({ isOpen, onClose, courseId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    category: 'Documents',
    isPublic: true
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      // Auto-fill title with filename if empty
      if (!metadata.title) setMetadata({ ...metadata, title: e.dataTransfer.files[0].name });
    }
  };

  const handleUpload = async () => {
    if (!file || !metadata.title) return toast.error("Please provide a file and a title");

    setIsUploading(true);
    try {
      // Simulate API Call
      // const formData = new FormData();
      // formData.append('file', file);
      // await fetch(`/api/teacher/courses/${courseId}/resources`, { method: 'POST', body: formData });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Material uploaded successfully!");
      onClose();
    } catch (error) {
      toast.error("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Upload Material</h2>
              <p className="text-sm font-medium text-slate-500">Add resources for your students</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
              <XMarkIcon className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* DRAG & DROP ZONE */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-[2rem] p-10 transition-all duration-300 flex flex-col items-center justify-center gap-4
                ${isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[0.98]' : 'border-slate-200 bg-slate-50'}
                ${file ? 'border-emerald-500 bg-emerald-50/10' : ''}
              `}
            >
              {!file ? (
                <>
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600">
                    <CloudArrowUpIcon className="h-8 w-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Drag your file here or <span className="text-indigo-600 cursor-pointer">browse</span></p>
                    <p className="text-xs text-slate-400 mt-1">PDF, MP4, ZIP or DOCX up to 50MB</p>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                </>
              ) : (
                <div className="flex items-center gap-4 w-full px-4">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <DocumentIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-xs font-bold text-rose-500 hover:underline">Remove</button>
                </div>
              )}
            </div>

            {/* METADATA FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                <input 
                  type="text" 
                  value={metadata.title}
                  onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                  placeholder="e.g. Week 1 Lecture Slides"
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={metadata.category}
                  onChange={(e) => setMetadata({...metadata, category: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-700"
                >
                  <option>Documents</option>
                  <option>Lectures</option>
                  <option>Labs</option>
                  <option>External</option>
                </select>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl">
                <input 
                  type="checkbox" 
                  checked={metadata.isPublic}
                  onChange={(e) => setMetadata({...metadata, isPublic: e.target.checked})}
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-600 uppercase">Visible to Students</span>
              </div>
            </div>

            <button 
              disabled={isUploading || !file}
              onClick={handleUpload}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {isUploading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Uploading to Course Cloud...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Publish Resource
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}