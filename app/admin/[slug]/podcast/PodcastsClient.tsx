"use client";

import AddToPodcastModal from "@/components/AddToPodcastModal";
import PodcastDeleteModal from "@/components/PodcastDeleteModal";
import { StoreCategory } from "@/types/typings";
import React, { useState } from "react";

// Define the Podcast type for the client side (can be the same as server, but good to be explicit)
type Podcast = {
  _id: string;
  creatorId: string;
  creatorType: string;
  podcastId: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  episodeNumber: number;
  releaseDate: string;
  categories: string[];
  companyId:string;
  tags: string[];
  coverImageUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ClientProps {
  companyId: string;
  podcastsData: Podcast[];
  categoriesData: StoreCategory[];
}

export default function PodcastsClient({
  companyId,
  categoriesData,
  podcastsData,
}: ClientProps) {
  // State for modal visibility + selected podcast
  const [showDeletePodcastModal, setShowDeletePodcastModal] = useState(false);
  const [showAddEditPodcastModal, setShowAddEditPodcastModal] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);

  const handleSuccess = () => {
    // This is a simple way to refresh. For larger apps, consider SWR/React Query or a more sophisticated state update.
    // A full page reload might be too much, but for simplicity, we'll demonstrate that it can trigger data refresh.
    // In a real app, you might re-fetch only the podcasts data:
    // fetchPodcasts(); // Assuming you have a function to fetch podcasts
    window.location.reload(); // Simple refresh for demonstration
  };

  return (
    <div className="container mx-auto p-10">
      <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-14 tracking-tight">
        Manage Podcasts
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">All Podcasts</h2>
          <button
            onClick={() => {
              setSelectedPodcast(null); // Clear selected podcast for "Add New"
              setShowAddEditPodcastModal(true);
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Add New Podcast
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {podcastsData && podcastsData.length > 0 ? (
            podcastsData.map((podcast) => (
              <div
                key={podcast._id}
                className="bg-gray-100 border border-gray-200 rounded-xl p-6 transition transform hover:scale-105 shadow-md hover:shadow-xl duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-3 hover:text-blue-600 transition-colors">
                  {podcast.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Description: {podcast.description.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Episode: {podcast.episodeNumber}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  Duration: {Math.floor(podcast.duration / 60)}m{" "}
                  {podcast.duration % 60}s
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Release Date:{" "}
                  {new Date(podcast.releaseDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Categories:{" "}
                  {podcast.categories
                    .map(
                      (catId) =>
                        categoriesData.find((c) => c.categoryId === catId)?.displayName ||
                        "Unknown"
                    )
                    .join(", ")}
                </p>
                {podcast.coverImageUrl && (
                  <div className="mb-4">
                    <img
                      src={podcast.coverImageUrl}
                      alt={podcast.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex justify-end mt-2 space-x-3">
                  <button
                    onClick={() => {
                      setSelectedPodcast(podcast);
                      setShowAddEditPodcastModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-blue-600 shadow-md hover:shadow-lg"
                  >
                    Edit Podcast
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPodcast(podcast);
                      setShowDeletePodcastModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-red-500 text-white font-medium transition-all duration-300 ease-in-out hover:bg-red-600 shadow-md hover:shadow-lg"
                  >
                    Delete Podcast
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-xl">No podcasts available.</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== Modals ========== */}
      {showDeletePodcastModal && selectedPodcast && (
        <PodcastDeleteModal
          showModal={showDeletePodcastModal}
          setShowModal={setShowDeletePodcastModal}
          podcast={selectedPodcast}
          companyId={companyId} // Pass companyId if needed for API calls in modal
        />
      )}

      {showAddEditPodcastModal && (
            <AddToPodcastModal
              showModal={showAddEditPodcastModal}
              setShowModal={setShowAddEditPodcastModal}
              podcastToEdit={selectedPodcast}
              companyId={companyId}
              categories={categoriesData}
              onSuccess={handleSuccess} // Add this prop
            />
          )}
    </div>
  );
}