"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, ClockIcon, UserCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface ManualClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

const ManualClockModal = ({ isOpen, onClose, companyId, onSuccess }: ManualClockModalProps) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch staff names for the dropdown
      fetch(`/api/admin/staff?companyId=${companyId}`)
        .then(res => res.json())
        .then(data => setStaffList(data.data || []));
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyId,
      userId: formData.get("userId"),
      time: formData.get("time"),
      type: formData.get("type"), // 'IN' or 'OUT'
      date: new Date().toISOString().split('T')[0], // Today's date
      note: formData.get("note")
    };

    try {
      const res = await fetch("/api/admin/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      alert("Error processing manual entry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-lime-500/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClockIcon className="h-4 w-4 text-lime-400" />
              <span className="text-lime-400 text-[10px] font-black uppercase tracking-widest">Correction override</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Manual Clock-In</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {/* Select Staff */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Select Staff Member</label>
            <div className="relative">
              <UserCircleIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select name="userId" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-lime-500 outline-none appearance-none">
                <option value="">Choose Personnel...</option>
                {staffList.map((staff: any) => (
                  <option key={staff.id} value={staff.userId}>{staff.user?.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Entry Type */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Log Type</label>
              <select name="type" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-lime-500 outline-none">
                <option value="IN">Clock In</option>
                <option value="OUT">Clock Out</option>
              </select>
            </div>
            {/* Time Picker */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Effective Time</label>
              <input name="time" type="time" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-lime-500 outline-none" />
            </div>
          </div>

          {/* Admin Note */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Reason for Adjustment</label>
            <div className="relative">
              <ChatBubbleLeftRightIcon className="absolute left-5 top-4 h-5 w-5 text-slate-500" />
              <textarea 
                name="note" 
                rows={3} 
                placeholder="Staff forgot card / System downtime..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-lime-600 hover:bg-lime-500 disabled:bg-slate-800 text-white font-black text-xs uppercase py-5 rounded-2xl transition-all shadow-xl shadow-lime-900/20"
          >
            {loading ? "Processing Override..." : "Execute Manual Entry"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualClockModal;