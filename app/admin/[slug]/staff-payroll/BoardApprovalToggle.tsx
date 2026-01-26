"use client";

import React, { useState } from "react";
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  CloudArrowDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const BoardApprovalToggle = ({ companyId, initialLocked, onLockChange }: any) => {
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [loading, setLoading] = useState(false);

  const toggleLock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payroll/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, isLocked: !isLocked }),
      });
      if (res.ok) {
        setIsLocked(!isLocked);
        onLockChange(!isLocked);
      }
    } catch (err) {
      alert("Security override failed.");
    } finally {
      setLoading(false);
    }
  };
  
  const downloadBankExport = async () => {
    try {
      // Direct link to the API route which handles the file stream
      const downloadUrl = `/api/admin/payroll/export?companyId=${companyId}`;
      
      // Create a hidden link and click it to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Payroll_Export_Jan_2026.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to generate bank file. Please contact system admin.");
    }
  };

  return (
    <div className={`mt-10 p-1 border rounded-[2rem] transition-all duration-500 ${isLocked ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
        <div className="flex items-center gap-5">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${isLocked ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
            {isLocked ? <ShieldCheckIcon className="h-8 w-8" /> : <LockOpenIcon className="h-8 w-8" />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">
              {isLocked ? "Payroll Board Approved" : "Final Review Required"}
            </h4>
            <p className="text-xs text-slate-500">
              {isLocked 
                ? "Data is encrypted and locked. Ready for bank disbursement." 
                : "Salary structures are currently editable. Toggle to lock for export."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isLocked && (
            <button 
              onClick={downloadBankExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all"
            >
              <CloudArrowDownIcon className="h-4 w-4" /> Export Bank File
            </button>
          )}
          
          <button 
            onClick={toggleLock}
            disabled={loading}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isLocked 
                ? 'bg-slate-800 text-rose-400 hover:bg-rose-500/10' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
            }`}
          >
            {loading ? "Verifying..." : isLocked ? <><LockClosedIcon className="h-4 w-4" /> Unlock for Edits</> : "Approve & Lock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardApprovalToggle;