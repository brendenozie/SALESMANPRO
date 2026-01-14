"use client";

import React, { useState } from "react";
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  LockClosedIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

const RolesManagementClient = () => {
  const [selectedRole, setSelectedRole] = useState("Faculty");

  const roles = [
    { id: 'R-1', name: 'Super Admin', users: 2, level: 'Level 10' },
    { id: 'R-2', name: 'Faculty', users: 48, level: 'Level 5' },
    { id: 'R-3', name: 'Finance', users: 4, level: 'Level 7' },
    { id: 'R-4', name: 'HR Manager', users: 3, level: 'Level 8' },
  ];

  const permissions = [
    { category: 'Staff Records', actions: ['View', 'Edit', 'Delete'], status: [true, true, false] },
    { category: 'Financials', actions: ['View', 'Manage', 'Audit'], status: [false, false, false] },
    { category: 'Student Data', actions: ['View', 'Grade', 'Enroll'], status: [true, true, true] },
    { category: 'Reports', actions: ['Daily', 'Annual', 'Strategic'], status: [true, false, false] },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Security Infrastructure</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hierarchy.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40">
            <PlusIcon className="h-4 w-4 stroke-[3px]" /> Define New Role
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Role Selection List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">System Roles</h3>
            {roles.map((role) => (
              <button 
                key={role.id}
                onClick={() => setSelectedRole(role.name)}
                className={`w-full flex items-center justify-between p-5 rounded-[2rem] border transition-all ${
                  selectedRole === role.name 
                  ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl ${selectedRole === role.name ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">{role.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{role.users} Active Users</p>
                  </div>
                </div>
                <ChevronRightIcon className={`h-4 w-4 ${selectedRole === role.name ? 'text-blue-400' : 'text-slate-700'}`} />
              </button>
            ))}
          </div>

          {/* Right: Permission Matrix */}
          <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white italic">{selectedRole} Permissions</h2>
                <p className="text-xs text-slate-500 mt-1">Configure functional access levels for this user group.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-slate-800 rounded-xl">
                <KeyIcon className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Master Auth</span>
              </div>
            </div>

            <div className="space-y-6">
              {permissions.map((perm, idx) => (
                <div key={idx} className="bg-black/20 border border-slate-800/50 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wider w-32">{perm.category}</span>
                    <div className="flex flex-wrap gap-4">
                      {perm.actions.map((action, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`h-5 w-5 rounded border transition-all flex items-center justify-center ${
                            perm.status[i] 
                            ? 'bg-blue-600 border-blue-500' 
                            : 'bg-slate-800 border-slate-700 group-hover:border-slate-500'
                          }`}>
                            {perm.status[i] && <CheckBadgeIcon className="h-4 w-4 text-white" />}
                          </div>
                          <span className={`text-xs font-medium ${perm.status[i] ? 'text-slate-200' : 'text-slate-500'}`}>
                            {action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800 flex justify-end gap-3">
              <button className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white transition-colors">Discard Changes</button>
              <button className="px-8 py-2.5 bg-white text-black rounded-xl text-xs font-black uppercase hover:bg-blue-50 transition-all">Save Permissions</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RolesManagementClient;