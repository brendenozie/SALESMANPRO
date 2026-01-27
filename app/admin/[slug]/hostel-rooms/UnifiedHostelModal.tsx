"use client";
import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const UnifiedHostelModal = ({ config, schoolId, blockId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(config.data || {
    name: "", type: "MALE", // Default for Block
    roomNumber: "", capacity: 2, floor: 1, // Default for Room
    userId: "", description: "", priority: "MEDIUM" // For operational
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = config.type === "ROOM" || config.type === "BLOCK" 
      ? "/api/admin/hostel/infrastructure" 
      : "/api/admin/hostel/operations"; // You'll need an operations route similarly

    const method = config.mode === "ADD" ? "POST" : "PUT";
    const payload = { 
      entity: config.type, 
      id: config.data?.id, 
      data: { ...form, companyId: schoolId, blockId: blockId, roomId: config.data?.id } 
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(`${config.type} successfully saved`);
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || "Execution failed");
      }
    } catch (error) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{config.mode} {config.type}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.type === "BLOCK" && (
            <>
              <input className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" placeholder="Block Name (e.g. Wing A)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <select className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="MALE">Male Only</option>
                <option value="FEMALE">Female Only</option>
                <option value="MIXED">Mixed</option>
              </select>
            </>
          )}

          {config.type === "ROOM" && (
            <>
              <input className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" placeholder="Room Number" value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" placeholder="Capacity" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} />
                <input type="number" className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" placeholder="Floor" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} />
              </div>
            </>
          )}

          {config.type === "MAINTENANCE" && (
            <>
              <textarea className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" placeholder="Describe the issue..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <select className="w-full bg-black/40 border border-slate-800 rounded-xl px-4 py-3 text-white" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </>
          )}

          <button disabled={loading} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default UnifiedHostelModal;