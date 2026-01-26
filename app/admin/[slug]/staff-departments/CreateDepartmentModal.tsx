"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, RectangleGroupIcon, CurrencyDollarIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface CreateDeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  refreshData: () => void;
}

const CreateDepartmentModal = ({ isOpen, onClose, companyId, refreshData }: CreateDeptModalProps) => {
  const [loading, setLoading] = useState(false);
  const [availableStaff, setAvailableStaff] = useState([]);

  // Fetch staff members to populate the "Head of Department" dropdown
  useEffect(() => {
    if (isOpen) {
      fetch(`/api/admin/staff?companyId=${companyId}`)
        .then(res => res.json())
        .then(json => setAvailableStaff(json.data || []));
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyId,
      name: formData.get("name"),
      headUserId: formData.get("headUserId"),
      budgetAllocation: formData.get("budget"),
    };

    try {
      const res = await fetch("/api/admin/departments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        refreshData();
        onClose();
      }
    } catch (err) {
      alert("Error creating department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-indigo-500/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
              <RectangleGroupIcon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">New Unit</h2>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Organizational Structure</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* Dept Name */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Department Name</label>
            <div className="relative">
              <input 
                required 
                name="name" 
                type="text" 
                placeholder="e.g. Humanities, Research, Logistics..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Head Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Assign Department Head</label>
            <div className="relative">
              <UserCircleIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select 
                name="headUserId" 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-indigo-500 outline-none appearance-none"
              >
                <option value="">Select a staff member...</option>
                {availableStaff.map((staff: any) => (
                  <option key={staff.id} value={staff.id}>{staff.name} — {staff.staffProfile?.jobTitle}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Simulated Budget Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Initial Budget Allocation (%)</label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input 
                name="budget" 
                type="number" 
                max="100" 
                placeholder="0 - 100" 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-xs uppercase py-5 rounded-2xl transition-all shadow-xl shadow-indigo-900/20"
          >
            {loading ? "Creating Unit..." : "Confirm & Build Department"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentModal;