"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ArrowsRightLeftIcon, 
  InboxArrowDownIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

const RoomAssignmentsClient = ({ initialUnassigned, initialRooms, schoolId }: any) => {
  const [unassigned, setUnassigned] = useState(initialUnassigned);
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Inside RoomAssignmentsClient component...

    const [transferSource, setTransferSource] = useState<any>(null); // { allocationId, studentName, fromRoomId }

    const handleTransferOrAssign = async (targetRoom: any) => {
      // If we are in "Transfer Mode"
      if (transferSource) {
        if (targetRoom.id === transferSource.fromRoomId) {
          toast.error("Resident is already in this room");
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
              // Remove from old room
              if (r.id === transferSource.fromRoomId) {
                return { 
                  ...r, 
                  occupancy: r.occupancy - 1, 
                  residents: r.residents.filter((res: any) => res.allocationId !== transferSource.allocationId) 
                };
              }
              // Add to new room
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

      // Fallback to standard assignment logic if not transferring
      if (selectedStudent) {
        handleAssign(targetRoom);
      }
    };

  const handleAssign = async (room: any) => {
    if (!selectedStudent) {
      toast.error("Select a resident first");
      return;
    }

    if (room.residents.length >= room.capacity) {
      toast.error("This room is already at capacity");
      return;
    }

    const promise = fetch("/api/admin/hostel/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        roomId: room.id, 
        studentId: selectedStudent.id, // Matches the student model ID
        companyId: schoolId
      }),
    });

    toast.promise(promise, {
      loading: 'Finalizing assignment...',
      success: (data) => {
        // Optimistic UI Update based on your API structure
        setUnassigned(unassigned.filter((s: any) => s.id !== selectedStudent.id));
        setRooms(rooms.map((r: any) => 
          r.id === room.id 
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
      error: "Assignment failed. Please try again."
    });
  };

  const totalAvailableBeds = rooms.reduce((acc: number, r: any) => acc + (r.capacity - r.occupancy), 0);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-6 lg:p-12 font-sans selection:bg-indigo-500/30">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0F172A', color: '#fff', border: '1px solid #1E293B' }}} />
      
      <div className="max-w-7xl mx-auto h-[85vh] flex flex-col">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Deployment Logic</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              Room <span className="text-slate-500">Assignments.</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center gap-4 backdrop-blur-md">
                <div className="relative flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500 relative" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">{totalAvailableBeds} Beds Vacant</span>
             </div>
          </div>
        </header>

        <div className="flex-grow grid grid-cols-12 gap-8 overflow-hidden">
          {/* Left Side: Unassigned Residents */}
          <section className="col-span-12 lg:col-span-4 bg-slate-900/30 border border-slate-800 rounded-[3rem] flex flex-col overflow-hidden backdrop-blur-sm">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <InboxArrowDownIcon className="h-5 w-5" />
                </div>
                <h3 className="font-black text-white text-sm uppercase tracking-tight">Pending Residents</h3>
              </div>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                {unassigned.length}
              </span>
            </div>

            <div className="px-8 py-4 border-b border-slate-800 bg-black/20">
               <div className="relative group">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    className="w-full bg-transparent border-none rounded-xl py-2 pl-10 pr-4 text-xs outline-none text-white placeholder:text-slate-600" 
                    placeholder="Filter by name or ADM..." 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {unassigned
                .filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.idNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((student: any) => (
                <button 
                  key={student.id} 
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-5 border rounded-[2rem] transition-all duration-300 relative overflow-hidden group ${
                    selectedStudent?.id === student.id 
                    ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.02]' 
                    : 'bg-slate-800/20 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <p className="text-sm font-black text-white tracking-tight">{student.name}</p>
                      <p className={`text-[10px] font-bold uppercase mt-1 ${selectedStudent?.id === student.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {student.idNumber}
                      </p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${student.type === 'STAFF' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-400'}`}>
                        {student.type}
                      </span>
                    </div>
                    <ArrowsRightLeftIcon className={`h-5 w-5 transition-transform duration-500 ${selectedStudent?.id === student.id ? 'rotate-180 text-white' : 'text-slate-700'}`} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Right Side: Room Grid */}
          <section className="col-span-12 lg:col-span-8 bg-slate-900/10 border border-slate-800 rounded-[3rem] flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 gap-8 custom-scrollbar">
              {rooms.map((room: any) => {
                const isFull = room.occupancy >= room.capacity;
                return (
                  <div 
                    key={room.id} 
                    className={`group/room bg-slate-900/40 border-[1px] rounded-[2.5rem] p-8 transition-all duration-500 relative ${
                      selectedStudent && !isFull 
                      ? 'border-indigo-500/30 cursor-pointer hover:bg-indigo-500/5 hover:border-indigo-500 hover:shadow-2xl' 
                      : 'border-slate-800 shadow-inner'
                    }`}
                    onClick={() => selectedStudent && !isFull && handleAssign(room)}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-3xl font-black text-white italic tracking-tighter group-hover/room:text-indigo-400 transition-colors">
                          {room.roomNumber}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{room.wing} Wing</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Floor {room.floor}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-2xl ${isFull ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <UserGroupIcon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Active Residents */}
                      {/* Inside the room.residents.map loop */}
                      {room.residents.map((res: any, i: number) => (
                        <div 
                          key={i} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransferSource({
                              allocationId: res.allocationId,
                              studentName: res.name,
                              fromRoomId: room.id
                            });
                            setSelectedStudent(null); // Clear normal selection
                            toast.success(`Moving ${res.name}. Select a new room.`, { icon: '🔄' });
                          }}
                          className={`group/resident p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            transferSource?.allocationId === res.allocationId
                            ? 'bg-amber-500/20 border-amber-500 shadow-lg'
                            : 'border-indigo-500/10 bg-indigo-500/5 hover:border-amber-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${transferSource?.allocationId === res.allocationId ? 'bg-amber-400 animate-pulse' : 'bg-indigo-400'}`} />
                            <span className="text-xs font-black text-white uppercase tracking-tight">{res.name}</span>
                          </div>
                          <ArrowsRightLeftIcon className="h-4 w-4 text-amber-500 opacity-0 group-hover/resident:opacity-100 transition-opacity" />
                        </div>
                      ))}

                      {/* {room.residents.map((res: any, i: number) => (
                        <div key={i} className="group/resident p-4 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-indigo-400" />
                            <span className="text-xs font-black text-white uppercase tracking-tight">{res.name}</span>
                          </div>
                          <CheckBadgeIcon className="h-4 w-4 text-indigo-400 opacity-40" />
                        </div>
                      ))} */}

                      {/* Ghost Slots for empty capacity */}
                      {Array.from({ length: room.capacity - room.occupancy }).map((_, i) => (
                        <div key={i} className={`p-4 rounded-2xl border border-dashed flex items-center justify-between transition-colors ${selectedStudent ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-slate-800'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest italic ${selectedStudent ? 'text-indigo-400 animate-pulse' : 'text-slate-700'}`}>
                            {selectedStudent ? "Deploy Here" : "Vacant Slot"}
                          </span>
                          <PlusCircleIcon className={`h-5 w-5 ${selectedStudent ? 'text-indigo-500' : 'text-slate-800'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RoomAssignmentsClient;