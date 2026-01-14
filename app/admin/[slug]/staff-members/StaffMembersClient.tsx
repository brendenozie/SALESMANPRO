"use client";

import React, { useState } from "react";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";

const StaffMembersClient = () => {
  const staff = [
    { id: 'EMP-101', name: 'Dr. Alistair Cook', role: 'Senior Lecturer', dept: 'Science', status: 'Active', joined: '2022', type: 'Full-time' },
    { id: 'EMP-205', name: 'Sarah Jenkins', role: 'Department Head', dept: 'Mathematics', status: 'Active', joined: '2020', type: 'Full-time' },
    { id: 'EMP-312', name: 'Robert Fox', role: 'Lab Assistant', dept: 'Science', status: 'On Leave', joined: '2024', type: 'Contract' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Human Capital Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Directory.</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search staff by name, ID, or dept..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40">
              <UserPlusIcon className="h-4 w-4" /> Add Member
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
                <th className="p-6">Tenure</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {staff.map((emp) => (
                <tr key={emp.id} className="group hover:bg-blue-500/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 font-bold">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{emp.name}</p>
                        <p className="text-[10px] font-mono text-slate-600">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-xs text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-3.5 w-3.5 text-slate-500" />
                      {emp.role}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {emp.dept}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-6 text-[11px] font-mono text-slate-500">Since {emp.joined}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white">
                          <EnvelopeIcon className="h-4 w-4" />
                       </button>
                       <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white">
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
    </main>
  );
};

export default StaffMembersClient;