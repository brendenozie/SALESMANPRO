"use client";

import React, { useState } from "react";
import { XMarkIcon, IdentificationIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const OnboardStaffModal = ({ schoolId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "WARDEN",
    phoneNumber: "",
    staffId: "",
    shiftLabel: "Day (08:00 - 16:00)"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/hostel/staff/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, companyId: schoolId }),
      });

      if (res.ok) {
        const { data } = await res.json();
        onSuccess(data);
        toast.success("Personnel onboarded successfully");
        onClose();
      } else {
        toast.error("Error creating staff record");
      }
    } catch (err) {
      toast.error("Internal Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
        {/* Decorative violet glow */}
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-violet-600/10 blur-[80px] rounded-full" />

        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <header className="mb-10">
          <div className="h-12 w-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 mb-4">
            <UserPlusIcon className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-black text-white italic">Onboard <span className="text-violet-500">Personnel.</span></h2>
          <p className="text-sm text-slate-500 font-medium">Assign a new staff member to the hostel operations team.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
                placeholder="e.g. Sarah Connor"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Staff ID / Badge</label>
              <input 
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
                placeholder="STF-001"
                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Functional Role</label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-violet-500 outline-none appearance-none"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="WARDEN">Head Warden</option>
                <option value="SECURITY">Security Officer</option>
                <option value="CLEANER">Cleaning Staff</option>
                <option value="MAINTENANCE">Maintenance Tech</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Shift Assignment</label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-violet-500 outline-none appearance-none"
                onChange={(e) => setFormData({...formData, shiftLabel: e.target.value})}
              >
                <option>Day (08:00 - 16:00)</option>
                <option>Mid (12:00 - 20:00)</option>
                <option>Night (22:00 - 06:00)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
            <input 
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-violet-900/40 transition-all disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Activate Personnel"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardStaffModal;