// components/PodcastDeleteModal.tsx
"use client";

import React, { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type Podcast = {
  _id: string;
  title: string;
  // Only title is strictly needed for display here, but include other fields if useful for confirmation message.
  // ... other podcast fields
};

interface PodcastDeleteModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  podcast: Podcast; // The podcast to be deleted
  companyId: string; // May be needed for API route
  onSuccess?: () => void; // Callback to refresh data after success
}

export default function PodcastDeleteModal({
  showModal,
  setShowModal,
  podcast,
  companyId,
  onSuccess,
}: PodcastDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/podcasts/${podcast._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // You might need an Authorization header here, e.g., 'Bearer your_token'
        },
        // If your backend requires companyId in the body for delete, add it:
        // body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete podcast.");
      }

      setShowModal(false);
      if (onSuccess) {
        onSuccess(); // Trigger data refresh
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      console.error("Error deleting podcast:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the podcast "
          <span className="font-semibold">{podcast.title}</span>"? This action cannot be undone.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}