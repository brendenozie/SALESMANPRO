"use client";

import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowsRightLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  CalendarDaysIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  BookOpenIcon,
  UserIcon
} from "@heroicons/react/24/outline";

interface Issuance {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  status: 'Current' | 'Overdue' | 'Returned';
}

interface Props {
  initialRecords: Issuance[];
  books: any[]; // For the selection dropdown
  members: any[]; // For the selection dropdown
  schoolId: string;
}

const IssuanceRecordsClient = ({ initialRecords = [], books = [], members = [], schoolId }: Props) => {
  const [records, setRecords] = useState<Issuance[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats calculation
  const stats = useMemo(() => ({
    active: records.filter(r => r.status === 'Current').length,
    overdue: records.filter(r => r.status === 'Overdue').length
  }), [records]);

  const filteredRecords = records.filter(r => 
    r.bookTitle.toLowerCase().includes(search.toLowerCase()) || 
    r.memberName.toLowerCase().includes(search.toLowerCase())
  );

  const handleReturn = async (recordId: string) => {
    try {
      const res = await fetch(`/api/admin/library/issuance/${recordId}/return?companyId=${schoolId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: 'Returned' as const } : r));
        toast.success("Volume returned to archive");
      }
    } catch (err) {
      toast.error("Failed to process return");
    }
  };

  const handleNewTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      bookId: formData.get("bookId"),
      memberId: formData.get("memberId"),
      dueDate: formData.get("dueDate"),
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Current'
    };

    try {
      const res = await fetch(`/api/admin/library/issuance?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const { data } = await res.json();
        setRecords([data, ...records]);
        toast.success("Transaction recorded");
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Circulation Desk</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Issuance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-slate-900/40 border border-slate-800 rounded-2xl mr-4">
               <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Active</p>
                  <p className="text-lg font-bold text-blue-400">{stats.active}</p>
               </div>
               <div className="w-px h-8 bg-slate-800" />
               <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Overdue</p>
                  <p className="text-lg font-bold text-rose-500">{stats.overdue}</p>
               </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
              <span>New Transaction</span>
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="relative group mb-10">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or member name..."
            className="w-full bg-slate-900/40 border border-slate-800 focus:border-blue-500/50 rounded-2xl py-4 pl-12 outline-none transition-all placeholder:text-slate-600 text-white"
          />
        </div>

        {/* Records List */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            <div className="col-span-5">Book & Member Details</div>
            <div className="col-span-3">Timeline</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredRecords.map((record) => (
            <div key={record.id} className="grid grid-cols-12 items-center p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group">
              <div className="col-span-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                  record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                  record.status === 'Returned' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                   {record.status === 'Returned' ? <CheckCircleIcon className="h-6 w-6" /> : <ClockIcon className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{record.bookTitle}</h4>
                  <p className="text-sm text-slate-500">Issued to <span className="text-slate-300">{record.memberName}</span></p>
                </div>
              </div>

              <div className="col-span-3 space-y-1 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-600" />
                  <span>{record.issueDate}</span>
                  <span className="text-slate-700">→</span>
                  <span className={record.status === 'Overdue' ? 'text-rose-400 font-bold' : ''}>{record.dueDate}</span>
                </div>
              </div>

              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                  record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
                  record.status === 'Returned' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  <span className={`h-1 w-1 rounded-full ${record.status === 'Overdue' ? 'bg-rose-500' : record.status === 'Returned' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  {record.status}
                </span>
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                {record.status !== 'Returned' && (
                  <button 
                    onClick={() => handleReturn(record.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Return
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issuance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">New Issuance</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleNewTransaction} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Volume</label>
                  <div className="relative">
                    <BookOpenIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <select name="bookId" required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 appearance-none outline-none focus:border-blue-500 transition-all text-white">
                      <option value="">Select a book...</option>
                      {books.filter(b => b.available).map(book => (
                        <option key={book.id} value={book.id}>{book.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Member</label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <select name="memberId" required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 appearance-none outline-none focus:border-blue-500 transition-all text-white">
                      <option value="">Select member...</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name} ({member.memberId})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
                <input type="date" name="dueDate" required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 text-white" />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Recording Transaction..." : "Authorize Issuance"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default IssuanceRecordsClient;