// AdminExperts.jsx
"use client";

import React, { useState } from 'react';
import {
  UserGroupIcon, PlusCircleIcon, PencilIcon, TrashIcon, BriefcaseIcon, GlobeAltIcon, EnvelopeIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Dummy Data
const initialExperts = [
  { id: 'EXP001', name: 'Sophia Chen', specialty: 'Adventure Travel', experience: 8, travelsCompleted: 120, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2940&auto=format&fit=crop' },
  { id: 'EXP002', name: 'David Miller', specialty: 'Luxury & Relaxation', experience: 12, travelsCompleted: 95, photo: 'https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=2940&auto=format&fit=crop' },
  { id: 'EXP003', name: 'Maria Rodriguez', specialty: 'Cultural & Historical Tours', experience: 10, travelsCompleted: 150, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2940&auto=format&fit=crop' },
];

export default function AdminExperts() {
  const [experts, setExperts] = useState(initialExperts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExpert, setCurrentExpert] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentExpert(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expert) => {
    setCurrentExpert(expert);
    setIsModalOpen(true);
  };

  const handleSaveExpert = (formData) => {
    if (currentExpert) {
      // Edit existing
      setExperts(experts.map(e => e.id === formData.id ? formData : e));
      alert(`Expert ${formData.name} updated.`);
    } else {
      // Add new
      const newId = `EXP${String(experts.length + 1).padStart(3, '0')}`;
      setExperts([...experts, { ...formData, id: newId }]);
      alert(`Expert ${formData.name} added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteExpert = (id) => {
    if (confirm(`Are you sure you want to delete expert ${id}?`)) {
      setExperts(experts.filter(e => e.id !== id));
      alert(`Expert ${id} deleted.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Manage Travel Experts
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Experts</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Expert</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trips Completed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {experts.length > 0 ? (
                experts.map((expert) => (
                  <tr key={expert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expert.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image src={expert.photo} alt={expert.name} layout="fill" objectFit="cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expert.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{expert.specialty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {expert.experience} yrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {expert.travelsCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => openEditModal(expert)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteExpert(expert.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                          title="Delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No experts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Expert Modal */}
      {isModalOpen && (
        <ExpertModal
          expert={currentExpert}
          onSave={handleSaveExpert}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// ExpertModal.jsx (Internal Component for Add/Edit)
function ExpertModal({ expert, onSave, onClose }) {
  const [name, setName] = useState(expert?.name || '');
  const [specialty, setSpecialty] = useState(expert?.specialty || '');
  const [experience, setExperience] = useState(expert?.experience || '');
  const [travelsCompleted, setTravelsCompleted] = useState(expert?.travelsCompleted || '');
  const [photo, setPhoto] = useState(expert?.photo || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: expert?.id,
      name,
      specialty,
      experience: Number(experience),
      travelsCompleted: Number(travelsCompleted),
      photo,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {expert ? 'Edit Expert' : 'Add New Expert'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="expertName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="expertName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expertSpecialty" className="block text-sm font-medium text-gray-700">Specialty</label>
            <input
              type="text"
              id="expertSpecialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expertExperience" className="block text-sm font-medium text-gray-700">Experience (Years)</label>
            <input
              type="number"
              id="expertExperience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expertTravelsCompleted" className="block text-sm font-medium text-gray-700">Travels Completed</label>
            <input
              type="number"
              id="expertTravelsCompleted"
              value={travelsCompleted}
              onChange={(e) => setTravelsCompleted(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="expertPhoto" className="block text-sm font-medium text-gray-700">Photo URL</label>
            <input
              type="url"
              id="expertPhoto"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {photo && (
              <div className="mt-2 text-center">
                <Image src={photo} alt="Preview" width={80} height={80} objectFit="cover" className="rounded-full" />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {expert ? 'Save Changes' : 'Add Expert'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}