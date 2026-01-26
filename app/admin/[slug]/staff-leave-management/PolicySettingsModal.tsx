"use client";

import React, { useState, useEffect } from "react";
import { 
  XMarkIcon, 
  ShieldCheckIcon, 
  AdjustmentsHorizontalIcon,
  AcademicCapIcon,
  BeakerIcon,
  HeartIcon
} from "@heroicons/react/24/outline";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

const PolicySettingsModal = ({ isOpen, onClose, companyId }: PolicyModalProps) => {
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState([
    { type: "ANNUAL", days: 21, icon: AcademicCapIcon, color: "text-blue-400" },
    { type: "SICK", days: 10, icon: HeartIcon, color: "text-rose-400" },
    { type: "MATERNITY", days: 90, icon: BeakerIcon, color: "text-violet-400" },
  ]);

  const handleDayChange = (index: number, value: string) => {
    const newPolicies = [...policies];
    newPolicies[index].days = parseInt(value) || 0;
    setPolicies(newPolicies);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/leave/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, policies }),
      });
      onClose();
    } catch (err) {
      alert("Failed to sync policies.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-violet-500/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheckIcon className="h-4 w-4 text-violet-400" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Global Governance</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Leave Entitlements</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 space-y-8">
          <p className="text-xs text-slate-500 leading-relaxed italic">
            Define the maximum number of paid leave days available to staff per calendar year. Changes will apply to the next accrual cycle.
          </p>

          <div className="space-y-6">
            {policies.map((policy, idx) => (
              <div key={policy.type} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <policy.icon className={`h-5 w-5 ${policy.color}`} />
                    <span className="text-sm font-bold text-white tracking-wide">{policy.type} LEAVE</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-slate-800">
                    <input 
                      type="number"
                      value={policy.days}
                      onChange={(e) => handleDayChange(idx, e.target.value)}
                      className="w-12 bg-transparent text-center font-mono font-black text-violet-400 outline-none"
                    />
                    <span className="text-[10px] font-black text-slate-600 uppercase">Days</span>
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max={policy.type === 'MATERNITY' ? 180 : 40}
                  value={policy.days}
                  onChange={(e) => handleDayChange(idx, e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
            >
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-violet-900/20"
            >
              {loading ? "Syncing..." : "Update Policies"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicySettingsModal;