"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import imageCompression from "browser-image-compression"; // For image compression
import {
  ArrowUpIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  TvIcon,
  VideoCameraIcon,
  XMarkIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

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
  isPrimary,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
}: {
  preview: UnifiedMediaItem;
  onRemove: () => void;
  isPrimary?: boolean;
  onMakePrimary?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
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
      className={`relative group overflow-hidden rounded-xl shadow-md border-2 transition-all ${
        isPrimary ? "border-amber-500 ring-2 ring-amber-400/30" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isImage ? (
        <img src={preview.url} className="w-full h-40 object-cover" alt={preview.title || 'preview'} />
      ) : (
        <video src={preview.url} controls className="w-full h-40 bg-black" />
      )}

      {/* Cover / Primary Badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10">
          <StarIconSolid className="w-3.5 h-3.5 text-white" />
          <span>Cover</span>
        </div>
      )}

      {/* File Size Badge */}
      {preview.file && (
        <div className="absolute top-2 right-9 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow z-10">
          {(preview.file.size / 1024).toFixed(0)} KB
        </div>
      )}

      {/* Action Bar (Visible on Hover / Focus) */}
      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center gap-1">
          {onMoveLeft && (
            <button
              type="button"
              onClick={onMoveLeft}
              title="Move left"
              className="p-1 rounded-md bg-white/80 hover:bg-white text-gray-800 transition-colors"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {onMoveRight && (
            <button
              type="button"
              onClick={onMoveRight}
              title="Move right"
              className="p-1 rounded-md bg-white/80 hover:bg-white text-gray-800 transition-colors"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!isPrimary && onMakePrimary && (
          <button
            type="button"
            onClick={onMakePrimary}
            title="Set as Cover Photo"
            className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1"
          >
            <StarIcon className="w-3 h-3" />
            <span>Make Cover</span>
          </button>
        )}
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-10"
        title="Remove"
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

/**
 * MODIFIED: Now includes image compression
 */
export function ImagesTab({
  images,
  setImages,
}: {
  images: UnifiedMediaItem[];
  setImages: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  // MODIFIED: This function is now async to handle compression
  const handleFiles = async (files: File[]) => {
    const toastId = toast.loading(
      `Processing ${files.length} image(s)... This may take a moment.`
    );

    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp",
    };

    // Process each file
    const newItemsPromises = files.map(async (file): Promise<UnifiedMediaItem | null> => {
      try {
        let finalFile: File = file;
        try {
          const compressed = await imageCompression(file, options);
          if (compressed && compressed.size < file.size) {
            finalFile = compressed;
          }
        } catch (compressionErr) {
          console.warn("Client compression fallback to original:", compressionErr);
          finalFile = file;
        }

        return {
          id: crypto.randomUUID(),
          file: finalFile,
          url: URL.createObjectURL(finalFile),
          source: "local" as const,
          title: finalFile.name || "Untitled Image",
          author: "Merchant",
          coverPreviewUrl: undefined,
          fileName: finalFile.name || undefined,
        };
      } catch (error) {
        console.error("Image processing error:", error);
        toast.error(`Failed to process ${file.name}.`);
        return null;
      }
    });

    // Wait for all promises to resolve and filter out any nulls (failed files)
    const newItems = (await Promise.all(newItemsPromises)).filter(
      Boolean
    ) as UnifiedMediaItem[];

    toast.dismiss(toastId);
    if (newItems.length > 0) {
      toast.success(`Successfully added ${newItems.length} image(s).`);
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const makePrimary = (index: number) => {
    setImages((prev) => {
      if (index === 0 || index >= prev.length) return prev;
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

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
            isPrimary={idx === 0}
            onMakePrimary={idx !== 0 ? () => makePrimary(idx) : undefined}
            onMoveLeft={idx > 0 ? () => moveImage(idx, "left") : undefined}
            onMoveRight={idx < images.length - 1 ? () => moveImage(idx, "right") : undefined}
            onRemove={() => removeImage(idx)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * MODIFIED: Now includes file size validation
 */
export function VideosTab({
  videos,
  setVideos,
}: {
  videos: UnifiedMediaItem[];
  setVideos: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  // MODIFIED: This function now validates file size
  const handleFiles = (files: File[]) => {
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];

    // Separate files into valid and oversized lists
    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    }

    // Notify user about any rejected files
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      toast.error(`Files over 5MB were rejected: ${fileNames}`, {
        duration: 5000,
      });
    }

    // Process only the valid files
    const newItems: UnifiedMediaItem[] = validFiles.map((file) => ({
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
            preview={vid} 
            onRemove={() => removeVideo(idx)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * MODIFIED: Now includes file size validation
 */
export function BooksTab({
  books,
  setBooks,
}: {
  books: UnifiedMediaItem[];
  setBooks: React.Dispatch<React.SetStateAction<UnifiedMediaItem[]>>;
}) {
  // MODIFIED: This function now validates file size
  const handleFiles = (files: File[]) => {
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];

    // Separate files into valid and oversized lists
    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    }

    // Notify user about any rejected files
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      toast.error(`Files over 5MB were rejected: ${fileNames}`, {
        duration: 5000,
      });
    }

    // Process only the valid files
    const newItems: UnifiedMediaItem[] = validFiles.map((file) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
      const newItem = {
        id: crypto.randomUUID(),
        file: file,
        url: URL.createObjectURL(file),
        source: "local" as const,
        title: cleanName,
        author: "Unknown",
        coverPreviewUrl: null,
        fileName: file.name,
      };
      console.log("BooksTab: New item created with file:", newItem.file);
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
