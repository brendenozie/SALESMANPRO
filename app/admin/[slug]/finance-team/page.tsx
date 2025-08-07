// app/admin/[adminSlug]/experts/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  UserCircleIcon,
  BriefcaseIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/solid';
import ExpertModal from './ExpertModal';
import { useParams } from 'next/navigation';

// Dummy data for users who can become experts
// In a real application, you would fetch a list of users with a specific role
const mockUsers = [
  { id: 'usr1', name: 'Dr. Emily Carter', email: 'emily.c@example.com' },
  { id: 'usr2', name: 'Michael Chen, Esq.', email: 'michael.c@example.com' },
  { id: 'usr3', name: 'Sarah Rodriguez', email: 'sarah.r@example.com' },
  { id: 'usr4', name: 'David Lee', email: 'david.l@example.com' },
  { id: 'usr5', name: 'Jane Doe', email: 'jane.d@example.com' },
];

const expertiseOptions = ['FINANCE', 'LEGAL', 'MARKETING', 'TECHNOLOGY', 'CONSULTING', 'ADVISORY'];

// Define the ExpertData interface to match the API response
interface ExpertData {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
  specialty: string;
  experienceYears: number;
  travelsCompleted: number;
  photoUrl: string | null;
  bio: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

const ExpertManagementPage = () => {

  const params = useParams();
  const companyId = params.slug as string;

  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExpert, setCurrentExpert] = useState<ExpertData | null>(null);
  const [formState, setFormState] = useState({
    userId: '',
    title: '',
    expertise: [],
    bio: '',
    image: '',
  });

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/experts?companyId=${companyId}`);
      const data = await res.json();
      setExperts(data);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleOpenModal = (expert = null) => {
    if (expert) {
      setIsEditing(true);
      setCurrentExpert(expert);
      setFormState({
        userId: expert.userId,
        title: expert.title,
        expertise: expert.expertise,
        bio: expert.bio,
        image: expert.image || '',
      });
    } else {
      setIsEditing(false);
      setCurrentExpert(null);
      setFormState({
        userId: '',
        title: '',
        expertise: [],
        bio: '',
        image: '',
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleExpertiseChange = (e) => {
    const { options } = e.target;
    const selectedExpertise = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedExpertise.push(options[i].value);
      }
    }
    setFormState(prev => ({ ...prev, expertise: selectedExpertise }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const expertData = {
      ...formState,
    };

    try {
      const res = await fetch(isEditing ? `/api/admin/experts/${currentExpert.id}` : `/api/admin/experts?companyId=${companyId}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expertData),
      });

      if (!res.ok) throw new Error('Failed to save expert');

      await fetchExperts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving expert:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expert profile?')) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/experts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete expert');
        await fetchExperts();
      } catch (error) {
        console.error('Error deleting expert:', error);
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Expert Management</h1>
          <p className="text-gray-400">View, create, and manage expert profiles for your platform.</p>
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
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Expert</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Expertise</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {experts.map((expert) => (
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
                          <img className="h-10 w-10 rounded-full object-cover mr-4" src={expert.photoUrl || `https://placehold.co/40x40/2563eb/ffffff?text=${expert.name.charAt(0)}`} alt={expert.name} />
                          <div>
                            <div className="text-sm font-medium text-white">{expert.name}</div>
                            <div className="text-sm text-gray-400">{expert.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{expert.Specialty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex flex-wrap gap-2">
                          {expert.expertise.map(tag => (
                            <span key={tag} className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full">{tag}</span>
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
                            onClick={() => handleDelete(expert.id)}
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

          {/* Card View for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            <AnimatePresence>
              {experts.map((expert) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-full object-cover mr-4" src={expert.photoUrl || `https://placehold.co/40x40/2563eb/ffffff?text=${expert.name.charAt(0)}`} alt={expert.name} />
                      <div>
                        <h4 className="text-lg font-bold text-white">{expert.name}</h4>
                        <p className="text-sm text-gray-400">{expert.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{expert.Specialty}</span>
                    </div>
                    <div className="flex items-center">
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{expert.bio.substring(0, 50)}...</span>
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-gray-400 mb-1">Expertise:</h5>
                      <div className="flex flex-wrap gap-2">
                        {expert.expertise.map(tag => (
                          <span key={tag} className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      onClick={() => handleOpenModal(expert)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(expert.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal for Creating/Editing an Expert */}
      <ExpertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleFormSubmit}
        expert={currentExpert}
        slug={companyId}
      />
      
    </motion.div>
  );
};

export default ExpertManagementPage;
