"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, EnvelopeIcon, IdentificationIcon, UserMinusIcon } from "@heroicons/react/24/outline";

interface RosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  companyId: string;
}

const RosterDrawer = ({ isOpen, onClose, departmentName, companyId }: RosterDrawerProps) => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && departmentName) {
      setLoading(true);
      fetch(`/api/admin/departments/roster?companyId=${companyId}&department=${encodeURIComponent(departmentName)}`)
        .then(res => res.json())
        .then(json => {
          setRoster(json.data || []);
          setLoading(false);
        });
    }
  }, [isOpen, departmentName, companyId]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]" onClick={onClose} />
      )}

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0C10] border-l border-slate-800 z-[90] shadow-2xl transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-slate-800 bg-indigo-500/5">
            <div className="flex justify-between items-start mb-4">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <XMarkIcon className="h-6 w-6" />
              </button>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                Full Roster
              </span>
            </div>
            <h2 className="text-3xl font-black text-white italic">{departmentName}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">{roster.length} Personnel currently assigned</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-600 uppercase">Synchronizing Personnel...</p>
              </div>
            ) : roster.length === 0 ? (
              <div className="text-center py-20">
                <IdentificationIcon className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                <p className="text-sm text-slate-500">No staff members found in this unit.</p>
              </div>
            ) : (
              roster.map((staff: any) => (
                <div key={staff.id} className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                      {staff.user.image ? (
                        <img src={staff.user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-lg font-bold text-slate-500 uppercase">
                          {staff.user.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{staff.user.name}</h4>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tight">{staff.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                      <EnvelopeIcon className="h-3 w-3" />
                      <span className="text-[10px] font-medium truncate max-w-[150px]">{staff.user.email}</span>
                    </div>
                    <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-700 hover:text-red-500 transition-all" title="Reassign Staff">
                      <UserMinusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-black/40">
            <button className="w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-50 transition-all tracking-widest">
              Export Department Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RosterDrawer;