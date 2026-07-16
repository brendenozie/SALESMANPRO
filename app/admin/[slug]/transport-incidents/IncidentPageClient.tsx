"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ExclamationTriangleIcon, 
  LifebuoyIcon, 
  ShieldExclamationIcon,
  ChatBubbleBottomCenterTextIcon,
  VideoCameraIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  DocumentTextIcon,
  SunIcon,
  MoonIcon
} from "@heroicons/react/24/outline";

interface Incident {
  id: string;
  date: string;
  bus: string;
  type: string;
  severity: "High" | "Medium" | "Low";
  status: "Under Investigation" | "Resolved" | "Logged";
  driver: string;
  notes?: string;
  hasVideo?: boolean;
  hasPhotos?: boolean;
}

const IncidentPageClient = () => {
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Synchronize layout styling variables on load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Main Incidents State
  const [incidents, setIncidents] = useState<Incident[]>([
    { 
      id: 'INC-901', 
      date: '2026-01-14', 
      bus: 'BUS-202', 
      type: 'Minor Collision', 
      severity: 'Medium', 
      status: 'Under Investigation', 
      driver: 'Jane Cooper',
      notes: 'Fender bender near North Intersection. No injuries reported. Police report filed.',
      hasVideo: true,
      hasPhotos: true
    },
    { 
      id: 'INC-882', 
      date: '2026-01-12', 
      bus: 'BUS-101', 
      type: 'Engine Smoking', 
      severity: 'High', 
      status: 'Resolved', 
      driver: 'Robert Fox',
      notes: 'White smoke from manifold. Vehicle safely evacuated. Replacement dispatched within 12 minutes.',
      hasVideo: false,
      hasPhotos: true
    },
    { 
      id: 'INC-875', 
      date: '2026-01-08', 
      bus: 'VAN-03', 
      type: 'Route Deviation', 
      severity: 'Low', 
      status: 'Logged', 
      driver: 'Cody Fisher',
      notes: 'Unplanned detour due to standard road closure on Elm St. Logged for compliance tracking.',
      hasVideo: true,
      hasPhotos: false
    },
  ]);

  // Modal & Form State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("All");

  const [newIncident, setNewIncident] = useState({
    bus: "",
    type: "",
    severity: "Medium" as "High" | "Medium" | "Low",
    status: "Logged" as "Under Investigation" | "Resolved" | "Logged",
    driver: "",
    notes: ""
  });

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'High': 
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium': 
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: 
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `INC-${Math.floor(100 + Math.random() * 900)}`;
    const created: Incident = {
      id: generatedId,
      date: new Date().toISOString().split('T')[0],
      ...newIncident,
      hasVideo: Math.random() > 0.5,
      hasPhotos: Math.random() > 0.3
    };

    setIncidents([created, ...incidents]);
    setIsReportModalOpen(false);
    toast.success(`${generatedId} successfully logged to Safety Center`);
    
    // Reset Form
    setNewIncident({
      bus: "",
      type: "",
      severity: "Medium",
      status: "Logged",
      driver: "",
      notes: ""
    });
  };

  const handleStatusUpdate = (id: string, nextStatus: any) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: nextStatus } : inc));
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(prev => prev ? { ...prev, status: nextStatus } : null);
    }
    toast.success(`Case status synchronized: ${nextStatus}`);
  };

  // Filtered and searched data
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.driver.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inc.bus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === "All" || inc.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      {/* Emergency Alert Ambient Glow */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent -z-10 animate-pulse" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-rose-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">Safety & Compliance Watch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Incident <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Reports.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 self-stretch lg:self-auto justify-end">
            {/* Sun/Moon Theme Switcher */}
            {/* <button 
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Theme Mode"
              className="p-3 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800/80 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl transition-all shadow-sm"
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button> */}

            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-rose-950/20 dark:shadow-rose-950/50 hover:shadow-rose-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ShieldExclamationIcon className="h-5 w-5" />
              Report New Incident
            </button>
          </div>
        </header>

        {/* Dashboard Filters & Search Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white border border-slate-200/80 dark:bg-slate-900/20 dark:border-slate-800/80 p-4 rounded-3xl shadow-sm">
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            <input 
              type="text"
              placeholder="Search driver, vehicle, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800/80 rounded-2xl py-3 pl-11 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <FunnelIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400 mr-2 font-semibold">Filter Severity:</span>
            {["All", "High", "Medium", "Low"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterSeverity(level)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  filterSeverity === level 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" 
                    : "bg-white border-slate-200 dark:bg-black/20 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Incident Cards Grid */}
        {filteredIncidents.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
            {filteredIncidents.map((inc) => (
              <div 
                key={inc.id} 
                className="bg-white border border-slate-200 dark:bg-slate-900/30 dark:border-slate-800/80 rounded-[2rem] p-6 relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border tracking-wider ${getSeverityStyles(inc.severity)}`}>
                      {inc.severity} Severity
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-bold">{inc.id}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{inc.type}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-rose-500" />
                    Bus <strong className="text-slate-700 dark:text-slate-200">{inc.bus}</strong> • {inc.driver}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800/50 rounded-2xl p-3">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-xs font-black ${
                        inc.status === "Resolved" ? "text-emerald-600 dark:text-emerald-400" : inc.status === "Under Investigation" ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
                      }`}>{inc.status}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800/50 rounded-2xl p-3 text-right">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Incident Date</p>
                      <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{inc.date}</p>
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toast.success(inc.hasVideo ? "Streaming DVR dash footage..." : "No camera logs attached.")}
                      title={inc.hasVideo ? "View DVR footage" : "No footage available"} 
                      className={`p-2.5 rounded-xl transition-all ${
                        inc.hasVideo ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20" : "bg-slate-100 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      <VideoCameraIcon className="h-4.5 w-4.5" />
                    </button>
                    <button 
                      onClick={() => toast.success(inc.hasPhotos ? "Loading high-resolution asset attachments..." : "No image assets attached.")}
                      title={inc.hasPhotos ? "View photographs" : "No photos available"} 
                      className={`p-2.5 rounded-xl transition-all ${
                        inc.hasPhotos ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20" : "bg-slate-100 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      <PhotoIcon className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setSelectedIncident(inc)}
                    className="flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase text-rose-500 dark:text-rose-400 hover:text-rose-400 dark:hover:text-rose-300 transition-colors"
                  >
                    Case File →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-800 rounded-[2rem] p-16 text-center mb-12 shadow-sm">
            <ExclamationTriangleIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold italic text-sm">No incidents match the active search criteria.</p>
          </div>
        )}

        {/* Protocol & Resources Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 dark:from-slate-900/60 dark:to-black/80 dark:border-slate-800/80 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <LifebuoyIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              Emergency Response Protocols
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Immediate Driver Safety Check', desc: 'Secure status confirmation via telemetry radio.' },
                { title: 'Contact Emergency Dispatch', desc: 'Alert local fire, medical, or towing teams as required.' },
                { title: 'Parental Notifications', desc: 'Broadcast automated text alerts to safety contacts.' },
                { title: 'Dispatch Relief Vehicle', desc: 'Deploy nearest hot-standby unit to continue transport route.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-200 dark:bg-slate-800/20 dark:border-slate-800/30 rounded-2xl">
                  <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-black text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 dark:bg-slate-900/10 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
            <div>
              <ChatBubbleBottomCenterTextIcon className="h-10 w-10 text-rose-500 mb-6" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Live Supervisor Feedback</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "The response timeframe logged on the Jan 12th engine issue demonstrated maximum operational compliance. The emergency bus switch completed within 12 minutes, keeping the secondary route delay negligible."
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Audited by Safety Council</span>
              </div>
              <button 
                onClick={() => toast.success("Retrieving full compliance historical records...")}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors"
              >
                View Compliance Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: REPORT NEW INCIDENT --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 dark:bg-black/85 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)} />
          <div className="relative bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">Report Fleet Incident</h2>
                <p className="text-xs text-rose-500 uppercase tracking-wider font-bold mt-1">Submit Incident Report immediately</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Driver Name</label>
                  <input 
                    type="text" required placeholder="e.g. Jane Cooper"
                    value={newIncident.driver}
                    onChange={(e) => setNewIncident({...newIncident, driver: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Vehicle Registration</label>
                  <input 
                    type="text" required placeholder="e.g. BUS-202"
                    value={newIncident.bus}
                    onChange={(e) => setNewIncident({...newIncident, bus: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Incident Category</label>
                  <input 
                    type="text" required placeholder="e.g. Engine Overheat"
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Severity Class</label>
                  <select 
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({...newIncident, severity: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-300 outline-none focus:border-rose-500"
                  >
                    <option value="Low">Low Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Detailed Narrative</label>
                <textarea 
                  rows={4} required placeholder="State exact occurrence, immediate responses handled and present vehicle condition..."
                  value={newIncident.notes}
                  onChange={(e) => setNewIncident({...newIncident, notes: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-xs text-white uppercase shadow-lg shadow-rose-900/20 dark:shadow-rose-900/40"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: INTERACTIVE CASE FILE --- */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 dark:bg-black/85 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />
          <div className="relative bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl text-slate-900 dark:text-slate-200">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-8 w-8 text-rose-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Case: {selectedIncident.id}</h2>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border tracking-widest uppercase ${getSeverityStyles(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Dispatched: {selectedIncident.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 dark:bg-black/40 dark:border-slate-800/80 p-4 rounded-2xl text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Category</p>
                  <p className="font-extrabold text-slate-800 dark:text-white mt-1">{selectedIncident.type}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Route Unit</p>
                  <p className="font-extrabold text-slate-800 dark:text-white mt-1">{selectedIncident.bus}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Driver</p>
                  <p className="font-extrabold text-slate-800 dark:text-white mt-1">{selectedIncident.driver}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">File Status</p>
                  <p className="font-extrabold text-rose-500 dark:text-rose-400 mt-1">{selectedIncident.status}</p>
                </div>
              </div>

              {/* Driver Logs/Narratives */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Detailed Statement Narrative</p>
                <div className="bg-slate-50 border border-slate-200 dark:bg-black/20 dark:border-slate-800/60 p-4 rounded-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedIncident.notes || "No statements or operator commentary entered."}
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Update Case State</p>
                <div className="flex gap-2">
                  {(["Logged", "Under Investigation", "Resolved"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusUpdate(selectedIncident.id, st)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                        selectedIncident.status === st 
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400" 
                          : "bg-slate-50 border-slate-200 dark:bg-black/20 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-400"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* History Auditing Line */}
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Audit Compliance Steps</p>
                <div className="space-y-4 text-xs">
                  <div className="flex gap-3">
                    <ClockIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-800 dark:text-white font-bold">Safety Log Generated</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Automatic verification via fleet blackbox telemetry on {selectedIncident.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <ClockIcon className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-800 dark:text-white font-bold">Driver Debrief Conducted</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5">Coordinated interview with safety team logged and cataloged</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default IncidentPageClient;