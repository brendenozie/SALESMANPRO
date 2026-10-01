"use client";

import React, { useState, useEffect } from "react";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  BriefcaseIcon, 
  EnvelopeIcon, 
  EllipsisHorizontalIcon,
  SunIcon,
  MoonIcon,
  InboxIcon,
  BuildingOfficeIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import AddStaffModal from "./AddStaffModal";

interface StaffProfile {
  id?: string;
  jobTitle?: string;
  department?: string;
  loginCode?: string;
  hasLoginCode?: boolean;
}

interface StaffMember {
  id: string;
  name?: string;
  email: string;
  image?: string;
  isActive: boolean;
  staffProfile?: StaffProfile;
}

interface StaffMembersClientProps {
  initialStaff: StaffMember[];
  companyId: string;
}

const StaffMembersClient = ({ initialStaff = [], companyId }: StaffMembersClientProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync structural theme wrappers with system DOM
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareLoginCode = async (user: StaffMember) => {
    setSharingId(user.id);
    setAlertMsg(null);
    try {
      const res = await fetch("/api/admin/share-login-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          targetType: "STAFF",
          targetId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to send login code");
      }
      const code = data.data?.loginCode;
      setAlertMsg({
        type: "success",
        text: `Login code ${code ? `(${code})` : ""} successfully sent to ${data.data?.recipientEmail || user.email}!`,
      });

      // Update local state if code was generated
      if (code) {
        setStaffList((prev) =>
          prev.map((s) =>
            s.id === user.id
              ? {
                  ...s,
                  staffProfile: {
                    ...s.staffProfile,
                    loginCode: code,
                    hasLoginCode: true,
                  },
                }
              : s
          )
        );
      }
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Failed to email login code" });
    } finally {
      setSharingId(null);
    }
  };

  // Direct case-insensitive multi-field search mapping
  const filteredStaff = staffList.filter((user) => {
    const sTerm = searchTerm.toLowerCase();
    const nameMatch = user.name?.toLowerCase().includes(sTerm) ?? false;
    const titleMatch = user.staffProfile?.jobTitle?.toLowerCase().includes(sTerm) ?? false;
    const deptMatch = user.staffProfile?.department?.toLowerCase().includes(sTerm) ?? false;
    const emailMatch = user.email.toLowerCase().includes(sTerm);
    const codeMatch = user.staffProfile?.loginCode?.toLowerCase().includes(sTerm) ?? false;
    return nameMatch || titleMatch || emailMatch || deptMatch || codeMatch;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Global Controls Utility Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Identity & Directory Operations
            </span>
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all shadow-sm"
            aria-label="Toggle structural dark/light layouts"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>

        {/* Header Action Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-blue-650 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Team Members</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Staff Directory
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Oversee and manage your organization's workforce roster. You are currently tracking {staffList.length} total members.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="relative flex-grow sm:w-80">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, role, or email..." 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-900 dark:text-slate-100 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-2 focus:ring-blue-500/35 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-650"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm shrink-0"
            >
              <UserPlusIcon className="h-4 w-4 stroke-[3]" /> Add Staff Member
            </button>
          </div>
        </header>

        {/* Status Notification Banner */}
        {alertMsg && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
              alertMsg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {alertMsg.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <span>{alertMsg.text}</span>
            </div>
            <button
              onClick={() => setAlertMsg(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-150 dark:border-slate-850">
              <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                <th className="p-6">Employee</th>
                <th className="p-6">Designation</th>
                <th className="p-6">Department</th>
                <th className="p-6">Login Code</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <img src={user.image} className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800" alt="" />
                      ) : (
                        <div className="h-11 w-11 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xs font-black uppercase">
                          {user.name?.substring(0, 2) || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {user.name || "Unnamed User"}
                        </p>
                        <p className="text-[10px] font-mono text-slate-450 dark:text-slate-500 leading-none">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-650 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-4 w-4 text-slate-400 dark:text-slate-550" />
                      {user.staffProfile?.jobTitle || "No Title Assigned"}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-slate-400 dark:text-slate-550" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {user.staffProfile?.department || "General Operations"}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    {user.staffProfile?.loginCode ? (
                      <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1 rounded-xl text-indigo-700 dark:text-indigo-300 font-mono font-black text-xs">
                        <KeyIcon className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{user.staffProfile.loginCode}</span>
                        <button
                          onClick={() => handleCopyCode(user.id, user.staffProfile!.loginCode!)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 ml-1 p-0.5 rounded transition"
                          title="Copy login PIN"
                        >
                          {copiedId === user.id ? (
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not set (auto-generates on email)</span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                      user.isActive 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30' 
                        : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {user.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                       <button 
                         onClick={() => handleShareLoginCode(user)}
                         disabled={sharingId === user.id}
                         title="Email login PIN code to staff"
                         className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 text-[11px] font-bold"
                       >
                          <EnvelopeIcon className="h-4 w-4" />
                          <span className="hidden xl:inline">{sharingId === user.id ? 'Sending...' : 'Email PIN'}</span>
                       </button>
                       <button className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors">
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARDS VIEW --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredStaff.map((user) => (
            <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <img src={user.image} className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800" alt="" />
                ) : (
                  <div className="h-10 w-10 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xs font-bold uppercase">
                    {user.name?.substring(0, 2) || "U"}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-slate-950 dark:text-white">{user.name || "Unnamed User"}</h4>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-550">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Designation</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1 mt-0.5">
                    <BriefcaseIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {user.staffProfile?.jobTitle || "No Title"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Department</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1 mt-0.5">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {user.staffProfile?.department || "General"}
                  </p>
                </div>
              </div>

              {/* Mobile Login Code Display */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Login PIN:</span>
                  {user.staffProfile?.loginCode ? (
                    <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {user.staffProfile.loginCode}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">None</span>
                  )}
                </div>
                {user.staffProfile?.loginCode && (
                  <button
                    onClick={() => handleCopyCode(user.id, user.staffProfile!.loginCode!)}
                    className="p-1 text-slate-400 hover:text-indigo-600 text-xs flex items-center gap-1"
                  >
                    {copiedId === user.id ? (
                      <span className="text-emerald-500 font-bold text-[10px]">Copied!</span>
                    ) : (
                      <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                  user.isActive 
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-750 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/20' 
                    : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-750 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/20'
                }`}>
                  <span className={`h-1 w-1 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleShareLoginCode(user)}
                    disabled={sharingId === user.id}
                    className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-indigo-600 rounded-lg flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                  >
                    <EnvelopeIcon className="h-3.5 w-3.5" />
                    <span>{sharingId === user.id ? 'Sending...' : 'Email PIN'}</span>
                  </button>
                  <button className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg">
                    <EllipsisHorizontalIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Directory State */}
        {filteredStaff.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <InboxIcon className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider">No matching staff members found</p>
          </div>
        )}

      </div>

      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        companyId={companyId} 
      />
    </main>
  );
};

export default StaffMembersClient;