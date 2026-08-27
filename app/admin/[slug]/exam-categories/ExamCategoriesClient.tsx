"use client";

import React, { useState, useEffect } from "react";
import { 
  FolderPlusIcon, 
  TagIcon, 
  AcademicCapIcon, 
  TrashIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ExamCategory {
  id: string;
  name: string;
  description?: string;
  _count?: { exams: number };
}

interface Props {
  initialData: ExamCategory[];
  schoolId: string;
}

const ExamCategoriesClient = ({ initialData, schoolId }: Props) => {
  const [categories, setCategories] = useState<ExamCategory[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false );
  
  // Form State
  const [formData, setFormData] = useState({ name: "", description: "" });

  const router = useRouter();

  // Handle systemic or inline dark mode class matching
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const openModal = (cat?: ExamCategory) => {
    if (cat) {
      setEditingId(cat.id);
      setFormData({ name: cat.name, description: cat.description || "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId ? `/api/admin/exam-categories/${editingId}` : `/api/admin/exam-categories`;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, companyId: schoolId }),
      });

      if (res.ok) {
        const savedData = await res.json();
        if (editingId) {
          setCategories(prev => prev.map(c => c.id === editingId ? savedData : c));
        } else {
          setCategories(prev => [savedData, ...prev]);
        }
        setIsModalOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Something went wrong");
      }
    } catch (err) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/exam-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      // Handle error gracefully
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-6 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header / Top Action Panel */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-slate-200 dark:border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
              <span className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Academic Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Exam <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-500">Categories.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Stunning Custom Theme Toggle */}
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-400 hover:scale-105 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button> */}

            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-xs hover:bg-orange-600 dark:hover:bg-orange-50 hover:text-white transition-all shadow-md hover:shadow-orange-500/10"
            >
              <FolderPlusIcon className="h-4 w-4" /> Create Category
            </button>
          </div>
        </header>

        {/* Category Adaptive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-[2rem] p-6 md:p-8 hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3.5 bg-orange-50 dark:bg-slate-800 rounded-2xl text-orange-600 dark:text-orange-400">
                    <AcademicCapIcon className="h-7 w-7" />
                  </div>
                  <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => openModal(cat)} 
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)} 
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 min-h-[2.5rem]">
                    {cat.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div>
                <div className="py-4 border-y border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Linked Exams</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono bg-orange-50 dark:bg-orange-500/10 px-2.5 py-0.5 rounded-lg">
                    {cat._count?.exams || 0}
                  </span>
                </div>

                <button className="w-full mt-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 group-hover:bg-orange-600 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                  Manage Exams <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* New Category Dotted Microcard */}
          <button 
            onClick={() => openModal()}
            className="group border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-500/60 dark:hover:border-orange-500/50 hover:bg-white dark:hover:bg-orange-500/[0.01] transition-all min-h-[320px]"
          >
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-700 group-hover:text-orange-500 dark:group-hover:text-orange-500 group-hover:scale-110 transition-all">
              <TagIcon className="h-5 w-5" />
            </div>
            <p className="text-xs font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
              Add New Category
            </p>
          </button>
        </div>
      </div>

      {/* Modal Overlay Context */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md transition-opacity">
          <div className="bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800/80 w-full max-w-md rounded-[2rem] p-6 md:p-8 relative shadow-2xl scale-100 transition-all">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {editingId ? "Modify" : "New"} Exam Category
            </h2> 

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2">Category Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  placeholder="e.g., Mid-Term Exams"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all resize-none"
                  placeholder="Describe the scope of this category..."
                />
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 shadow-lg shadow-orange-600/10"
              >
                {loading ? "Processing..." : editingId ? "Update Category" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ExamCategoriesClient;