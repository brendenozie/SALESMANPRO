"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDaysIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
  ArrowPathIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

interface Program {
  id: string;
  name: string;
  description: string;
  status: "active" | "draft" | "inactive";
  type: "class" | "program";
  instructor: string;
  duration: string;
  price: number;
}

interface Props {
  slug: string;
}

// --- Card Component ---
const ProgramCard = ({ program, slug }: { program: Program; slug: string }) => {
  const router = useRouter();

  const statusColors = {
    active: "bg-green-600 text-white",
    draft: "bg-yellow-400 text-gray-900",
    inactive: "bg-red-600 text-white",
  };

  const handleCardClick = () => {
    router.push(`/admin/${slug}/fitness-programs/${program.id}`);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className="relative p-6 rounded-2xl shadow-xl overflow-hidden flex flex-col bg-gray-800 text-gray-200 cursor-pointer border border-transparent hover:border-gray-700 transition-colors duration-200"
      whileHover={{ scale: 1.03, y: -4, transition: { duration: 0.2 } }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[program.status] || statusColors.draft}`}
      >
        {program.status}
      </div>

      <div className="mt-8 flex-grow">
        <h4 className="text-xl font-extrabold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {program.name}
        </h4>
        <p className="text-sm text-gray-400 line-clamp-2">{program.description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-400">
          <UserIcon className="mr-2 w-5 h-5 text-gray-500" />
          {program.instructor}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CalendarDaysIcon className="mr-2 w-5 h-5 text-gray-500" />
          {program.duration}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
        <span className="text-3xl font-bold text-green-400">
          ${Number(program.price).toFixed(2)}
        </span>
        <div className="flex gap-2">
          {/* View Curriculum Action Overlay Indicator */}
          <button 
            onClick={handleCardClick}
            className="p-3 bg-gray-700 hover:bg-indigo-600 rounded-full text-indigo-400 hover:text-white transition group"
            title="Manage Curriculum"
          >
            <AcademicCapIcon className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gray-700 rounded-full text-indigo-400 hover:bg-gray-600 transition">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gray-700 rounded-full text-red-400 hover:bg-gray-600 transition">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Modal Component ---
const AddProgramModal = ({ isOpen, onClose, onAddProgram, slug }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: 0,
    instructorId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-programs?id=${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (responseData.success) {
        onAddProgram(responseData.data);
        onClose();
        setFormData({ name: "", description: "", duration: "", price: 0, instructorId: "" });
      } else {
        alert(`Error: ${responseData.message}`);
      }
    } catch (error) {
      console.error("Failed to add program", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div className="bg-gray-800 rounded-xl p-8 w-full max-w-md relative border border-gray-700">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
            <XMarkIcon className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">Add New Program</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none transition"
              placeholder="Program Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <textarea
              required
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none transition resize-none"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none transition"
              placeholder="Duration (e.g., 4 Weeks)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none transition"
              placeholder="Price"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <input
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none transition"
              placeholder="Instructor ID"
              value={formData.instructorId}
              onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
            />

            <button 
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg flex justify-center items-center font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Add Program"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main Client Component ---
export default function ProgramsClient({ slug }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/admin/fitness-programs?id=${slug}`, { credentials: "include" });
        const json = await res.json();
        setPrograms(json.data || []);
      } catch (error) {
        console.error("Failed to load programs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Programs & Classes</h1>
            <p className="text-gray-400 mt-1">Manage corporate offerings and structure dynamic internal modules.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-xl flex items-center font-medium shadow-lg shadow-indigo-500/10"
          >
            <PlusCircleIcon className="w-6 h-6 mr-2" />
            Add Program
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ArrowPathIcon className="w-10 h-10 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} slug={slug} />
            ))}
          </div>
        )}

        {/* Informative fallback layout state */}
        {!loading && programs.length === 0 && (
          <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700 border-dashed max-w-xl mx-auto">
            <AcademicCapIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">No Programs Found</h3>
            <p className="text-gray-500 mt-2">Create your first fitness track or educational course structure above.</p>
          </div>
        )}

        <AddProgramModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddProgram={(newProgram: Program) => setPrograms((prev) => [newProgram, ...prev])}
          slug={slug}
        />
      </div>
    </div>
  );
}