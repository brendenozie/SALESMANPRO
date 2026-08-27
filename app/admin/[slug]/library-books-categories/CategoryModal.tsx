"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface Category {
  id: string;
  name: string;
}

interface CategoryModalProps {
  category: Category | null;
  schoolId: string;
  onClose: () => void;
  onSuccess: (category: Category) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  category, 
  schoolId, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");

    setLoading(true);
    const url = category 
      ? `/api/admin/library/categories/${category.id}?companyId=${schoolId}` 
      : `/api/admin/library/categories?companyId=${schoolId}`;
    
    const method = category ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: JSON.stringify({ name, companyId: schoolId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const result = await res.json();
        onSuccess(result.data);
        toast.success(category ? "Index Updated" : "Category Created");
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#05070A]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {category ? "Modify Index" : "Create Category"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mt-1">
              Library Taxonomy
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close dialog"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-[0.15em] ml-1">
              Category Name
            </label>
            <input
              required
              autoFocus
              placeholder="e.g. Quantum Physics, Classic Literature..."
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl px-5 py-4 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all order-2 sm:order-1"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-black rounded-2xl font-black hover:bg-slate-850 dark:hover:bg-cyan-50 transition-all active:scale-95 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? "Processing..." : category ? "Update Index" : "Confirm Category"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default CategoryModal;