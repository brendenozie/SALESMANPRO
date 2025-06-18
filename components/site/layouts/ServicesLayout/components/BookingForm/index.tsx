"use client";

import { useState } from "react";

interface BookingFormProps {
  listingId: string;
  onComplete?: (orderId: string) => void;
}

export default function BookingForm({ listingId, onComplete }: BookingFormProps) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, date, timeSlot, quantity: 1 }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Booking failed");
      }

      const { order } = await res.json();            // <— grab the order
      if (onComplete) {
        onComplete(order.id);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

