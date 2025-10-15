"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { ArrowUpIcon, BookOpenIcon, CloudArrowUpIcon, GiftIcon, TvIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";

// --- Helper Class: PreviewManager ---
class PreviewManager {
  createPreviews(files: File[], startIndex = 0) {
    return files.map((file, idx) => ({
      file, // Keep the original file object
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      index: startIndex + idx,
    }));
  }

  revokePreviews(previews: { url: string }[]) {
    previews.forEach(p => URL.revokeObjectURL(p.url));
  }
}

// --- Constants ---
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_BOOK_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// --- UI Components ---

// A more visually engaging Tab Switcher
export function TabSwitcher({ selected, setSelected }: { selected: string; setSelected: (v: "images" | "videos" | "books") => void; }) {
  const tabs = [
    { id: "images", label: "Images", icon: <TvIcon className="w-4 h-4" /> },
    { id: "videos", label: "Videos", icon: <VideoCameraIcon className="w-4 h-4" /> },
    { id: "books", label: "Books", icon: <BookOpenIcon className="w-4 h-4" /> }
  ];
  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setSelected(tab.id as any)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            selected === tab.id
              ? "text-indigo-700"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {selected === tab.id && (
            <motion.div
              layoutId="active-tab-indicator"
              className="absolute inset-0 bg-white dark:bg-gray-900 rounded-full shadow-md z-0"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.icon}</span>
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// A reusable Dropzone component
function Dropzone({ onFilesAdded, accept, children }: { onFilesAdded: (files: File[]) => void; accept: string; children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onFilesAdded(Array.from(e.dataTransfer.files));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300 ${
        isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
      }`}
    >
      <input type="file" accept={accept} multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      {children}
    </div>
  );
}

// Generic File Preview component
// function FilePreview({ preview, onRemove }: { preview: any; onRemove: () => void }) {
//     const formatBytes = (bytes: number, decimals = 2) => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const dm = decimals < 0 ? 0 : decimals;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
//     };

//     return (
//         <motion.div
//             layout
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.8 }}
//             className="relative group overflow-hidden rounded-lg shadow-md"
//         >
//             {preview.file.type.startsWith('image/') ? (
//                  <img src={preview.url} alt={preview.name} className="w-full h-40 object-cover" />
//             ) : (
//                 <video src={preview.url} controls className="w-full h-40 object-cover bg-black" />
//             )}

//             <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs backdrop-blur-sm">
//                 <p className="font-semibold truncate">{preview.name}</p>
//                 <p>{formatBytes(preview.size)}</p>
//             </div>
//             <button
//                 onClick={onRemove}
//                 className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//             >
//                <XMarkIcon className="h-4 w-4" />
//             </button>
//         </motion.div>
//     );
// }

// Generic File Preview component
function FilePreview({ preview, onRemove }: { preview: any; onRemove: () => void }) {
    const formatBytes = (bytes: number, decimals = 2) => {
        if (!bytes || bytes === 0) return '';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // --- FIX APPLIED HERE ---
    // Determine if the media is an image in a safe way.
    // 1. Check if a local File object's type exists.
    // 2. If not (e.g., for a server URL), guess from the URL's extension.
    const isImage = preview.file
        ? preview.file.type.startsWith('image/')
        : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(preview.url);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative group overflow-hidden rounded-lg shadow-md"
        >
            {isImage ? (
                 <img src={preview.url} alt={preview.name || 'Image preview'} className="w-full h-40 object-cover" />
            ) : (
                <video src={preview.url} controls className="w-full h-40 object-cover bg-black" />
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-xs backdrop-blur-sm">
                <p className="font-semibold truncate">{preview.name || preview.url.split('/').pop()}</p>
                {/* Only display size if it exists */}
                {preview.size && <p>{formatBytes(preview.size)}</p>}
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
// --- Tabs ---
export function ImagesTab({ imageFiles, setImageFiles, imagePreviews, setImagePreviews, previewManager }: any) {
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file.`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} exceeds 10MB.`);
        return false;
      }
      return true;
    });

    const newPreviews = previewManager.createPreviews(validFiles, imagePreviews.length);
    setImageFiles([...imageFiles, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (indexToRemove: number) => {
    previewManager.revokePreviews([imagePreviews[indexToRemove]]);
    setImageFiles(imageFiles.filter((_: any, i: number) => i !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_: any, i: number) => i !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      <Dropzone onFilesAdded={handleFiles} accept="image/*">
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <CloudArrowUpIcon className="h-10 w-10 text-gray-400" />
            <p className="font-semibold">Drag & drop images here</p>
            <p className="text-sm">or click to browse</p>
            <p className="text-xs mt-2">Max file size: 10MB</p>
        </div>
      </Dropzone>

      <AnimatePresence>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imagePreviews.map((preview: any, index: number) => (
            <FilePreview key={preview.url} preview={preview} onRemove={() => removeImage(index)} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

export function VideosTab({ videoFiles, setVideoFiles, videoPreviews, setVideoPreviews, previewManager }: any) {
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid video file.`);
        return false;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`${file.name} exceeds 100MB.`);
        return false;
      }
      return true;
    });

    const newPreviews = previewManager.createPreviews(validFiles, videoPreviews.length);
    setVideoFiles([...videoFiles, ...validFiles]);
    setVideoPreviews([...videoPreviews, ...newPreviews]);
  };

  const removeVideo = (index: number) => {
    previewManager.revokePreviews([videoPreviews[index]]);
    setVideoFiles(videoFiles.filter((_:any, i:number) => i !== index));
    setVideoPreviews(videoPreviews.filter((_:any, i:number) => i !== index));
  };

  return (
    <div className="space-y-6">
        <Dropzone onFilesAdded={handleFiles} accept="video/*">
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <ArrowUpIcon className="text-gray-400 w-10 h-10" />
                <p className="font-semibold">Drag & drop videos here</p>
                <p className="text-sm">or click to browse</p>
                <p className="text-xs mt-2">Max file size: 100MB</p>
            </div>
        </Dropzone>
        <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {videoPreviews.map((preview: any, index: number) => (
                <FilePreview key={preview.url} preview={preview} onRemove={() => removeVideo(index)} />
            ))}
            </div>
        </AnimatePresence>
    </div>
  );
}


// --- Updated BooksTab ---
// This component now focuses ONLY on updating the book file for existing books.
export function BooksTab({ books, setBooks }: { books: BookItem[], setBooks: React.Dispatch<React.SetStateAction<BookItem[]>> }) {
  
  const handleBookFileUpdate = (e: React.ChangeEvent<HTMLInputElement>, bookIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_BOOK_FILE_SIZE) {
      toast.error(`"${file.name}" exceeds the 50MB limit.`);
      return;
    }

    const updatedBooks = [...books];
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], bookFile: file, bookFileName: file.name };
    setBooks(updatedBooks);
    toast.success(`File for "${updatedBooks[bookIndex].title}" updated!`);
  };

  if (!books || books.length === 0) {
      return (
        <div className="text-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Books Found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Book details are managed elsewhere. Use this tab to update their files.</p>
        </div>
      )
  }

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4">
                        <img
                            src={book.coverPreview || 'https://placehold.co/48x64/E0E7FF/4F46E5?text=Book'}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded shadow-md"
                        />
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-white">{book.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">by {book.author}</p>
                            {book.bookFileName && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                                    <GiftIcon className="h-3 w-3" />
                                    <span>{book.bookFileName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <label className="cursor-pointer bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-2 rounded-md text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900">
                        Update File
                        <input
                            type="file"
                            accept=".pdf,.epub"
                            onChange={(e) => handleBookFileUpdate(e, index)}
                            className="hidden"
                        />
                    </label>
                </div>
            ))}
        </div>
    </div>
  );
}

// --- Main Component ---
interface BookItem {
  id: string | number;
  title: string;
  author: string;
  coverPreview: string | null;
  bookFile: File | null;
  bookFileName?: string; // To display the name of the currently attached file
}

interface MediaUploaderProps {
  // Existing state for images and videos
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviews: any[];
  setImagePreviews: React.Dispatch<React.SetStateAction<any[]>>;
  videoFiles: File[];
  setVideoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  videoPreviews: any[];
  setVideoPreviews: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Book props - pass existing books into the component
  books: BookItem[];
  setBooks: React.Dispatch<React.SetStateAction<BookItem[]>>;
}

const ImageUploader: React.FC<MediaUploaderProps> = ({
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews,
  videoFiles,
  setVideoFiles,
  videoPreviews,
  setVideoPreviews,
  books,
  setBooks,
}) => {
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">("images");
  const previewManager = new PreviewManager();

  const tabContentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Toaster position="top-center" toastOptions={{
          className: 'dark:bg-gray-700 dark:text-white',
      }} />
      <div className="p-6 bg-white dark:bg-gray-900/50 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6">
        <TabSwitcher selected={selectedTab} setSelected={setSelectedTab} />
        <div className="pt-4">
            <AnimatePresence mode="wait">
            {selectedTab === "images" && (
                <motion.div key="images" {...tabContentVariants}>
                <ImagesTab
                    imageFiles={imageFiles}
                    setImageFiles={setImageFiles}
                    imagePreviews={imagePreviews}
                    setImagePreviews={setImagePreviews}
                    previewManager={previewManager}
                />
                </motion.div>
            )}
            {selectedTab === "videos" && (
                <motion.div key="videos" {...tabContentVariants}>
                <VideosTab
                    videoFiles={videoFiles}
                    setVideoFiles={setVideoFiles}
                    videoPreviews={videoPreviews}
                    setVideoPreviews={setVideoPreviews}
                    previewManager={previewManager}
                />
                </motion.div>
            )}
            {selectedTab === "books" && (
                <motion.div key="books" {...tabContentVariants}>
                <BooksTab
                    books={books}
                    setBooks={setBooks}
                />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;