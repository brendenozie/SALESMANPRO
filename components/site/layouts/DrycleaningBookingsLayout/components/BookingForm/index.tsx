'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ExclamationCircleIcon 
} from "@heroicons/react/24/outline";

interface BookingFormProps {
  service: any;
  slug: string;
  themeSettings?: {
    primaryColor?: string;
  };
}

export default function BookingForm({ service, slug, themeSettings }: BookingFormProps) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const primaryColor = themeSettings?.primaryColor || '#059669';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!date || !timeSlot) {
      setError("Please select both date and time.");
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({
      listingId: service.id,
      name: service.name ?? "",
      price: service.finalPrice !== undefined ? service.finalPrice.toString() : "0.00",
      date,
      timeSlot,
    });

    router.push(`/bookings/checkout?${params.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Secure your spot</h3>
        <p className="text-slate-500 font-medium">Select your preferred window below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100"
          >
            <ExclamationCircleIcon className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Date Input */}
        <div className="group">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">
            Pick a Date
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-4 text-slate-900 font-bold outline-none transition-all duration-300 shadow-inner group-hover:bg-slate-100/50"
            />
          </div>
        </div>

        {/* Time Input */}
        <div className="group">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-4">
            Select Time
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
              <ClockIcon className="w-5 h-5" />
            </div>
            <input
              type="time"
              required
              value={timeSlot}
              onChange={(e) => {
                setTimeSlot(e.target.value);
                setError("");
              }}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white rounded-[1.5rem] pl-14 pr-6 py-4 text-slate-900 font-bold outline-none transition-all duration-300 shadow-inner group-hover:bg-slate-100/50"
            />
          </div>
        </div>

        {/* Dynamic CTA Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full relative group overflow-hidden flex items-center justify-between p-2 rounded-full transition-all duration-300 shadow-xl"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 20px 40px -10px ${primaryColor}40`
          }}
        >
          <div className="flex items-center gap-3 pl-6">
            <span className="text-white font-black tracking-tight">
              {loading ? "Processing..." : "Confirm Booking"}
            </span>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-3">
             <span className="text-white font-black text-sm">
                ${service.finalPrice || '0.00'}
             </span>
             <ArrowRightIcon className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">
          Free cancellation up to 24 hours before session
        </p>
      </form>
    </motion.div>
  );
}