"use client";

import React, { useState } from "react";
import { XMarkIcon, LockClosedIcon } from "@heroicons/react/24/outline";

const FreezePeriodModal = ({ isOpen, onClose, companyId, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);

  const handleFreeze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    await fetch("/api/admin/leave/freeze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        label: formData.get("label"),
        departmentScope: formData.get("scope"),
      }),
    });

    setLoading(false);
    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-cyan-500/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Freeze Leave</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleFreeze} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Period Label</label>
            <input name="label" required placeholder="e.g. 2026 Final Exams" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-cyan-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start</label>
              <input name="startDate" type="date" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-xs text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">End</label>
              <input name="endDate" type="date" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-xs text-white outline-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Scope</label>
            <select name="scope" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none appearance-none">
              <option value="ALL">All Departments</option>
              <option value="ACADEMIC">Academic Staff Only</option>
              <option value="ADMIN">Administration Only</option>
            </select>
          </div>

          <button disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase py-5 rounded-2xl transition-all shadow-lg shadow-cyan-900/20">
            {loading ? "Locking Dates..." : "Establish Freeze Period"}
          </button>
        </form>
      </div>
    </div>
  );
};