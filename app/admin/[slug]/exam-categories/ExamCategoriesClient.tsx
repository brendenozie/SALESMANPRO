"use client";

import React, { useState } from "react";
import { 
  FolderPlusIcon, 
  TagIcon, 
  AcademicCapIcon, 
  TrashIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  XMarkIcon
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
  
  // Form State
  const [formData, setFormData] = useState({ name: "", description: "" });

  const router = useRouter();

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

    const url = editingId ? `/api/exam-categories/${editingId}` : `/api/exam-categories`;
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
      console.error("Submission error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/exam-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Academic Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Exam <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Categories.</span>
            </h1>
          </div>

          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-orange-50 transition-all shadow-lg"
          >
            <FolderPlusIcon className="h-4 w-4" /> Create Category
          </button>
        </header>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-900/60 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-slate-800 rounded-2xl text-orange-400">
                  <AcademicCapIcon className="h-8 w-8" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(cat)} className="text-slate-600 hover:text-white transition-colors">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-600 hover:text-red-500 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-black text-white mb-2">{cat.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 min-h-[2.5rem]">
                  {cat.description || "No description provided."}
                </p>
              </div>

              <div className="py-6 border-y border-slate-800/50">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Linked Exams</p>
                <p className="text-xl font-bold text-orange-400 italic">{cat._count?.exams || 0}</p>
              </div>

              <button className="w-full mt-6 py-4 rounded-2xl bg-slate-800/50 text-slate-400 group-hover:bg-orange-600 group-hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                Manage Exams <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* New Category Placeholder */}
          <button 
            onClick={() => openModal()}
            className="group border-2 border-dashed border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all"
          >
            <div className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 group-hover:text-orange-500 transition-colors">
              <TagIcon className="h-6 w-6" />
            </div>
            <p className="text-xs font-black uppercase text-slate-600 tracking-widest group-hover:text-slate-300">Add New Category</p>
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? "Edit" : "New"} Exam Category
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Category Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g., Mid-Term Exams"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Describe the scope of this category..."
                />
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
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