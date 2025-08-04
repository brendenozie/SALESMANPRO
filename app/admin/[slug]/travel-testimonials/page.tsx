// AdminTestimonials.jsx
"use client";

import React, { useState } from 'react';
import {
  ChatBubbleLeftRightIcon, PlusCircleIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon, StarIcon, UserCircleIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Image from 'next/image';

const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Dummy Data
const initialTestimonials = [
  { id: 'T001', author: 'Alex Johnson', quote: 'Our trip to Patagonia was flawlessly organized!', rating: 5, status: 'Approved', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2940&auto=format&fit=crop' },
  { id: 'T002', author: 'Sarah Davis', quote: 'The Bali retreat was exactly what I needed. Pure relaxation!', rating: 5, status: 'Pending', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2940&auto=format&fit=crop' },
  { id: 'T003', author: 'Michael Brown', quote: 'Planning our family vacation to Alaska was stress-free.', rating: 4, status: 'Approved', avatar: 'https://images.unsplash.com/photo-1507003211169-0a3dd782dab4?q=80&w=2940&auto=format&fit=crop' },
];

// StarRating Component (reused)
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon className="h-4 w-4 text-yellow-400" />
          <div className="absolute top-0 right-0 overflow-hidden" style={{ width: '50%' }}>
            <StarIcon className="h-4 w-4 text-gray-300" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null); // For edit mode

  const openAddModal = () => {
    setCurrentTestimonial(null);
    setIsModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setCurrentTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = (formData) => {
    if (currentTestimonial) {
      // Edit existing
      setTestimonials(testimonials.map(t => t.id === formData.id ? formData : t));
      alert(`Testimonial from ${formData.author} updated.`);
    } else {
      // Add new
      const newId = `T${String(testimonials.length + 1).padStart(3, '0')}`;
      setTestimonials([...testimonials, { ...formData, id: newId }]);
      alert(`Testimonial from ${formData.author} added.`);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTestimonial = (id) => {
    if (confirm(`Are you sure you want to delete testimonial ${id}?`)) {
      setTestimonials(testimonials.filter(t => t.id !== id));
      alert(`Testimonial ${id} deleted.`);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTestimonials(testimonials.map(t =>
      t.id === id ? { ...t, status: newStatus } : t
    ));
    alert(`Testimonial ${id} status updated to ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        Manage Testimonials
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Testimonials</h2>
          <motion.button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span>Add New Testimonial</span>
          </motion.button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <tr key={testimonial.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                        <Image src={testimonial.avatar} alt={testimonial.author} layout="fill" objectFit="cover" loader={customLoader}/>
                      </div>
                      {testimonial.author}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate italic">"{testimonial.quote}"</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating rating={testimonial.rating} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(testimonial.status)}`}>
                        {testimonial.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {testimonial.status === 'Pending' && (
                          <motion.button
                            onClick={() => handleUpdateStatus(testimonial.id, 'Approved')}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition"
                            title="Approve"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        {testimonial.status === 'Pending' && (
                          <motion.button
                            onClick={() => handleUpdateStatus(testimonial.id, 'Rejected')}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                            title="Reject"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => openEditModal(testimonial)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                          title="Edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No testimonials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Testimonial Modal */}
      {isModalOpen && (
        <TestimonialModal
          testimonial={currentTestimonial}
          onSave={handleSaveTestimonial}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

// TestimonialModal.jsx (Internal Component for Add/Edit)
function TestimonialModal({ testimonial, onSave, onClose }) {
  const [author, setAuthor] = useState(testimonial?.author || '');
  const [quote, setQuote] = useState(testimonial?.quote || '');
  const [rating, setRating] = useState(testimonial?.rating || 5);
  const [status, setStatus] = useState(testimonial?.status || 'Pending');
  const [avatar, setAvatar] = useState(testimonial?.avatar || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: testimonial?.id,
      author,
      quote,
      rating: Number(rating),
      status,
      avatar,
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
          {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">Author Name</label>
            <input
              type="text"
              id="authorName"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="quote" className="block text-sm font-medium text-gray-700">Quote</label>
            <textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows="4"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
            <input
              type="number"
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min="1"
              max="5"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="url"
              id="avatarUrl"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {avatar && (
              <div className="mt-2 text-center">
                <Image src={avatar} alt="Preview" width={50} height={50} objectFit="cover" className="rounded-full" loader={customLoader}/>
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
              {testimonial ? 'Save Changes' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}