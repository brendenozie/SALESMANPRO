"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ShieldExclamationIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function IncidentPageClient({
  initialIncidents = [],
  companyId,
}: {
  initialIncidents: any[];
  companyId: string;
}) {
  const [incidents, setIncidents] = useState<any[]>(initialIncidents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newIncident, setNewIncident] = useState({
    type: "MECHANICAL_BREAKDOWN",
    severity: "MEDIUM",
    description: "",
  });

  const getSeverityStyles = (level: string) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
      case "CRITICAL":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.description.trim()) {
      toast.error("Please enter incident details");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/transport/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          ...newIncident,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to log incident");
      }

      setIncidents([data.data, ...incidents]);
      toast.success("Incident logged successfully");
      setIsModalOpen(false);
      setNewIncident({
        type: "MECHANICAL_BREAKDOWN",
        severity: "MEDIUM",
        description: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Error submitting incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Emergency Alert Glow */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/40 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">Safety & Compliance Watch</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Incident <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">Reports.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40"
          >
            <ShieldExclamationIcon className="h-4 w-4" />
            Report New Incident
          </button>
        </header>

        {/* Incident Summary Grid */}
        {incidents.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Incidents Logged</h3>
            <p className="text-xs text-slate-400 mt-1">Fleet operating within standard safety tolerances.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
            {incidents.map((inc) => (
              <div key={inc.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getSeverityStyles(inc.severity)}`}>
                    {inc.severity || "MEDIUM"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(inc.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-2">{inc.type?.replace(/_/g, " ")}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{inc.description}</p>

                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Status: <strong className="text-white">{inc.status || "OPEN"}</strong></span>
                  {inc.vehicle && (
                    <span>Unit: <strong className="text-cyan-400">{inc.vehicle.plateNumber}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase">Log Incident Report</h3>
                <p className="text-xs text-slate-400">Record a fleet or delivery operational disruption</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Incident Type</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                >
                  <option value="MECHANICAL_BREAKDOWN">Mechanical Breakdown</option>
                  <option value="TRAFFIC_ACCIDENT">Traffic Accident / Collision</option>
                  <option value="PACKAGE_DAMAGED">Package Damaged / Tampered</option>
                  <option value="ROUTE_DEVIATION">Severe Delay / Route Deviation</option>
                  <option value="WEATHER_HAZARD">Weather Hazard / Impassable</option>
                  <option value="OTHER">Other Operational Disruption</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Severity Rating</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setNewIncident({ ...newIncident, severity: sev })}
                      className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        newIncident.severity === sev
                          ? "bg-rose-500/20 border-rose-500 text-rose-300"
                          : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Detailed Incident Description *</label>
                <textarea
                  rows={4}
                  required
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500"
                  placeholder="Describe location, vehicle condition, and actions taken..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 disabled:opacity-50"
                >
                  {submitting ? "Logging..." : "Submit Incident Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}