"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XMarkIcon, 
  BanknotesIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { FeeItem } from "@/lib/data";

interface Props {
  isOpen: boolean;
  feeItem: FeeItem | null;
  onClose: () => void;
  onSave: (data: Partial<FeeItem>) => void;
  isSubmitting: boolean;
}

const AddEditFeeItemModal: React.FC<Props> = ({
  isOpen,
  feeItem,
  onClose,
  onSave,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<FeeItem>>({
    name: "",
    defaultAmount: 0,
    currency: "USD",
    applicableTo: "ALL" as any,
  });

  useEffect(() => {
    if (feeItem) {
      setFormData(feeItem);
    } else {
      setFormData({ name: "", defaultAmount: 0, currency: "USD", applicableTo: "ALL" as any });
    }
  }, [feeItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-slate-900/80 border border-white/10 p-8 shadow-2xl backdrop-blur-2xl"
          >
            {/* Background Glow Ornament */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="h-5 w-5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Configuration</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {feeItem ? "Edit Fee" : "New Fee Item"}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="group p-2 rounded-full bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
              >
                <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div className="group space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1 transition-colors group-focus-within:text-indigo-400">
                  Fee Description
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Semester Registration"
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <GlobeAltIcon className="h-5 w-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Default Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 text-white font-mono focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all"
                      value={formData.defaultAmount}
                      onChange={(e) => setFormData({ ...formData, defaultAmount: Number(e.target.value) })}
                    />
                    <BanknotesIcon className="h-5 w-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 font-bold" />
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Currency</label>
                  <select 
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 text-white focus:ring-2 focus:ring-indigo-500/40 outline-none appearance-none cursor-pointer transition-all"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="NGN">NGN (₦)</option>
                  </select>
                </div>
              </div>

              {/* Scope Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Target Audience</label>
                <div className="flex p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl gap-1">
                  {['ALL', 'LEVEL', 'CLASS'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, applicableTo: type as any })}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                        formData.applicableTo === type 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-bold transition-all border border-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 stroke-[2.5]" />
                      {feeItem ? "UPDATE FEE" : "SAVE FEE ITEM"}
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

export default AddEditFeeItemModal;