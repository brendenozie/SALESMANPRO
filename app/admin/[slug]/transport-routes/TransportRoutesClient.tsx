"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  MapIcon, ClockIcon, UserGroupIcon, ChevronDownIcon,
  FlagIcon, ArrowsUpDownIcon, TrashIcon,
  CogIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface RouteStop {
  time: string;
  location: string;
  type: 'Start' | 'Pickup' | 'Dropoff';
  students?: number;
}

interface TransportRoute {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: any; // Json from Prisma
  vehicleId?: string;
  vehicle?: { registration: string };
  _count?: { assignments: number };
}

const TransportRoutesClient = ({ initialRoutes, schoolId }: { initialRoutes: TransportRoute[], schoolId: string }) => {
  const [routes, setRoutes] = useState(initialRoutes);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [stops, setStops] = useState<{time: string, location: string, type: string}[]>([]);

  const addStopField = () => {
    setStops([...stops, { time: "07:00", location: "", type: "Pickup" }]);
  };

  const removeStopField = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/transport/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          startPoint,
          endPoint,
          stops,
          companyId: schoolId
        }),
      });

      const result = await res.json();
      if (result.success) {
        setRoutes([result.data, ...routes]);
        toast.success("New route architecture deployed.");
        setIsModalOpen(false);
        // Reset form
        setName(""); setStartPoint(""); setEndPoint(""); setStops([]);
      }
    } catch (err) {
      toast.error("Failed to save route.");
    } finally {
      setIsSubmitting(false);
    }
  };

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this route?")) return;
  
  try {
    const res = await fetch(`/api/admin/transport/routes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRoutes(routes.filter(r => r.id !== id));
      toast.success("Route decommissioned");
    }
  } catch (err) {
    toast.error("Delete failed");
  }
};

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Navigation & Scheduling</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Architecture.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            {/* <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all">
              <MapIcon className="h-4 w-4" />
              New Route
            </button> */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all"
            >
              <MapIcon className="h-4 w-4 stroke-[3px]" />
              Create Route
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {routes.map((route) => {
            const parsedStops: RouteStop[] = Array.isArray(route.stops) ? route.stops : [];
            
            return (
              <div key={route.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden transition-all border-l-4 border-l-transparent hover:border-l-blue-500">
                <div 
                  className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
                      <FlagIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{route.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-mono text-slate-500">{route.startPoint} → {route.endPoint}</span>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                          <UserGroupIcon className="h-3.5 w-3.5" />
                          {route._count?.assignments || 0} Assigned
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Primary Vehicle</p>
                      <p className="text-sm font-black text-slate-200">{route.vehicle?.registration || 'Unassigned'}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(route.id); }}
                      className="p-2 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-xl transition-all"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <ChevronDownIcon className={`h-6 w-6 text-slate-600 transition-transform ${expandedRoute === route.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedRoute === route.id && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative space-y-8 mt-4 ml-2">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 to-slate-800" />

                      {parsedStops.map((stop, index) => (
                        <div key={index} className="relative flex items-start gap-8 group">
                          <div className={`mt-1.5 h-6 w-6 rounded-full border-4 border-[#05070A] z-10 ${
                            stop.type === 'Start' ? 'bg-blue-500' : stop.type === 'Dropoff' ? 'bg-indigo-500' : 'bg-slate-700'
                          }`} />

                          <div className="flex-grow flex justify-between items-center bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30">
                            <div className="flex items-center gap-6">
                              <div className="text-center min-w-[70px]">
                                <ClockIcon className="h-4 w-4 text-slate-500 mx-auto mb-1" />
                                <p className="text-xs font-black text-white">{stop.time}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase">{stop.type}</p>
                                <h4 className="font-bold text-slate-200">{stop.location}</h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


      {/* --- ADD ROUTE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-[#0F1115] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">Route Blueprint</h2>
                <p className="text-xs text-slate-500">Define path, timing, and sequence for the fleet.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Route Identifier / Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-500 outline-none" placeholder="e.g. North Circuit Express" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Departure (Start)</label>
                  <input required value={startPoint} onChange={e => setStartPoint(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-500 outline-none" placeholder="Main Depot" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Destination (End)</label>
                  <input required value={endPoint} onChange={e => setEndPoint(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:border-blue-500 outline-none" placeholder="School Gate" />
                </div>
              </div>

              {/* Dynamic Stop Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-blue-500" />
                    Waypoints & Stops
                  </h3>
                  <button 
                    type="button" 
                    onClick={addStopField}
                    className="text-[10px] font-black text-blue-500 uppercase hover:text-blue-400 flex items-center gap-1"
                  >
                    <PlusIcon className="h-3 w-3" /> Add Stop
                  </button>
                </div>

                <div className="space-y-3">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 bg-black/40 p-4 rounded-2xl border border-slate-800 animate-in slide-in-from-left-2 duration-200">
                      <input 
                        type="time" 
                        value={stop.time} 
                        onChange={e => updateStop(index, 'time', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <input 
                        placeholder="Stop Location Name" 
                        value={stop.location} 
                        onChange={e => updateStop(index, 'location', e.target.value)}
                        className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <select 
                        value={stop.type} 
                        onChange={e => updateStop(index, 'type', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      >
                        <option value="Pickup">Pickup</option>
                        <option value="Dropoff">Dropoff</option>
                        <option value="Rest">Rest Stop</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={() => removeStopField(index)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {stops.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 text-xs">
                      No intermediate stops defined. Add one to begin sequence.
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <CogIcon className="h-5 w-5 animate-spin" /> : <><MapIcon className="h-5 w-5" /> Deploy Route</>}
              </button>
            </form>
          </div>
        </div>
      )}
      
    </main>
  );
};

export default TransportRoutesClient;