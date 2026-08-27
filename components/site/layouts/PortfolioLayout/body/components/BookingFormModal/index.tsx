"use client";

// import { ServiceItem } from "@/app/admin/[slug]/services/AdminServicesClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookingFormProps {
  service: any;
}

export default function BookingFormModal({ service }: BookingFormProps) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !timeSlot) {
      setError("Please select both date and time.");
      return;
    }

    // Build the query string
    const params = new URLSearchParams({
      listingId: service.id,
      name: service.name ?? "",
      price: service.finalPrice !== undefined ? service.finalPrice.toString() : "0.00",
      date,
      timeSlot,
    });

    // Navigate to your checkout page
    router.push(`/portfolio/checkout?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Date</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Time</label>
        <input
          type="time"
          required
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        {loading ? "Booking…" : "Confirm Booking"}
      </button>
    </form>
  );
}

