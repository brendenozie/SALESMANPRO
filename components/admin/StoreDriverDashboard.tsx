"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import {
  UserCircleIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckBadgeIcon,
  Squares2X2Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon, PlayIcon as PlaySolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

// --- Types ---
type Coords = { lat: number; lng: number };

interface DeliveryItem {
  id: string;
  trackingNumber: string;
  status: string;
  customerName: string;
  customerContact: string | null;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  packageDescription: string;
  packageWeightKg: number;
  totalDistanceKm?: number;
  estimatedTravelTime?: number;
  scheduledFor: string;
  notes: string | null;
  vehicle: string | null;
  hasProof: boolean;
  proof: any;
}

interface DriverProfile {
  id: string;
  name: string;
  email: string | null;
  vehicle: any;
  status: string;
  stats: {
    activeDeliveries: number;
    completedToday: number;
    rating: number;
  };
}

// Fallback coordinates for tactical map if geocodes are missing
const DEFAULT_START: Coords = { lat: -1.286389, lng: 36.817223 };
const DEFAULT_END: Coords = { lat: -1.292066, lng: 36.821945 };

// --- Tactical Map Engine ---
const MapModule = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Circle, Polyline, useMap } = await import("react-leaflet");
    const L = await import("leaflet");

    const MapRecenter = ({ coords }: { coords: [number, number] }) => {
      const map = useMap();
      useEffect(() => {
        map.setView(coords, map.getZoom(), { animate: true });
      }, [coords, map]);
      return null;
    };

    return ({ progress, start, end }: { progress: number; start: Coords; end: Coords }) => {
      const currentPos: [number, number] = [
        start.lat + (end.lat - start.lat) * (progress / 100),
        start.lng + (end.lng - start.lng) * (progress / 100),
      ];

      const calculateBearing = (s: Coords, e: Coords) => {
        const y = Math.sin(e.lng - s.lng) * Math.cos(e.lat);
        const x = Math.cos(s.lat) * Math.sin(e.lat) - Math.sin(s.lat) * Math.cos(e.lat) * Math.cos(e.lng - s.lng);
        return (Math.atan2(y, x) * 180) / Math.PI;
      };

      const bearing = calculateBearing(start, end);

      const truckIcon = L.divIcon({
        className: "custom-icon",
        html: `<div style="transform: rotate(${bearing}deg); transition: transform 0.2s ease-out;" 
                    class="bg-cyan-500 p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.8)] border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="white" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m0-11.25h-4.875c-.621 0-1.125.504-1.125 1.125V18" />
                </svg>
              </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      return (
        <div className="h-full w-full relative">
          <MapContainer center={currentPos} zoom={15} zoomControl={false} className="h-full w-full grayscale brightness-[0.7] contrast-[1.2]">
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            <MapRecenter coords={currentPos} />
            <Polyline
              positions={[[start.lat, start.lng], [end.lat, end.lng]]}
              pathOptions={{ color: "#22d3ee", weight: 8, opacity: 0.1 }}
            />
            <Polyline
              positions={[[start.lat, start.lng], [end.lat, end.lng]]}
              pathOptions={{ color: "#22d3ee", weight: 2, dashArray: "12, 12", opacity: 0.6 }}
            />
            <Circle
              center={[end.lat, end.lng]}
              radius={100}
              pathOptions={{ color: "#06b6d4", weight: 2, fillOpacity: 0.2, dashArray: "5, 5" }}
            />
            <Marker position={[end.lat, end.lng]} />
            <Circle
              center={[start.lat, start.lng]}
              radius={40}
              pathOptions={{ color: "#475569", weight: 1, fillOpacity: 0.1 }}
            />
            <Marker position={currentPos} icon={truckIcon} />
          </MapContainer>

          <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em]">GPS Telemetry</p>
              </div>
              <p className="font-mono text-[10px] text-white/80 leading-tight">
                POS: {currentPos[0].toFixed(4)}, {currentPos[1].toFixed(4)}<br />
                HDG: {bearing.toFixed(1)}°
              </p>
            </div>
          </div>
        </div>
      );
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest">Establishing Uplink...</p>
      </div>
    ),
  }
);

export default function StoreDriverDashboard({
  companyId,
  currentUserId,
}: {
  companyId: string;
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState<"hub" | "profile">("hub");
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryItem | null>(null);
  const [workflowStep, setWorkflowStep] = useState<"navigating" | "completing" | "exception" | "summary">("navigating");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch driver assignments
  const loadDriverDeliveries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/driver/deliveries?filter=all");
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries || []);
        if (data.driver) {
          setDriverProfile(data.driver);
        }
      }
    } catch (err) {
      console.error("Failed to load driver deliveries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverDeliveries();
  }, []);

  // Simulation Engine
  useEffect(() => {
    let interval: any;
    if (isSimulating && workflowStep === "navigating" && currentDelivery) {
      interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev >= 100) {
            setIsSimulating(false);
            setWorkflowStep("completing");
            toast.success("Arrival: Target Destination Reached", {
              icon: <CheckBadgeIcon className="w-5 h-5 text-cyan-400" />,
              style: { background: "#0F172A", color: "#fff", border: "1px solid #1E293B" },
            });
            return 100;
          }
          return prev + 1;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isSimulating, workflowStep, currentDelivery]);

  // Transition status handler
  const handleStartRoute = async (delivery: DeliveryItem) => {
    setCurrentDelivery(delivery);
    setSimProgress(0);
    setWorkflowStep("navigating");

    try {
      await fetch(`/api/driver/deliveries/${delivery.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "IN_TRANSIT",
          note: "Driver started navigation to destination",
        }),
      });
      toast.success("Route Dispatched: IN_TRANSIT");
      loadDriverDeliveries();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <Toaster position="top-center" />

      <main className="p-6 pb-32 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            <ProfileView
              key="profile"
              driver={driverProfile}
              deliveries={deliveries}
            />
          ) : (
            <motion.div key="hub-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {!currentDelivery ? (
                <Dashboard
                  deliveries={deliveries}
                  driver={driverProfile}
                  isOnline={isOnline}
                  loading={loading}
                  onSelect={handleStartRoute}
                  isSimulating={isSimulating}
                  onToggleSim={() => setIsSimulating(!isSimulating)}
                  onRefresh={loadDriverDeliveries}
                />
              ) : (
                <div className="space-y-6">
                  {workflowStep === "navigating" && (
                    <RouteNavigation
                      delivery={currentDelivery}
                      simProgress={simProgress}
                      isSimulating={isSimulating}
                      onBack={() => {
                        setCurrentDelivery(null);
                        setIsSimulating(false);
                      }}
                      onArrive={() => setWorkflowStep("completing")}
                      onReportException={() => setWorkflowStep("exception")}
                    />
                  )}
                  {workflowStep === "completing" && (
                    <CompletionWorkflow
                      delivery={currentDelivery}
                      onClose={() => setWorkflowStep("navigating")}
                      onSuccess={() => {
                        setWorkflowStep("summary");
                        loadDriverDeliveries();
                      }}
                    />
                  )}
                  {workflowStep === "exception" && (
                    <ExceptionWorkflow
                      delivery={currentDelivery}
                      onClose={() => setWorkflowStep("navigating")}
                      onSuccess={() => {
                        setCurrentDelivery(null);
                        setWorkflowStep("navigating");
                        loadDriverDeliveries();
                      }}
                    />
                  )}
                  {workflowStep === "summary" && (
                    <RouteSummary
                      delivery={currentDelivery}
                      onDone={() => {
                        setCurrentDelivery(null);
                        setWorkflowStep("navigating");
                      }}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Dock */}
      {(!currentDelivery || workflowStep === "navigating") && (
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-3xl border-t border-white/5 px-12 flex justify-between items-center z-[5000]">
          <NavButton
            active={activeTab === "hub"}
            onClick={() => {
              setActiveTab("hub");
              setCurrentDelivery(null);
            }}
            icon={<Squares2X2Icon className="w-7 h-7" />}
            label="Command"
          />
          <div className="relative -top-8">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center border-4 border-[#07080A] transition-all duration-500 shadow-2xl ${
                isOnline ? "bg-cyan-500 rotate-0 shadow-[0_0_25px_rgba(6,182,212,0.6)]" : "bg-rose-600 rotate-45"
              }`}
            >
              <BoltIcon className="h-8 w-8 text-white" />
            </button>
            <p className={`text-[10px] font-black uppercase text-center mt-2 tracking-widest ${isOnline ? "text-cyan-500" : "text-rose-500"}`}>
              {isOnline ? "Online" : "Standby"}
            </p>
          </div>
          <NavButton
            active={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={<UserCircleIcon className="w-7 h-7" />}
            label="Operator"
          />
        </nav>
      )}
    </div>
  );
}

// --- Dashboard Component ---
const Dashboard = ({
  deliveries,
  driver,
  isOnline,
  loading,
  onSelect,
  isSimulating,
  onToggleSim,
  onRefresh,
}: any) => {
  const activeDeliveries = deliveries.filter(
    (d: DeliveryItem) =>
      d.status !== "DELIVERED" &&
      d.status !== "COMPLETED" &&
      d.status !== "CANCELLED" &&
      d.status !== "FAILED_DELIVERY"
  );
  const currentActive = activeDeliveries[0];
  const pendingDeliveries = activeDeliveries.slice(1);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
            Driver Hub
          </h2>
          <p className="text-[10px] text-cyan-500/80 font-black uppercase tracking-[0.3em] mt-2">
            Operator: {driver?.name || "Ready"} • {driver?.vehicle?.model || "Fleet Active"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
          >
            Sync
          </button>
          <button
            onClick={onToggleSim}
            className={`px-3 py-2 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${
              isSimulating
                ? "bg-cyan-500 border-cyan-400 text-white animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
            }`}
          >
            {isSimulating ? "Sim Active" : "Simulate"}
          </button>
        </div>
      </header>

      {/* Current Active Mission */}
      {currentActive ? (
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(currentActive)}
          className="bg-gradient-to-br from-cyan-600/20 via-cyan-900/10 to-transparent border border-cyan-500/30 rounded-[2.5rem] p-8 cursor-pointer relative overflow-hidden group shadow-[0_20px_40px_rgba(6,182,212,0.15)]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TruckIcon className="w-28 h-28" />
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-[9px] font-black text-cyan-300 uppercase tracking-widest">
                {currentActive.status}
              </span>
              <h4 className="text-2xl font-black text-white mt-2">{currentActive.customerName}</h4>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                <MapPinIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                {currentActive.deliveryAddress}
              </p>
            </div>
            <div className="bg-cyan-500 rounded-2xl p-3 shadow-xl group-hover:scale-110 transition-transform">
              <PlaySolid className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex gap-3 relative z-10">
            <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-[11px] font-black text-cyan-400 flex items-center gap-2 uppercase tracking-widest border border-white/5">
              <ClockIcon className="w-4 h-4" /> {currentActive.estimatedTravelTime || 25} Mins
            </div>
            <div className="bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 text-[11px] font-black text-emerald-400 flex items-center gap-2 uppercase tracking-widest border border-white/5">
              <TruckIcon className="w-4 h-4" /> {currentActive.packageWeightKg || 1} KG
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="p-12 text-center border border-white/5 bg-white/5 rounded-[2.5rem]">
          <TruckIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-white">No Active Deliveries</h4>
          <p className="text-xs text-slate-500 mt-1">
            {loading ? "Checking dispatch queue..." : "You have no pending assignments. You are on standby."}
          </p>
        </div>
      )}

      {/* Queue */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-500 px-1 tracking-[0.4em]">
          Assigned Queue ({pendingDeliveries.length})
        </h3>
        {pendingDeliveries.length === 0 ? (
          <p className="text-xs text-slate-600 px-1">Queue clear. No pending stops.</p>
        ) : (
          pendingDeliveries.map((d: DeliveryItem) => (
            <motion.div
              key={d.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(d)}
              className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner">
                  <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="font-bold text-white text-base">{d.customerName}</p>
                  <p className="text-[10px] text-cyan-500/70 font-black uppercase tracking-widest">
                    {d.packageDescription} • {d.trackingNumber}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-700" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Route Navigation Component ---
const RouteNavigation = ({
  delivery,
  simProgress,
  isSimulating,
  onBack,
  onArrive,
  onReportException,
}: any) => (
  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
    <div className="flex justify-between items-center">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" /> Disengage
      </button>
      <button
        onClick={onReportException}
        className="flex items-center gap-1 text-rose-400 font-bold text-[10px] uppercase tracking-wider hover:text-rose-300"
      >
        <ExclamationTriangleIcon className="w-4 h-4" /> Report Issue
      </button>
    </div>

    <div className="h-[420px] bg-slate-900 rounded-[3.5rem] overflow-hidden relative border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
      <MapModule progress={simProgress} start={DEFAULT_START} end={DEFAULT_END} />

      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-[1001]">
        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">Destination Target</p>
        <h2 className="text-xl font-black text-white leading-tight tracking-tight">{delivery.deliveryAddress}</h2>
        {delivery.customerContact && (
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-2">
            <PhoneIcon className="w-3.5 h-3.5 text-cyan-400" /> {delivery.customerContact}
          </p>
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <StatTile
        label="ETA Target"
        value={isSimulating ? `${Math.max(1, 15 - Math.floor(simProgress / 7))}m` : `${delivery.estimatedTravelTime || 20}m`}
        icon={<ClockIcon className="text-cyan-500" />}
      />
      <StatTile
        label="Tracking ID"
        value={delivery.trackingNumber.slice(-7)}
        icon={<TruckIcon className="text-emerald-500" />}
      />
    </div>

    <button
      onClick={onArrive}
      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[0_20px_40px_rgba(8,145,178,0.3)] active:scale-95 transition-all"
    >
      Confirm Handover / Deliver
    </button>
  </motion.div>
);

// --- Completion / Proof of Delivery Workflow ---
const CompletionWorkflow = ({ delivery, onSuccess, onClose }: any) => {
  const [recipientName, setRecipientName] = useState(delivery.customerName || "");
  const [recipientPhone, setRecipientPhone] = useState(delivery.customerContact || "");
  const [proofType, setProofType] = useState<"SIGNATURE" | "PHOTO" | "OTP">("SIGNATURE");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!recipientName) {
      toast.error("Please enter recipient name");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/driver/deliveries/${delivery.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_DELIVERY",
          proof: {
            recipientName,
            recipientPhone,
            signatureUrl: proofType === "SIGNATURE" ? "data:image/svg+xml;base64,signed" : undefined,
            imageUrl: proofType === "PHOTO" ? "data:image/jpeg;base64,captured" : undefined,
            notes,
          },
          note: `Handover confirmed to ${recipientName}. Proof type: ${proofType}`,
        }),
      });

      if (res.ok) {
        toast.success("Delivery completed successfully!");
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to confirm delivery");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to complete delivery");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="fixed inset-0 bg-[#07080A] z-[9000] p-8 flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <XMarkIcon className="w-6 h-6 text-slate-400" />
        </button>
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400">Proof of Delivery</h2>
        <div className="w-12" />
      </div>

      <div className="space-y-6 flex-1 max-w-md mx-auto w-full">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Recipient Full Name
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Recipient Contact Phone
          </label>
          <input
            type="text"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500"
            placeholder="+1 555 0192"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Verification Protocol
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["SIGNATURE", "PHOTO", "OTP"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setProofType(type)}
                className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                  proofType === type
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Handover Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Left with reception / gate security..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-6 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-lg rounded-[2.5rem] shadow-2xl active:scale-95 transition-all disabled:opacity-50 mt-4"
        >
          {submitting ? "Signing Off Mission..." : "Complete Handover"}
        </button>
      </div>
    </motion.div>
  );
};

// --- Exception / Issue Workflow ---
const ExceptionWorkflow = ({ delivery, onSuccess, onClose }: any) => {
  const [reason, setReason] = useState("RECIPIENT_UNAVAILABLE");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/driver/deliveries/${delivery.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPORT_EXCEPTION",
          exception: {
            reason,
            notes,
          },
        }),
      });

      if (res.ok) {
        toast.error("Delivery exception logged. Admin notified.");
        onSuccess();
      } else {
        toast.error("Failed to report exception");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to submit exception");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} className="fixed inset-0 bg-[#07080A] z-[9000] p-8 flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl border border-white/5">
          <XMarkIcon className="w-6 h-6 text-slate-400" />
        </button>
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-rose-500">Report Exception</h2>
        <div className="w-12" />
      </div>

      <div className="space-y-6 flex-1 max-w-md mx-auto w-full">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Failure Category
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-rose-500"
          >
            <option value="RECIPIENT_UNAVAILABLE">Recipient Unavailable / No Answer</option>
            <option value="WRONG_ADDRESS">Incorrect Delivery Address</option>
            <option value="ACCESS_DENIED">Security / Access Gate Denied</option>
            <option value="PACKAGE_DAMAGED">Package Damaged Prior to Handover</option>
            <option value="VEHICLE_BREAKDOWN">Vehicle Mechanical Failure</option>
            <option value="OTHER">Other Operational Issue</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
            Detailed Incident Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-rose-500 resize-none"
            placeholder="Explain why delivery could not be completed..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white font-black text-lg rounded-[2.5rem] shadow-2xl active:scale-95 transition-all disabled:opacity-50 mt-4"
        >
          {submitting ? "Logging Exception..." : "Submit Incident Report"}
        </button>
      </div>
    </motion.div>
  );
};

// --- Route Summary Component ---
const RouteSummary = ({ delivery, onDone }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center pt-12">
    <div className="w-28 h-28 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
      <CheckBadgeIcon className="w-14 h-14 text-emerald-400" />
    </div>
    <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter uppercase">Mission Completed</h2>
    <p className="text-slate-400 font-medium mb-10 uppercase text-[10px] tracking-[0.3em]">
      Tracking Hash: {delivery.trackingNumber}
    </p>

    <div className="w-full bg-white/5 border border-white/5 p-8 rounded-[3rem] mb-10 shadow-2xl">
      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-2">Recipient Verified</p>
      <p className="text-2xl font-black text-white">{delivery.customerName}</p>
      <p className="text-xs text-slate-400 mt-1">{delivery.deliveryAddress}</p>
    </div>

    <button
      onClick={onDone}
      className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2.5rem] font-black text-lg active:scale-95 transition-all shadow-xl"
    >
      Return to Operations Hub
    </button>
  </motion.div>
);

// --- Operator Profile View ---
const ProfileView = ({ driver, deliveries }: any) => {
  const completed = deliveries.filter((d: any) => d.status === "DELIVERED" || d.status === "COMPLETED");

  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center py-10 relative">
        <div className="absolute top-0 w-full h-32 bg-cyan-500/5 blur-[100px] -z-10" />
        <div className="w-28 h-28 rounded-[2.5rem] bg-slate-900 border-2 border-white/5 flex items-center justify-center mb-5 shadow-2xl">
          <UserCircleIcon className="w-16 h-16 text-cyan-400" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          {driver?.name || "Tactical Driver"}
        </h2>
        <div className="mt-2 px-4 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
          <p className="text-cyan-400 font-black text-[9px] uppercase tracking-[0.3em]">
            Status: {driver?.status || "ACTIVE OPERATOR"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatTile
          label="Completed Today"
          value={driver?.stats?.completedToday ?? completed.length}
          icon={<CheckBadgeIcon className="text-emerald-500" />}
        />
        <StatTile
          label="Assigned Vehicle"
          value={driver?.vehicle?.plateNumber || "Motorcycle 01"}
          icon={<TruckIcon className="text-cyan-500" />}
        />
      </div>

      <div className="bg-white/5 border border-white/5 p-7 rounded-[2.5rem]">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">
          Recent Activity Log
        </h4>
        <div className="space-y-4">
          {completed.length === 0 ? (
            <p className="text-xs text-slate-600">No completed deliveries on file for today.</p>
          ) : (
            completed.slice(0, 5).map((d: any) => (
              <div key={d.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-white">{d.customerName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{d.trackingNumber}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">DELIVERED</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Reusable Tile ---
const StatTile = ({ label, value, icon }: any) => (
  <div className="bg-white/5 p-6 rounded-[2.2rem] border border-white/5 flex flex-col items-start w-full shadow-inner">
    <div className="w-6 h-6 mb-3 opacity-80">{icon}</div>
    <p className="text-2xl font-black text-white tracking-tighter">{value}</p>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 outline-none">
    <div className={`transition-all duration-300 ${active ? "text-cyan-400 scale-110" : "text-slate-600"}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${active ? "text-cyan-400" : "text-slate-600"}`}>
      {label}
    </span>
  </button>
);