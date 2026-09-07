"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  XMarkIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// ---- Types ----
interface Testimonial {
  id: string;
  authorName: string;
  authorTitle?: string;
  quote: string;
  status: "PENDING" | "APPROVED" | "HIDDEN";
  companyId: string;
}

type FormState = Omit<Testimonial, "id" | "companyId">;

interface TestimonialsClientProps {
  companyId: string;
}

export default function TestimonialsClient({ companyId }: TestimonialsClientProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);

  const initialForm: FormState = {
    authorName: "",
    authorTitle: "",
    quote: "",
    status: "PENDING",
  };
  const [formState, setFormState] = useState<FormState>(initialForm);

  // ---- Fetch ----
  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/testimonials?companyId=${companyId}`, {
        headers: { "Content-Type": "application/json", Credentials: "include" },
      });
      if (!res.ok) throw new Error("Failed to fetch testimonials");
      const data = (await res.json()).data;
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [companyId]);

  // ---- Modal ----
  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setIsEditing(true);
      setCurrentTestimonial(testimonial);
      setFormState({
        authorName: testimonial.authorName,
        authorTitle: testimonial.authorTitle ?? "",
        quote: testimonial.quote,
        status: testimonial.status,
      });
    } else {
      setIsEditing(false);
      setCurrentTestimonial(null);
      setFormState(initialForm);
    }
    setShowModal(true);
  };

  // ---- Form Handlers ----
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing
        ? `${apiBaseUrl}/admin/testimonials/${currentTestimonial?.id}`
        : `${apiBaseUrl}/admin/testimonials`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Credentials: "include" },
        body: JSON.stringify({ ...formState, companyId }),
      });

      if (!res.ok) throw new Error("Failed to save testimonial");

      await fetchTestimonials();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving testimonial:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Actions ----
  const updateTestimonialStatus = async (id: string, newStatus: Testimonial["status"]) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Credentials: "include" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update testimonial status");
      await fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/testimonials/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Credentials: "include" },
        });
        if (!res.ok) throw new Error("Failed to delete testimonial");
        await fetchTestimonials();
      } catch (error) {
        console.error("Error deleting testimonial:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // ---- Layout Variant Utilities ----
  const getStatusBadgeStyles = (status: Testimonial["status"]) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20";
      case "PENDING":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20";
      case "HIDDEN":
        return "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
    }
  };

  const getCardStatusBorder = (status: Testimonial["status"]) => {
    switch (status) {
      case "APPROVED":
        return "before:bg-emerald-500";
      case "PENDING":
        return "before:bg-amber-500";
      case "HIDDEN":
        return "before:bg-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300 font-sans selection:bg-indigo-500/20">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-500/10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 pb-6 border-b border-slate-200 dark:border-slate-900">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Client Testimonials
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
              Review, approve, and curate your showcase profiles.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="group inline-flex items-center justify-center whitespace-nowrap rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-98"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2.5 text-indigo-200 group-hover:text-white transition-colors" />
            Add Testimonial
          </button>
        </header>

        {/* Core View State Trigger */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] rounded-3xl border border-dashed border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/20 backdrop-blur-sm">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-500 dark:text-indigo-400 mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Syncing database assets...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center min-h-[350px] p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-900 bg-white/40 dark:bg-slate-900/10">
            <p className="text-base font-semibold text-slate-400 dark:text-slate-500">No client testimonials found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">Click the action button above to register your first review asset entry.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className={`relative group bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] ${getCardStatusBorder(
                    testimonial.status
                  )}`}
                >
                  <div className="flex-1">
                    <span className="absolute right-6 top-6 text-slate-200 dark:text-slate-800/40 font-serif text-7xl select-none leading-none pointer-events-none">
                      &ldquo;
                    </span>
                    <p className="text-base md:text-lg text-slate-700 dark:text-slate-200 font-medium italic leading-relaxed relative z-10 pr-6 mb-6">
                      {testimonial.quote}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm tracking-wider uppercase shadow-inner">
                        {testimonial.authorName?.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {testimonial.authorName}
                        </h4>
                        {testimonial.authorTitle && (
                          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                            {testimonial.authorTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/60">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase border ${getStatusBadgeStyles(testimonial.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
                      {testimonial.status.toLowerCase()}
                    </span>
                    
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-100 dark:border-slate-900">
                      {testimonial.status !== "APPROVED" && (
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, "APPROVED")}
                          title="Approve Asset"
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-all duration-200"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      {testimonial.status !== "HIDDEN" && (
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, "HIDDEN")}
                          title="Hide Asset"
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-all duration-200"
                        >
                          <EyeSlashIcon className="h-5 w-5" />
                        </button>
                      )}
                      {testimonial.status !== "PENDING" && (
                        <button
                          onClick={() => updateTestimonialStatus(testimonial.id, "PENDING")}
                          title="Mark Pending"
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-all duration-200"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal(testimonial)}
                        title="Edit Schema"
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-all duration-200"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        title="Purge Document"
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-900 transition-all duration-200"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modal Layer */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md transition-opacity"
                  onClick={() => setShowModal(false)}
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 8 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 md:p-8 text-left shadow-2xl border border-slate-200 dark:border-slate-800/80 transition-all w-full max-w-lg"
                >
                  <div className="absolute right-4 top-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    {isEditing ? "Modify Testimonial Parameters" : "Register Testimonial Node"}
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="authorName" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Author Identification
                      </label>
                      <input
                        type="text"
                        id="authorName"
                        name="authorName"
                        value={formState.authorName}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g., Jane Doe"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 placeholder-slate-400 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400/70 focus:border-transparent transition-all sm:text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label htmlFor="authorTitle" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Professional Title (Optional)
                      </label>
                      <input
                        type="text"
                        id="authorTitle"
                        name="authorTitle"
                        value={formState.authorTitle}
                        onChange={handleFormChange}
                        placeholder="e.g., Technical Director / COO"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 placeholder-slate-400 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400/70 focus:border-transparent transition-all sm:text-sm font-medium"
                      />
                    </div>

                    <div>
                      <label htmlFor="quote" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Quote Payload
                      </label>
                      <textarea
                        id="quote"
                        name="quote"
                        rows={4}
                        value={formState.quote}
                        onChange={handleFormChange}
                        required
                        placeholder="Paste or write the evaluation text here..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 placeholder-slate-400 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400/70 focus:border-transparent transition-all sm:text-sm font-medium resize-none leading-relaxed"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Visibility Lifecycle
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formState.status}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400/70 focus:border-transparent transition-all sm:text-sm font-semibold tracking-wide"
                      >
                        <option value="PENDING">Pending Approval Cycle</option>
                        <option value="APPROVED">Live & Approved</option>
                        <option value="HIDDEN">Archived / Hidden</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 border border-transparent hover:border-slate-200 dark:hover:border-slate-800/60 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-500 transition-all duration-200 active:scale-98"
                      >
                        {isEditing ? "Save Changes" : "Commit Node"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}