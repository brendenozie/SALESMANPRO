"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchScrewdriverIcon, 
  CheckCircleIcon, 
  BookOpenIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

const MaintenanceClient = ({ schoolId, initialBooks }: any) => {
  const [books, setBooks] = useState(initialBooks);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Theme state synced with localStorage and system settings
  // const [theme, setTheme] = useState<"light" | "dark">("light");

  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  //   if (savedTheme) {
  //     setTheme(savedTheme);
  //   } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setTheme("dark");
  //   } else {
  //     setTheme("light");
  //   }
  // }, []);

  // const toggleTheme = () => {
  //   const nextTheme = theme === "dark" ? "light" : "dark";
  //   setTheme(nextTheme);
  //   localStorage.setItem("theme", nextTheme);
  // };

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
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status due to a connection issue");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 transition-colors duration-300 relative overflow-hidden">
        <Toaster position="bottom-center" />
        
        {/* Subtle Orange Decorative Ambient Glow */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <WrenchScrewdriverIcon className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                <span className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">Archive Maintenance</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Repair <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600 dark:from-orange-500 dark:to-orange-400">Queue.</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Volumes flagged as damaged and awaiting restoration.</p>
            </div>

            {/* Theme Toggle Button */}
            {/* <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-orange-500/30 dark:hover:border-orange-500/30 rounded-2xl transition-all shadow-sm"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <>
                  <SunIcon className="h-5 w-5 text-orange-400" />
                  <span className="text-xs font-semibold text-slate-300">Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-5 w-5 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-700">Dark Mode</span>
                </>
              )}
            </button> */}
          </header>

          {books.length === 0 ? (
            <div className="text-center py-32 bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm dark:shadow-none">
              <CheckCircleIcon className="h-12 w-12 text-emerald-500/20 dark:text-emerald-500/10 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-400">Inventory Healthy</h3>
              <p className="text-slate-500 dark:text-slate-600 text-sm mt-1">No books currently require maintenance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((book: any) => (
                <div 
                  key={book.id} 
                  className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group shadow-sm dark:shadow-none"
                >
                  <div className="flex gap-4 items-start">
                    <div className="h-16 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-all flex-shrink-0">
                      <BookOpenIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ISBN: {book.identifier || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-500 text-[10px] font-black uppercase rounded border border-orange-500/20">
                          Damaged
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-600 font-bold italic">
                          Reported by: {book.issuances?.[0]?.libraryMember?.student?.firstName || "Faculty"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRepair(book.id)}
                    disabled={loadingId === book.id}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all disabled:opacity-50 active:scale-95 text-center shadow-sm"
                  >
                    {loadingId === book.id ? "Processing..." : "Mark Restored"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MaintenanceClient;