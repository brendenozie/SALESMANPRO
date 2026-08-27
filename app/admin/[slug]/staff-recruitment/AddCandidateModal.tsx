"use client";

import React, { useState } from "react";
import { XMarkIcon, UserPlusIcon, EnvelopeIcon, BriefcaseIcon, StarIcon } from "@heroicons/react/24/outline";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

const AddCandidateModal = ({ isOpen, onClose, companyId, onSuccess }: AddCandidateModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      companyId,
      name: formData.get("name"),
      email: formData.get("email"),
      position: formData.get("position"),
      source: formData.get("source"),
      score: formData.get("score"),
      notes: formData.get("notes"),
    };

    try {
      const res = await fetch("/api/admin/recruitment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      alert("Error adding candidate");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-indigo-500/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlusIcon className="h-4 w-4 text-indigo-400" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Candidate Intake</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Add Referral Applicant</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Full Name</label>
            <input name="name" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none" placeholder="e.g. Dr. Jane Smith" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Address</label>
            <input name="email" type="email" required className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none" placeholder="jane@institution.edu" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Target Position</label>
            <select name="position" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none appearance-none">
              <option value="Physics Head">Physics Head</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Lab Assistant">Lab Assistant</option>
              <option value="Administrative Lead">Administrative Lead</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Referral Source</label>
            <input name="source" className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none" placeholder="e.g. LinkedIn / Internal Referral" />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Initial Screening Score (0-100)</label>
            <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <StarIcon className="h-5 w-5 text-indigo-400" />
              <input name="score" type="range" min="0" max="100" className="flex-1 accent-indigo-500" />
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Internal Notes</label>
            <textarea name="notes" rows={3} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-5 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Strengths, weaknesses, and referral context..." />
          </div>

          <div className="col-span-2 flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white transition-all">
              Cancel
            </button>
            <button disabled={loading} type="submit" className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20">
              {loading ? "Processing..." : "Register Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddCandidateModal;