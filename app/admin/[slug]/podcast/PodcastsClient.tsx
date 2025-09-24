"use client";

import AddToPodcastModal from "@/components/AddToPodcastModal";
import PodcastDeleteModal from "@/components/PodcastDeleteModal";
import { IStoreCategory } from "@/types/typings";
import React, { useState } from "react";

// Define the Category type to match the API and Prisma schema
type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
};

// Define the Podcast type for the client side
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
  categories: string; // Array of category _ids
  companyId: string; // Assuming this is the creatorId for filtering
  tags: string[]; // Array of tag _ids (or names, depending on your Tag model)
  coverImageUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ClientProps {
  companyId: string;
  podcastsData: Podcast[];
  categoriesData: IStoreCategory[]; // Using the corrected Category type
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
    // A more robust way to refresh data would be to re-fetch it from the API
    // or update the state directly if the API returns the updated list.
    // For this example, a full page reload is used for simplicity.
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8 font-inter">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4 drop-shadow-lg">
            Your Podcast Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Effortlessly manage, edit, and curate your podcast episodes.
          </p>
        </div>

        {/* Podcasts Management Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-12 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.005]">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 sm:mb-0">All Episodes</h2>
            <button
              onClick={() => {
                setSelectedPodcast(null); // Clear selected podcast for "Add New"
                setShowAddEditPodcastModal(true);
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Add New Podcast</span>
            </button>
          </div>

          {/* Podcast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {podcastsData && podcastsData.length > 0 ? (
              podcastsData.map((podcast) => (
                <div
                  key={podcast._id}
                  className="relative bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden transition transform hover:scale-102 hover:shadow-xl duration-300 group"
                >
                  {/* Cover Image */}
                  <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={podcast.coverImageUrl || `https://placehold.co/400x400/A78BFA/FFFFFF?text=Podcast+Cover`}
                      alt={podcast.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/400x400/A78BFA/FFFFFF?text=Podcast+Cover`;
                      }}
                    />
                    {/* Featured Badge */}
                    {podcast.isFeatured && (
                      <span className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Featured
                      </span>
                    )}
                    {/* Play Button Overlay (Optional, for visual appeal) */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-3 bg-white rounded-full text-blue-600 shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Podcast Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors duration-200">
                      {podcast.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {podcast.description}
                    </p>

                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Episode: {podcast.episodeNumber}
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duration: {Math.floor(podcast.duration / 60)}m{" "}
                        {podcast.duration % 60}s
                      </p>
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Release: {new Date(podcast.releaseDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Categories Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* {podcast.categories.map((catId) => {
                        const category = categoriesData.find((c) => c.id === catId);
                        return category ? (
                          <span
                            key={catId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.displayName}
                          </span>
                        ) : null;
                      })} */}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-auto pt-4 border-t border-gray-100 space-x-3">
                      <button
                        onClick={() => {
                          setSelectedPodcast(podcast);
                          setShowAddEditPodcastModal(true);
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white font-medium text-sm transition-all duration-300 ease-in-out hover:bg-indigo-600 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedPodcast(podcast);
                          setShowDeletePodcastModal(true);
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm transition-all duration-300 ease-in-out hover:bg-red-600 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Engaging Empty State */
              <div className="col-span-full bg-gray-50 rounded-2xl p-12 text-center shadow-inner border border-dashed border-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-24 w-24 text-gray-400 mb-6 animate-pulse"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-2xl font-semibold text-gray-700 mb-4">
                  No Podcasts Yet!
                </p>
                <p className="text-lg text-gray-500 mb-8">
                  It looks a little quiet in here. Start by adding your first captivating episode.
                </p>
                <button
                  onClick={() => {
                    setSelectedPodcast(null);
                    setShowAddEditPodcastModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Add Your First Podcast</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== Modals ========== */}
      {showDeletePodcastModal && selectedPodcast && (
        <PodcastDeleteModal
          showModal={showDeletePodcastModal}
          setShowModal={setShowDeletePodcastModal}
          podcast={selectedPodcast}
          companyId={companyId}
          onSuccess={handleSuccess}
        />
      )}

      {showAddEditPodcastModal && (
        <AddToPodcastModal
          showModal={showAddEditPodcastModal}
          setShowModal={setShowAddEditPodcastModal}
          podcastToEdit={selectedPodcast}
          companyId={companyId}
          categories={categoriesData}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
