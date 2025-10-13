// File: components/MediaUploader.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "./Modal";
import { useDropzone, Accept } from "react-dropzone";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  VideoCameraIcon,
  BookOpenIcon,
  XMarkIcon,
  PlusIcon,
  CheckIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpTrayIcon } from "@heroicons/react/24/solid";

/* ---------- Types ---------- */
interface BookItem {
  title: string;
  author: string;
  coverFile: File | null;         // raw File for the cover image
  coverPreview: string | null;    // objectURL for the cover preview
  bookFile: File | null;          // raw File for the actual PDF/EPUB/etc.
}

// ───────────────────────────────
// Max file sizes in bytes
// ───────────────────────────────
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_BOOK_COVER_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BOOK_FILE_SIZE = 50 * 1024 * 1024; // 50MB

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

/* ---------- Hook: usePreviewManager ---------- */
/**
 * Centralizes creation and revocation of object URLs.
 * - createPreviews(files) -> string[] (objectURLs)
 * - revoke(url) / revokeMany(urls)
 * - revokeAll() to cleanup on unmount
 */
function usePreviewManager() {
  const created = useRef<Set<string>>(new Set());

  const createPreviews = useCallback((files: File[]) => {
    const urls = files.map((f) => {
      const u = URL.createObjectURL(f);
      created.current.add(u);
      return u;
    });
    return urls;
  }, []);

  const revoke = useCallback((url: string | undefined | null) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      /* ignore */
    }
    created.current.delete(url);
  }, []);

  const revokeMany = useCallback((urls: (string | undefined | null)[]) => {
    urls.forEach((u) => {
      if (u) {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          /* ignore */
        }
        created.current.delete(u);
      }
    });
  }, []);

  const revokeAll = useCallback(() => {
    created.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch (e) {
        /* ignore */
      }
    });
    created.current.clear();
  }, []);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      revokeAll();
    };
  }, [revokeAll]);

  return { createPreviews, revoke, revokeMany, revokeAll };
}



/* ---------- Small motion presets ---------- */
const tileMotion = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  whileHover: { scale: 1.02 },
  transition: { duration: 0.16 },
};

/* ---------- Internal Components (kept inside single file) ---------- */

const TabSwitcher: React.FC<{
  selected: "images" | "videos" | "books";
  setSelected: (t: "images" | "videos" | "books") => void;
}> = ({ selected, setSelected }) => {
  const btnBase =
    "flex items-center space-x-2 pb-2 px-1 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200";

  return (
    <div className="flex space-x-4 border-b border-gray-200 mb-4">
      <button
        className={`${btnBase} ${selected === "images" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-orange-500"}`}
        onClick={() => setSelected("images")}
      >
        <PhotoIcon className="w-6 h-6" />
        <span>Images</span>
      </button>
      <button
        className={`${btnBase} ${selected === "videos" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-orange-500"}`}
        onClick={() => setSelected("videos")}
      >
        <VideoCameraIcon className="w-6 h-6" />
        <span>Videos</span>
      </button>
      <button
        className={`${btnBase} ${selected === "books" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-500 hover:text-orange-500"}`}
        onClick={() => setSelected("books")}
      >
        <BookOpenIcon className="w-6 h-6" />
        <span>Books</span>
      </button>
    </div>
  );
};

/* ---------- ImagesTab ---------- */
const ImagesTab: React.FC<{
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  previewManager: ReturnType<typeof usePreviewManager>;
}> = ({ imageFiles, setImageFiles, imagePreviews, setImagePreviews, previewManager }) => {

  
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      // Append raw files
      setImageFiles((prev) => [...prev, ...acceptedFiles]);

      // Generate previews via manager and append
      const newPreviews = previewManager.createPreviews(acceptedFiles);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [setImageFiles, setImagePreviews, previewManager]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: true,
    onDrop,
  });

  const removeImageAt = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      const url = prev[idx];
      previewManager.revoke(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white transition-all flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-500">
          Drag & drop images here, or{" "}
          <span className="text-orange-500 font-semibold">click to select</span>
        </p>
      </div>

      {imagePreviews && imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imagePreviews.map((url, idx) => (
            <motion.div key={url + idx} {...tileMotion} className="rounded-lg overflow-hidden">
              <div className="relative group overflow-hidden rounded-lg shadow-sm">
                <img
                  src={url}
                  alt={`Preview ${idx}`}
                  className="h-28 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105 aspect-square"
                />
                <button
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-all"
                  onClick={() => removeImageAt(idx)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- VideosTab ---------- */
const VideosTab: React.FC<{
  videoFiles: File[];
  setVideoFiles: React.Dispatch<React.SetStateAction<File[]>>;
  videoPreviews: string[];
  setVideoPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  previewManager: ReturnType<typeof usePreviewManager>;
}> = ({ videoFiles, setVideoFiles, videoPreviews, setVideoPreviews, previewManager }) => {

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      setVideoFiles((prev) => [...prev, ...acceptedFiles]);
      const newPreviews = previewManager.createPreviews(acceptedFiles);
      setVideoPreviews((prev) => [...prev, ...newPreviews]);
    },
    [setVideoFiles, setVideoPreviews, previewManager]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "video/*": [] } as Accept,
    multiple: true,
    onDrop,
  });
  

  const removeVideoAt = (idx: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
    setVideoPreviews((prev) => {
      const url = prev[idx];
      previewManager.revoke(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white transition-all flex flex-col items-center justify-center"
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-gray-500">
          Drag & drop videos here, or{" "}
          <span className="text-orange-500 font-semibold">click to select</span>
        </p>
      </div>

      {videoPreviews && videoPreviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {videoPreviews.map((url, idx) => (
            <motion.div key={url + idx} {...tileMotion}>
              <div className="relative group rounded-lg shadow-sm overflow-hidden">
                <video
                  src={url}
                  className="h-40 w-full object-cover rounded-lg aspect-video"
                  controls
                />
                <button
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-all"
                  onClick={() => removeVideoAt(idx)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- BookModal (internal) ---------- */
const BookModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: BookItem) => void;
  previewManager: ReturnType<typeof usePreviewManager>;
}> = ({ isOpen, onClose, onSave, previewManager }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // clear when closing
      setTitle("");
      setAuthor("");
      if (coverPreview) {
        previewManager.revoke(coverPreview);
        setCoverPreview(null);
      }
      setCoverFile(null);
      setBookFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // dropzone for cover inside modal
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      const f = acceptedFiles[0];
      // revoke previous preview if exists
      if (coverPreview) previewManager.revoke(coverPreview);
      const u = previewManager.createPreviews([f])[0];
      setCoverFile(f);
      setCoverPreview(u);
    },
  });

  const handleBookFileSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setBookFile(null);
      return;
    }
    setBookFile(e.target.files[0]);
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      // keep UI simple — no toast here but you may add validation UI as needed
      return;
    }

    onSave({
      title: title.trim(),
      author: author.trim(),
      coverFile,
      coverPreview,
      bookFile,
    });

    // Reset local modal state (onClose will also clear)
    setTitle("");
    setAuthor("");
    setCoverFile(null);
    setCoverPreview(null);
    setBookFile(null);
    onClose();
  };

  // subtle motion for modal content
  const contentMotion = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.16 },
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        {...contentMotion}
        className="bg-white/80 backdrop-blur-md p-6 rounded-xl w-full max-w-md mx-auto shadow-2xl"
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Book</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="bookTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Great Gatsby"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              id="bookAuthor"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. F. Scott Fitzgerald"
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image (optional)
            </label>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer bg-white/60 backdrop-blur-sm hover:bg-white transition-all flex items-center justify-center"
            >
              <input {...getInputProps()} />
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover Preview"
                  className="h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <CameraIcon className="w-8 h-8 text-gray-400 mb-1" />
                  <p className="text-gray-500 text-sm">
                    Drag & drop an image, or{" "}
                    <span className="text-orange-500 font-semibold">click to select</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700">
              Book File (PDF, EPUB, etc.)
            </label>
            <input
              type="file"
              id="bookFile"
              accept=".pdf,.epub,.mobi,.txt,.doc,.docx"
              onChange={handleBookFileSelect}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            {bookFile && <p className="text-gray-500 text-sm mt-1">{bookFile.name}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center space-x-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Save Book</span>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

/* ---------- BooksTab ---------- */
const BooksTab: React.FC<{
  books: BookItem[];
  setBooks: React.Dispatch<React.SetStateAction<BookItem[]>>;
  previewManager: ReturnType<typeof usePreviewManager>;
}> = ({ books, setBooks, previewManager }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeBookAt = (idx: number) => {
    setBooks((prev) => {
      const copy = [...prev];
      const candidate = copy[idx];
      if (candidate?.coverPreview) previewManager.revoke(candidate.coverPreview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleSaveBook = (book: BookItem) => {
    setBooks((prev) => [...prev, book]);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow"
      >
        <PlusIcon className="w-5 h-5" />
        <span>Add New Book</span>
      </button>

      {books && books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {books.map((book, idx) => (
            <motion.div key={book.title + idx} {...tileMotion}>
              <div className="relative bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                {book.coverPreview ? (
                  <img src={book.coverPreview} alt={book.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 w-full bg-gray-200 flex items-center justify-center">
                    <BookOpenIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <div className="p-3">
                  <h4 className="text-gray-800 font-semibold">{book.title}</h4>
                  <p className="text-gray-600 text-sm">{book.author}</p>
                  {book.bookFile && (
                    <p className="text-gray-500 text-xs mt-1">{book.bookFile.name}</p>
                  )}
                </div>

                <button
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-all"
                  onClick={() => removeBookAt(idx)}
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No books added yet.</p>
      )}

      <BookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBook}
        previewManager={previewManager}
      />
    </div>
  );
};

/* ---------- Main Component: MediaUploader ---------- */
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
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">("images");
  const previewManager = usePreviewManager();

  // If parent passed initial previews that were created outside of this component,
  // we don't want to double revoke them — so we only track previews we created.
  // The hook safely revokes what it created. Still, when removing items we also
  // call previewManager.revoke(url) — if it wasn't created by this hook, revoke is safe (no-op if URL already revoked).

  // Unified cleanup for book cover previews stored inside books
  useEffect(() => {
    return () => {
      // Revoke book cover previews (they might not be owned by previewManager)
      if (books && books.length > 0) {
        books.forEach((b) => {
          if (b.coverPreview) {
            try {
              URL.revokeObjectURL(b.coverPreview);
            } catch (e) {
              // ignore
            }
          }
        });
      }
      // previewManager.revokeAll() will run on unmount from its own effect
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only on unmount

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-6">
      <TabSwitcher selected={selectedTab} setSelected={setSelectedTab} />

      {selectedTab === "images" && (
        <ImagesTab
          imageFiles={imageFiles}
          setImageFiles={setImageFiles}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          previewManager={previewManager}
        />
      )}

      {selectedTab === "videos" && (
        <VideosTab
          videoFiles={videoFiles}
          setVideoFiles={setVideoFiles}
          videoPreviews={videoPreviews}
          setVideoPreviews={setVideoPreviews}
          previewManager={previewManager}
        />
      )}

      {selectedTab === "books" && (
        <BooksTab books={books} setBooks={setBooks} previewManager={previewManager} />
      )}
    </div>
  );
};

export default MediaUploader;
