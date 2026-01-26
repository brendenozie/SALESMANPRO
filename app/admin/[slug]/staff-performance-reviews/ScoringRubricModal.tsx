"use client";

import React, { useState } from "react";
import { ShieldCheckIcon, AdjustmentsVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ScoringRubricModal = ({ isOpen, onClose }: any) => {
  const [rubric, setRubric] = useState([
    { criteria: "Instructional Quality", weight: 40, description: "Student outcomes and engagement metrics." },
    { criteria: "Peer Collaboration", weight: 20, description: "Contribution to departmental growth." },
    { criteria: "Research/Lab Output", weight: 20, description: "Published papers or technical audits." },
    { criteria: "Institutional Service", weight: 20, description: "Committee participation and mentorship." },
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-purple-500/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Institutional Rubric</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-4">
          {rubric.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">{item.criteria}</p>
                <p className="text-[10px] text-slate-500">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  defaultValue={item.weight} 
                  className="w-12 bg-black border border-slate-700 rounded-lg p-1 text-center text-xs text-purple-400 font-bold"
                />
                <span className="text-[10px] font-black text-slate-600">%</span>
              </div>
            </div>
          ))}
          <button className="w-full mt-4 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
            Update Rubric Weights
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoringRubricModal;