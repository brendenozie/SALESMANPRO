"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellAlertIcon,
  CalendarDateRangeIcon,
  CalendarDaysIcon,
  PencilIcon,
  PlusCircleIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// ---------------- TYPES ----------------
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

// ---------------- ANIMATION VARIANTS ----------------
const containerVariants = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    transition: { duration: 0.2 },
  },
};

// ---------------- CARD ----------------
const ProgramCard = ({ program }: { program: Program }) => {
  const statusColors = {
    active: "bg-green-600 text-white",
    draft: "bg-yellow-400 text-gray-900",
    inactive: "bg-red-600 text-white",
  };

  const typeIcon =
    program.type === "class" ? (
      <CalendarDateRangeIcon className="w-6 h-6" />
    ) : (
      <BellAlertIcon className="w-6 h-6" />
    );

  return (
    <motion.div
      className="relative p-6 rounded-2xl shadow-xl overflow-hidden cursor-pointer flex flex-col bg-gray-800 text-gray-200"
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[program.status]}`}
      >
        {program.status}
      </div>

      <div className="mt-8 flex-grow">
        <h4 className="text-xl font-extrabold text-white mb-2">
          {program.name}
        </h4>
        <p className="text-sm text-gray-400 line-clamp-2">
          {program.description}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-400">
          <UserIcon className="mr-2 w-5 h-5" />
          {program.instructor}
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CalendarDaysIcon className="mr-2 w-5 h-5" />
          {program.duration}
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span className="text-3xl font-bold text-green-400">
          ${program.price.toFixed(2)}
        </span>
        <div className="flex gap-2">
          <button className="p-3 bg-gray-700 rounded-full text-indigo-400">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gray-700 rounded-full text-red-400">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ---------------- MODAL ----------------
const AddProgramModal = ({
  isOpen,
  onClose,
  onAddProgram,
  slug,
}: any) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState(0);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <motion.div className="bg-gray-800 rounded-xl p-8 w-full max-w-md">
          <button onClick={onClose} className="absolute top-4 right-4">
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>

          <h2 className="text-2xl font-bold text-white mb-6">
            Add New Program
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddProgram({
                id: crypto.randomUUID(),
                name,
                description,
                duration,
                price,
                instructor: "TBD",
                status: "active",
                type: "program",
              });
              onClose();
            }}
            className="space-y-4"
          >
            <input
              className="w-full p-2 rounded bg-gray-700"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="w-full p-2 rounded bg-gray-700"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="w-full p-2 rounded bg-gray-700"
              placeholder="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
            <input
              type="number"
              className="w-full p-2 rounded bg-gray-700"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />

            <button className="w-full bg-indigo-600 py-2 rounded">
              Add Program
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ---------------- MAIN CLIENT ----------------
export default function ProgramsClient({ slug }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPrograms = async () => {
    const res = await fetch(
      `${apiBaseUrl}/admin/fitness-programs?id=${slug}`,
      { credentials: "include" }
    );
    const data = (await res.json()).data || [];
    setPrograms(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="flex justify-between mb-10">
        <h1 className="text-4xl font-bold">Programs & Classes</h1>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 px-6 py-3 rounded-xl"
        >
          <PlusCircleIcon className="w-6 h-6 inline mr-2" />
          Add Program
        </motion.button>
      </div>

      {!loading && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </motion.div>
      )}

      <AddProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProgram={(p: Program) =>
          setPrograms((prev) => [p, ...prev])
        }
        slug={slug}
      />
    </div>
  );
}
