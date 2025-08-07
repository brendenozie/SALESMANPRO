// app/admin/[adminSlug]/testimonials/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EyeSlashIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/solid';
import { useParams } from 'next/navigation';

const TestimonialsPage = () => {
  
  const params = useParams();
  const companyId = params.slug as string;

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);
  const [formState, setFormState] = useState({
    authorName: '',
    authorTitle: '',
    quote: '',
    status: 'PENDING',
  });

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?companyId=${companyId}`);
      const data = await res.json();
      setTestimonials(data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setIsEditing(true);
      setCurrentTestimonial(testimonial);
      setFormState({
        authorName: testimonial.authorName,
        authorTitle: testimonial.authorTitle || '',
        quote: testimonial.quote,
        status: testimonial.status,
      });
    } else {
      setIsEditing(false);
      setCurrentTestimonial(null);
      setFormState({
        authorName: '',
        authorTitle: '',
        quote: '',
        status: 'PENDING',
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/admin/testimonials/${currentTestimonial.id}` : '/api/admin/testimonials';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formState,companyId}),
      });

      if (!res.ok) throw new Error('Failed to save testimonial');

      await fetchTestimonials();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonialStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update testimonial status');

      await fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete testimonial');
        await fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/20 text-green-300 border border-green-500';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500';
      case 'HIDDEN':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500';
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Client Testimonials</h1>
          <p className="text-gray-400">Review, approve, and manage client feedback and testimonials.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-400">
          <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
          Loading testimonials...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {testimonials.length>0 && testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 flex flex-col justify-between
                  ${testimonial.status === 'PENDING' ? 'border-yellow-500' : ''}
                  ${testimonial.status === 'APPROVED' ? 'border-green-500' : ''}`}
              >
                <div>
                  <p className="text-xl italic text-gray-200 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                  <p className="text-lg font-semibold text-white">- {testimonial.authorName}</p>
                  {testimonial.authorTitle && <p className="text-sm text-gray-400">{testimonial.authorTitle}</p>}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClasses(testimonial.status)}`}>
                    {testimonial.status}
                  </span>
                  <div className="flex space-x-3">
                    {testimonial.status !== 'APPROVED' && (
                      <motion.button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'APPROVED')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Approve"
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        <CheckCircleIcon className="h-6 w-6" />
                      </motion.button>
                    )}
                    {testimonial.status !== 'HIDDEN' && (
                      <motion.button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'HIDDEN')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Hide"
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                      >
                        <EyeSlashIcon className="h-6 w-6" />
                      </motion.button>
                    )}
                    {testimonial.status !== 'PENDING' && (
                      <motion.button
                        onClick={() => updateTestimonialStatus(testimonial.id, 'PENDING')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Mark as Pending"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <EyeIcon className="h-6 w-6" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleOpenModal(testimonial)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit"
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(testimonial.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete"
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for Creating/Editing a Testimonial */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-gray-100 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Testimonial' : 'Create New Testimonial'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-700">
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-400">Author Name</label>
                  <input
                    type="text"
                    id="authorName"
                    name="authorName"
                    value={formState.authorName}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="authorTitle" className="block text-sm font-medium text-gray-400">Author Title (Optional)</label>
                  <input
                    type="text"
                    id="authorTitle"
                    name="authorTitle"
                    value={formState.authorTitle}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., Founder & CEO"
                  />
                </div>
                <div>
                  <label htmlFor="quote" className="block text-sm font-medium text-gray-400">Testimonial Quote</label>
                  <textarea
                    id="quote"
                    name="quote"
                    rows="4"
                    value={formState.quote}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-400">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formState.status}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Create Testimonial'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialsPage;
