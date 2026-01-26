"use client";

import React, { useState } from "react";
import { XMarkIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const FileRequestModal = ({ rooms, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    category: "PLUMBING",
    priority: "MEDIUM",
    description: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomId) return toast.error("Please select a room");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/hostel/maintenance/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const { data } = await res.json();
        onSuccess(data);
        toast.success("Ticket logged successfully");
        onClose();
      }
    } catch (err) {
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-orange-500/10 blur-[80px] rounded-full" />
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <header className="mb-8">
          <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
            <WrenchScrewdriverIcon className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-black text-white italic">Log <span className="text-orange-500">Service.</span></h2>
          <p className="text-sm text-slate-500 font-medium">Manually filing an issue reported via offline channels.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location / Room</label>
              <select 
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none appearance-none"
                onChange={(e) => setFormData({...formData, roomId: e.target.value})}
              >
                <option value="">Select Room...</option>
                {rooms.map((r: any) => (
                  <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none appearance-none"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="FURNITURE">Furniture</option>
                <option value="STRUCTURAL">Structural</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={`py-3 rounded-xl text-[10px] font-black transition-all border ${
                    formData.priority === p 
                    ? 'bg-orange-600 border-orange-500 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                > {p} </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issue Description</label>
            <textarea 
              required
              rows={3}
              placeholder="Describe the leak, broken item, or electrical fault..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 transition-all disabled:opacity-50"
          >
            {loading ? "Generating Ticket..." : "Dispatch Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileRequestModal;