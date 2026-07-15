"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  MapIcon, ClockIcon, UserGroupIcon, ChevronDownIcon,
  FlagIcon, ArrowsUpDownIcon, TrashIcon,
  CogIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "@heroicons/react/24/outline";

interface RouteStop {
  time: string;
  location: string;
  type: 'Start' | 'Pickup' | 'Dropoff' | 'Rest';
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
  const [routes, setRoutes] = useState<TransportRoute[]>(initialRoutes);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  
  // Edit State Tracker
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [stops, setStops] = useState<{time: string, location: string, type: string}[]>([]);

  // Sync / set light and dark theme classes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Open modal in creation mode
  const handleCreateOpen = () => {
    setEditingRouteId(null);
    setName("");
    setStartPoint("");
    setEndPoint("");
    setStops([]);
    setIsModalOpen(true);
  };

  // Open modal in editing mode preloaded with target route data
  const handleEditOpen = (route: TransportRoute) => {
    setEditingRouteId(route.id);
    setName(route.name);
    setStartPoint(route.startPoint);
    setEndPoint(route.endPoint);
    const parsedStops = Array.isArray(route.stops) ? route.stops : [];
    setStops(parsedStops.map((stop: any) => ({
      time: stop.time || "07:00",
      location: stop.location || "",
      type: stop.type || "Pickup"
    })));
    setIsModalOpen(true);
  };

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

  // Reorder stops inside the creator dynamically
  const moveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stops.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reorderedStops = [...stops];
    const temp = reorderedStops[index];
    reorderedStops[index] = reorderedStops[targetIndex];
    reorderedStops[targetIndex] = temp;
    setStops(reorderedStops);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEditing = !!editingRouteId;
    const endpoint = isEditing 
      ? `/api/admin/transport/routes/${editingRouteId}`
      : `/api/admin/transport/routes`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method: method,
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
        if (isEditing) {
          setRoutes(routes.map(r => r.id === editingRouteId ? result.data : r));
          toast.success("Route architecture updated successfully.");
        } else {
          setRoutes([result.data, ...routes]);
          toast.success("New route architecture deployed.");
        }
        setIsModalOpen(false);
        // Reset form
        setName(""); setStartPoint(""); setEndPoint(""); setStops([]);
        setEditingRouteId(null);
      } else {
        toast.error(result.error || "Failed to process route action.");
      }
    } catch (err) {
      toast.error("Failed to save route configuration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this route?")) return;
    
    try {
      const res = await fetch(`/api/admin/transport/routes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRoutes(routes.filter(r => r.id !== id));
        toast.success("Route decommissioned successfully");
      }
    } catch (err) {
      toast.error("Decommissioning failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Navigation & Scheduling</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Route <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Architecture.</span>
            </h1>
          </div>

          <div className="flex gap-3 items-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl transition-all shadow-sm active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-600" />
              )}
            </button>

            <button 
              onClick={handleCreateOpen}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-500/10 dark:shadow-blue-500/20 active:scale-95"
            >
              <MapIcon className="h-4 w-4 stroke-[3px]" />
              Create Route
            </button>
          </div>
        </header>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 gap-6">
          {routes.map((route) => {
            const parsedStops: RouteStop[] = Array.isArray(route.stops) ? route.stops : [];
            const isExpanded = expandedRoute === route.id;
            
            return (
              <div 
                key={route.id} 
                className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden transition-all shadow-sm dark:shadow-none border-l-4 hover:border-l-blue-500 dark:hover:border-l-blue-500 ${
                  isExpanded ? 'border-l-blue-500' : 'border-l-transparent'
                }`}
              >
                {/* Header of Route Card */}
                <div 
                  className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors"
                  onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                      <FlagIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">{route.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{route.startPoint} → {route.endPoint}</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <UserGroupIcon className="h-3.5 w-3.5" />
                          {route._count?.assignments || 0} Assigned
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Primary Vehicle</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">{route.vehicle?.registration || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Route Trigger Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditOpen(route); }}
                        className="p-3 bg-slate-50 hover:bg-blue-50 dark:bg-transparent dark:hover:bg-blue-500/20 text-slate-400 hover:text-blue-600 dark:text-slate-600 dark:hover:text-blue-400 rounded-xl transition-all"
                        title="Edit Route Blueprint"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>

                      {/* Delete Route Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(route.id); }}
                        className="p-3 bg-slate-50 hover:bg-rose-50 dark:bg-transparent dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-500 rounded-xl transition-all"
                        title="Decommission Route"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <ChevronDownIcon className={`h-6 w-6 text-slate-400 dark:text-slate-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Waypoints Timeline */}
                {isExpanded && (
                  <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="relative space-y-8 mt-4 ml-2">
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-slate-200 dark:to-slate-800" />

                      {parsedStops.map((stop, index) => (
                        <div key={index} className="relative flex items-start gap-8 group">
                          <div className={`mt-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-[#05070A] z-10 shadow-sm ${
                            stop.type === 'Start' ? 'bg-blue-500' : stop.type === 'Dropoff' ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-700'
                          }`} />

                          <div className="flex-grow flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/30">
                            <div className="flex items-center gap-6">
                              <div className="text-center min-w-[70px]">
                                <ClockIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                                <p className="text-xs font-black text-slate-800 dark:text-white">{stop.time}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{stop.type}</p>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200">{stop.location}</h4>
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


      {/* --- ADD / EDIT ROUTE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {editingRouteId ? "Configure Blueprint" : "Route Blueprint"}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingRouteId ? "Adjust existing paths, timesteps, and dynamic checkpoints." : "Define path, timing, and sequence for the fleet."}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <XMarkIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Route Identifier / Name</label>
                  <input 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-all" 
                    placeholder="e.g. North Circuit Express" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departure (Start)</label>
                  <input 
                    required 
                    value={startPoint} 
                    onChange={e => setStartPoint(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-all" 
                    placeholder="Main Depot" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Destination (End)</label>
                  <input 
                    required 
                    value={endPoint} 
                    onChange={e => setEndPoint(e.target.value)} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-slate-900 dark:text-white focus:border-blue-500 outline-none transition-all" 
                    placeholder="School Gate" 
                  />
                </div>
              </div>

              {/* Dynamic Stop Builder */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                    Waypoints & Stops
                  </h3>
                  <button 
                    type="button" 
                    onClick={addStopField}
                    className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase hover:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <PlusIcon className="h-3 w-3 stroke-[3px]" /> Add Stop
                  </button>
                </div>

                <div className="space-y-3">
                  {stops.map((stop, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-2 duration-200 items-stretch md:items-center">
                      
                      {/* Sort Sequence controls */}
                      <div className="flex md:flex-col gap-1 items-center justify-between md:justify-center px-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveStop(index, 'up')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 rounded-md transition-all"
                        >
                          <ArrowUpIcon className="h-3 w-3 stroke-[3px]" />
                        </button>
                        <button
                          type="button"
                          disabled={index === stops.length - 1}
                          onClick={() => moveStop(index, 'down')}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 text-slate-500 rounded-md transition-all"
                        >
                          <ArrowDownIcon className="h-3 w-3 stroke-[3px]" />
                        </button>
                      </div>

                      <input 
                        type="time" 
                        value={stop.time} 
                        onChange={e => updateStop(index, 'time', e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                      <input 
                        placeholder="Stop Location Name" 
                        value={stop.location} 
                        onChange={e => updateStop(index, 'location', e.target.value)}
                        className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                      />
                      <div className="relative">
                        <select 
                          value={stop.type} 
                          onChange={e => updateStop(index, 'type', e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none appearance-none pr-8 cursor-pointer w-full"
                        >
                          <option value="Pickup">Pickup</option>
                          <option value="Dropoff">Dropoff</option>
                          <option value="Rest">Rest Stop</option>
                        </select>
                        <ChevronDownIcon className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeStopField(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors self-end md:self-center"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {stops.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 dark:text-slate-600 text-xs">
                      No intermediate stops defined. Add one to begin sequence.
                    </div>
                  )}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-500/15 dark:shadow-none"
              >
                {isSubmitting ? (
                  <CogIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <MapIcon className="h-5 w-5" /> 
                    {editingRouteId ? "Deploy Adjustments" : "Deploy Route"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      
    </main>
  );
};

export default TransportRoutesClient;