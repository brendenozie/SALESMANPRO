"use client";

import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  IdentificationIcon,
  TicketIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";

interface Member {
  id: string;
  name: string;
  email: string;
  memberId: string;
  booksBorrowed: number;
  status: 'Active' | 'Suspended' | 'Pending';
  avatarColor: string;
}

const LibraryMembersClient = ({ initialMembers = [], schoolId = '' }) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Assign a random avatar color for the UI
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      memberId: formData.get("memberId"),
      status: 'Active',
      avatarColor: randomColor,
      booksBorrowed: 0
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
        toast.success(`${payload.name} has been registered`);
        setIsModalOpen(false);
      } else {
        toast.error("Failed to register member");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 font-sans p-8">
      <Toaster position="top-right" />
      
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Community</span>
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
            <span>Register Member</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3 relative group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or email..."
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/50 rounded-2xl py-4 pl-12 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
            <FunnelIcon className="h-5 w-5" />
            <span className="font-medium">Sort: Recent</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070A]/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">New Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleRegister} className="p-8 space-y-5">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <input name="name" required placeholder="e.g. Alex Rivera" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-2 outline-none focus:border-emerald-500 transition-all text-white" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input name="email" type="email" required placeholder="alex@school.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-2 outline-none focus:border-emerald-500 transition-all text-white" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Member ID</label>
                <input name="memberId" required placeholder="LIB-XXXX" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 mt-2 outline-none focus:border-emerald-500 transition-all text-white" />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-emerald-500 text-[#05070A] rounded-2xl font-black transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Create Identity"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};


const MemberCard = ({ member }: { member: Member }) => {
  return (
    <div className="group relative bg-slate-900/40 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 ${member.avatarColor} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {member.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">{member.name}</h3>
            <p className="text-xs text-slate-500 font-mono tracking-tighter">{member.memberId}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
        }`}>
          {member.status}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <EnvelopeIcon className="h-4 w-4 text-slate-600" />
          {member.email}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <TicketIcon className="h-4 w-4 text-slate-600" />
          {member.booksBorrowed} Books currently held
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors">
          <IdentificationIcon className="h-4 w-4" />
          View Profile
        </button>
        <button className="p-3 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-xl transition-all">
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Progress Bar for Borrow Limit (e.g., limit of 5) */}
      <div className="mt-6">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-600 mb-2">
          <span>Borrowing Capacity</span>
          <span>{member.booksBorrowed}/5</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${member.booksBorrowed >= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${(member.booksBorrowed / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LibraryMembersClient;