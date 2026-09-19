"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon
} from "@heroicons/react/24/solid";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: "AVAILABLE" | "ISSUED" | "RESERVED";
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  location?: string;
}

interface Props {
  initialBooks: Book[];
  schoolId: string;
}

const LibraryBooksClient: React.FC<Props> = ({ initialBooks, schoolId }) => {
  const [books, setBooks] = useState<Book[]>(Array.isArray(initialBooks) ? initialBooks : []);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`/api/admin/library/categories?companyId=${schoolId}`);
        if (res.ok) {
          const result = await res.json();
          setCategories(result.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCats();
  }, [schoolId]);

  // Handle outside clicks to close filter dropdowns
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title?.toLowerCase().includes(search.toLowerCase()) ||
        book.author?.toLowerCase().includes(search.toLowerCase()) ||
        book.isbn?.includes(search);

      const matchesStatus = statusFilter === "ALL" || book.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [books, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this volume from the archive? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/library/books/${id}?companyId=${schoolId}`, { method: "DELETE" });
      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== id));
        toast.success("Volume removed from archive");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30 transition-colors duration-200 p-6 md:p-8">
      <Toaster position="top-right" />
      
      {/* Background Glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 dark:bg-indigo-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 dark:bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">Knowledge Hub</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl">
              Library <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Archive.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex bg-white dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                aria-label="Grid View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                aria-label="List View"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
            <button 
              onClick={() => { setEditingBook(null); setIsModalOpen(true); }}
              className="group flex items-center gap-2 px-5 py-3 bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-850 dark:hover:bg-indigo-50 rounded-2xl font-bold transition-all active:scale-95 shadow-md"
            >
              <PlusIcon className="h-5 w-5 stroke-2" />
              <span>Acquire New Volume</span>
            </button>
          </div>
        </header>

        {/* Filter & Search Bar Section */}
        <section className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-grow group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 dark:focus:border-indigo-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="relative" ref={filterDropdownRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all border ${
                statusFilter !== "ALL" 
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/60" 
                  : "bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span>{statusFilter === "ALL" ? "Filters" : `Status: ${statusFilter}`}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { setStatusFilter("ALL"); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-colors ${statusFilter === "ALL" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    All Books
                  </button>
                  <button 
                    onClick={() => { setStatusFilter("AVAILABLE"); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-colors ${statusFilter === "AVAILABLE" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    Available
                  </button>
                  <button 
                    onClick={() => { setStatusFilter("ISSUED"); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-colors ${statusFilter === "ISSUED" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    Checked Out
                  </button>
                  <button 
                    onClick={() => { setStatusFilter("RESERVED"); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm rounded-xl transition-colors ${statusFilter === "RESERVED" ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                  >
                    Reserved
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Books Content Container */}
        {filteredBooks.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-3"
          }>
            {filteredBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                viewMode={viewMode} 
                onEdit={() => { setEditingBook(book); setIsModalOpen(true); }}
                onDelete={() => handleDelete(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-transparent">
            <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4">
              <BookmarkIcon className="h-8 w-8 text-slate-400 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No volumes found</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Try adjusting your search criteria or changing your filters.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <BookFormModal 
          book={editingBook} 
          schoolId={schoolId} 
          categories={categories}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(updatedBook) => {
            if (editingBook) {
              setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
              toast.success("Archive updated");
            } else {
              setBooks(prev => [updatedBook, ...prev]);
              toast.success("New volume added");
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </main>
  );
};

/* --- Sub-Components --- */

const BookCard = ({ book, viewMode, onEdit, onDelete }: { book: Book, viewMode: 'grid' | 'list', onEdit: () => void, onDelete: () => void }) => {
  const [showMenu, setShowMenu] = useState(false);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (cardMenuRef.current && !cardMenuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Compute colors and display terms strictly from dynamic status mappings
  const statusConfig = {
    AVAILABLE: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30", label: "Available" },
    ISSUED: { bg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-500/30", label: "Checked Out" },
    RESERVED: { bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-500/30", label: "Reserved" }
  };

  const config = statusConfig[book.status] || statusConfig.AVAILABLE;

  const Menu = () => (
    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-10 overflow-hidden animate-in fade-in duration-100">
      <button 
        onClick={() => { onEdit(); setShowMenu(false); }} 
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <PencilSquareIcon className="h-4 w-4" /> Edit
      </button>
      <button 
        onClick={() => { onDelete(); setShowMenu(false); }} 
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
      >
        <TrashIcon className="h-4 w-4" /> Delete
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-2xl hover:border-indigo-500/30 hover:shadow-md transition-all">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-10 bg-slate-100 dark:bg-gradient-to-br dark:from-slate-700 dark:to-slate-800 rounded shadow-inner flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-transparent">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{book.title?.charAt(0)}</span>
          </div>
          <div className="truncate">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{book.title}</h4>
            <p className="text-sm text-slate-500 truncate">{book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
          <span className="hidden md:block font-mono text-xs text-slate-400 dark:text-slate-600 tracking-wider">{book.isbn || 'No ISBN'}</span>
          <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold tracking-wide border uppercase ${config.bg}`}>
            {book.status === "ISSUED" ? "OUT" : book.status}
          </span>
          <div className="relative" ref={cardMenuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Book actions">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            {showMenu && <Menu />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] mb-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/20 dark:to-purple-500/20 border border-slate-100 dark:border-transparent rounded-2xl overflow-hidden relative shadow-inner">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <BookmarkIcon className={`h-12 w-12 mb-4 transition-colors duration-300 ${book.status === "AVAILABLE" ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`} />
          <span className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase opacity-70 dark:opacity-50">Archive Edition</span>
        </div>
        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-md border ${config.bg}`}>
          {config.label}
        </div>
      </div>

      <div className="space-y-1 min-w-0">
        <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">{book.title}</h3>
        <p className="text-slate-500 text-sm font-medium truncate">{book.author}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest truncate max-w-[120px]">{book.isbn || 'No ISBN'}</span>
        <div className="relative" ref={cardMenuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white" aria-label="Book actions">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          {showMenu && <Menu />}
        </div>
      </div>
    </div>
  );
};

const BookFormModal = ({ 
  book, 
  schoolId, 
  categories, 
  onClose, 
  onSuccess 
}: { 
  book: Book | null, 
  schoolId: string, 
  categories: {id: string, name: string}[],
  onClose: () => void, 
  onSuccess: (b: Book) => void 
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      title: formData.get("title"),
      author: formData.get("author"),
      isbn: formData.get("isbn"),
      categoryId: formData.get("categoryId"),
      status: formData.get("status"),
      location: formData.get("location"),
      companyId: schoolId
    };

    try {
      const url = book ? `/api/admin/library/books/${book.id}?companyId=${schoolId}` : `/api/admin/library/books?companyId=${schoolId}`;
      const res = await fetch(url, {
        method: book ? "PUT" : "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await res.json();
      if (res.ok) {
        onSuccess(result.data);
      } else {
        toast.error(result.message || "Archive sync failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#05070A]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{book ? "Edit Volume" : "Acquire Volume"}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mt-1">Book Registration</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
              <input 
                name="title" 
                required 
                defaultValue={book?.title} 
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Author */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Author</label>
                <input 
                  name="author" 
                  required 
                  defaultValue={book?.author} 
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
              {/* ISBN */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">ISBN</label>
                <input 
                  name="isbn" 
                  defaultValue={book?.isbn} 
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Location / Shelf ID</label>
              <input 
                name="location" 
                defaultValue={book?.location} 
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                placeholder="e.g. Shelf A-3, Floor 2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select 
                  name="categoryId" 
                  required 
                  defaultValue={book?.categoryId || ""} 
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="" disabled className="text-slate-400 dark:text-slate-600">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>
              {/* Status */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Archive Status</label>
                <select 
                  name="status" 
                  defaultValue={book?.status || "AVAILABLE"} 
                  className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="AVAILABLE" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">Available</option>
                  <option value="ISSUED" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">Issued</option>
                  <option value="RESERVED" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">Reserved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-[2] px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-black rounded-2xl font-black hover:bg-slate-850 dark:hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? "Syncing..." : book ? "Update Record" : "Confirm Acquisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryBooksClient;