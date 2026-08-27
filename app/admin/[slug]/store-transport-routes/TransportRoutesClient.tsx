"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  MapIcon, ClockIcon, TruckIcon, ChevronDownIcon,
  FlagIcon, TrashIcon,
  CogIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";

interface RouteStop {
  time: string;
  location: string;
  type: 'Loading' | 'Unloading' | 'Checkpoint' | 'Rest';
}

interface TransportRoute {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: any; 
  vehicleId?: string;
  vehicle?: { registration: string };
  _count?: { assignments: number }; // Number of pending deliveries
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
    setStops([...stops, { time: "08:00", location: "", type: "Unloading" }]);
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
        body: JSON.stringify({ name, startPoint, endPoint, stops, companyId: schoolId }),
      });
      const result = await res.json();
      if (result.success) {
        setRoutes([result.data, ...routes]);
        toast.success("Logistics route deployed.");
        setIsModalOpen(false);
        setName(""); setStartPoint(""); setEndPoint(""); setStops([]);
      }
    } catch (err) {
      toast.error("Failed to save route.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this supply route?")) return;
    try {
      const res = await fetch(`/api/admin/transport/routes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoutes(routes.filter(r => r.id !== id));
        toast.success("Route removed from supply chain");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-600 rounded-full" />
              <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Supply Chain Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Architecture.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <MapIcon className="h-4 w-4 stroke-[3px]" />
            Create Supply Route
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {routes.map((route) => {
            const parsedStops: RouteStop[] = Array.isArray(route.stops) ? route.stops : [];
            
            return (
              <div key={route.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none border-l-4 border-l-transparent hover:border-l-blue-600">
                <div 
                  className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                  onClick={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                      <TruckIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{route.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-tighter">{route.startPoint} → {route.endPoint}</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <ArchiveBoxIcon className="h-3.5 w-3.5" />
                          {route._count?.assignments || 0} Deliveries
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Lorry</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">{route.vehicle?.registration || 'None Assigned'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(route.id); }}
                        className="p-2 bg-slate-100 dark:bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <ChevronDownIcon className={`h-6 w-6 text-slate-400 transition-transform ${expandedRoute === route.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {expandedRoute === route.id && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative space-y-8 mt-4 ml-2">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-600 to-slate-200 dark:to-slate-800" />

                      {parsedStops.map((stop, index) => (
                        <div key={index} className="relative flex items-start gap-8 group">
                          <div className={`mt-1.5 h-6 w-6 rounded-full border-4 border-slate-50 dark:border-[#05070A] z-10 ${
                            stop.type === 'Loading' ? 'bg-emerald-500' : stop.type === 'Unloading' ? 'bg-blue-600' : 'bg-slate-400'
                          }`} />

                          <div className="flex-grow flex justify-between items-center bg-slate-100/50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/30">
                            <div className="flex items-center gap-6">
                              <div className="text-center min-w-[70px]">
                                <ClockIcon className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                                <p className="text-xs font-black text-slate-900 dark:text-white">{stop.time}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase">{stop.type}</p>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{stop.location}</h4>
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
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Route Blueprint</h2>
                <p className="text-xs text-slate-500">Define logistics path and unload points for supermarket branches.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Route Name (e.g. Fresh Produce North)</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Departure (Warehouse)</label>
                  <input required value={startPoint} onChange={e => setStartPoint(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Final Destination</label>
                  <input required value={endPoint} onChange={e => setEndPoint(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-blue-600" />
                    Delivery Waypoints
                  </h3>
                  <button type="button" onClick={addStopField} className="text-[10px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1">
                    <PlusIcon className="h-3 w-3" /> Add Waypoint
                  </button>
                </div>

                <div className="space-y-3">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-2 duration-200">
                      <input type="time" value={stop.time} onChange={e => updateStop(index, 'time', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600" />
                      <input placeholder="Branch or Station Name" value={stop.location} onChange={e => updateStop(index, 'location', e.target.value)} className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-600" />
                      <select value={stop.type} onChange={e => updateStop(index, 'type', e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none">
                        <option value="Loading">Loading</option>
                        <option value="Unloading">Unloading</option>
                        <option value="Checkpoint">Checkpoint</option>
                        <option value="Rest">Driver Rest</option>
                      </select>
                      <button type="button" onClick={() => removeStopField(index)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {stops.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
                      Direct route with no intermediate branch stops.
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 dark:disabled:bg-slate-800"
              >
                {isSubmitting ? <CogIcon className="h-5 w-5 animate-spin" /> : <><MapIcon className="h-5 w-5" /> Deploy Supply Route</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TransportRoutesClient;