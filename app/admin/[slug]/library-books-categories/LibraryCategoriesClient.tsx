"use client";

import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  PlusIcon, MagnifyingGlassIcon, FolderIcon, 
  XMarkIcon, TrashIcon, PencilSquareIcon, EllipsisVerticalIcon 
} from "@heroicons/react/24/solid";
import CategoryModal from "./CategoryModal";

interface Category {
  id: string;
  name: string;
  _count?: { libraryBooks: number };
}

const LibraryCategoriesClient = ({ initialCategories, schoolId }: { initialCategories: Category[], schoolId: string }) => {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => 
    categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), 
  [categories, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This will affect book organization.")) return;
    try {
      const res = await fetch(`/api/admin/library/categories/${id}?companyId=${schoolId}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success("Category dissolved");
      }
    } catch (err) { toast.error("Failed to delete"); }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8">
      <Toaster position="top-right" />
      
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-cyan-500 rounded-full" />
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-[0.2em]">Taxonomy</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              Category <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Index.</span>
            </h1>
          </div>

          <button 
            onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-cyan-50 rounded-2xl font-bold transition-all active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Category</span>
          </button>
        </header>

        {/* Search */}
        <section className="relative mb-10 group">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter categories..."
            className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 focus:border-cyan-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
          />
        </section>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((cat) => (
            <div key={cat.id} className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                  <FolderIcon className="h-6 w-6" />
                </div>
                <div className="flex gap-1">
                   <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} className="p-2 text-slate-500 hover:text-white transition-colors">
                     <PencilSquareIcon className="h-4 w-4" />
                   </button>
                   <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-500 hover:text-rose-400 transition-colors">
                     <TrashIcon className="h-4 w-4" />
                   </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-slate-500 text-sm font-medium">
                {cat._count?.libraryBooks || 0} Catalogued Volumes
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Simplified Modal Logic */}
      {isModalOpen && (
        <CategoryModal 
          category={editingCategory} 
          schoolId={schoolId} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(data) => {
            setCategories(prev => editingCategory ? prev.map(c => c.id === data.id ? data : c) : [data, ...prev]);
            setIsModalOpen(false);
          }}
        />
      )}
    </main>
  );
};

export default LibraryCategoriesClient;