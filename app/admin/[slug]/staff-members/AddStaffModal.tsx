"use client";

import React, { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  CheckBadgeIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/outline";

interface UserResult {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function AddStaffModal({ 
  isOpen, 
  onClose, 
  companyId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  companyId: string;
}) {
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Selection state
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [loginPin, setLoginPin] = useState("");

  // 1. Debounced Search Logic
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/users/search?companyId=${companyId}&q=${searchQuery}`);
        const json = await res.json();
        setSearchResults(json.data || []);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, companyId]);

  // 2. Form Submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // We send either userId (existing) or name/email (new)
    const payload = {
      userId: selectedUser?.id || null,
      name: formData.get("name"),
      email: formData.get("email"),
      jobTitle: formData.get("jobTitle"),
      department: formData.get("department"),
      role: formData.get("role"),
      loginCode: loginPin.trim() || formData.get("loginCode") || undefined,
      companyId,
    };

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        onClose();
        window.location.reload(); // Refresh to show new staff member
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (err) {
      alert("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <div>
            <h2 className="text-xl font-bold text-white">Onboard Staff</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Company ID: {companyId.slice(-6)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Section: User Identification */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400">Step 1: Identify User</label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Search existing users by name or email..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {/* Search Results Dropdown */}
              {(isSearching || searchResults.length > 0) && (
                <div className="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-slate-500">Searching database...</div>
                  ) : (
                    searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full p-4 flex items-center gap-3 hover:bg-blue-600/10 border-b border-slate-800 last:border-0 transition-colors text-left"
                      >
                        <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center text-blue-400 text-xs font-bold">
                          {user.name.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected User Badge or Manual Input Fields */}
            {selectedUser ? (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckBadgeIcon className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-white">{selectedUser.name}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedUser(null)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-tighter"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                  <input required name="name" type="text" placeholder="John Doe" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email</label>
                  <input required name="email" type="email" placeholder="john@example.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* Section: Professional Details */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400">Step 2: Professional Details</label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Job Title</label>
                <input required name="jobTitle" type="text" placeholder="Manager" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Department</label>
                <input required name="department" type="text" placeholder="Operations" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">System Role</label>
              <div className="relative">
                <select 
                  name="role" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white appearance-none focus:border-blue-500 outline-none"
                >
                  <option value="STAFF">Staff (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                  <option value="USER">User (Restricted Access)</option>
                </select>
                <ChevronDownIcon className="h-4 w-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Section: Terminal & App Access */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400">
                Step 3: App & POS Login PIN (Optional)
              </label>
              <button
                type="button"
                onClick={() => setLoginPin(Math.floor(100000 + Math.random() * 900000).toString())}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-tighter"
              >
                🎲 Generate PIN
              </button>
            </div>
            <div className="space-y-2">
              <input
                name="loginCode"
                type="text"
                maxLength={8}
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Auto-generated if left blank"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 font-mono text-sm text-white focus:border-blue-500 outline-none tracking-widest"
              />
              <p className="text-[10px] text-slate-500 ml-1">
                Leave blank to auto-generate a secure 6-digit login PIN for Mobile & Desktop applications.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-900/10 mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              selectedUser ? "Link & Create Staff Profile" : "Create Account & Onboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}