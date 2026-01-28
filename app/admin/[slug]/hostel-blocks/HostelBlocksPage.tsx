"use client";

import React, { useEffect, useState } from "react";
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon,
  UsersIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import UnifiedHostelModal from "./UnifiedHostelModal";

interface HostelBlocksPageProps {
  initialBlocks: any[];
  schoolId: string;
}

export default function HostelBlocksPage({ initialBlocks, schoolId }: HostelBlocksPageProps) {

  const [blocks, setBlocks] = useState(initialBlocks || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const fetchBlocks = async () => {
    const res = await fetch(`/api/admin/hostel/blocks?companyId=${schoolId}`);
    const json = await res.json();
    setBlocks(json.data || []);
  };

  useEffect(() => { fetchBlocks(); }, [schoolId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the block and all associated room data.")) return;
    const res = await fetch(`/api/admin/hostel/blocks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Block decommissioned");
      fetchBlocks();
    } else {
      toast.error("Clear rooms before deleting block");
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-white">Infrastructure <span className="text-purple-500">Blocks.</span></h1>
            <p className="text-slate-500 text-sm">Manage buildings and wing assignments</p>
          </div>
          <button 
            onClick={() => { setSelectedBlock(null); setIsModalOpen(true); }}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20"
          >
            <PlusIcon className="h-5 w-5" /> Add Block
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blocks.map((block: any) => (
            <div key={block.id} className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
              {/* Type Badge */}
              <div className="absolute top-0 right-0 px-6 py-2 bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-bl-2xl">
                {block.type}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                  <BuildingOfficeIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{block.name}</h3>
                  <p className="text-xs text-slate-500">{block.roomCount} Total Rooms</p>
                </div>
              </div>

              {/* Aggregated Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/30 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Capacity</p>
                  <p className="text-xl font-black text-white">{block.totalCapacity}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Residents</p>
                  <p className="text-xl font-black text-purple-400">{block.totalOccupancy}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedBlock(block); setIsModalOpen(true); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <PencilSquareIcon className="h-4 w-4 text-slate-400" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(block.id)}
                  className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <UnifiedHostelModal 
          config={{
            isOpen: true,
            type: "BLOCK",
            mode: selectedBlock ? "EDIT" : "ADD",
            data: selectedBlock
          }}
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchBlocks(); }}
        />
      )}
    </main>
  );
}