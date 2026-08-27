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

  const primaryColor = themeSettings?.primaryColor || '#C5A267';

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
      className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] shadow-xl dark:shadow-none border border-zinc-100 dark:border-white/5 backdrop-blur-xl transition-colors duration-500"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Secure your spot</h3>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Select your preferred window below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-500/20"
          >
            <ExclamationCircleIcon className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Date Input */}
        <div className="group">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 ml-4">
            Pick a Date
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
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
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-zinc-200 dark:focus:border-white/10 focus:bg-white dark:focus:bg-zinc-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-zinc-900 dark:text-white font-bold outline-none transition-all duration-300 shadow-inner group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/80 color-scheme-dark"
            />
          </div>
        </div>

        {/* Time Input */}
        <div className="group">
          <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 ml-4">
            Select Time
          </label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">
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
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-zinc-200 dark:focus:border-white/10 focus:bg-white dark:focus:bg-zinc-800 rounded-[1.5rem] pl-14 pr-6 py-4 text-zinc-900 dark:text-white font-bold outline-none transition-all duration-300 shadow-inner group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800/80"
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
            <span className="text-white dark:text-black font-black tracking-tight transition-colors duration-500">
              {loading ? "Processing..." : "Confirm Booking"}
            </span>
          </div>
          
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full px-5 py-3 flex items-center gap-3 transition-colors duration-500">
             <span className="text-white dark:text-black font-black text-sm">
               ${service.finalPrice || '0.00'}
             </span>
             <ArrowRightIcon className="w-4 h-4 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-4 transition-colors">
          Free cancellation up to 24 hours before session
        </p>
      </form>
      
      <style jsx>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: var(--icon-filter);
          cursor: pointer;
        }
        :global(.dark) { --icon-filter: invert(1); }
        :global(:not(.dark)) { --icon-filter: invert(0); }
      `}</style>
    </motion.div>
  );
}