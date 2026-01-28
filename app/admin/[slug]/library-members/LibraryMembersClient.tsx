"use client";

import React, { useMemo, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  IdentificationIcon,
  TicketIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

interface Member {
  id: string;
  memberId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  booksBorrowed: number;
  student?: { firstName: string; lastName: string; contactEmail: string; admissionNumber: string };
  educator?: { user: { name: string; email: string }; loginCode: string };
}

const LibraryMembersClient = ({ initialMembers = [], schoolId = '' }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search & Selection State
  const [userType, setUserType] = useState<'STUDENT' | 'EDUCATOR'>('STUDENT');
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      const res = await fetch(`/api/admin/library/members/search-profiles?companyId=${schoolId}&type=${userType}&q=${query}`);
      const result = await res.json();
      if (res.ok) setSearchResults(result.data);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query, userType, schoolId]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const name = m.student ? `${m.student.firstName} ${m.student.lastName}` : m.educator?.user?.name;
      return name?.toLowerCase().includes(search.toLowerCase()) || m.memberId?.toLowerCase().includes(search.toLowerCase());
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

      if (res.ok) {
        const { data } = await res.json();
        setMembers([data, ...members]);
        toast.success(`Identity established for ${selectedProfile.name}`);
        setIsModalOpen(false);
        setSelectedProfile(null);
      } else {
        toast.error("User is already a library member");
      }
    } catch (err) {
      toast.error("Integration error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 font-sans p-8">
      <Toaster position="top-right" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Archive Security</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Member <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Directory.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span>Onboard Member</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3 relative group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or Library ID..."
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/50 rounded-2xl py-4 pl-12 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* ONBOARDING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Issue Identity</h2>
              <button onClick={() => { setIsModalOpen(false); setSelectedProfile(null); }} className="text-slate-500 hover:text-white transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="px-8 pt-6">
              <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-6">
                {(['STUDENT', 'EDUCATOR'] as const).map(type => (
                  <button 
                    key={type}
                    onClick={() => { setUserType(type); setSelectedProfile(null); setSearchResults([]); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${userType === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {type === 'STUDENT' ? 'Students' : 'Faculty'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleOnboard} className="p-8 pt-0 space-y-5">
              {!selectedProfile ? (
                <div className="relative">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Search Profile</label>
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${userType}...`}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-2 outline-none focus:border-indigo-500 transition-all text-white" 
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                      {searchResults.map(res => (
                        <div 
                          key={res.id} 
                          onClick={() => setSelectedProfile(res)}
                          className="p-4 hover:bg-indigo-500/10 cursor-pointer border-b border-slate-700/50 last:border-0 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{res.name}</p>
                            <p className="text-[10px] text-slate-500">{res.identifier}</p>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 text-slate-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-white font-bold text-sm">{selectedProfile.name}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">{selectedProfile.identifier}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedProfile(null)} className="text-[10px] text-slate-400 hover:text-white underline">Change</button>
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Archive Member ID</label>
                <input 
                  name="memberId" 
                  required 
                  defaultValue={selectedProfile?.identifier}
                  placeholder="LIB-XXXX" 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-2 outline-none focus:border-emerald-500 transition-all text-white font-mono uppercase" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !selectedProfile}
                className="w-full py-4 bg-white text-black rounded-2xl font-black transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-30"
              >
                {isSubmitting ? "Syncing..." : "Confirm Onboarding"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

const MemberCard = ({ member }: { member: any }) => {
  const profile = member.student || member.educator;
  const name = member.student 
    ? `${member.student.firstName} ${member.student.lastName}` 
    : member.educator?.user?.name;
  
  // Calculate total pending fines
  const totalFines = member.issuances?.reduce((acc: number, issuance: any) => {
    const issuanceFines = issuance.fines?.reduce((sum: number, fine: any) => sum + fine.amount, 0) || 0;
    return acc + issuanceFines;
  }, 0) || 0;

  const hasFines = totalFines > 0;

  return (
    <div className={`group relative bg-slate-900/40 border ${hasFines ? 'border-rose-500/50' : 'border-slate-800'} hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300`}>
      {/* Fine Alert Badge */}
      {hasFines && (
        <div className="absolute -top-3 -right-3 bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-rose-900/40 animate-bounce">
          DEBT: ${totalFines.toFixed(2)}
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg ${hasFines ? 'bg-rose-500' : 'bg-slate-700'}`}>
            {name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors line-clamp-1">{name}</h3>
            <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">
              {member.studentId ? "Student" : "Faculty"}
            </span>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          member.status === 'ACTIVE' && !hasFines ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {hasFines ? 'Action Required' : member.status}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <EnvelopeIcon className="h-4 w-4 text-slate-600" />
          <span className="line-clamp-1">{member.student?.contactEmail || member.educator?.user?.email}</span>
        </div>
        
        {/* Fine Indicator in Info List */}
        <div className={`flex items-center gap-3 text-sm ${hasFines ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
          <ExclamationTriangleIcon className={`h-4 w-4 ${hasFines ? 'text-rose-500' : 'text-slate-600'}`} />
          {hasFines ? `Outstanding Fine: $${totalFines.toFixed(2)}` : 'No outstanding fines'}
        </div>
      </div>

      <div className="flex gap-2">
        <button className={`flex-grow flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-colors ${
          hasFines ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
        }`}>
          <IdentificationIcon className="h-4 w-4" />
          {hasFines ? 'Settle Balance' : 'View Profile'}
        </button>
      </div>
    </div>
  );
};

export default LibraryMembersClient;