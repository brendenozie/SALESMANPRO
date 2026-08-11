// app/admin/featured-picks/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

// ------------------- Types -------------------
export type VideoType = "Video" | "Article" | "Series" | "Interview";

export interface Video {
  id: string;
  title: string;
  type: VideoType;
  imageUrl: string;
  isFeatured: boolean;
  companyId: string;
  userId: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ToastData {
  message: string;
  type: "add" | "remove" | "error";
}

// ------------------- Mock Prisma -------------------
const mockPrisma = {
  video: {
    findMany: async ({ where }: { where?: Partial<Pick<Video, "isFeatured">> }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let data: Video[] = [
        {
          id: "vid1",
          title: "Building a Next.js App",
          type: "Video",
          imageUrl:
            "https://hold.co/400x300/F0F4F8/3B4254?text=NextJS+Tutorial",
          isFeatured: true,
          companyId: "comp1",
          userId: "user1",
        },
        {
          id: "vid2",
          title: "The Future of AI in Design",
          type: "Article",
          imageUrl:
            "https://placehold.co/400x300/D0D4DB/3B4254?text=AI+Article",
          isFeatured: true,
          companyId: "comp1",
          userId: "user1",
        },
        {
          id: "vid3",
          title: "Advanced Tailwind CSS Tricks",
          type: "Video",
          imageUrl:
            "https://placehold.co/400x300/F0F4F8/3B4254?text=Tailwind+Tips",
          isFeatured: false,
          companyId: "comp1",
          userId: "user1",
        },
      ];
      if (where && typeof where.isFeatured !== "undefined") {
        data = data.filter((v) => v.isFeatured === where.isFeatured);
      }
      return data;
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<Video>;
    }): Promise<Video> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id: where.id, title: "Updated", type: "Video", imageUrl: "", isFeatured: !!data.isFeatured, companyId: "comp1", userId: "user1" };
    },
    create: async ({ data }: { data: Video }): Promise<Video> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...data, id: `vid${Math.floor(Math.random() * 100)}` };
    },
  },
};

// ------------------- Mock API -------------------
const mockApi = {
  getVideos: async (isFeatured: boolean | null = null): Promise<Video[]> => {
    const where = isFeatured !== null ? { isFeatured } : {};
    return mockPrisma.video.findMany({ where });
  },
  addVideo: async (videoData: Omit<Video, "id" | "companyId" | "userId">) => {
    const mockCompanyId = "comp1";
    const mockUserId = "user1";
    return mockPrisma.video.create({
      data: {
        ...videoData,
        companyId: mockCompanyId,
        userId: mockUserId,
      } as Video,
    });
  },
  updateVideoFeaturedStatus: async (id: string, newStatus: boolean) => {
    return mockPrisma.video.update({
      where: { id },
      data: { isFeatured: newStatus },
    });
  },
};

// ------------------- Components -------------------
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-['Inter']">
    <div className="max-w-7xl mx-auto">{children}</div>
  </div>
);

const fallbackImageUrl =  "https://placehold.co/400x300/4B5563/F3F4F6?text=Image+Not+Found";
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// --- Toast ---
const Toast: React.FC<{ message: string; type: ToastData["type"]; onClose: () => void }> = ({ message, type, onClose }) => {
  const icon = type === "add" ? <StarIcon /> : <TrashIcon />;
  const iconColor = type === "add" ? "text-yellow-400" : "text-red-400";
  const bgColor = type === "add" ? "bg-green-600" : "bg-red-600";

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl flex items-center space-x-3 text-white z-50 ${bgColor}`}
    >
      <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
      <p className="font-semibold">{message}</p>
      <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

// --- Add Modal ---
const AddPickModal: React.FC<{ onClose: () => void; onAdd: (pick: Omit<Video, "id" | "companyId" | "userId">) => Promise<void> }> = ({
  onClose,
  onAdd,
}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<VideoType>("Video");
  const [imageUrl, setImageUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && type && imageUrl) {
      setIsAdding(true);
      await onAdd({ title, type, imageUrl, isFeatured: false });
      setIsAdding(false);
      onClose();
    }
  };

  return (
    <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Add a New Content Pick</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => 
                    setType(e.target.value as "Video" | "Article" | "Series" | "Interview")
                  }
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                >
                  <option value="Video">Video</option>
                  <option value="Article">Article</option>
                  <option value="Series">Series</option>
                  <option value="Interview">Interview</option>
                </select>
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              <motion.button
                type="submit"
                disabled={isAdding}
                className={`w-full py-3 mt-4 text-white font-semibold rounded-full shadow-lg transition-colors ${
                  isAdding ? 'bg-purple-800 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                }`}
                whileHover={{ scale: isAdding ? 1 : 1.05 }}
                whileTap={{ scale: isAdding ? 1 : 0.95 }}
              >
                {isAdding ? 'Adding...' : 'Add Pick'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
  );
};

// --- Card ---
const FeaturedPickCard: React.FC<{
  pick: Video;
  onToggle: (id: string, currentStatus: boolean) => Promise<void>;
  showToast: (toast: ToastData) => void;
}> = ({ pick, onToggle, showToast }) => {
  const { id, title, type, imageUrl, isFeatured } = pick;

  const handleToggle = async () => {
    try {
      await onToggle(id, isFeatured);
      showToast({
        message: `${isFeatured ? "Removed" : "Added"} "${title}" to Featured Picks.`,
        type: isFeatured ? "remove" : "add",
      });
    } catch {
      showToast({ message: `Failed to update status for "${title}".`, type: "error" });
    }
  };

  return (
    <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`relative rounded-3xl overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300 ${
            isFeatured ? 'bg-gray-800 ring-2 ring-purple-500' : 'bg-gray-900'
          }`}
        >
          <div className="relative w-full h-48">
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover" 
              loader={loader} 
              onError={(e) => (e.currentTarget.src = fallbackImageUrl)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
            {isFeatured && (
              <div className="absolute top-4 left-4 p-2 bg-purple-600 rounded-full shadow-lg">
                <StarIcon className="h-5 w-5 text-yellow-300" />
              </div>
            )}
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm mb-4">{type}</p>
            <div className="flex justify-end">
              <motion.button
                onClick={handleToggle}
                className={`p-3 rounded-full shadow-lg transition-colors duration-200 ${
                  isFeatured 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`${isFeatured ? 'Remove from' : 'Add to'} featured`}
              >
                {isFeatured ? (
                  <TrashIcon className="h-5 w-5" />
                ) : (
                  <StarIcon className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
  );
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- Main Page ---
export default async function FeaturedPicksPage({ params }: PageProps) {
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  
    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedVideos = await mockApi.getVideos();
      setVideos(fetchedVideos);
    } catch {
      setError("Failed to fetch videos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    await mockApi.updateVideoFeaturedStatus(id, !currentStatus);
    await fetchVideos();
  };

  const handleAddPick = async (newPick: Omit<Video, "id" | "companyId" | "userId">) => {
    await mockApi.addVideo(newPick);
    await fetchVideos();
    setToast({ message: `Successfully added "${newPick.title}"!`, type: "add" });
  };

  const featuredContent = videos.filter((p) => p.isFeatured);
  const nonFeaturedContent = videos.filter((p) => !p.isFeatured);

  
  const showToast = (toastData: ToastData) => {
    setToast(toastData);
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 sm:mb-0">
          Featured & Top <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-600">Picks</span>
        </h1>
        <motion.button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New Pick
        </motion.button>
      </motion.div>

      {/* Loading/Error State */}
      {loading && (
        <div className="flex justify-center items-center h-48 bg-gray-900 rounded-3xl mb-10">
          <p className="text-lg text-gray-400">Loading featured picks...</p>
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-48 bg-gray-900 rounded-3xl mb-10">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

      {/* Featured Picks Section */}
      {!loading && !error && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <StarIcon className="h-6 w-6 mr-3 text-yellow-400" /> Currently Featured
          </h2>
          {featuredContent.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {featuredContent.map(pick => (
                  <FeaturedPickCard
                    key={pick.id}
                    pick={pick}
                    onToggle={handleToggleFeatured}
                    showToast={showToast}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-48 bg-gray-900 rounded-3xl border border-gray-700 border-dashed text-gray-500">
              <p className="text-lg">No items are currently featured. Add some below!</p>
            </div>
          )}
        </section>
      )}

      {/* All Content Section */}
      {!loading && !error && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-400" /> All Content
          </h2>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {nonFeaturedContent.map(pick => (
                <FeaturedPickCard
                  key={pick.id}
                  pick={pick}
                  onToggle={handleToggleFeatured}
                  showToast={showToast}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </section>
      )}
      
      {/* Modal for adding a new pick */}
      <AnimatePresence>
        {showModal && (
          <AddPickModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddPick}
          />
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
