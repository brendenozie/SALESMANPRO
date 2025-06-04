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
  coverUrl: string | null;
}

interface MediaUploaderProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  videos: string[];
  setVideos: React.Dispatch<React.SetStateAction<string[]>>;
  books: BookItem[];
  setBooks: React.Dispatch<React.SetStateAction<BookItem[]>>;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  images,
  setImages,
  videos,
  setVideos,
  books,
  setBooks,
}) => {
  // Tab state: "images" | "videos" | "books"
  const [selectedTab, setSelectedTab] = useState<"images" | "videos" | "books">("images");

  // Loading states for dropzones
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Modal for adding a new book
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookCover, setNewBookCover] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);

  // Dropzone for images
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
  } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoadingImages(true);
      setTimeout(() => {
        setImages((prev) => {
          const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newUrls]));
        });
        setLoadingImages(false);
      }, 800);
    },
  });

  // Dropzone for videos
  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
  } = useDropzone({
    accept: { "video/*": [] } as Accept,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setLoadingVideos(true);
      setTimeout(() => {
        setVideos((prev) => {
          const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
          return Array.from(new Set([...prev, ...newUrls]));
        });
        setLoadingVideos(false);
      }, 800);
    },
  });

  // Dropzone for book cover inside modal
  const {
    getRootProps: getCoverRootProps,
    getInputProps: getCoverInputProps,
  } = useDropzone({
    accept: { "image/*": [] } as Accept,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setCoverLoading(true);
      const file = acceptedFiles[0];
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setNewBookCover(url);
        setCoverLoading(false);
      }, 500);
    },
  });

  // Handler: Remove image
  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler: Remove video
  const removeVideo = (idx: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler: Remove book
  const removeBook = (idx: number) => {
    setBooks((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handler: Save new book from modal
  const saveNewBook = () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;
    setBooks((prev) => [
      ...prev,
      { title: newBookTitle.trim(), author: newBookAuthor.trim(), coverUrl: newBookCover },
    ]);
    // Reset modal state
    setNewBookTitle("");
    setNewBookAuthor("");
    setNewBookCover(null);
    setIsBookModalOpen(false);
  };

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
            {loadingImages ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 animate-pulse" />
              </motion.div>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Drag & drop images here, or{" "}
                  <span className="text-orange-500 font-semibold">click to upload</span>
                </p>
              </>
            )}
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative group overflow-hidden rounded-lg shadow-lg">
                    <img
                      src={img}
                      alt={`Preview ${idx}`}
                      className="h-24 w-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                      onClick={() => removeImage(idx)}
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
            {loadingVideos ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ArrowUpTrayIcon className="w-10 h-10 text-gray-500 animate-pulse" />
              </motion.div>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-gray-500">
                  Drag & drop videos here, or{" "}
                  <span className="text-orange-500 font-semibold">click to upload</span>
                </p>
              </>
            )}
          </div>
          {videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {videos.map((vid, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="relative group rounded-lg shadow-lg overflow-hidden">
                    <video
                      src={vid}
                      className="h-32 w-full object-cover rounded-lg"
                      controls
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                      onClick={() => removeVideo(idx)}
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
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
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
                    </div>
                    <button
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-all"
                      onClick={() => removeBook(idx)}
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
              <div>
                <label
                  htmlFor="bookTitle"
                  className="block text-sm font-medium text-gray-700"
                >
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
              <div>
                <label
                  htmlFor="bookAuthor"
                  className="block text-sm font-medium text-gray-700"
                >
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Image (optional)
                </label>
                <div
                  {...getCoverRootProps()}
                  className="border-2 border-dashed border-gray-300 p-4 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center"
                >
                  <input {...getCoverInputProps()} />
                  {coverLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <ArrowUpTrayIcon className="w-8 h-8 text-gray-500 animate-pulse" />
                    </motion.div>
                  ) : newBookCover ? (
                    <img
                      src={newBookCover}
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
