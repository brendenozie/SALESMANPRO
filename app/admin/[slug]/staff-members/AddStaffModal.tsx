"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { addStaffMember } from "@/actions/staff"; 

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

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      jobTitle: formData.get("jobTitle"),
      department: formData.get("department"),
    };

    const res = await addStaffMember(data, companyId);
    
    setLoading(false);
    if (res.success) {
      onClose();
      // Optional: Add a toast notification here
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <h2 className="text-xl font-bold text-white">Add New Staff</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Full Name</label>
            <input required name="name" type="text" placeholder="John Doe" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
            <input required name="email" type="email" placeholder="john@company.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Job Title</label>
              <input required name="jobTitle" type="text" placeholder="Manager" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Department</label>
              <input required name="department" type="text" placeholder="Admin" className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:border-blue-500 outline-none" />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20 mt-4"
          >
            {loading ? "Onboarding Staff..." : "Confirm & Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}