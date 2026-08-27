"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ArrowsRightLeftIcon, 
  InboxArrowDownIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ArrowLongRightIcon
} from "@heroicons/react/24/outline";

interface Props {
  initialUnassigned: any[];
  initialRooms: any[];
  schoolId: string;
}

const RoomAssignmentsClient = ({ initialUnassigned, initialRooms, schoolId }: Props) => {
  const [unassigned, setUnassigned] = useState(initialUnassigned);
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [transferSource, setTransferSource] = useState<any>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Sync state with HTML class for tailwind dark: selectors
  // useEffect(() => {
  //   const root = window.document.documentElement;
  //   if (darkMode) {
  //     root.classList.add("dark");
  //   } else {
  //     root.classList.remove("dark");
  //   }
  // }, [darkMode]);

  const handleTransferOrAssign = async (targetRoom: any) => {
    // 1. Logic for Transferring an existing resident
    if (transferSource) {
      if (targetRoom.id === transferSource.fromRoomId) {
        toast.error("Resident is already in this room");
        return;
      }
      if (targetRoom.occupancy >= targetRoom.capacity) {
        toast.error("Target room is full");
        return;
      }

      const promise = fetch("/api/admin/hostel/transfer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          allocationId: transferSource.allocationId, 
          targetRoomId: targetRoom.id 
        }),
      });

      toast.promise(promise, {
        loading: 'Transferring resident...',
        success: () => {
          setRooms((prev: any) => prev.map((r: any) => {
            if (r.id === transferSource.fromRoomId) {
              return { 
                ...r, 
                occupancy: r.occupancy - 1, 
                residents: r.residents.filter((res: any) => res.allocationId !== transferSource.allocationId) 
              };
            }
            if (r.id === targetRoom.id) {
              return { 
                ...r, 
                occupancy: r.occupancy + 1, 
                residents: [...r.residents, { 
                  allocationId: transferSource.allocationId, 
                  name: transferSource.studentName, 
                  joinedAt: new Date().toISOString() 
                }] 
              };
            }
            return r;
          }));
          setTransferSource(null);
          return "Transfer successful!";
        },
        error: "Transfer failed."
      });
      return;
    }

    // 2. Logic for Assigning a new resident from the sidebar
    if (selectedStudent) {
      if (targetRoom.occupancy >= targetRoom.capacity) {
        toast.error("This room is already at capacity");
        return;
      }

      const promise = fetch("/api/admin/hostel/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          roomId: targetRoom.id, 
          studentId: selectedStudent.type === 'STUDENT' ? selectedStudent.id : null,
          educatorId: selectedStudent.type === 'STAFF' ? selectedStudent.id : null,
          companyId: schoolId
        }),
      });

      toast.promise(promise, {
        loading: 'Finalizing assignment...',
        success: () => {
          setUnassigned(unassigned.filter((s: any) => s.id !== selectedStudent.id));
          setRooms(rooms.map((r: any) => 
            r.id === targetRoom.id 
              ? { 
                  ...r, 
                  occupancy: r.occupancy + 1,
                  residents: [...r.residents, { name: selectedStudent.name, joinedAt: new Date().toISOString() }] 
                }
              : r
          ));
          setSelectedStudent(null);
          return "Assignment secured!";
        },
        error: "Assignment failed."
      });
    }
  };

  const totalAvailableBeds = rooms.reduce((acc: number, r: any) => acc + (r.capacity - r.occupancy), 0);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 transition-colors duration-200 font-sans selection:bg-indigo-600 selection:text-white">
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          style: { 
            background: darkMode ? '#0f172a' : '#ffffff', 
            color: darkMode ? '#f1f5f9' : '#0f172a', 
            border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
            borderRadius: '1rem',
            fontSize: '12px',
            fontWeight: 'bold'
          } 
        }} 
      />
      
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Top Meta Navigation & Dark Mode Utility */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Allocation Module
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            aria-label="Toggle structural theme layout"
          >
            {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Master Control Header Panel */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Deployment Logic</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Room Assignments
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm font-medium">
              Assign waiting residents to open suites, or click an active resident card below to initialize a cross-wing transfer.
            </p>
          </div>
          
          {/* Dashboard Control Badges & Actions */}
          <div className="flex items-center gap-3 w-full xl:w-auto">
            {transferSource && (
              <button 
                onClick={() => setTransferSource(null)}
                className="px-4 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-all text-xs font-bold uppercase tracking-wide"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel Transfer
              </button>
            )}

            {selectedStudent && (
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-all text-xs font-bold uppercase tracking-wide"
              >
                <XMarkIcon className="h-4 w-4" />
                Deselect Resident
              </button>
            )}

            <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                {totalAvailableBeds} Empty Beds Available
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Dual-Panel Workspace Grid */}
        <div className="grid grid-cols-12 gap-6 lg:h-[70vh]">
          
          {/* LEFT: Unassigned/Pending List */}
          <section className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <InboxArrowDownIcon className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">Waiting Pool</h3>
              </div>
              <span className="bg-indigo-600 dark:bg-indigo-550 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                {unassigned.length} Pending
              </span>
            </div>

            {/* Quick Filter Search Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10">
              <div className="relative">
                <MagnifyingGlassIcon className="h-3.5 w-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  className="w-full bg-slate-100 dark:bg-slate-950 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none text-slate-800 dark:text-white placeholder:text-slate-450 dark:placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="Search waiting pool..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List Body */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2.5 max-h-[500px] lg:max-h-full">
              {unassigned
                .filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.idNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((resident: any) => {
                  const isCurrentSelection = selectedStudent?.id === resident.id;
                  return (
                    <button 
                      key={resident.id} 
                      onClick={() => {
                        setSelectedStudent(resident);
                        setTransferSource(null); // Cancel transferring state
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                        isCurrentSelection 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className={`text-xs font-bold truncate ${isCurrentSelection ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
                          {resident.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-[9px] font-bold tracking-wide uppercase ${isCurrentSelection ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                            {resident.idNumber}
                          </p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                            isCurrentSelection 
                              ? 'bg-white/20 text-white' 
                              : resident.type === 'STAFF' 
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-500' 
                                : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                          }`}>
                            {resident.type}
                          </span>
                        </div>
                      </div>
                      <PlusCircleIcon className={`h-5 w-5 flex-shrink-0 transition-transform ${isCurrentSelection ? 'text-white rotate-45' : 'text-slate-350 dark:text-slate-650'}`} />
                    </button>
                  );
                })}

              {unassigned.length === 0 && (
                <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                  <p className="text-xs font-bold">Waiting pool is empty</p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: Active Rooms Workspace Grid */}
          <section className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-sm">
            <div className="flex-grow overflow-y-auto p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room: any) => {
                const isFull = room.occupancy >= room.capacity;
                const isTargetable = (selectedStudent || transferSource) && !isFull;

                return (
                  <div 
                    key={room.id} 
                    className={`group/room border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative ${
                      isTargetable 
                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 cursor-pointer hover:shadow-md' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
                    }`}
                    onClick={() => isTargetable && handleTransferOrAssign(room)}
                  >
                    <div>
                      {/* Room Banner Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                            Suite {room.roomNumber}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{room.wing} Wing</span>
                            <span className="text-slate-300 dark:text-slate-700 text-[8px]">•</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Lvl {room.floor}</span>
                          </div>
                        </div>
                        <div className={`p-2 rounded-xl border ${
                          isFull 
                            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-500' 
                            : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-500'
                        }`}>
                          <UserGroupIcon className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Room Occupants Directory */}
                      <div className="space-y-2">
                        {room.residents.map((res: any, i: number) => {
                          const isBeingTransferred = transferSource?.allocationId === res.allocationId;
                          return (
                            <div 
                              key={i} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTransferSource({
                                  allocationId: res.allocationId,
                                  studentName: res.name,
                                  fromRoomId: room.id
                                });
                                setSelectedStudent(null); 
                                toast(`Select target room to reassign ${res.name}`, { icon: '🔄' });
                              }}
                              className={`group/resident p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                isBeingTransferred
                                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-400'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full ${isBeingTransferred ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`} />
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-250 truncate max-w-[140px] uppercase">
                                  {res.name}
                                </span>
                              </div>
                              <ArrowsRightLeftIcon className="h-3.5 w-3.5 text-amber-500 opacity-0 group-hover/resident:opacity-100 transition-opacity" />
                            </div>
                          );
                        })}

                        {/* Ghost/Empty Slots */}
                        {Array.from({ length: room.capacity - room.occupancy }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`p-3 rounded-xl border border-dashed flex items-center justify-between transition-colors ${
                              isTargetable 
                                ? 'border-indigo-400 dark:border-indigo-500/50 bg-indigo-500/5' 
                                : 'border-slate-200 dark:border-slate-800 bg-transparent'
                            }`}
                          >
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                              isTargetable 
                                ? 'text-indigo-600 dark:text-indigo-400 animate-pulse' 
                                : 'text-slate-400 dark:text-slate-600'
                            }`}>
                              {transferSource ? "Transfer Here" : selectedStudent ? "Deploy Here" : "Vacant Slot"}
                            </span>
                            {isTargetable ? (
                              <ArrowLongRightIcon className="h-4 w-4 text-indigo-500" />
                            ) : (
                              <PlusCircleIcon className="h-4 w-4 text-slate-200 dark:text-slate-800" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RoomAssignmentsClient;