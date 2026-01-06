"use client";

import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, BookOpenIcon } from "@heroicons/react/24/outline";

interface Props {
  initialBooks: any[];
  schoolId: string;
}

const LibraryBooksClient: React.FC<Props> = ({ initialBooks, schoolId }) => {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");

  const filteredBooks = useMemo(() => {
    return books.filter(book =>
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase())
    );
  }, [books, search]);

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-gray-100 p-6">
      <Toaster />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Library Books</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Manage Catalog</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-colors">
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          Add New Book
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-3 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or author..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase text-gray-500 bg-gray-800/40">
            <tr>
              <th className="px-6 py-4">Book Details</th>
              <th className="px-6 py-4">ISBN</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredBooks.map(book => (
              <tr key={book.id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <BookOpenIcon className="h-8 w-8 text-indigo-400 p-1.5 bg-indigo-400/10 rounded-lg" />
                    <div>
                      <div className="font-semibold">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-gray-400">{book.isbn}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${book.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {book.available ? "AVAILABLE" : "ISSUED"}
                   </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors"><PencilSquareIcon className="h-4 w-4" /></button>
                  <button className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"><TrashIcon className="h-4 w-4 text-red-400" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default LibraryBooksClient;