// File: components/MediaUploader.tsx
import React, { useState, useEffect } from "react";
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

interface BookItem {
  title: string;
  author: string;
  coverFile: File | null;         // raw File for the cover image
  coverPreview: string | null;    // objectURL for the cover preview
  bookFile: File | null;          // raw File for the actual PDF/EPUB/etc.
}

interface MediaUploaderProps {
  // We now expect the parent to maintain raw File arrays (and preview URLs):
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
  // Tab state
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">("images");

  // Modal for adding a new book
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");

  const [newBookCoverFile, setNewBookCoverFile] = useState<File | null>(null);
  const [newBookCoverPreview, setNewBookCoverPreview] = useState<string | null>(null);

  const [newBookFile, setNewBookFile] = useState<File | null>(null);


  // ───────────────────────────────
  // 1) Drop Images (no immediate upload)
  // ───────────────────────────────
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
  } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) return;

      // 1. Append raw File objects to state
      setImageFiles((prev) => [...prev, ...acceptedFiles]);

      // 2. Generate object URLs for previews
      const newPreviews = acceptedFiles.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
  });

  // ───────────────────────────────
  // 2) Drop Videos (no immediate upload)
  // ───────────────────────────────
  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
  } = useDropzone({
    accept: { "video/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) return;

      // 1. Append raw File objects to state
      setVideoFiles((prev) => [...prev, ...acceptedFiles]);

      // 2. Generate object URLs for previews
      const newPreviews = acceptedFiles.map((f) => URL.createObjectURL(f));
      setVideoPreviews((prev) => [...prev, ...newPreviews]);
    },
  });

  // ───────────────────────────────
  // 3) Drop Book Cover (inside modal)
  // ───────────────────────────────
  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
  } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];

      // 1. Keep raw File for later upload
      setNewBookCoverFile(file);

      // 2. Generate object URL for preview
      const preview = URL.createObjectURL(file);
      setNewBookCoverPreview(preview);
    },
  });

  // ───────────────────────────────
  // 4) Cleanup object URLs on unmount
  // ───────────────────────────────
  useEffect(() => {
    return () => {
      // Revoke all previews when unmounting
      if(imagePreviews && imagePreviews.length > 0){
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      }

      if(videoPreviews && videoPreviews.length > 0){
        videoPreviews.forEach((url) => URL.revokeObjectURL(url));
      }

      if(books && books.length > 0){
        books.forEach((b) => {
          if (b.coverPreview) URL.revokeObjectURL(b.coverPreview);
        });
      }

      if (newBookCoverPreview) URL.revokeObjectURL(newBookCoverPreview);
    };
  }, [
    imagePreviews,
    videoPreviews,
    books,
    newBookCoverPreview,
  ]);

  // ───────────────────────────────
  // (2) Simple <input type="file"> for Book File (PDF/EPUB/etc.)
  // ───────────────────────────────
  // You could also use `useDropzone` with accept: { "application/pdf": [], "application/epub+zip": [] }
  // but for simplicity here, I’ll show a plain input that accepts any file:
  const handleBookFileSelect: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setNewBookFile(null);
      return;
    }
    setNewBookFile(e.target.files[0]);
  };

   // ───────────────────────────────
  // (3) Revoke object URLs on unmount to avoid memory leaks
  // ───────────────────────────────
  useEffect(() => {
    return () => {
      if (newBookCoverPreview) {
        URL.revokeObjectURL(newBookCoverPreview);
      }
      if(books && books.length > 0){
        books.forEach((b) => {
          if (b.coverPreview) URL.revokeObjectURL(b.coverPreview);
        });
      }
    };

  }, [books, newBookCoverPreview]);


  // ───────────────────────────────
  // (4) Handler to remove a BookItem
  // ───────────────────────────────
  const removeBookAt = (idx: number) => {
    setBooks((prev) => {
      const copy = [...prev];
      if (copy[idx].coverPreview) {
        URL.revokeObjectURL(copy[idx].coverPreview!);
      }
      copy.splice(idx, 1);
      return copy;
    });
  };

   // ───────────────────────────────
  // (5) Save New Book (no upload here—just keep the File objects)
  // ───────────────────────────────
  const saveNewBook = () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      return;
    }

    setBooks((prev) => [
      ...prev,
      {
        title: newBookTitle.trim(),
        author: newBookAuthor.trim(),
        coverFile: newBookCoverFile,
        coverPreview: newBookCoverPreview,
        bookFile: newBookFile,
      },
    ]);

    // Reset modal state
    setNewBookTitle("");
    setNewBookAuthor("");
    setNewBookCoverFile(null);
    setNewBookCoverPreview(null);
    setNewBookFile(null);
    setIsBookModalOpen(false);
  };

  // ───────────────────────────────
  // 5) Handlers to remove items
  // ───────────────────────────────
  const removeImageAt = (idx: number) => {
    // 1) Remove raw File
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    // 2) Revoke & remove preview URL
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeVideoAt = (idx: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
    setVideoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // const removeBookAt = (idx: number) => {
  //   setBooks((prev) => {
  //     const copy = [...prev];
  //     if (copy[idx].coverPreview) URL.revokeObjectURL(copy[idx].coverPreview!);
  //     copy.splice(idx, 1);
  //     return copy;
  //   });
  // };

  // ───────────────────────────────
  // 6) Save new book from modal (no S3 yet)
  // ───────────────────────────────
  // const saveNewBook = () => {
  //   if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

  //   setBooks((prev) => [
  //     ...prev,
  //     {
  //       title: newBookTitle.trim(),
  //       author: newBookAuthor.trim(),
  //       coverFile: newBookCoverFile,
  //       coverPreview: newBookCoverPreview,
  //     },
  //   ]);

  //   // Clear modal state
  //   setNewBookTitle("");
  //   setNewBookAuthor("");
  //   setNewBookCoverFile(null);
  //   setNewBookCoverPreview(null);
  //   setIsBookModalOpen(false);
  // };

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 space-y-6">
      {/* ── Tabs ── */}
      <div className="flex space-x-4 border-b border-gray-200 mb-4">
        <button
          className={`flex items-center space-x-2 pb-2 ${
            selectedTab === "images"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-500 hover:text-orange-500"
          }`}
          onClick={() => setSelectedTab("images")}
        >
          <PhotoIcon className="w-6 h-6" />
          <span>Images</span>
        </button>
        <button
          className={`flex items-center space-x-2 pb-2 ${
            selectedTab === "videos"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-500 hover:text-orange-500"
          }`}
          onClick={() => setSelectedTab("videos")}
        >
          <VideoCameraIcon className="w-6 h-6" />
          <span>Videos</span>
        </button>
        <button
          className={`flex items-center space-x-2 pb-2 ${
            selectedTab === "books"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-500 hover:text-orange-500"
          }`}
          onClick={() => setSelectedTab("books")}
        >
          <BookOpenIcon className="w-6 h-6" />
          <span>Books</span>
        </button>
      </div>

      {/* ── Images Tab ── */}
      {selectedTab === "images" && (
        <div className="space-y-6">
          <div
            {...getImageRootProps()}
            className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
          >
            <input {...getImageInputProps()} />
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">
              Drag & drop images here, or{" "}
              <span className="text-orange-500 font-semibold">click to select</span>
            </p>
          </div>

          {imagePreviews && imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews && imagePreviews.length > 0 &&imagePreviews.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative group overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={url}
                      alt={`Preview ${idx}`}
                      className="h-24 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
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
      )}

      {/* ── Videos Tab ── */}
      {selectedTab === "videos" && (
        <div className="space-y-6">
          <div
            {...getVideoRootProps()}
            className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center justify-center"
          >
            <input {...getVideoInputProps()} />
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">
              Drag & drop videos here, or{" "}
              <span className="text-orange-500 font-semibold">click to select</span>
            </p>
          </div>

          {videoPreviews.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {videoPreviews.map((url, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative group rounded-lg shadow-lg overflow-hidden">
                    <video
                      src={url}
                      className="h-32 w-full object-cover rounded-lg"
                      controls
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
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
      )}

      {/* ── Books Tab ── */}
      {selectedTab === "books" && (
        <div className="space-y-6">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add New Book</span>
          </button>

          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((book, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative bg-gray-50 rounded-lg shadow-lg overflow-hidden">
                    {book.coverPreview ? (
                      <img
                        src={book.coverPreview}
                        alt={book.title}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="h-32 w-full bg-gray-200 flex items-center justify-center">
                        <BookOpenIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="text-gray-800 font-semibold">{book.title}</h4>
                      <p className="text-gray-600 text-sm">{book.author}</p>
                      {book.bookFile && (
                        <p className="text-gray-500 text-xs mt-1">
                          {book.bookFile.name}
                        </p>
                      )}
                    </div>
                    <button
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
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
        </div>
      )}

      {/* ── Book Modal ── */}
      {isBookModalOpen && (
        <Modal onClose={() => setIsBookModalOpen(false)}>
          <div className="bg-white p-6 rounded-xl w-full max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Book</h3>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="bookTitle" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="bookTitle"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. The Great Gatsby"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Author */}
              <div>
                <label htmlFor="bookAuthor" className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  id="bookAuthor"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="e.g. F. Scott Fitzgerald"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Cover Image Dropzone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image (optional)
                </label>
                <div
                  {...getCoverRootProps()}
                  className="border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center"
                >
                  <input {...getCoverInputProps()} />
                  {newBookCoverPreview ? (
                    <img
                      src={newBookCoverPreview}
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
              {/* Book File Input */}
              <div>
                <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700">
                  Book File (PDF, EPUB, etc.)
                </label>
                <input
                  type="file"
                  id="bookFile"
                  accept=".pdf,.epub,.mobi,.txt,.doc,.docx"
                  onChange={handleBookFileSelect}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newBookFile && (
                  <p className="text-gray-500 text-sm mt-1">{newBookFile.name}</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveNewBook}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
              >
                <CheckIcon className="w-5 h-5" />
                <span>Save Book</span>
              </button>
            </div>
          </div>
        </Modal>
      )}


























      

      
    </div>
  );
};

export default MediaUploader;
