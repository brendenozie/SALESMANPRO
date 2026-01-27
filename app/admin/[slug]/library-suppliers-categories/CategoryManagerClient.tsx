"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  TagIcon, 
  PlusIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
}

interface Props {
  initialCategories: Category[];
  schoolId: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CategoryManagerClient: React.FC<Props> = ({ initialCategories, schoolId }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory ? "PATCH" : "POST";
    const endpoint = editingCategory 
      ? `${apiBaseUrl}/admin/library/suppliers-categories/${editingCategory.id}`
      : `${apiBaseUrl}/admin/library/suppliers-categories`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, companyId: schoolId })
      });

      if (res.ok) {
        const { data } = await res.json();
        if (editingCategory) {
          setCategories(prev => prev.map(c => c.id === data.id ? data : c));
          toast.success("Category updated");
        } else {
          setCategories(prev => [data, ...prev]);
          toast.success("New category indexed");
        }
        closeModal();
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This may affect filtered suppliers.")) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/admin/library/suppliers-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success("Category removed");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName('');
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Background Glow */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Classification System</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Categories.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-5 py-3 bg-white text-black rounded-2xl font-bold transition-all hover:bg-blue-50 active:scale-95"
          >
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            Add Category
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <TagIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingCategory(cat); setName(cat.name); setIsModalOpen(true); }}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State Card */}
          {categories.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-slate-800 rounded-3xl py-20 flex flex-col items-center opacity-50">
                <Squares2X2Icon className="h-12 w-12 mb-4" />
                <p>No categories defined yet.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">{editingCategory ? 'Update' : 'New'} Category</h2>
                <button onClick={closeModal} className="text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Category Identity</label>
                  <input 
                    required 
                    autoFocus
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 outline-none focus:border-blue-500/50 transition-all text-white font-medium" 
                    placeholder="e.g. Periodicals" 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                  {editingCategory ? 'Save Changes' : 'Initialize Category'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryManagerClient;