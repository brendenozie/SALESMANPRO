'use client';

import { useRouter, usePathname  } from "next/navigation";
import { useState } from "react";
import { MarketListingForm } from "@/types/typings";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

interface BookingFormProps {
  service: MarketListingForm; // Renamed to use the specific type
  slug: string; // Added slug prop to identify the store
}

export default function ProgramsBookingForm({ service, slug }: BookingFormProps) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname(); 

  // Determine if the price is effectively zero (e.g., Free program)
  const isFree = (service.finalPrice === 0 || service.finalPrice === null || service.finalPrice === undefined);
  const actionText = isFree ? "Enroll Now (Free)" : "Confirm Enrollment";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // e.g. "/site/something"
    // const params = new URLSearchParams({ plan: "premium" });

    if (!date || !timeSlot) {
      setError("Please select both a preferred date and time slot for the program.");
      return;
    }

    setLoading(true);

    // Build the query string for checkout/enrollment process
    const params = new URLSearchParams({
      listingId: service.id,
      name: service.name ?? "Program Enrollment",
      // Ensure price is a string for the URL (handle null or undefined)
      price: (service.finalPrice ?? 0).toString(),
      productType: "program", // Context for the checkout page
      enrollmentDate: date,
      timeSlot,
      // Add other relevant program data here (e.g., category, duration)
    });

    // Navigate to the checkout/enrollment finalization page
    // Using `/site/booking/checkout` (standard path) or `/site/program/enrollment`
    router.push(`${pathname}/bookings/checkout?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border border-blue-200 rounded-xl shadow-lg bg-white dark:bg-gray-800">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b border-blue-100 dark:border-blue-800 pb-3">
        <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
        Schedule/Enrollment Details
      </h3>
      
      {error && <p className="p-3 bg-red-100 text-red-700 rounded-lg text-sm transition-all">{error}</p>}
      
      {/* Date Input */}
      <div className="space-y-1">
        <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Preferred Start Date
        </label>
        <div className="relative">
          <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => {
                setDate(e.target.value);
                setError(""); // Clear error on change
            }}
            className="pl-10 mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      {/* Time Slot Input */}
      <div className="space-y-1">
        <label htmlFor="timeSlot" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          Preferred Time Slot
        </label>
        <div className="relative">
          <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="timeSlot"
            type="time"
            required
            value={timeSlot}
            onChange={(e) => {
                setTimeSlot(e.target.value);
                setError(""); // Clear error on change
            }}
            className="pl-10 mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
          This helps us match you with the best available cohort/session.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${isFree ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {loading ? "Processing Enrollment…" : actionText}
      </button>
    </form>
  );
}