"use client";

import React, { useState } from "react";
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

const BankDetailsTab = ({ staff, onUpdate }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const saveDetails = async (e: React.FormEvent<HTMLFormElement>, staffId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const res = await fetch("/api/admin/staff/bank-details", {
      method: "POST",
      body: JSON.stringify({
        staffId,
        bankAccount: formData.get("bankAccount"),
        bankCode: formData.get("bankCode"),
      }),
    });

    if (res.ok) {
      setEditingId(null);
      onUpdate();
    } else {
      alert("Validation Error: Please check account number format.");
    }
  };

  return (
    <div className="space-y-4">
      {staff.map((member: any) => (
        <div key={member.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 transition-all hover:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                <BuildingLibraryIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{member.user.name}</h4>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{member.department || 'Unassigned'}</p>
              </div>
            </div>

            {editingId === member.id ? (
              <form onSubmit={(e) => saveDetails(e, member.id)} className="flex flex-wrap gap-3 flex-1 max-w-2xl">
                <input 
                  name="bankAccount"
                  placeholder="Account Number"
                  defaultValue={member.bankAccount}
                  className="flex-1 min-w-[150px] bg-black border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
                <input 
                  name="bankCode"
                  placeholder="Swift/Sort Code"
                  defaultValue={member.bankCode}
                  className="w-32 bg-black border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
                <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
                <button type="button" onClick={() => setEditingId(null)} className="text-slate-500 text-[10px] font-black uppercase">Cancel</button>
              </form>
            ) : (
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Account Number</p>
                  <p className="text-xs font-mono text-slate-300">{member.bankAccount || "•••• •••• ••••"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Bank Code</p>
                  <p className="text-xs font-mono text-slate-300">{member.bankCode || "---"}</p>
                </div>
                <div className="flex items-center gap-2 min-w-[100px]">
                  {member.bankAccount ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded-md">
                      <CheckCircleIcon className="h-3 w-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold bg-rose-500/10 px-2 py-1 rounded-md animate-pulse">
                      <ExclamationTriangleIcon className="h-3 w-3" /> MISSING
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setEditingId(member.id)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <CreditCardIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};