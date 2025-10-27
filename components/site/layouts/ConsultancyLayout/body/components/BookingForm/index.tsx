'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpenIcon, EnvelopeIcon } from "@heroicons/react/24/outline"; // Added icons

interface BookingFormProps {
  service: any; // Using 'service' to maintain consistency, but it represents the E-book listing
  slug: string; // Added slug prop to identify the store
}

export default function BookingForm({ service, slug }: BookingFormProps) {
  // E-books require user contact info (e.g., email) for delivery/purchase.
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isFree = (service.finalPrice === 0 || service.finalPrice === null || service.finalPrice === undefined);
  const actionText = isFree ? "Get Free E-book" : "Purchase E-book";
  const buttonStyle = isFree ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address for delivery.");
      return;
    }
    
    setLoading(true);

    // Build the query string with product details and user email
    const params = new URLSearchParams({
      listingId: service.id,
      name: service.name ?? "E-book",
      // Ensure price is a string for the URL
      price: service.finalPrice !== undefined ? service.finalPrice.toString() : "0.00",
      productType: "ebook", // Important for the checkout page logic
      email, // Add the user's email
    });
    
    // In a real application, you might first call an API here to create a checkout session.
    // For this example, we navigate directly to the checkout page.

    // Navigate to your checkout page
    router.push(`/site/${slug}/bookings/checkout?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border border-gray-200 rounded-xl shadow-inner bg-gray-50 dark:bg-gray-800">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b pb-3 mb-4">
        <BookOpenIcon className="w-6 h-6 text-orange-600" />
        {isFree ? "Secure Your Copy" : "Ready to Purchase"}
      </h3>
      
      {error && <p className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</p>}
      
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Delivery Email Address
        </label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
          The e-book will be sent to this email immediately after checkout.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${buttonStyle} text-white py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {loading ? "Processing…" : actionText}
      </button>
      
      {/* Display price prominently */}
      <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        Total Due: 
        <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 ml-2">
            KES {service.finalPrice !== undefined ? service.finalPrice.toFixed(2) : "0.00"}
        </span>
      </p>
    </form>
  );
}