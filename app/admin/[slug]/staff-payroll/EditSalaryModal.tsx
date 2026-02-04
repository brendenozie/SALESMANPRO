"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, BanknotesIcon, CalculatorIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface SalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}

const EditSalaryModal = ({ isOpen, onClose, companyId, onSuccess }: SalaryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch(`/api/admin/staff?companyId=${companyId}`)
        .then(res => res.json())
        .then(data => setStaffList(data.data || []));
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      staffId: formData.get("staffId"),
      salary: formData.get("salary"),
    };

    try {
      const res = await fetch("/api/admin/payroll/update-salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-amber-500/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalculatorIcon className="h-4 w-4 text-amber-500" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Remuneration Adjuster</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Salary Structure</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-10 space-y-6">
          {/* Staff Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Select Personnel</label>
            <div className="relative">
              <UserCircleIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select 
                name="staffId" 
                required 
                onChange={(e) => {
                  const staff = staffList.find((s: any) => s.staffProfile.id === e.target.value);
                  setSelectedStaff(staff);
                }}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-amber-500 outline-none appearance-none"
              >
                <option value="">Choose Employee...</option>
                {staffList.map((s: any) => (
                  <option key={s.id} value={s.id || s.staffProfile.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Salary Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">New Monthly Base Salary ($)</label>
            <div className="relative">
              <BanknotesIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input 
                name="salary"
                type="number"
                step="0.01"
                required
                defaultValue={selectedStaff?.staffProfile?.salary || ""}
                placeholder="e.g. 4500.00"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-sm text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
             <p className="text-[10px] text-slate-400 leading-relaxed italic">
               * Adjusting the base salary will automatically recalculate the 15% statutory withholding and net payable amount in the next payroll batch run.
             </p>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-black text-xs uppercase py-5 rounded-2xl transition-all shadow-xl shadow-amber-900/20"
          >
            {loading ? "Updating Records..." : "Update Salary Structure"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSalaryModal;