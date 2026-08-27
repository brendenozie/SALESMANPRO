"use client";

import React, { useState, useMemo } from "react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  PlayIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
  ClockIcon,
  CalendarDaysIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import AddToPodcastModal from "@/components/AddToPodcastModal";
import PodcastDeleteModal from "@/components/PodcastDeleteModal";
import { IStoreCategory } from "@/types/typings";

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
  categories: string; // Stored as comma separated or string ID
  companyId: string; 
  tags: string[]; 
  coverImageUrl: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ClientProps {
  companyId: string;
  podcastsData: Podcast[];
  categoriesData: IStoreCategory[]; 
}

export default function PodcastsClient({
  companyId,
  categoriesData,
  podcastsData = [],
}: ClientProps) {
  const [showDeletePodcastModal, setShowDeletePodcastModal] = useState(false);
  const [showAddEditPodcastModal, setShowAddEditPodcastModal] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSuccess = () => {
    window.location.reload();
  };

  // Live filter computed optimization
  const filteredPodcasts = useMemo(() => {
    return podcastsData.filter((podcast) =>
      podcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [podcastsData, searchTerm]);

  // Quick Stats Computations
  const stats = useMemo(() => {
    return {
      totalEpisodes: podcastsData.length,
      featuredCount: podcastsData.filter(p => p.isFeatured).length
    };
  }, [podcastsData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-8 mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Audio & Podcast Hub 🎙️
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Effortlessly publish episodes, organize themes, track releases, and curate standout featured audio blocks.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedPodcast(null);
              setShowAddEditPodcastModal(true);
            }}
            className="inline-flex items-center self-start md:self-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md transition duration-200 text-sm tracking-wide"
          >
            <PlusIcon className="h-5 w-5 mr-2 stroke-[2.5]" />
            Add New Episode
          </button>
        </div>

        {/* Search and Filters Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search episode title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-11 pr-10 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm outline-none shadow-sm transition"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Performance Snapshot Badges */}
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
              Total Clips: <strong className="text-slate-900 dark:text-white ml-0.5">{stats.totalEpisodes}</strong>
            </span>
            {stats.featuredCount > 0 && (
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200/40 dark:border-amber-900/40 flex items-center">
                <SparklesIcon className="h-3.5 w-3.5 mr-1 text-amber-500 fill-amber-500/10" />
                Featured: <strong className="ml-1">{stats.featuredCount}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Main Grid View */}
        {filteredPodcasts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPodcasts.map((podcast) => {
              const formattedDuration = `${Math.floor(podcast.duration / 60)}m ${podcast.duration % 60}s`;
              const formattedDate = new Date(podcast.releaseDate).toLocaleDateString(undefined, { 
                month: 'short', day: 'numeric', year: 'numeric' 
              });

              return (
                <div
                  key={podcast._id}
                  className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm hover:shadow-md dark:hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Cover Artwork Window */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800/60">
                    <img
                      src={podcast.coverImageUrl || `https://placehold.co/600x400/6366F1/FFFFFF?text=Audio+Track`}
                      alt={podcast.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/600x400/6366F1/FFFFFF?text=Audio+Track`;
                      }}
                    />
                    
                    {/* Badge Overlay conditionally handled */}
                    {podcast.isFeatured && (
                      <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-white shadow-sm">
                        <SparklesIcon className="h-3 w-3 mr-1 fill-white" />
                        Featured
                      </span>
                    )}

                    {/* Fast Play/Preview Blur Overlay */}
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-3 bg-white/95 dark:bg-slate-900/95 rounded-full text-indigo-600 dark:text-indigo-400 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <PlayIcon className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  </div>

                  {/* Creative Content Shell */}
                  <div className="p-5 flex flex-col flex-grow">
                    
                    {/* Category Labeling Row */}
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {categoriesData && categoriesData.length > 0 && (() => {
                        // Safe normalization handling array loops
                        const normalizedCategories = podcast.categories?.split(",") || [];
                        return normalizedCategories.map((catId) => {
                          const category = categoriesData.find((c) => (c._id || c.id) === catId.trim());
                          return category ? (
                            <span
                              key={catId}
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40"
                            >
                              {category.name || category.displayName}
                            </span>
                          ) : null;
                        });
                      })()}
                    </div>

                    <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 line-clamp-1 mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {podcast.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                      {podcast.description || "No customized audio summary details provided for this publication."}
                    </p>

                    {/* Metadata Metadata Rows */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><MusicalNoteIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> Episode No.</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{podcast.episodeNumber || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><ClockIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> Play Duration</span>
                        <span className="text-slate-800 dark:text-slate-200">{formattedDuration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><CalendarDaysIcon className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> Sync Release</span>
                        <span className="text-slate-800 dark:text-slate-200">{formattedDate}</span>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="flex space-x-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                      <button
                        onClick={() => {
                          setSelectedPodcast(podcast);
                          setShowAddEditPodcastModal(true);
                        }}
                        className="flex-1 inline-flex justify-center items-center py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5 mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPodcast(podcast);
                          setShowDeletePodcastModal(true);
                        }}
                        className="inline-flex justify-center items-center p-2 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-transparent hover:bg-rose-100 dark:hover:bg-rose-900/30 transition"
                        title="Delete Episode"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Intuitive Elegant Empty State Layout */
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm my-12">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <MusicalNoteIcon className="h-8 w-8 stroke-[1.8]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Records Available</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {searchTerm ? "No audio publications currently correlate with your chosen keyword queries." : "Your catalog index is clean. Onboard and schedule your media parameters directly down below."}
            </p>
            <button
              onClick={() => {
                setSelectedPodcast(null);
                setShowAddEditPodcastModal(true);
              }}
              className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition"
            >
              <PlusIcon className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Add First Episode
            </button>
          </div>
        )}
      </div>

      {/* Roster Target Management Operations Modals Container */}
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