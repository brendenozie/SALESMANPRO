"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowUpIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  GiftIcon,
  TvIcon,
  VideoCameraIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { InboxIcon } from "@heroicons/react/24/solid";

export interface UnifiedMediaItem {
  id: string;
  title: string;
  author: string;
  coverPreviewUrl?: string | null;
  file?: File | null; // ✅ unified field
  fileName?: string;
  url?: string;
  source: "local" | "server";
}

export function TabSwitcher({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (v: "images" | "videos" | "books") => void;
}) {
  const tabs = [
    { id: "images", label: "Images", icon: <TvIcon className="w-4 h-4" /> },
    { id: "videos", label: "Videos", icon: <VideoCameraIcon className="w-4 h-4" /> },
    { id: "books", label: "Books", icon: <BookOpenIcon className="w-4 h-4" /> },
  ];
  return (
    <div className="flex justify-center bg-gray-100 p-1 rounded-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSelected(tab.id as any)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            selected === tab.id
              ? "text-indigo-700 bg-white shadow"
              : "text-gray-600 hover:bg-gray-200"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Dropzone({
  onFilesAdded,
  accept,
  children,
}: {
  onFilesAdded: (files: File[]) => void;
  accept: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-8 border-2 border-dashed rounded-xl text-center hover:border-indigo-400">
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(e) =>
          e.target.files && onFilesAdded(Array.from(e.target.files))
        }
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {children}
    </div>
  );
}

function FilePreview({
  preview,
  onRemove,
}: {
  preview: UnifiedMediaItem;
  onRemove: () => void;
}) {
  const isImage = preview.file
    ? preview.file.type.startsWith("image/")
    : /\.(jpg|jpeg|png|webp)$/i.test(preview.url || "");
    
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group overflow-hidden rounded-lg shadow-md"
    >
      {isImage ? (
        <img src={preview.url} className="w-full h-40 object-cover" alt={preview.title || 'preview'} />
      ) : (
        <video src={preview.url} controls className="w-full h-40 bg-black" />
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/**
 * New component to render book previews
 */
function BookFilePreview({
  preview,
  onRemove,
}: {
  preview: UnifiedMediaItem;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group overflow-hidden rounded-lg shadow-md bg-gray-50"
    >
      <div className="flex flex-col h-40">
        {/* Use cover preview if it exists */}
        {preview.coverPreviewUrl ? (
          <img
            src={preview.coverPreviewUrl}
            className="w-full h-2/3 object-cover"
            alt={preview.title}
          />
        ) : (
          // Otherwise, show a generic icon
          <div className="flex-1 flex items-center justify-center bg-gray-200">
            <BookOpenIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Show book title */}
        <div className="flex-1 p-2 text-xs font-medium text-gray-800 overflow-hidden">
          <p className="truncate" title={preview.title}>
            {preview.title}
          </p>
          <p className="text-gray-500 truncate">{preview.author}</p>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ImagesTab({
  images,
  setImages,
}: {
  images: UnifiedMediaItem[];
  setImages: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  const handleFiles = (files: File[]) => {
    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      source: "local" as const,
      title: file.name || "Untitled Image",
      author: file.name || "Unknown",
      coverPreviewUrl: undefined,
      fileName: file.name || undefined,
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <Dropzone onFilesAdded={handleFiles} accept="image/*">
        <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p>Drag & drop images here</p>
      </Dropzone>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {images.map((img, idx) => (
          <FilePreview
            key={img.id || img.url}
            preview={img}
            onRemove={() => removeImage(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export function VideosTab({
  videos,
  setVideos,
}: {
  videos: UnifiedMediaItem[];
  setVideos: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  const handleFiles = (files: File[]) => {
    const newItems: UnifiedMediaItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      source: "local" as const,
      title: file.name || "Untitled Video",
      author: file.name || "Unknown",
      coverPreviewUrl: undefined,
      fileName: file.name || undefined,
    }));
    setVideos((prev) => [...prev, ...newItems]);
  };
  const removeVideo = (index: number) =>
    setVideos((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <Dropzone onFilesAdded={handleFiles} accept="video/*">
        <ArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p>Drag & drop videos here</p>
      </Dropzone>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {videos.map((vid, idx) => (
          <FilePreview
            key={vid.id || vid.url}
            preview={vid} // ✅ Corrected: Pass the full object
            onRemove={() => removeVideo(idx)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * New component for handling book uploads
 */
export function BooksTab({
  books,
  setBooks,
}: {
  books: UnifiedMediaItem[];
  setBooks: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  const handleFiles = (files: File[]) => {
    const newItems: UnifiedMediaItem[] = files.map((file) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, ""); // remove extension

      // return {
      //   id: crypto.randomUUID(),
      //   file: file,
      //   url: URL.createObjectURL(file), // URL to the PDF/ePub
      //   source: "local" as const,
      //   title: cleanName,
      //   author: "Unknown",
      //   coverPreviewUrl: null, // No local preview for book covers
      //   fileName: file.name,
      // };

      const newItem = { // <-- Create the object first
        id: crypto.randomUUID(),
        file: file,
        url: URL.createObjectURL(file), 
        source: "local" as const,
        title: cleanName,
        author: "Unknown",
        coverPreviewUrl: null,
        fileName: file.name,
      };

      console.log("BooksTab: New item created with file:", newItem.file); // <-- ADD THIS LOG

      return newItem;
    });
    
    setBooks((prev) => [...prev, ...newItems]);
  };

  const removeBook = (index: number) =>
    setBooks((prev) => prev.filter((_, i) => i !== index));

  return (
    <div>
      <Dropzone onFilesAdded={handleFiles} accept=".pdf,.epub,.mobi">
        <BookOpenIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p>Drag & drop books here (.pdf, .epub)</p>
      </Dropzone>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {books.map((book, idx) => (
          <BookFilePreview
            key={book.id || book.url}
            preview={book}
            onRemove={() => removeBook(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default function ImageUploader({
  images,
  setImages,
  videos,
  setVideos,
  books,
  setBooks,
}: {
  images: UnifiedMediaItem[];
  setImages: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
  videos: UnifiedMediaItem[];
  setVideos: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
  books: UnifiedMediaItem[];
  setBooks: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">("images");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toaster position="top-center" />
      <div className="p-6 bg-white shadow-2xl rounded-2xl space-y-6">
        <TabSwitcher selected={selectedTab} setSelected={setSelectedTab} />
        <AnimatePresence mode="wait">
          {selectedTab === "images" && <ImagesTab images={images} setImages={setImages} />}
          {selectedTab === "videos" && <VideosTab videos={videos} setVideos={setVideos} />}
          {selectedTab === "books" && <BooksTab books={books} setBooks={setBooks} />}
        </AnimatePresence>
      </div>
    </div>
  );
}