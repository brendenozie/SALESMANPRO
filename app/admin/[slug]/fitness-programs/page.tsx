"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellAlertIcon, CalendarDateRangeIcon, CalendarDaysIcon, PencilIcon, PlusCircleIcon, TrashIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Head from 'next/head'; // For setting page title/meta tags
import { useParams } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// Define the Program interface to match the API response
interface Program {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'inactive';
  type: 'class' | 'program'; // Assuming 'class' for now, could be dynamic
  instructor: string;
  duration: string;
  price: number;
}

interface ProgramsProps {
  params: {
    slug: string;
  };
}

// Variants for the main container
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Variants for individual program cards
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
    },
  },
};

// Reusable card component for a cleaner main file
const ProgramCard = ({ program }: { program: Program }) => {
  const statusColors = {
    active: 'bg-green-600 text-white',
    draft: 'bg-yellow-400 text-gray-900',
    inactive: 'bg-red-600 text-white',
  };

  const typeIcon = program.type === 'class' ? <CalendarDateRangeIcon className='w-6 h-6' /> : <BellAlertIcon className='w-6 h-6' />;
  const typeColor = program.type === 'class' ? 'bg-indigo-600' : 'bg-purple-600';
  const typeLabel = program.type === 'class' ? 'Class' : 'Program';

  return (
    <motion.div
      className="relative p-6 rounded-2xl shadow-xl overflow-hidden cursor-pointer flex flex-col bg-gray-800 text-gray-200"
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
    >
      {/* Program Status Badge */}
      <div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${statusColors[program.status]}`}
      >
        {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
      </div>

      {/* Program Type Tag */}
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${typeColor}`}>
        {typeIcon}
        {typeLabel}
      </div>

      <div className="mt-8 flex-grow">
        <h4 className="text-xl font-extrabold text-white mb-2 leading-tight">{program.name}</h4>
        <p className="text-sm text-gray-400 line-clamp-2">{program.description}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-400">
          <UserIcon className="mr-2 text-indigo-400 w-6 h-6" />
          <span>Instructor: {program.instructor}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <CalendarDaysIcon className="mr-2 text-indigo-400 w-6 h-6" />
          <span>Duration: {program.duration}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <span className="text-3xl font-bold text-green-400">${program.price.toFixed(2)}</span>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gray-700 rounded-full text-indigo-400 hover:bg-gray-600"
            aria-label="Edit program"
          >
            <PencilIcon className='w-6 h-6' />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-gray-700 rounded-full text-red-400 hover:bg-gray-600"
            aria-label="Delete program"
          >
            <TrashIcon className='w-6 h-6' />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Add Program Modal Component
const AddProgramModal = ({ isOpen, onClose, onAddProgram, slug }: {
  isOpen: boolean;
  onClose: () => void;
  onAddProgram: (program: Program) => void;
  slug: string;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructorId, setInstructorId] = useState(''); // Will store Educator ID
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [educators, setEducators] = useState<{ id: string; name: string }[]>([]);

  // Fetch educators when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchEducators = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/admin/educators?id=${slug}`, { credentials: 'include' });
          if (!res.ok) {
            throw new Error('Failed to fetch instructors');
          }
          const data = (await res.json()).data.data || [];
          console.log('Fetched educators:', data);
          setEducators(data);
        } catch (err: any) {
          console.error('Error fetching instructors:', err);
          setError(err.message);
        }
      };
      fetchEducators();
    }
  }, [isOpen, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-programs?id=${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include', // Include cookies for authentication
        },
        body: JSON.stringify({
          name,
          description,
          instructorId,
          duration,
          price: parseFloat(price.toFixed(2)), // Ensure price is a number with 2 decimal places
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add program');
      }

      const newProgram: Program = ( await res.json()).data;
      onAddProgram(newProgram); // Add the new program to the list
      onClose(); // Close the modal
      // Reset form fields
      setName('');
      setDescription('');
      setInstructorId('');
      setDuration('');
      setPrice(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Add New Program</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Program Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-300 mb-1">Instructor</label>
              <select
                id="instructor"
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select an Instructor</option>
                {educators.length > 0 && educators.map((edu) => (
                  <option key={edu.id} value={edu.id}>
                    {edu.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (e.g., "10 Weeks", "30 Hours")</label>
              <input
                type="text"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            {error && (
              <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <PlusCircleIcon className='w-6 h-6' />
              )}
              {loading ? 'Adding Program...' : 'Add Program'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// API route to fetch educators (needed for the AddProgramModal)
// pages/api/admin/[slug]/educators.js
// This route is assumed to exist for the modal's functionality.
// You would implement it similarly to the programs API:
/*
import prisma from '../../../../lib/prisma'; // Adjust path as needed

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!prisma) {
    return res.status(500).json({ message: 'Database client not initialized.' });
  }

  let company;
  try {
    company = await prisma.company.findUnique({
      where: { slug: slug },
      select: { id: true },
    });

    if (!company) {
      return res.status(404).json({ message: 'Company not found for the given slug.' });
    }
  } catch (error) {
    console.error('Error finding company by slug:', error);
    return res.status(500).json({ message: 'Internal server error during company lookup.', error: error.message });
  }

  const companyId = company.id;

  if (req.method === 'GET') {
    try {
      const educators = await prisma.educator.findMany({
        where: {
          companyId: companyId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          user: {
            name: 'asc', // Order by educator's user name
          },
        },
      });

      // Map to a simpler format for the dropdown
      const formattedEducators = educators.map(edu => ({
        id: edu.id,
        name: edu.user?.name || 'Unknown Educator',
      }));

      return res.status(200).json(formattedEducators);
    } catch (error) {
      console.error('Error fetching educators:', error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
*/


export default function ProgramsPage() {

  const { slug } = useParams<ProgramsProps['params']>();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch programs from the API
  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/fitness-programs?id=${slug}`, {
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Program[] = (await response.json()).data || [];
      setPrograms(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch programs on component mount and when slug changes
  useEffect(() => {
    fetchPrograms();
  }, [slug]);

  // Callback to add a new program to the state after successful creation
  const handleAddProgram = (newProgram: Program) => {
    setPrograms((prevPrograms) => [newProgram, ...prevPrograms]); // Add new program to the top
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 font-sans">
      <Head>
        <title>Programs & Classes - {slug}</title>
        <meta name="description" content={`Manage programs and classes for ${slug}`} />
      </Head>

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-white">Programs & Classes</h1>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className='w-6 h-6' />
          Add New Program
        </motion.button>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">Loading programs...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-700 text-white p-4 rounded-lg text-center mb-8">
          <p className="font-bold">Error loading programs:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && programs.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl text-gray-400">No programs or classes found.</p>
        </div>
      )}

      {!loading && !error && programs.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </motion.div>
      )}

      <AddProgramModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProgram={handleAddProgram}
        slug={slug}
      />
    </div>
  );
}
