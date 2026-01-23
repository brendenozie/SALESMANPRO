"use client";

import React, { useMemo, useState } from "react";
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
  available: boolean;
  category?: string;
  availableCopies?: number;
}

interface Props {
  initialBooks: Book[];
  schoolId: string;
}

const LibraryBooksClient: React.FC<Props> = ({ initialBooks, schoolId }) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase()) ||
      book.isbn?.includes(search)
    );
  }, [books, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this volume from the archive?")) return;
    
    try {
      const res = await fetch(`/api/admin/library/books/${id}?companyId=${schoolId}`, { method: "DELETE" });
      if (res.ok) {
        setBooks(prev => prev.filter(b => b.id !== id));
        toast.success("Volume removed from archive");
      }
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" />
      
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">Knowledge Hub</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
              Library <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Archive.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
            <button 
              onClick={() => { setEditingBook(null); setIsModalOpen(true); }}
              className="group flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-indigo-50 rounded-2xl font-bold transition-all active:scale-95"
            >
              <PlusIcon className="h-5 w-5 stroke-2" />
              <span>Acquire New Volume</span>
            </button>
          </div>
        </header>

        <section className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-grow group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full bg-slate-900/40 backdrop-blur-md border border-slate-800 focus:border-indigo-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-600 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span className="font-medium">Filters</span>
          </button>
        </section>

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
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="inline-flex p-4 bg-slate-900 rounded-2xl mb-4">
              <BookmarkIcon className="h-8 w-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300">No volumes found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <BookFormModal 
          book={editingBook} 
          schoolId={schoolId} 
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
  const isAvailable = book.available;

  const Menu = () => (
    <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-10 overflow-hidden">
      <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <PencilSquareIcon className="h-4 w-4" /> Edit
      </button>
      <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
        <TrashIcon className="h-4 w-4" /> Delete
      </button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="group flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center gap-4">
          <div className="h-12 w-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded shadow-inner flex-shrink-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{book.title?.charAt(0)}</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors">{book.title}</h4>
            <p className="text-sm text-slate-500">{book.author}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span className="hidden md:block font-mono text-xs text-slate-600 tracking-wider">{book.isbn}</span>
          <span className={`text-[10px] px-3 py-1 rounded-full font-black tracking-tighter ${isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {isAvailable ? 'READY' : 'OUT'}
          </span>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-600 hover:text-white">
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            {showMenu && <Menu />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-5 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] mb-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <BookmarkIcon className={`h-12 w-12 mb-4 ${isAvailable ? 'text-indigo-400' : 'text-slate-600'}`} />
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase opacity-50">Archive Edition</span>
        </div>
        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl border ${isAvailable ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'}`}>
          {isAvailable ? "Available" : "Checked Out"}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{book.title}</h3>
        <p className="text-slate-500 text-sm font-medium">{book.author}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-800/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{book.isbn || 'No ISBN'}</span>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
          {showMenu && <Menu />}
        </div>
      </div>
    </div>
  );
};

const BookFormModal = ({ book, schoolId, onClose, onSuccess }: { book: Book | null, schoolId: string, onClose: () => void, onSuccess: (b: Book) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      author: formData.get("author"),
      isbn: formData.get("isbn"),
      available: formData.get("available") === "true",
    };

    try {
      const url = book ? `/api/admin/library/books/${book.id}?companyId=${schoolId}` : `/api/admin/library/books?companyId=${schoolId}`;
      const res = await fetch(url, {
        method: book ? "PUT" : "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const result = await res.json();
        onSuccess(result.data);
      }
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#05070A]/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">{book ? "Edit Volume" : "Acquire Volume"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
              <input name="title" required defaultValue={book?.title} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Author</label>
                <input name="author" required defaultValue={book?.author} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">ISBN</label>
                <input name="isbn" defaultValue={book?.isbn} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
              <select name="available" defaultValue={book?.available?.toString() ?? "true"} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 mt-1 outline-none focus:border-indigo-500 transition-all text-white">
                <option value="true">Available in Archive</option>
                <option value="false">Checked Out</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] px-6 py-3 bg-white text-black rounded-2xl font-bold hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50">
              {loading ? "Syncing Archive..." : book ? "Update Record" : "Confirm Acquisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryBooksClient;