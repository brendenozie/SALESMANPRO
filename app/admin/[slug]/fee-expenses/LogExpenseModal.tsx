"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface LogExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isSubmitting: boolean;
}

const LogExpenseModal = ({ isOpen, onClose, onSave, isSubmitting }: LogExpenseModalProps) => {
  const [formData, setFormData] = useState({
    category: "Utilities",
    description: "",
    vendor: "",
    amount: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#05070A]/80 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-white/5 bg-rose-500/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Log Expense</h2>
                <p className="text-[10px] text-rose-400 uppercase tracking-widest font-black">Financial Outflow</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Category Select */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Procurement">Procurement</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Description</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Monthly Electricity Bill"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vendor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Vendor</label>
                  <input 
                    required
                    type="text"
                    placeholder="City Power"
                    value={formData.vendor}
                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-slate-700"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input 
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:ring-2 focus:ring-rose-500 outline-none placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 transition-all mt-4"
              >
                {isSubmitting ? "Processing..." : "Authorize Expense"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogExpenseModal;