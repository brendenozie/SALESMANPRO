"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, UserIcon, CalendarDaysIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const PostLeaveModal = ({ isOpen, onClose, companyId, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (isOpen) {
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
      type: formData.get("type"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      backupId: formData.get("backupId"),
      reason: formData.get("reason"),
    };

    const res = await fetch("/api/admin/leave/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-violet-500/5 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Post Admin Override Leave</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500"><XMarkIcon className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-6">
          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Select Employee</label>
            <select name="userId" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500 appearance-none">
              <option value="">Choose Personnel...</option>
              {staffList.map((s: any) => <option key={s.id} value={s.userId}>{s.name || s.user?.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Leave Type</label>
            <select name="type" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500">
              <option value="ANNUAL">Annual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="MATERNITY">Maternity</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Backup Staff</label>
            <select name="backupId" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500 appearance-none">
              <option value="">None Assigned</option>
              {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.name || s.user?.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Start Date</label>
            <input name="startDate" type="date" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">End Date</label>
            <input name="endDate" type="date" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500" />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Reason / Justification</label>
            <textarea name="reason" rows={3} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white outline-none focus:border-violet-500" placeholder="Required for audit trail..." />
          </div>

          <button disabled={loading} type="submit" className="col-span-2 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase py-5 rounded-2xl transition-all shadow-xl shadow-violet-900/20">
            {loading ? "Processing..." : "Confirm & Post Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostLeaveModal;