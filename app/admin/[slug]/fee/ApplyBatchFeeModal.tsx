"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XMarkIcon, 
  CheckIcon,
  UserGroupIcon,
  HashtagIcon,
  CalendarDaysIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  feeItems: any[];
  academicLevels: any[];
  classrooms: any[];
  onApply: (data: any) => void;
  isSubmitting: boolean;
}

const ApplyBatchFeeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  feeItems,
  academicLevels,
  classrooms,
  onApply,
  isSubmitting
}) => {
  // State for batch logic
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<"ALL" | "ACADEMIC_LEVEL" | "CLASS">("ALL");
  const [targetValue, setTargetValue] = useState("");
  const [academicYear, setAcademicYear] = useState(`${new Date().getFullYear()}`);
  const [term, setTerm] = useState("Term 1");

  const toggleFee = (id: string) => {
    setSelectedFeeIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      feeItemIds: selectedFeeIds,
      targetType,
      targetValue,
      academicYear,
      term
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl">
                  <SparklesIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Batch Apply Fees</h2>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Automatic Revenue Generation</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
              {/* SECTION 1: TARGETING */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4" /> 1. Select Audience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["ALL", "ACADEMIC_LEVEL", "CLASS"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setTargetType(t as any); setTargetValue(""); }}
                      className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                        targetType === t 
                        ? "bg-white text-slate-950 border-white shadow-lg" 
                        : "bg-slate-950/50 border-white/5 text-slate-500 hover:border-white/20"
                      }`}
                    >
                      {t === "ALL" ? "All Students" : t === "ACADEMIC_LEVEL" ? "By Level" : "By Class"}
                    </button>
                  ))}
                </div>

                {targetType !== "ALL" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <select
                      required
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select {targetType === "ACADEMIC_LEVEL" ? "Academic Level" : "Classroom"}...</option>
                      {(targetType === "ACADEMIC_LEVEL" ? academicLevels : classrooms).map((item: any) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              {/* SECTION 2: FEE ITEMS (The "What") */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                  <HashtagIcon className="h-4 w-4" /> 2. Select Fee Items
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {feeItems.map((item: any) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleFee(item.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedFeeIds.includes(item.id)
                        ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                        : "bg-slate-950/50 border-white/5 text-slate-400"
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold">{item.name}</p>
                        <p className="text-[10px] opacity-60">${item.defaultAmount.toLocaleString()}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedFeeIds.includes(item.id) ? "bg-indigo-500 border-indigo-500" : "border-white/20"
                      }`}>
                        {selectedFeeIds.includes(item.id) && <CheckIcon className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: META INFO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Academic Year</label>
                  <input 
                    value={academicYear} 
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Term</label>
                  <input 
                    value={term} 
                    onChange={e => setTerm(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedFeeIds.length === 0 || (targetType !== "ALL" && !targetValue)}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white rounded-[2rem] font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Generate Invoices for {targetType === "ALL" ? "All" : "Selected Group"}
                      <div className="px-2 py-0.5 bg-white/20 rounded-md text-[10px]">{selectedFeeIds.length} Items</div>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplyBatchFeeModal;