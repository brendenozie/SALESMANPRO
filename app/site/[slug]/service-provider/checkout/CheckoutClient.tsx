"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Section from "@/components/site/Section/Section";
import NewsletterSection from "@/components/site/NewsletterSection/NewsletterSection";

interface CheckoutClientProps {
  searchParams: {
    listingId?: string;
    name?: string;
    price?: string;
    date?: string;
    timeSlot?: string;
  };
}

const steps = ["Billing", "Payment", "Review"];

export default function CheckoutClient({ searchParams }: CheckoutClientProps) {
  const { listingId, name, price, date, timeSlot } = searchParams || {};
  const { data: session } = useSession();
  const router = useRouter();

  if (!listingId || !name || !price || !date || !timeSlot) {
    return (
      <p className="p-6 text-red-600 text-center font-semibold">
        Missing booking details.
      </p>
    );
  }

  const amount = Number(price);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<Record<string, string>>({});

  const [billing, setBilling] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cvv: "",
  });

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((b) => ({ ...b, [e.target.name]: e.target.value }));
    setError((err) => ({ ...err, [e.target.name]: "" }));
  };

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      ["name", "email", "phone"].forEach((f) => {
        if (!billing[f as keyof typeof billing]) errs[f] = "Required";
      });
    }
    if (step === 1) {
      ["cardNumber", "cardExpiry", "cvv"].forEach((f) => {
        if (!billing[f as keyof typeof billing]) errs[f] = "Required";
      });
    }
    setError(errs);
    return Object.keys(errs).length === 0;
  }, [step, billing]);

  const total = useMemo(() => amount, [amount]);
  const next = () => { if (validate()) setStep((s) => s + 1); };
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
        },
        body: JSON.stringify({
          date,
          timeSlot,
          quantity: 1,
          consumerId: session?.user?.id,
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
          cardNumber: billing.cardNumber,
          cardExpiry: billing.cardExpiry,
          cvv: billing.cvv,
          totalPrice: total,
          items: [
            {
              marketplaceListingId: listingId,
              quantity: 1,
              date,
              timeSlot,
              price: total,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { order } = await res.json();
      setTracking(order.trackingNumber);
      setOrderPlaced(true);
    } catch (err: any) {
      setError({ submit: err.message || "Submission failed." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success screen
  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <Confetti />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
        >
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold mt-4">Booking Confirmed!</h2>
          <p className="mt-2">Your tracking number is:</p>
          <p className="font-mono text-lg mt-1">{tracking}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Continue Browsing
          </button>
        </motion.div>
      </div>
    );
  }

  // ✅ Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 md:p-12">
      <Section title="Booking Checkout">
        {/* Steps */}
        <div className="flex mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center relative">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                  step > i
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {i + 1}
              </motion.div>
              <p className="text-xs mt-1">{label}</p>
              {i < steps.length - 1 && (
                <div
                  className={`absolute top-3 right-0 w-full h-0.5 ${
                    step > i ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              <p><strong>Service:</strong> {name}</p>
              <p><strong>Date:</strong> {new Date(date!).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {timeSlot}</p>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={step === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()}
            className="md:col-span-2 bg-white rounded-3xl p-8 shadow-2xl space-y-6"
          >
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Billing Info</h2>
                {(["name", "email", "phone"] as const).map((fld) => (
                  <div key={fld}>
                    <input
                      name={fld}
                      value={billing[fld]}
                      onChange={handleBillingChange}
                      placeholder={fld.charAt(0).toUpperCase() + fld.slice(1)}
                      className={`w-full p-3 border rounded-lg ${
                        error[fld] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error[fld] && (
                      <p className="text-red-600 text-sm mt-1">{fld} is required</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Payment Details</h2>
                {(["cardNumber", "cardExpiry", "cvv"] as const).map((fld) => (
                  <div key={fld}>
                    <input
                      name={fld}
                      value={billing[fld]}
                      onChange={handleBillingChange}
                      placeholder={
                        fld === "cardNumber"
                          ? "Card Number"
                          : fld === "cardExpiry"
                          ? "MM/YY"
                          : "CVV"
                      }
                      className={`w-full p-3 border rounded-lg ${
                        error[fld] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error[fld] && (
                      <p className="text-red-600 text-sm mt-1">{fld} is required</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold">Review & Confirm</h2>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {billing.name}</p>
                  <p><strong>Email:</strong> {billing.email}</p>
                  <p><strong>Phone:</strong> {billing.phone}</p>
                  <p><strong>Total:</strong> ${total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="px-6 py-2 bg-gray-200 rounded-lg"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  {loading ? "Processing…" : "Place Booking"}
                </button>
              )}
            </div>

            {error.submit && (
              <p className="text-red-600 text-center mt-4">{error.submit}</p>
            )}
          </form>
        </div>
      </Section>
      <NewsletterSection />
    </div>
  );
}
