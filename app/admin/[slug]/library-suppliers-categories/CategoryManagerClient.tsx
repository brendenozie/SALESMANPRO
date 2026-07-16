"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  TagIcon, 
  PlusIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon,
  Squares2X2Icon,
  SunIcon,
  MoonIcon
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
  
  // Theme state synced with system preferences and localStorage
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

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
      } else {
        toast.error("Invalid entry parameters");
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
      } else {
        toast.error("Delete rejected by backend");
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
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
        <Toaster position="top-right" />
        
        {/* Blue Ambient Glow */}
        <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-blue-600 dark:bg-blue-500 rounded-full" />
                <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Classification System</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Categories.</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Theme Toggle Button */}
              {/* <button 
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 rounded-2xl transition-all shadow-sm"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <>
                    <SunIcon className="h-5 w-5 text-orange-400" />
                    <span className="hidden md:inline text-xs font-semibold text-slate-300">Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 text-slate-600" />
                    <span className="hidden md:inline text-xs font-semibold text-slate-700">Dark Mode</span>
                  </>
                )}
              </button> */}

              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 dark:bg-white dark:hover:bg-blue-50 text-white dark:text-black rounded-2xl font-bold transition-all active:scale-95 shadow-sm"
              >
                <PlusIcon className="h-5 w-5 stroke-[3px]" />
                Add Category
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-all shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <TagIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingCategory(cat); setName(cat.name); setIsModalOpen(true); }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                      title="Edit Category"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete Category"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State Card */}
            {categories.length === 0 && (
              <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-20 flex flex-col items-center text-slate-400 dark:text-slate-500">
                <Squares2X2Icon className="h-12 w-12 mb-4" />
                <p className="font-semibold">No categories defined yet.</p>
              </div>
            )}
          </div>

          {/* Modal Overlay */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
              <div className="bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl transition-colors duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingCategory ? 'Update' : 'New'} Category
                  </h2>
                  <button 
                    onClick={closeModal} 
                    className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">
                      Category Identity
                    </label>
                    <input 
                      required 
                      autoFocus
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 outline-none focus:border-blue-500/50 dark:focus:border-blue-500/50 transition-all font-medium placeholder-slate-400 dark:placeholder-slate-600" 
                      placeholder="e.g. Periodicals" 
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/10 dark:shadow-blue-900/20 active:scale-95"
                  >
                    {editingCategory ? 'Save Changes' : 'Initialize Category'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryManagerClient;