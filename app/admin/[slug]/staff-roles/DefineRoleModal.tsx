"use client";

import React, { useState } from "react";
import { XMarkIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface DefineRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  // Updated: returns the whole role object from DB
  onSuccess: (newRole: any) => void; 
}

const DefineRoleModal = ({ isOpen, onClose, companyId, onSuccess }: DefineRoleModalProps) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyId,
      roleName: formData.get("roleName"),
      department: formData.get("department"),
      baseTemplate: formData.get("template"),
    };

    try {
      const res = await fetch("/api/admin/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // Pass the actual database record back to the parent
        onSuccess(result.role); 
        onClose();
      } else {
        alert(result.error || "Failed to create role.");
      }
    } catch (err) {
      alert("Error creating role configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-gradient-to-b from-slate-900/50 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">New Designation</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Define Access Role</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Role Identity</label>
            <input 
              required 
              name="roleName" 
              type="text" 
              placeholder="e.g. Senior Registrar, Lab Supervisor..." 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Department</label>
              <select name="department" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Administration">Administration</option>
                <option value="Medical">Medical</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Permission Template</label>
              <select name="template" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 outline-none">
                <option value="restricted">Restricted (View Only)</option>
                <option value="standard">Standard (Edit Access)</option>
                <option value="elevated">Elevated (Admin Access)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
            <div className="h-10 w-10 shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Defining a new role allows you to set specialized permissions for specific job titles. Staff assigned to this title will automatically inherit the hierarchy you configure.
            </p>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-white text-black hover:bg-blue-50 disabled:bg-slate-700 font-black text-xs uppercase py-4 rounded-2xl transition-all shadow-xl shadow-white/5"
            >
              {loading ? "Creating Definition..." : "Initialize Role Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DefineRoleModal;