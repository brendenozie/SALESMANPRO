"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  InformationCircleIcon,
  BookOpenIcon 
} from "@heroicons/react/24/outline";

const MaintenanceClient = ({ schoolId, initialBooks }: any) => {
  const [books, setBooks] = useState(initialBooks);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRepair = async (bookId: string) => {
    setLoadingId(bookId);
    try {
      const res = await fetch(`/api/admin/library/maintenance`, {
        method: "PATCH",
        body: JSON.stringify({ bookId }),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        toast.success("Book restored to available inventory");
        setBooks(books.filter((b: any) => b.id !== bookId));
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8">
      <Toaster position="bottom-center" />
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <WrenchScrewdriverIcon className="h-5 w-5 text-orange-400" />
            <span className="text-orange-400 text-[10px] font-black uppercase tracking-widest">Archive Maintenance</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Repair <span className="text-orange-500">Queue.</span></h1>
          <p className="text-slate-500 mt-2 text-sm">Volumes flagged as damaged and awaiting restoration.</p>
        </header>

        {books.length === 0 ? (
          <div className="text-center py-32 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl">
            <CheckCircleIcon className="h-12 w-12 text-emerald-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Inventory Healthy</h3>
            <p className="text-slate-600 text-sm">No books currently require maintenance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book: any) => (
              <div key={book.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/30 transition-all flex justify-between items-start group">
                <div className="flex gap-4">
                  <div className="h-16 w-12 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-all">
                    <BookOpenIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{book.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">ISBN: {book.identifier || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase rounded border border-orange-500/20">Damaged</span>
                      <span className="text-[10px] text-slate-600 font-bold italic">
                        Reported by: {book.issuances?.[0]?.libraryMember?.student?.firstName || "Faculty"}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRepair(book.id)}
                  disabled={loadingId === book.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50"
                >
                  {loadingId === book.id ? "Processing..." : "Mark Restored"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MaintenanceClient;