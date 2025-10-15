"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";


// --- PreviewManager ---
class PreviewManager {
  createPreviews(files: File[], startIndex = 0) {
    return files.map((file, idx) => ({
      url: URL.createObjectURL(file),
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
const MAX_BOOK_COVER_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BOOK_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// --- TabSwitcher ---
export function TabSwitcher({
  selected,
  setSelected,
}: {
  selected: string;
  setSelected: (v: "images" | "videos" | "books") => void;
}) {
  const tabs = ["images", "videos", "books"];
  return (
    <div className="flex justify-center space-x-4">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setSelected(tab as any)}
          className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
            selected === tab
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// --- ImagesTab ---
export function ImagesTab({
  imageFiles,
  setImageFiles,
  imagePreviews,
  setImagePreviews,
  previewManager,
}: any) {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB.`);
        return false;
      }
      return true;
    });

    const newPreviews = previewManager.createPreviews(validFiles, imagePreviews.length)
      .map((p:any) => ({ ...p, source: "local" })); // 🟢 mark as new

    setImageFiles([...imageFiles, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const updatedPreviews = [...imagePreviews];
    const removed = updatedPreviews.splice(index, 1)[0];

    if (removed.source === "local") {
      // also remove corresponding file
      const updatedFiles = [...imageFiles];
      updatedFiles.splice(index, 1);
      previewManager.revokePreviews([removed]);
      setImageFiles(updatedFiles);
    }

    setImagePreviews(updatedPreviews);
  };

  return (
    <div className="space-y-4">
      <Toaster />
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="block w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-2"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {imagePreviews.map((preview: any, index: number) => (
          <div key={preview.index} className="relative group">
            <img
              src={preview.url}
              alt="preview"
              className={`rounded-lg w-full h-32 object-cover shadow-md ${
                preview.source === "server" ? "border border-green-400" : ""
              }`}
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- VideosTab ---
export function VideosTab({
  videoFiles,
  setVideoFiles,
  videoPreviews,
  setVideoPreviews,
  previewManager,
}: any) {
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const validFiles = files.filter(file => {
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
    const updatedFiles = [...videoFiles];
    const updatedPreviews = [...videoPreviews];
    previewManager.revokePreviews([updatedPreviews[index]]);
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setVideoFiles(updatedFiles);
    setVideoPreviews(updatedPreviews);
  };

  return (
    <div className="space-y-4">
      <Toaster />
      <input
        type="file"
        accept="video/*"
        multiple
        onChange={handleFiles}
        className="block w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-2"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videoPreviews.map((preview: any, index: number) => (
          <div key={preview.index} className="relative group">
            <video
              src={preview.url}
              controls
              className="rounded-lg w-full h-40 object-cover shadow-md"
            />
            <button
              onClick={() => removeVideo(index)}
              className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- BooksTab ---
export function BooksTab({
  books,
  setBooks,
  maxCoverSize = MAX_BOOK_COVER_SIZE,
  maxBookSize = MAX_BOOK_FILE_SIZE,
}: any) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > maxCoverSize) {
      toast.error("Cover image exceeds 5MB.");
      return;
    }
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleBook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > maxBookSize) {
      toast.error("Book file exceeds 50MB.");
      return;
    }
    setBookFile(file ?? null);
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      toast.error("Please provide both title and author.");
      return;
    }

    setBooks((prev: any[]) => [
      ...prev,
      {
        title,
        author,
        coverFile,
        coverPreview,
        bookFile,
      },
    ]);

    setTitle("");
    setAuthor("");
    setCoverFile(null);
    setCoverPreview(null);
    setBookFile(null);
  };

  const removeBook = (index: number) => {
    const updated = [...books];
    updated.splice(index, 1);
    setBooks(updated);
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 w-full"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 rounded-lg p-2 w-full"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input type="file" accept="image/*" onChange={handleCover} />
        <input type="file" accept=".pdf,.epub" onChange={handleBook} />
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Add Book
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {books.map((b: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow"
          >
            <div className="flex items-center gap-3">
              {b.coverPreview && (
                <img
                  src={b.coverPreview}
                  alt={b.title}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-semibold">{b.title}</div>
                <div className="text-sm text-gray-500">{b.author}</div>
              </div>
            </div>
            <button
              onClick={() => removeBook(index)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ---------- Types ---------- */
interface BookItem {
  title: string;
  author: string;
  coverFile: File | null;         // raw File for the cover image
  coverPreview: string | null;    // objectURL for the cover preview
  bookFile: File | null;          // raw File for the actual PDF/EPUB/etc.
}

interface MediaUploaderProps {
  // Parent maintains raw File arrays and preview URLs
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;

  videoFiles: File[];
  setVideoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  videoPreviews: string[];
  setVideoPreviews: React.Dispatch<React.SetStateAction<string[]>>;

  books: BookItem[];
  setBooks: React.Dispatch<React.SetStateAction<BookItem[]>>;
}

// --- Main MediaUploader ---
const MediaUploader: React.FC<MediaUploaderProps> = ({
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
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">(
    "images"
  );

  // const [imageFiles, setImageFiles] = useState<File[]>([]);
  // const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // const [videoFiles, setVideoFiles] = useState<File[]>([]);
  // const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  // const [books, setBooks] = useState<any[]>([]);

  const previewManager = new PreviewManager();

  const handleImageDrop = useCallback(
    (files: File[]) => {
      const valid = files.filter(f => f.size <= MAX_IMAGE_SIZE);
      const invalid = files.filter(f => f.size > MAX_IMAGE_SIZE);
      if (invalid.length) toast.error(`${invalid.length} file(s) exceed 10MB.`);
      if (valid.length) {
        setImageFiles(prev => [...prev, ...valid]);
        const previews = previewManager.createPreviews(valid);
        setImagePreviews(prev => [
          ...prev,
          ...previews.map(p => p.url)
        ]);
      }
    },
    [previewManager]
  );

  const handleVideoDrop = useCallback(
    (files: File[]) => {
      const valid = files.filter(f => f.size <= MAX_VIDEO_SIZE);
      const invalid = files.filter(f => f.size > MAX_VIDEO_SIZE);
      if (invalid.length)
        toast.error(`${invalid.length} video(s) exceed 100MB.`);
      if (valid.length) {
        setVideoFiles(prev => [...prev, ...valid]);
        const previews = previewManager.createPreviews(valid);
        setVideoPreviews(prev => [...prev, ...previews.map(p => p.url)]);
      }
    },
    [previewManager]
  );

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: "easeOut" },
  };

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <div className="p-6 bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6 transition-all duration-300">
        <TabSwitcher selected={selectedTab} setSelected={setSelectedTab} />

        <AnimatePresence mode="wait">
          {selectedTab === "images" && (
            <motion.div key="images" {...tabVariants}>
              <ImagesTab
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                imagePreviews={imagePreviews}
                setImagePreviews={setImagePreviews}
                previewManager={previewManager}
                onDrop={handleImageDrop}
              />
            </motion.div>
          )}
          {selectedTab === "videos" && (
            <motion.div key="videos" {...tabVariants}>
              <VideosTab
                videoFiles={videoFiles}
                setVideoFiles={setVideoFiles}
                videoPreviews={videoPreviews}
                setVideoPreviews={setVideoPreviews}
                previewManager={previewManager}
                onDrop={handleVideoDrop}
              />
            </motion.div>
          )}
          {selectedTab === "books" && (
            <motion.div key="books" {...tabVariants}>
              <BooksTab
                books={books}
                setBooks={setBooks}
                previewManager={previewManager}
                maxCoverSize={MAX_BOOK_COVER_SIZE}
                maxBookSize={MAX_BOOK_FILE_SIZE}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MediaUploader;