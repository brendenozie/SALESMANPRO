"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  IdentificationIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";

interface Member {
  id: string;
  memberId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  booksBorrowed: number;
  studentId?: string | null;
  educatorId?: string | null;
  student?: { firstName: string; lastName: string; contactEmail: string; admissionNumber: string };
  educator?: { user: { name: string; email: string }; loginCode: string };
  issuances?: Array<{
    id: string;
    fines?: Array<{
      id: string;
      amount: number;
      status: 'PENDING' | 'PAID';
    }>;
  }>;
}

interface Props {
  initialMembers?: Member[];
  schoolId?: string;
}

const LibraryMembersClient: React.FC<Props> = ({ initialMembers = [], schoolId = '' }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Selection State
  const [userType, setUserType] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search Logic (Debounced Profile Search)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/admin/library/members/search-profiles?companyId=${schoolId}&type=${userType}&q=${query}`);
        const result = await res.json();
        if (res.ok) setSearchResults(result.data || []);
      } catch (err) {
        console.error("Error searching profiles:", err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, userType, schoolId]);

  // Handle outside clicks to close profile search dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const name = m.student ? `${m.student.firstName} ${m.student.lastName}` : m.educator?.user?.name;
      const matchesSearch = 
        name?.toLowerCase().includes(search.toLowerCase()) || 
        m.memberId?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [members, search]);

  const handleOnboard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProfile) return toast.error("Select a profile first");
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      profileId: selectedProfile.id,
      type: userType,
      memberId: formData.get("memberId"),
      companyId: schoolId
    };

    try {
      const res = await fetch(`/api/admin/library/members?companyId=${schoolId}`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      });

      const json = await res.json();
      if (res.ok) {
        setMembers([json.data, ...members]);
        toast.success(`Identity established for ${selectedProfile.name}`);
        setIsModalOpen(false);
        setSelectedProfile(null);
        setQuery("");
      } else {
        toast.error(json.message || "User is already a library member");
      }
    } catch (err) {
      toast.error("Integration error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (memberId: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/library/members/${memberId}/status?companyId=${schoolId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
        toast.success(`Member is now ${newStatus.toLowerCase()}`);
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSettleFines = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/library/members/${memberId}/settle-fines?companyId=${schoolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        // Optimistically clean outstanding pending fines
        setMembers(prev => prev.map(m => {
          if (m.id !== memberId) return m;
          const clearedIssuances = m.issuances?.map(iss => ({
            ...iss,
            fines: iss.fines?.map(f => ({ ...f, status: 'PAID' as const }))
          }));
          return { ...m, issuances: clearedIssuances };
        }));
        toast.success("Outstanding balances settled successfully");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to process fine clearance");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 font-sans selection:bg-emerald-500/30 transition-colors duration-200 p-6 md:p-8">
      <Toaster position="top-right" />
      
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-600/5 dark:bg-emerald-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/5 dark:bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">Archive Security</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white lg:text-5xl">
              Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">Directory.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-5 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-slate-850 dark:hover:bg-slate-50 rounded-2xl font-bold transition-all active:scale-95 shadow-md self-start md:self-auto"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Onboard Member</span>
          </button>
        </header>

        {/* Filter Section */}
        <section className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-grow group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or Library ID..."
              className="w-full bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 focus:border-emerald-500/50 dark:focus:border-emerald-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </section>

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard 
                key={member.id} 
                member={member} 
                onUpdateStatus={handleUpdateStatus}
                onSettleFines={handleSettleFines}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-transparent">
            <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-4">
              <IdentificationIcon className="h-8 w-8 text-slate-400 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No members indexed</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Try typing a different name or checking back later.</p>
          </div>
        )}
      </div>

      {/* ONBOARDING MODAL */}
      {isModalOpen && (
        <BookOnboardModal 
          userType={userType}
          setUserType={setUserType}
          query={query}
          setQuery={setQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          selectedProfile={selectedProfile}
          setSelectedProfile={setSelectedProfile}
          isSubmitting={isSubmitting}
          searchContainerRef={searchContainerRef}
          onClose={() => { setIsModalOpen(false); setSelectedProfile(null); setQuery(""); }}
          onOnboard={handleOnboard}
        />
      )}
    </main>
  );
};

/* --- Sub-Components --- */

interface MemberCardProps {
  member: Member;
  onUpdateStatus: (id: string, current: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
  onSettleFines: (id: string) => Promise<void>;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onUpdateStatus, onSettleFines }) => {
  const [loading, setLoading] = useState(false);
  const name = member.student 
    ? `${member.student.firstName} ${member.student.lastName}` 
    : member.educator?.user?.name;
  
  // Calculate total pending (unpaid) fines
  const totalFines = useMemo(() => {
    return member.issuances?.reduce((acc: number, issuance: any) => {
      const pendingFines = issuance.fines
        ?.filter((f: any) => f.status === 'PENDING')
        ?.reduce((sum: number, fine: any) => sum + fine.amount, 0) || 0;
      return acc + pendingFines;
    }, 0) || 0;
  }, [member.issuances]);

  const hasFines = totalFines > 0;

  const handleSettle = async () => {
    if (loading) return;
    setLoading(true);
    await onSettleFines(member.id);
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    if (loading) return;
    setLoading(true);
    await onUpdateStatus(member.id, member.status);
    setLoading(false);
  };

  return (
    <div className={`group relative bg-white dark:bg-slate-900/40 border ${hasFines ? 'border-rose-500/40 dark:border-rose-500/30' : 'border-slate-200 dark:border-slate-800'} hover:border-emerald-500/40 dark:hover:border-emerald-500/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-lg`}>
      {/* Fine Alert Badge */}
      {hasFines && (
        <div className="absolute -top-3 -right-3 bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-rose-900/30">
          DEBT: ${totalFines.toFixed(2)}
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md flex-shrink-0 ${hasFines ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 border border-slate-700/30'}`}>
            {name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">{name}</h3>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold tracking-widest uppercase">
              {member.studentId ? "Student" : "Faculty"}
            </span>
          </div>
        </div>
        
        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${
          member.status === 'ACTIVE' && !hasFines 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
        }`}>
          {hasFines ? 'Action Required' : member.status}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 min-w-0">
          <EnvelopeIcon className="h-4 w-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          <span className="truncate">{member.student?.contactEmail || member.educator?.user?.email || "No Email Provided"}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm min-w-0">
          <IdentificationIcon className="h-4 w-4 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          <span className="font-mono text-xs text-slate-400 tracking-wider">MEMBER ID: <span className="font-bold text-slate-700 dark:text-slate-300">{member.memberId}</span></span>
        </div>
        
        {/* Fine Indicator in Info List */}
        <div className={`flex items-center gap-3 text-sm min-w-0 ${hasFines ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
          <ExclamationTriangleIcon className={`h-4 w-4 flex-shrink-0 ${hasFines ? 'text-rose-500' : 'text-slate-400 dark:text-slate-600'}`} />
          <span>{hasFines ? `Outstanding Fine: $${totalFines.toFixed(2)}` : 'No outstanding fines'}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {hasFines ? (
          <button 
            disabled={loading}
            onClick={handleSettle}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            Clear Balance
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={handleToggleStatus}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border ${
              member.status === 'ACTIVE' 
                ? 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
            }`}
          >
            {member.status === 'ACTIVE' ? (
              <>
                <NoSymbolIcon className="h-4 w-4" /> Suspend
              </>
            ) : (
              <>
                <ShieldCheckIcon className="h-4 w-4" /> Reactivate
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

interface BookOnboardModalProps {
  userType: 'STUDENT' | 'EDUCATOR';
  setUserType: (type: 'STUDENT' | 'EDUCATOR') => void;
  query: string;
  setQuery: (q: string) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  selectedProfile: any | null;
  setSelectedProfile: (prof: any | null) => void;
  isSubmitting: boolean;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onOnboard: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const BookOnboardModal: React.FC<BookOnboardModalProps> = ({
  userType,
  setUserType,
  query,
  setQuery,
  searchResults,
  setSearchResults,
  selectedProfile,
  setSelectedProfile,
  isSubmitting,
  searchContainerRef,
  onClose,
  onOnboard
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Issue Identity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500 font-medium uppercase tracking-wider mt-1">Add Library Member</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 pt-6">
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
            {(['STUDENT', 'EDUCATOR'] as const).map(type => (
              <button 
                key={type}
                type="button"
                onClick={() => { setUserType(type); setSelectedProfile(null); setSearchResults([]); setQuery(""); }}
                className={`flex-grow py-2.5 rounded-lg text-xs font-bold transition-all ${userType === type ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {type === 'STUDENT' ? 'Students' : 'Faculty'}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onOnboard} className="p-6 space-y-5">
          {!selectedProfile ? (
            <div className="relative" ref={searchContainerRef}>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Search Profile</label>
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${userType.toLowerCase()}...`}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1.5 outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              />
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                  {searchResults.map(res => (
                    <button 
                      type="button"
                      key={res.id} 
                      onClick={() => setSelectedProfile(res)}
                      className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800/40 last:border-0 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{res.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{res.identifier}</p>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-sm">{selectedProfile.name}</p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{selectedProfile.identifier}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setSelectedProfile(null); setQuery(""); }} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Change</button>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">Archive Member ID</label>
            <input 
              name="memberId" 
              required 
              defaultValue={selectedProfile?.identifier || ""}
              placeholder="LIB-XXXX" 
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 mt-1.5 outline-none focus:border-emerald-500 transition-all text-slate-900 dark:text-white font-mono uppercase focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600" 
            />
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
              disabled={isSubmitting || !selectedProfile}
              className="flex-[2] px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:bg-slate-850 dark:hover:bg-indigo-50 active:scale-95 disabled:opacity-30 order-1 sm:order-2"
            >
              {isSubmitting ? "Syncing..." : "Confirm Onboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryMembersClient;