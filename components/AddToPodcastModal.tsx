// components/AddToPodcastModal.tsx
"use client";

import { StoreCategory } from "@/types/typings";
import React, { useState, useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  categories: string[]; // Array of category _ids
  tags: string[]; // Array of tag _ids
  coverImageUrl: string;
  isFeatured: boolean;
  companyId:string;
  createdAt: string;
  updatedAt: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
};

interface AddToPodcastModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  podcastToEdit: Podcast | null; // Null for adding, Podcast object for editing
  companyId: string;
  categories: StoreCategory[]; // To populate the category dropdown/multiselect
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
    categories: [],
    tags: [],
    coverImageUrl: "",
    isFeatured: false,
    companyId:companyId
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
        categories: podcastToEdit.categories,
        tags: podcastToEdit.tags,
        coverImageUrl: podcastToEdit.coverImageUrl,
        isFeatured: podcastToEdit.isFeatured,
        companyId:companyId
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
        categories: [],
        tags: [],
        coverImageUrl: "",
        companyId:companyId,
        isFeatured: false,
      });
    }
    setError(null); // Clear errors on modal open/edit
  }, [podcastToEdit, showModal]); // Re-run when podcastToEdit changes or modal opens

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
        companyId:companyId,
        creatorId: companyId, // Assuming companyId is the creatorId for admin
        creatorType: "admin", // Or "company", "user", etc.
        // If it's a new podcast, generate a simple podcastId (you might have a better method on backend)
        podcastId: podcastToEdit?.podcastId || `pod_${Date.now()}`,
      };

      if (podcastToEdit) {
        // Editing existing podcast
        response = await fetch(`${apiUrl}/admin/podcasts/${podcastToEdit._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Adding new podcast
        response = await fetch(`${apiUrl}/admin/podcasts`, {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {podcastToEdit ? "Edit Podcast" : "Add New Podcast"}
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="audioUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Audio URL
            </label>
            <input
              type="url"
              id="audioUrl"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://example.com/podcast.mp3"
              required
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Episode Number
            </label>
            <input
              type="number"
              id="episodeNumber"
              name="episodeNumber"
              value={formData.episodeNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
              Release Date
            </label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              id="coverImageUrl"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://example.com/cover.jpg"
            />
          </div>

          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>

          <div className="col-span-2">
            <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <select
              id="categories"
              name="categories"
              multiple
              value={formData.categories}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</p>
          </div>

          {/* You might want a similar multi-select for Tags if your API supports it */}
          {/* <div className="col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <select
              id="tags"
              name="tags"
              multiple
              value={formData.tags}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            >
               { For tags, you'd fetch and map them similarly to categories }
              <option value="tag1">Tag 1</option>
              <option value="tag2">Tag 2</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</p>
          </div> */}

          <div className="col-span-2 flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm font-medium text-gray-900">
              Feature Podcast
            </label>
          </div>

          <div className="col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : (podcastToEdit ? "Update Podcast" : "Add Podcast")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}