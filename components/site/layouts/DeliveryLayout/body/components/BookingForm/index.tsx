"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TruckIcon, MapPinIcon, ScaleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

interface BookingFormProps {
  service: any;
  slug: string;
}

export default function BookingForm({ service, slug }: BookingFormProps) {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [weightKg, setWeightKg] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      alert("Please provide both pickup and dropoff addresses");
      return;
    }

    const params = new URLSearchParams({
      pickup,
      dropoff,
      weight: weightKg,
      service: service?.name?.toUpperCase()?.includes("EXPRESS")
        ? "EXPRESS"
        : service?.name?.toUpperCase()?.includes("SAME")
        ? "SAME_DAY"
        : "STANDARD",
    });

    router.push(`/site/${slug}/logistics/book?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 border border-white/10 rounded-2xl shadow-2xl bg-slate-900/80 backdrop-blur-md text-white"
    >
      <h3 className="text-lg font-black flex items-center gap-2 border-b border-white/10 pb-3 mb-2">
        <TruckIcon className="w-5 h-5 text-cyan-400" />
        Schedule {service?.name || "Delivery Service"}
      </h3>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Pickup Address
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            required
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="e.g. Warehouse A, Industrial Area"
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Destination Address
        </label>
        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            required
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            placeholder="e.g. 42 Commercial Avenue"
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Approx Cargo Weight (KG)
        </label>
        <div className="relative">
          <ScaleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="number"
            min="0.5"
            step="0.5"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-xl"
      >
        Calculate Quote & Book <ArrowRightIcon className="w-4 h-4" />
      </button>
    </form>
  );
}