"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useParams } from "next/navigation";



const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Types
interface FAQ {
  id: string;
  question: string;
  answer: string;
  companyId: string;
}

interface FormState {
  question: string;
  answer: string;
}

const FAQsPage = () => {
  const params = useParams();
  const companyId = params.slug as string;

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentFAQ, setCurrentFAQ] = useState<FAQ | null>(null);
  const [formState, setFormState] = useState<FormState>({
    question: "",
    answer: "",
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/faqs?companyId=${companyId}`
        , { headers: { "Credentials": "include" } }
      );
      const data: { faqs: FAQ[] } = (await res.json()).data;
      setFaqs(data.faqs);
    } catch (error) {
      // console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleFAQ = (id: string) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  const handleOpenModal = (faq: FAQ | null = null) => {
    if (faq) {
      setIsEditing(true);
      setCurrentFAQ(faq);
      setFormState({
        question: faq.question,
        answer: faq.answer,
      });
    } else {
      setIsEditing(false);
      setCurrentFAQ(null);
      setFormState({
        question: "",
        answer: "",
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing
        ? `${apiBaseUrl}/admin/faqs/${currentFAQ?.id}`
        : `${apiBaseUrl}/admin/faqs?companyId=${companyId}`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", "Credentials": "include" },
        body: JSON.stringify({ ...formState, companyId }),
      });

      if (!res.ok) throw new Error("Failed to save FAQ");

      await fetchFaqs();
      setShowModal(false);
    } catch (error) {
      // console.error("Error saving FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/faqs/${id}`, { 
          method: "DELETE",
        headers: { 
          "Content-Type": "application/json", "Credentials": "include" },
          });
        if (!res.ok) throw new Error("Failed to delete FAQ");
        await fetchFaqs();
      } catch (error) {
        // console.error("Error deleting FAQ:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-400">Manage and organize the most common questions from your clients.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New FAQ
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-400">
          <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
          Loading FAQs...
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {faqs && faqs.length > 0 && faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-6 cursor-pointer"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <h4 className="text-xl font-semibold text-white flex-1 pr-4">{faq.question}</h4>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      // onClick={(e) => { e.stopPropagation(); handleOpenModal(faq); }}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleOpenModal(faq);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit"
                      className="p-2 rounded-full text-blue-400 hover:bg-gray-700 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        handleDelete(faq.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete"
                      className="p-2 rounded-full text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.div
                      animate={{ rotate: openFAQId === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 rounded-full text-blue-400"
                    >
                      <ChevronDownIcon className="h-6 w-6" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {openFAQId === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-blue-200 border-t border-gray-700"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal for Creating/Editing an FAQ */}
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
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit FAQ' : 'Create New FAQ'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-700">
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-400">Question</label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    value={formState.question}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-400">Answer</label>
                  <textarea
                    id="answer"
                    name="answer"
                    // rows="4"
                    value={formState.answer}
                    onChange={handleFormChange}
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
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
                    {isEditing ? 'Save Changes' : 'Create FAQ'}
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

export default FAQsPage;
