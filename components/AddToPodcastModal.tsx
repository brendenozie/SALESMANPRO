// components/AddToPodcastModal.tsx
"use client";

import { IStoreCategory } from "@/types/typings";
import React, { useState, useEffect } from "react";

// Assuming StoreCategory is defined elsewhere and has categoryId and displayName
// If your backend Category type uses _id and name, you might want to align this.
// type StoreCategory = {
//   categoryId: string; // Maps to _id from backend
//   displayName: string; // Maps to name from backend
//   image: string;
//   tags: string[];
//   status: string;
// };

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define the Podcast type for the client side
type Podcast = {
  _id: string;
  creatorId: string;
  creatorType: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  episodeNumber: number;
  releaseDate: string; // ISO string
  categories: string; // Corrected: Array of category _ids (Prisma/MongoDB _id)
  tags: string[]; // Array of tag _ids
  coverImageUrl: string;
  isFeatured: boolean;
  companyId: string; // Added as per your provided code
  createdAt: string;
  updatedAt: string;
};

interface AddToPodcastModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  podcastToEdit: Podcast | null; // Null for adding, Podcast object for editing
  companyId: string;
  categories: IStoreCategory[]; // To populate the category dropdown/multiselect
  onSuccess?: () => void; // Callback to refresh data after success
}

export default function AddToPodcastModal({
  showModal,
  setShowModal,
  podcastToEdit,
  companyId,
  categories,
  onSuccess,
}: AddToPodcastModalProps) {
  const [formData, setFormData] = useState<Partial<Podcast>>({
    title: "",
    description: "",
    audioUrl: "",
    duration: 0,
    episodeNumber: 1,
    releaseDate: new Date().toISOString().split("T")[0], // Default to today
    categories: '', // Corrected: Initialize as array
    tags: [],
    coverImageUrl: "",
    isFeatured: false,
    companyId: companyId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (podcastToEdit) {
      // Populate form for editing
      setFormData({
        title: podcastToEdit.title,
        description: podcastToEdit.description,
        audioUrl: podcastToEdit.audioUrl,
        duration: podcastToEdit.duration,
        episodeNumber: podcastToEdit.episodeNumber,
        releaseDate: podcastToEdit.releaseDate.split("T")[0],
        categories: podcastToEdit.categories, // Ensure this is an array of strings
        tags: podcastToEdit.tags,
        coverImageUrl: podcastToEdit.coverImageUrl,
        isFeatured: podcastToEdit.isFeatured,
        companyId: companyId,
      });
    } else {
      // Reset form for adding new
      setFormData({
        title: "",
        description: "",
        audioUrl: "",
        duration: 0,
        episodeNumber: 1,
        releaseDate: new Date().toISOString().split("T")[0],
        categories: '', // Ensure this is an array of strings
        tags: [],
        coverImageUrl: "",
        companyId: companyId,
        isFeatured: false,
      });
    }
    setError(null); // Clear errors on modal open/edit
  }, [podcastToEdit, showModal, companyId]); // Re-run when podcastToEdit changes or modal opens

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "categories" || name === "tags") {
      // Handle multi-select for categories/tags
      const options = (e.target as HTMLSelectElement).options;
      const selectedValues: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));
    } else if (name === "duration" || name === "episodeNumber") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0, // Ensure numbers are parsed correctly
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.title || !formData.description || !formData.audioUrl || !formData.duration || !formData.releaseDate) {
      setError("Please fill in all required fields (Title, Description, Audio URL, Duration, Release Date).");
      setLoading(false);
      return;
    }
    if (formData.duration <= 0) {
      setError("Duration must be a positive number.");
      setLoading(false);
      return;
    }
    if (formData.episodeNumber && formData.episodeNumber <= 0) {
      setError("Episode Number must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      let response;
      const payload = {
        ...formData,
        creatorId: companyId, // Assuming companyId is the creatorId for admin
        creatorType: "admin", // Or "company", "user", etc.
        // If it's a new podcast, generate a simple podcastId (you might have a better method on backend)
        podcastId: podcastToEdit?.podcastId || `pod_${Date.now()}`,
        // Ensure categories is an array of strings (IDs)
        categories: Array.isArray(formData.categories) ? formData.categories : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };

      if (podcastToEdit) {
        // Editing existing podcast
        response = await fetch(`${apiBaserUrl}/admin/podcasts/${podcastToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Adding new podcast
        response = await fetch(`${apiBaserUrl}/admin/podcasts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save podcast.");
      }

      setShowModal(false);
      if (onSuccess) {
        onSuccess(); // Trigger data refresh
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error saving podcast:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      {/* Modal Container */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-3xl p-8 relative transform scale-95 animate-scale-in border border-gray-100  h-[40rem] overflow-x-auto">
        {/* Close Button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mb-2">
            {podcastToEdit ? "Edit Podcast" : "Add New Podcast"}
          </h2>
          <p className="text-gray-600 text-lg">
            {podcastToEdit ? "Update episode details" : "Create a captivating new episode"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl mb-6 flex items-center space-x-3 shadow-sm animate-fade-in"
            role="alert"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="relative group">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Title
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="e.g., The Future of AI"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Audio URL */}
          <div className="relative group">
            <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Audio URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="audioUrl"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="https://example.com/episode.mp3"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.333 11.333H7.667a1 1 0 00-1 1v4a1 1 0 001 1h1.666a1 1 0 001-1v-4a1 1 0 00-1-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.667 11.333H13a1 1 0 00-1 1v4a1 1 0 001 1h1.667a1 1 0 001-1v-4a1 1 0 00-1-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="relative group">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Duration (seconds)
            </label>
            <div className="relative">
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                min="0"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Episode Number */}
          <div className="relative group">
            <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Episode Number
            </label>
            <div className="relative">
              <input
                type="number"
                id="episodeNumber"
                name="episodeNumber"
                value={formData.episodeNumber}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                min="1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Release Date */}
          <div className="relative group">
            <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Release Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="relative group">
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Cover Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                id="coverImageUrl"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 pr-10 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                placeholder="https://example.com/cover.jpg"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2 relative group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
              placeholder="A brief summary of the podcast episode..."
              required
            ></textarea>
          </div>

          {/* Categories Multi-select */}
          <div className="col-span-2 relative group">
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-200 group-focus-within:text-blue-600">
              Categories
            </label>
            <select
              id="categories"
              name="categories"
              multiple
              value={formData.categories}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 h-36 custom-select"
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId || ''}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</span>
            </p>
          </div>

          {/* Feature Podcast Checkbox */}
          <div className="col-span-2 flex items-center mt-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md shadow-sm cursor-pointer transition-colors duration-200 checked:bg-blue-600 checked:border-transparent"
            />
            <label htmlFor="isFeatured" className="ml-3 block text-base font-medium text-gray-900 cursor-pointer">
              Feature Podcast
            </label>
          </div>

          {/* Action Buttons */}
          <div className="col-span-2 flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-3 border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{podcastToEdit ? "Update Podcast" : "Add Podcast"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
