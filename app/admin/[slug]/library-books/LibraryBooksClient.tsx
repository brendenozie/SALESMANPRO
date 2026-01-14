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
  EllipsisVerticalIcon
} from "@heroicons/react/24/solid";

interface Props {
  initialBooks: any[];
  schoolId: string;
}

const LibraryBooksClient: React.FC<Props> = ({ initialBooks, schoolId }) => {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase())
    );
  }, [books, search]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" />
      
      {/* Dynamic Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
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
            <button className="group flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-indigo-50 rounded-2xl font-bold transition-all active:scale-95">
              <PlusIcon className="h-5 w-5 stroke-2" />
              <span>Acquire New Volume</span>
            </button>
          </div>
        </header>

        {/* Search & Filter Bar */}
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

        {/* Content Grid */}
        {filteredBooks.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-3"
          }>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} viewMode={viewMode} />
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
    </main>
  );
};

/* Sub-component for individual Book Cards */
const BookCard = ({ book, viewMode }: { book: any, viewMode: 'grid' | 'list' }) => {
  const isAvailable = book.available;

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
          <button className="p-2 text-slate-600 hover:text-white">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl p-5 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[3/4] mb-5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl overflow-hidden relative shadow-2xl">
        {/* Placeholder for real book cover images */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <BookmarkIcon className={`h-12 w-12 mb-4 ${isAvailable ? 'text-indigo-400' : 'text-slate-600'}`} />
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase opacity-50">Edition 2024</span>
        </div>
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl border ${isAvailable ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' : 'bg-rose-500/20 border-rose-500/50 text-rose-200'}`}>
          {isAvailable ? "Available" : "Checked Out"}
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-lg leading-tight text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-slate-500 text-sm font-medium">{book.author}</p>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-800/50 flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{book.isbn || 'No ISBN'}</span>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryBooksClient;