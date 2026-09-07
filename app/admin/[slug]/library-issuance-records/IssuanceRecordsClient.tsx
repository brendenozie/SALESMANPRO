"use client";

import React, { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  ArrowsRightLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  CalendarDaysIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
  initialRecords: any[];
  books: any[]; // For the selection dropdown
  members: any[]; // For the selection dropdown
  schoolId: string;
}

// Helper to get name from polymorphic member object
const getMemberName = (m: any): string => {
  if (!m) return "Unknown Member";
  if (m.student) return `${m.student.firstName} ${m.student.lastName}`;
  if (m.educator) return m.educator.user?.name || "Staff";
  return m.name || "Unknown";
};

const getBookTitle = (b: any) => {
  if (!b) return "Unknown Book";
  return b.title || "Unknown Book";
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const computeStatus = (row: any): 'Current' | 'Overdue' | 'Returned' => {
  if (row.returnDate) return "Returned";

  const due = new Date(row.dueDate);
  const now = new Date();

  if (due < now) return "Overdue";
  return "Current";
};

const normalizeIssuance = (row: any): Issuance => ({
  id: row.id,
  bookId: row.bookId,
  bookTitle: row.book?.title ?? "Unknown Book",
  memberId: row.libraryMemberId,
  memberName: getMemberName(row.libraryMember),
  issueDate: formatDate(row.issuedDate),
  dueDate: formatDate(row.dueDate),
  status: computeStatus(row),
});

const IssuanceRecordsClient = ({ initialRecords = [], books = [], members = [], schoolId }: Props) => {
  const [records, setRecords] = useState<Issuance[]>(() =>
    initialRecords.map(normalizeIssuance)
  );
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({});

  // Stats calculation
  const stats = useMemo(() => ({
    active: records.filter(r => r.status === 'Current').length,
    overdue: records.filter(r => r.status === 'Overdue').length
  }), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.bookTitle?.toLowerCase().includes(search.toLowerCase()) || 
      r.memberName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const handleReturn = async (recordId: string) => {
    if (activeActions[recordId]) return;
    
    // Set local loading for this item
    setActiveActions(prev => ({ ...prev, [recordId]: true }));
    
    try {
      const res = await fetch(`${apiBaseUrl}/admin/library/issuance/${recordId}/return?companyId=${schoolId}`, {
        method: "PATCH",
      });
      if (res.ok) {
        setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: 'Returned' as const } : r));
        toast.success("Volume returned to archive successfully");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to process return. Please try again.");
    } finally {
      setActiveActions(prev => ({ ...prev, [recordId]: false }));
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
      status: 'Current',
      companyId: schoolId
    };

    try {
      const res = await fetch(`${apiBaseUrl}/admin/library/issuance?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const { data } = await res.json();
        setRecords(prev => [normalizeIssuance(data), ...prev]);
        toast.success("Circulation transaction registered successfully");
        setIsModalOpen(false);
      } else {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Transaction authorization failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to issue volume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-6 md:p-8 font-sans selection:bg-blue-500/30 transition-colors duration-200">
      <Toaster position="top-right" />
      
      {/* Decorative Blur Backgrounds */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-600/5 dark:bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/5 dark:bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-blue-500 rounded-full" />
              <span className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Circulation Desk</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight lg:text-5xl">
              Issuance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Stats Cards */}
            <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Active</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Overdue</p>
                <p className="text-lg font-bold text-rose-500">{stats.overdue}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-850 dark:hover:bg-slate-50 rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              <ArrowsRightLeftIcon className="h-5 w-5" />
              <span>Issue Book</span>
            </button>
          </div>
        </header>

        {/* Search */}
        <section className="relative group mb-10">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or member name..."
            className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10"
          />
        </section>

        {/* Records List / Grid */}
        <div className="space-y-4">
          {/* List Header */}
          <div className="hidden md:grid grid-cols-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">
            <div className="col-span-5">Book & Member Details</div>
            <div className="col-span-3">Timeline</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <div 
                key={record.id} 
                className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-0 items-start md:items-center p-6 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/60 rounded-3xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all hover:shadow-md group"
              >
                {/* Book & Member Info */}
                <div className="md:col-span-5 flex items-center gap-4 w-full">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
                    record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                    record.status === 'Returned' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                    {record.status === 'Returned' ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : record.status === 'Overdue' ? (
                      <ExclamationTriangleIcon className="h-6 w-6" />
                    ) : (
                      <ClockIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">{record.bookTitle}</h4>
                    <p className="text-sm text-slate-400 dark:text-slate-500 truncate">Issued to <span className="font-semibold text-slate-700 dark:text-slate-300">{record.memberName}</span></p>
                  </div>
                </div>

                {/* Timeline info */}
                <div className="md:col-span-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CalendarDaysIcon className="h-4 w-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  <span className="font-medium">{record.issueDate}</span>
                  <span className="text-slate-300 dark:text-slate-700">→</span>
                  <span className={`font-bold ${record.status === 'Overdue' ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>{record.dueDate}</span>
                </div>

                {/* Badge Container */}
                <div className="md:col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' : 
                    record.status === 'Returned' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${record.status === 'Overdue' ? 'bg-rose-500' : record.status === 'Returned' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    {record.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 w-full md:w-auto flex justify-end">
                  {record.status !== 'Returned' ? (
                    <button 
                      disabled={activeActions[record.id]}
                      onClick={() => handleReturn(record.id)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      <ArrowPathIcon className={`h-4 w-4 ${activeActions[record.id] ? 'animate-spin' : ''}`} />
                      <span>{activeActions[record.id] ? "Returning..." : "Return"}</span>
                    </button>
                  ) : (
                    <span className="hidden md:inline-block text-xs font-semibold text-slate-400 dark:text-slate-600">Settled</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-transparent">
              <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4">
                <ArrowsRightLeftIcon className="h-8 w-8 text-slate-400 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No transactions matched</h3>
              <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto font-medium">Verify your filter settings or record a new circulation event.</p>
            </div>
          )}
        </div>
      </div>

      {/* AUTHORIZATION MODAL */}
      {isModalOpen && (
        <AuthorizationModal 
          books={books}
          members={members}
          loading={loading}
          onClose={() => setIsModalOpen(false)}
          onAuthorize={handleNewTransaction}
        />
      )}
    </main>
  );
};

/* --- Sub-Components --- */

interface AuthorizationModalProps {
  books: any[];
  members: any[];
  loading: boolean;
  onClose: () => void;
  onAuthorize: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const AuthorizationModal: React.FC<AuthorizationModalProps> = ({
  books,
  members,
  loading,
  onClose,
  onAuthorize
}) => {
  // Modal Escape Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-[#05070A]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Authorize Issuance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mt-1">Circulation Dispatch</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onAuthorize} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Volume</label>
              <select 
                name="bookId" 
                required 
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 text-slate-950 dark:text-white outline-none focus:border-blue-500 transition-all text-sm focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">Select available book...</option>
                {books.filter(b => b.status === 'AVAILABLE').map(b => (
                  <option key={b.id} value={b.id} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">
                    {getBookTitle(b)} {b.isbn ? `(${b.isbn})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Library Member ID</label>
              <select 
                name="memberId" 
                required 
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 text-slate-950 dark:text-white outline-none focus:border-blue-500 transition-all text-sm focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="" className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">Select recipient...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">
                    {getMemberName(m)} — {m.memberId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Return Deadline</label>
              <input 
                type="date" 
                name="dueDate" 
                required 
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 text-slate-950 dark:text-white outline-none focus:border-blue-500 transition-all text-sm focus:ring-4 focus:ring-blue-500/10" 
              />
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
              className="flex-[2] px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:bg-slate-850 dark:hover:bg-slate-50 active:scale-95 disabled:opacity-30 order-1 sm:order-2 shadow-lg shadow-indigo-500/10"
            >
              {loading ? "Processing Dispatch..." : "Confirm Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssuanceRecordsClient;