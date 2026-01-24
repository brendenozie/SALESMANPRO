"use client";

import React, { useState } from "react";
import { XMarkIcon, MagnifyingGlassIcon, BookmarkIcon } from "@heroicons/react/24/outline";

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  schoolId: string;
}

const NewReservationModal = ({ isOpen, onClose, onSubmit, schoolId }: NewReservationModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookId: "",
    memberId: "",
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Manual Hold</h2>
            <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-1">Add member to waitlist</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Book ID Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Book Identifier (ISBN or ID)</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
              <input 
                required
                placeholder="Search volumes..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-violet-500/50 transition-all"
                value={formData.bookId}
                onChange={(e) => setFormData({...formData, bookId: e.target.value})}
              />
            </div>
          </div>

          {/* Member ID Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Member Library ID</label>
            <div className="relative">
              <BookmarkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
              <input 
                required
                placeholder="LIB-XXXXXX"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-violet-500/50 transition-all font-mono"
                value={formData.memberId}
                onChange={(e) => setFormData({...formData, memberId: e.target.value})}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hold Expiry Date</label>
            <input 
              type="date"
              required
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white outline-none focus:border-violet-500/50 transition-all"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-900/20"
          >
            {loading ? "Registering Hold..." : "Confirm Reservation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReservationModal;