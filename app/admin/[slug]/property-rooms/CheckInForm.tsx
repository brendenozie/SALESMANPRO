"use client";

import React, { useState } from "react";

const CheckInForm = ({ roomId, roomNumber, onAllocationComplete }: any) => {
  const [studentId, setStudentId] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/property/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, userId: studentId, endDate }),
    });

    if (res.ok) {
      onAllocationComplete();
      alert("Student allocated successfully!");
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl mt-4">
      <h4 className="text-sm font-bold text-white mb-4">Check-in Student to {roomNumber}</h4>
      <form onSubmit={handleCheckIn} className="space-y-4">
        <input 
          placeholder="Enter Student MongoDB ID" 
          className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-bold uppercase">Expected Departure (Optional)</label>
          <input 
            type="date" 
            className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button 
          disabled={loading}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          {loading ? "Processing..." : "Confirm Allocation"}
        </button>
      </form>
    </div>
  );
};

export default CheckInForm;