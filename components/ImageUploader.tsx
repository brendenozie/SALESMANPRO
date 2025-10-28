"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpIcon, BookOpenIcon, CloudArrowUpIcon, GiftIcon, TvIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { InboxIcon } from "@heroicons/react/24/solid";

export interface UnifiedMediaItem {
  id: string;
  title: string;
  author: string;
  coverPreviewUrl?: string | null;
  file?: File | null;             // ✅ unified field
  fileName?: string;
  url?: string;
  source: "local" | "server";
}

export function TabSwitcher({ selected, setSelected }: { selected: string; setSelected: (v: "images" | "videos" | "books") => void; }) {
  const tabs = [
    { id: "images", label: "Images", icon: <TvIcon className="w-4 h-4" /> },
    { id: "videos", label: "Videos", icon: <VideoCameraIcon className="w-4 h-4" /> },
    { id: "books", label: "Books", icon: <BookOpenIcon className="w-4 h-4" /> }
  ];
  return (
    <div className="flex justify-center bg-gray-100 p-1 rounded-full">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setSelected(tab.id as any)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${selected === tab.id ? "text-indigo-700 bg-white shadow" : "text-gray-600 hover:bg-gray-200"}`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Dropzone({ onFilesAdded, accept, children }: { onFilesAdded: (files: File[]) => void; accept: string; children: React.ReactNode }) {
  return (
    <div className="relative p-8 border-2 border-dashed rounded-xl text-center hover:border-indigo-400">
      <input type="file" accept={accept} multiple onChange={(e) => e.target.files && onFilesAdded(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer" />
      {children}
    </div>
  );
}

function FilePreview({ preview, onRemove }: { preview: any; onRemove: () => void }) {
  const isImage = preview.file ? preview.file.type.startsWith("image/") : /\.(jpg|jpeg|png|webp)$/i.test(preview.url);
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative group overflow-hidden rounded-lg shadow-md">
      {isImage ? <img src={preview.url} className="w-full h-40 object-cover" /> : <video src={preview.url} controls className="w-full h-40 bg-black" />}
      <button onClick={onRemove} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ImagesTab({ images, setImages }: { images: UnifiedMediaItem[], setImages: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>> }) {
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
    setImages(prev => [...prev, ...newItems]);
  };
  
  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  return (
    <div>
      <Dropzone onFilesAdded={handleFiles} accept="image/*">
        <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p>Drag & drop images here</p>
      </Dropzone>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        {images.map((img, idx) => <FilePreview key={img.url} preview={img} onRemove={() => removeImage(idx)} />)}
      </div>
    </div>
  );
}

export function VideosTab({ videos, setVideos }: { videos: UnifiedMediaItem[], setVideos: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>> }) {
  const handleFiles = (files: File[]) => {
    const newItems: UnifiedMediaItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      source: "local" as const,
      title: file.name || "Untitled Video",
      author: file.name || "Unknown",
      coverPreviewUrl: undefined,
      fileName: file.name || undefined,
    }));
    setVideos(prev => [...prev, ...newItems]);
  };
  const removeVideo = (index: number) => setVideos(prev => prev.filter((_, i) => i !== index));

  return (
    <div>
      <Dropzone onFilesAdded={handleFiles} accept="video/*">
        <ArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
        <p>Drag & drop videos here</p>
      </Dropzone>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {videos.map((vid, idx) => <FilePreview key={vid.url} preview={vid.url} onRemove={() => removeVideo(idx)} />)}
      </div>
    </div>
  );
}

// import React from 'react';
// import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast
// import { BookOpen, UploadCloud, FileText } from 'lucide-react'; // Assuming you have lucide-react or similar icons

// // Assuming UnifiedBookItem structure for context
// interface UnifiedBookItem {
//   title: string;
//   author: string;
//   bookFile?: File;
//   bookFileName?: string;
//   source: 'local' | 'remote';
//   // Add an optional 'id' for better React key/update logic
//   id: string | number; 
// }

interface BooksTabProps {
  books: UnifiedMediaItem[];
  setBooks: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}

export function BooksTab({ books, setBooks }: BooksTabProps) {

  // Handler for *updating* an existing book's file
  const handleBookFileUpdate = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBooks(prev => {
      const updated = [...prev];
      updated[index] = { 
        ...updated[index], 
        file: file, 
        fileName: file.name, 
        source: "local" 
      };
      return updated;
    });
    // Visual feedback is key
    toast.success(`'${file.name}' file assigned to '${books[index].title}'! 🚀`);
  };

  // Handler for *adding* a new book from the empty state upload
  const handleNewBookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // --- ASSUMPTION: You need a way to parse/derive title and author from the file or prompt the user.
    // For this example, we'll use placeholder data. You'll need to expand this!
    const newBook: UnifiedMediaItem = {
      id: Date.now().toString(), // Simple unique ID
      title: file.name.replace(/\.[^/.]+$/, "") || "New Uploaded Book", // Try to use filename
      author: "Unknown Author (Local Upload)",
      file: file,
      fileName: file.name,
      source: "local"
    };
    // --- END ASSUMPTION

    setBooks(prev => [...prev, newBook]);
    toast.success(`"${newBook.title}" has been successfully added to your library! 🎉`);
  };

  // --- RENDERING ---

  // Component for the captivating Empty State
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-gray-300 rounded-xl bg-white hover:border-indigo-400 transition duration-300 ease-in-out">
      <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
      <p className="text-xl font-semibold text-gray-700 mb-2">
        Ready to Dive In?
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Drag & drop your files here, or click to browse. (EPUB/PDF)
      </p>
      <label className="cursor-pointer inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-full text-base font-bold shadow-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105">
        <BookOpenIcon className="w-5 h-5 mr-2" />
        Upload Your First Book
        <input 
          type="file" 
          accept=".pdf,.epub" 
          onChange={handleNewBookUpload} 
          className="hidden" 
        />
      </label>
    </div>
  );

  // Component for an individual visually appealing Book Card
  const BookCard = ({ book, index }: { book: UnifiedMediaItem, index: number }) => (
    <div 
      key={book.id || index} // Use ID if available
      className="flex items-center justify-between p-5 bg-white rounded-xl shadow-md border border-gray-200 transition duration-150 ease-in-out hover:shadow-lg"
    >
      <div className="flex items-center min-w-0 pr-4">
        <BookOpenIcon className="w-6 h-6 text-indigo-500 mr-4 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-extrabold text-lg text-gray-800 truncate">{book.title}</p>
          <p className="text-sm text-gray-500 truncate mt-0.5">
            {book.author}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Visual feedback of the current file */}
        {book.fileName && (
          <div className="text-xs text-gray-600 flex items-center bg-gray-100 p-2 rounded-lg">
            <InboxIcon className="w-4 h-4 mr-1.5 text-green-500" />
            <span className='font-medium max-w-[150px] truncate'>{book.fileName}</span>
          </div>
        )}

        {/* Captivating Update Button */}
        <label className="cursor-pointer bg-indigo-500 text-white p-3 rounded-full text-sm font-semibold shadow-md hover:bg-indigo-600 transition duration-200 transform hover:scale-105" title="Replace Book File">
          <CloudArrowUpIcon className="w-5 h-5" />
          <input 
            type="file" 
            accept=".pdf,.epub" 
            onChange={(e) => handleBookFileUpdate(e, index)} 
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-[400px] rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        📚 My Local Library
      </h2>
      <div className="space-y-4">
        {books && books.length > 0 ? (
          books.map((book, index) => (
            <BookCard key={book.id || index} book={book} index={index} />
          ))
        ) : (
          <EmptyState />
        )}
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
