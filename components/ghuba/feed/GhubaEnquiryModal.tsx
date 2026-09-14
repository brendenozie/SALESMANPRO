"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { HiXMark, HiCheckCircle } from "react-icons/hi2";
import { GhubaFeedItem } from "@/lib/ghuba-feed-service";

interface GhubaEnquiryModalProps {
  isOpen: boolean;
  item: GhubaFeedItem | null;
  mode: "BOOKING" | "ENQUIRY";
  onClose: () => void;
}

export const GhubaEnquiryModal: React.FC<GhubaEnquiryModalProps> = ({
  isOpen,
  item,
  mode,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !item) return null;

  const isBooking = mode === "BOOKING";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Record user interest event
      await fetch("/api/ghuba/feed/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isBooking ? "BOOK" : "CONTACT",
          listingId: item.listingId,
          metadata: { name, phone, date, notes },
        }),
      });

      setIsDone(true);
      toast.success(
        isBooking
          ? "Booking request submitted! The provider will contact you shortly."
          : "Enquiry submitted! The seller has been notified."
      );
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1800);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-neutral-900 p-6 text-white shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-white/60 hover:text-white transition-colors"
        >
          <HiXMark className="h-6 w-6" />
        </button>

        {isDone ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <HiCheckCircle className="h-16 w-16 text-emerald-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold">Request Received!</h3>
            <p className="text-xs text-white/60 mt-1">
              {item.seller.name} will reach out to you at {phone}.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold">
              {isBooking ? "Book Service Appointment" : "Enquire About Listing"}
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              {item.title} — {item.currency} {item.price.toLocaleString()}
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Kamau"
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400"
                />
              </div>

              {isBooking && (
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Preferred Date / Time
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isBooking
                      ? "Special requests or service details..."
                      : "Questions regarding condition, inspection, or pricing..."
                  }
                  className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-white/40 outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 font-bold text-xs text-black shadow-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : isBooking ? "Confirm Booking Request" : "Send Enquiry"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
