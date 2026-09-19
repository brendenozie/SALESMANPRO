"use client";

import React, { useState, useEffect } from "react";
import { 
  HomeModernIcon, 
  SquaresPlusIcon,
  SunIcon,
  MoonIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import AddRoomModal from "./AddRoomModal";
import CheckInForm from "./CheckInForm";
import { toast } from "react-hot-toast";

interface Props {
  initialBlocks?: any[];
  initiablocks?: any[];
  schoolId: string;
}

const HostelRoomsClient = ({ initialBlocks, initiablocks, schoolId }: Props) => {
  const safeInitialBlocks = Array.isArray(initialBlocks)
    ? initialBlocks
    : Array.isArray(initiablocks)
    ? initiablocks
    : [];
  const [rooms, setRooms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>(safeInitialBlocks);
  
  const [activeBlockId, setActiveBlockId] = useState<string>(
    safeInitialBlocks.length > 0 && safeInitialBlocks[0]?.id ? safeInitialBlocks[0].id : ""
  );
  const [selectedBlock, setSelectedBlock] = useState<any>(
    safeInitialBlocks.length > 0 ? safeInitialBlocks[0] : null
  );

  const fetchBlocks = async () => {
    try {
      const res = await fetch(`/api/admin/hostel/blocks?companyId=${schoolId}`);
      const json = await res.json();
      setBlocks(json.data || []);
    } catch (error) {
      toast.error("Failed to fetch hostel blocks");
    }
  };

  const fetchRooms = async (blockId: string) => {
    if (!blockId) return;
    try {
      const res = await fetch(`/api/admin/hostel/rooms?blockId=${blockId}&companyId=${schoolId}`);
      const json = await res.json();
      setRooms(json.data || []);
    } catch (error) {
      toast.error("Failed to load inventory rooms");
    }
  };

  useEffect(() => {
    fetchRooms(activeBlockId);
  }, [activeBlockId]);


  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 transition-colors duration-200 font-sans antialiased selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Sub-Header Utility Tracker Controls */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <BuildingOfficeIcon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Wing: {selectedBlock?.name || "None Selected"}
            </span>
          </div>
          
        </div>

        {/* Master Panel Action Header */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.75rem] p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-purple-600 dark:bg-purple-500 rounded-full" />
              <span className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">System State Matrix</span>
            </div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Room Inventory
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 max-w-sm font-medium">
              Monitor building space parameters, assign open room capacity levels, and optimize student check-in distribution workflows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Horizontal Block Selector Navigation Matrix */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 w-full sm:w-auto overflow-x-auto scrollbar-none">
              {blocks && blocks.length > 0 ? (
                blocks.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => {
                      setActiveBlockId(block.id);
                      setSelectedBlock(block);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-1 sm:flex-initial ${
                      activeBlockId === block.id
                        ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-white shadow-sm border border-slate-200/40 dark:border-slate-800"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {block.name}
                  </button>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 px-3 py-1.5 italic">No active blocks</span>
              )}
            </div>

            {/* Quick Component Initialization Action Modals */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setIsBlockModalOpen(true);
                  setSelectedBlock(null);
                }}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                <SquaresPlusIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Add Block
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <SquaresPlusIcon className="h-4 w-4" />
                Add Room
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Empty Room Set Indicator */}
        {rooms.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8">
            <div className="h-12 w-12 bg-slate-100 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto mb-3">
              <HomeModernIcon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No rooms configured</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
              There are no physical operational spaces registered to this sector yet. Click Add Room to start populate data fields.
            </p>
          </div>
        )}

        {/* Clean Structured Grid Columns Portfolio */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {rooms.map((room) => {
            const utilizationRate = ((room.occupancy || 0) / room.capacity) * 100;
            const isUnoccupied = room.occupancy === 0;
            const isSaturated = room.occupancy >= room.capacity;

            return (
              <div
                key={room.id}
                className={`group bg-white dark:bg-slate-900 border transition-all duration-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm ${
                  selectedRoomId === room.id
                    ? "border-purple-600 ring-1 ring-purple-600 dark:border-purple-500 dark:ring-purple-500"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Internal Panel Badge Structure */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-10 w-10 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
                      <HomeModernIcon className="h-5 w-5" />
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                        isUnoccupied
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400"
                          : !isSaturated
                          ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400"
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {isUnoccupied ? "Available" : !isSaturated ? "Partial" : "Full"}
                    </span>
                  </div>

                  {/* Room Standard Identifiers */}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white tracking-tight">
                      Room {room.roomNumber}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded">
                        {room.type || "Standard"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Floor {room.floor || "Ground"}
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Capacity Bar Component */}
                  <div className="mb-6 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      <span>Occupancy</span>
                      <span className="text-slate-800 dark:text-slate-200">
                        {room.occupancy || 0} / {room.capacity}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSaturated
                            ? "bg-slate-400 dark:bg-slate-600"
                            : isUnoccupied
                            ? "bg-emerald-500"
                            : "bg-purple-600 dark:bg-purple-500"
                        }`}
                        style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Flow Control Action Elements */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      selectedRoomId === room.id
                        ? "bg-slate-950 dark:bg-white text-white dark:text-black border-transparent"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                    }`}
                  >
                    <UserPlusIcon className="h-3.5 w-3.5" />
                    {selectedRoomId === room.id ? "Close Panel" : "Manage Check-in"}
                  </button>

                  {selectedRoomId === room.id && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                      <CheckInForm
                        roomId={room.id}
                        roomNumber={room.roomNumber}
                        onAllocationComplete={() => {
                          setSelectedRoomId(null);
                          fetchRooms(activeBlockId);
                          toast.success(`Allocations updated for Room ${room.roomNumber}`);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Overlay Modal Integrations */}
      {isModalOpen && (
        <AddRoomModal
          blockId={activeBlockId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newRoom) => {
            setRooms((prev) => [...prev, newRoom]);
            setIsModalOpen(false);
          }}
        />
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl font-black text-slate-950 dark:text-white mb-1">
              {selectedBlock ? "Edit" : "New"} Hostel Block
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium">
              Configure parameters for new structural dorm facilities or layout wings.
            </p>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get("name"),
                  type: formData.get("type"),
                  companyId: schoolId
                };

                const method = selectedBlock ? "PUT" : "POST";
                const endpoint = `/api/admin/hostel/blocks${selectedBlock ? `?id=${selectedBlock.id}` : ""}`;
                
                try {
                  const res = await fetch(endpoint, {
                    method,
                    body: JSON.stringify(data),
                    headers: { "Content-Type": "application/json" }
                  });

                  if (res.ok) {
                    toast.success("Structural setup saved");
                    setIsBlockModalOpen(false);
                    fetchBlocks();
                  } else {
                    toast.error("Failed to execute updates");
                  }
                } catch {
                  toast.error("Endpoint networking failure");
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider ml-1">Block Designation Name</label>
                <input
                  name="name"
                  defaultValue={selectedBlock?.name}
                  placeholder="e.g., Kilimanjaro Wing"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-1 relative">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider ml-1">Gender Layout Classification</label>
                <div className="relative">
                  <select
                    name="type"
                    defaultValue={selectedBlock?.type || "BOYS"}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="BOYS">BOYS Only</option>
                    <option value="GIRLS">GIRLS Only</option>
                    <option value="MIXED">Mixed / Co-ed</option>
                    <option value="STAFF">Staff Only</option>
                  </select>
                  <ChevronDownIcon className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-750 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default HostelRoomsClient;