"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function BookingFormModal({ service }: { service: any }) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({
      listingId: service.id,
      name: service.name ?? "",
      price: service.finalPrice?.toString() || service.sellingPrice?.toString() || "0",
      date,
      timeSlot,
    });
    router.push(`/service-provider/checkout?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Date Input */}
        <div className="relative group">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
            Select Date
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
            />
          </div>
        </div>

        {/* Time Input */}
        <div className="relative group">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
            Preferred Time
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="time"
              required
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all hover:border-indigo-300"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full bg-gray-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-xl active:scale-[0.98]"
      >
        <div className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Processing..." : "Continue to Checkout"}
          {!loading && <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      
      <p className="text-center text-[11px] text-gray-400 px-4">
        By clicking continue, you agree to our service terms and cancellation policy.
      </p>
    </form>
  );
}