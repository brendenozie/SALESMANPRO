"use client";

import React, { useState } from "react";
import { XMarkIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface DefineRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: (newRole: any) => void; 
  sourcePermissions?: any; // New prop for duplication
  sourceRoleName?: string;  // For the UI label
}


const DefineRoleModal = ({ isOpen, onClose, companyId, onSuccess, sourcePermissions, sourceRoleName }: DefineRoleModalProps) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyId,
      roleName: formData.get("roleName"),
      // If duplicating, we send the source matrix instead of a template string
      permissions: sourcePermissions || null, 
      baseTemplate: sourcePermissions ? null : formData.get("template"),
    };

    try {
      const res = await fetch("/api/admin/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        onSuccess(result.role);
        onClose();
      }
    } catch (err) {
      alert("Error duplicating role.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitV1 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      companyId,
      roleName: formData.get("roleName"),
      department: formData.get("department"),
      baseTemplate: formData.get("template"), // 'restricted' | 'standard' | 'elevated'
    };

    try {
      const res = await fetch("/api/admin/roles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // result.role now contains the ID and the generated JSON permissions
        onSuccess(result.role); 
        onClose();
      } else {
        alert(result.error || "This role identity already exists in your company.");
      }
    } catch (err) {
      alert("Network error. Could not initialize configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-gradient-to-b from-slate-900/50 to-transparent">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Hierarchy Builder</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Define Access Role</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {sourceRoleName && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl mb-4">
            <p className="text-[10px] text-amber-500 font-bold uppercase">Duplicating: {sourceRoleName}</p>
            </div>
        )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Unique Role Title</label>
            <input 
              required 
              name="roleName" 
              type="text" 
              placeholder="e.g. Lead Pharmacist" 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

        {!sourcePermissions && (
       
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Department</label>
              <select name="department" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 outline-none">
                <option value="Administration">Administration</option>
                <option value="Medical">Medical</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Base Permissions</label>
              <select name="template" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-blue-500 outline-none">
                <option value="restricted">Restricted (All Off)</option>
                <option value="standard">Standard (View Only)</option>
                <option value="elevated">Elevated (All On)</option>
              </select>
            </div>
          </div>

          )}

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
            <div className="h-10 w-10 shrink-0 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              New roles are initialized with a template. You can customize specific toggles in the permission matrix after creation.
            </p>
          </div>

          <div className="pt-4">
            {/* <button 
              
              type="submit" 
              >
              {loading ? "Generating Role..." : "Initialize Role Configuration"}
            </button> */}
             <button 
             disabled={loading}
             type="submit" 
             className="w-full bg-white text-black hover:bg-blue-50 disabled:bg-slate-700 font-black text-xs uppercase py-4 rounded-2xl transition-all shadow-xl shadow-white/5"
            >
                {loading ? "Processing..." : sourcePermissions ? "Create Duplicate" : "Initialize Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DefineRoleModal;