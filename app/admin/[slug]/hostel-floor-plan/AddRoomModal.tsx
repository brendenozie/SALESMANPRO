"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AddRoomModalProps {
  blockId: string;
  schoolId?: string;
  onClose: () => void;
  onSuccess: (newRoom: any) => void;
}

const AddRoomModal = ({ blockId, schoolId, onClose, onSuccess }: AddRoomModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    capacity: 2,
    type: "DOUBLE", // Matches HostelRoomType Enum
    floor: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hostel/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, blockId, companyId: schoolId }),
      });
      const result = await res.json();
      if (res.ok) {
        onSuccess(result.data);
        onClose();
      }
    } catch (error) {
      // console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-black text-white mb-2">New Room <span className="text-purple-500">Allocation.</span></h2>
        <p className="text-xs text-slate-500 mb-8">Registering unit for Block ID: {blockId.slice(-6)}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Room Number</label>
              <input 
                required
                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                placeholder="A-101"
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Room Type</label>
              <select 
                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-purple-500 outline-none appearance-none"
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="SUITE">Suite</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Capacity</label>
              <input 
                type="number"
                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Floor</label>
              <input 
                type="number"
                className="w-full bg-black/40 border border-slate-800 rounded-2xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
          >
            {loading ? "PROVISIONING..." : "CREATE UNIT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;