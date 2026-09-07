"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import ExpertModal, { ExpertData } from "./ExpertModal";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ExpertManagementClientProps {
  companyId: string;
}

export default function ExpertManagementClient({ companyId }: ExpertManagementClientProps) {
  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertData | null>(null);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/admin/experts?companyId=${companyId}`,
        {
          headers: {
            Credentials: "include",
          },
        }
      );
      const dataRes = (await res.json()).data;
      const data: ExpertData[] = dataRes.data || [];
      
      setExperts(data);
    } catch (error) {
      // console.error("Error fetching experts:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const handleOpenModal = (expert: ExpertData | null = null) => {
    if (expert) {
      setIsEditing(true);
      setCurrentExpert(expert);
    } else {
      setIsEditing(false);
      setCurrentExpert(null);
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (expert: ExpertData) => {
    setLoading(true);
    try {
      const res = await fetch(
        isEditing
          ? `${apiBaseUrl}/admin/experts/${expert.id}`
          : `${apiBaseUrl}/admin/experts?companyId=${companyId}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { 
            "Content-Type": "application/json", 
            Credentials: "include" 
          },
          body: JSON.stringify(expert),
        }
      );

      if (!res.ok) throw new Error("Failed to save expert");

      await fetchExperts();
      setShowModal(false);
    } catch (error) {
      // console.error("Error saving expert:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expert profile?")) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/experts/${id}`, {
          method: "DELETE",
          headers: { Credentials: "include" },
        });
        if (!res.ok) throw new Error("Failed to delete expert");
        await fetchExperts();
      } catch (error) {
        // console.error("Error deleting expert:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">
            Expert Management
          </h1>
          <p className="text-gray-400">
            View, create, and manage expert profiles for your platform.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Create New Expert
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-400">
          <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
          Loading experts...
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Expert
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Expertise
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {experts.length > 0 &&
                    experts.map((expert) => (
                      <motion.tr
                        key={expert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover mr-4"
                              src={
                                expert.photoUrl ||
                                `https://placehold.co/40x40/2563eb/ffffff?text=${expert.name?.charAt(
                                  0
                                )}`
                              }
                              alt={expert.name ?? "Expert"}
                            />
                            <div>
                              <div className="text-sm font-medium text-white">
                                {expert.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {expert.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {expert.specialty}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex flex-wrap gap-2">
                            {expert.expertise?.map((tag) => (
                              <span
                                key={tag}
                                className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <motion.button
                              onClick={() => handleOpenModal(expert)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(expert.id || "")}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ExpertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleFormSubmit}
        expert={currentExpert}
        slug={companyId}
      />
    </motion.div>
  );
}