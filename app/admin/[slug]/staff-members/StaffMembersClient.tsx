"use client";

import React, { useState } from "react";
import { UserPlusIcon, MagnifyingGlassIcon, BriefcaseIcon, EnvelopeIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import AddStaffModal from "./AddStaffModal";

interface StaffMembersClientProps {
  initialStaff: any[];
  companyId: string;
}

const StaffMembersClient = ({ initialStaff, companyId }: StaffMembersClientProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList] = useState(initialStaff);
  // Inside StaffMembersClient.tsx
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter logic for the search bar
  const filteredStaff = staffList.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.staffProfile?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Directory.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">Managing {staffList.length} total team members</p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, role, or email..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all">
              <UserPlusIcon className="h-4 w-4" /> Add Staff
            </button>
          </div>
        </header>

        {/* Staff Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Employee</th>
                <th className="p-6">Designation</th>
                <th className="p-6">Department</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filteredStaff.map((user) => (
                <tr key={user.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {user.image ? (
                        <img src={user.image} className="h-10 w-10 rounded-xl object-cover" alt="" />
                      ) : (
                        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-bold uppercase">
                          {user.name?.substring(0, 2) || "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{user.name || "Unnamed User"}</p>
                        <p className="text-[10px] font-mono text-slate-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-3.5 w-3.5 text-slate-500" />
                      {user.staffProfile?.jobTitle || "No Title"}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 uppercase">
                      {user.staffProfile?.department || "General"}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white">
                          <EnvelopeIcon className="h-4 w-4" />
                       </button>
                       <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white">
                          <EllipsisHorizontalIcon className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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