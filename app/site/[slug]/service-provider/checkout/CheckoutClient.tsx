"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
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

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

const steps = ["Billing", "Payment", "Review"];

export default function CheckoutClient({ searchParams }: CheckoutClientProps) {
  const { listingId, name, price, date, timeSlot } = searchParams || {};
  const { data: session } = useSession();
  const router = useRouter();

  // Validate URL params
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

  // Billing fields
  const [billing, setBilling] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });

  // Payment selection
  const [paymentMethod, setPaymentMethod] = useState<
    "mpesa" | "paystack" | "card"
  >("mpesa");

  const total = useMemo(() => amount, [amount]);

  /** Billing Input Change */
  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((b) => ({ ...b, [e.target.name]: e.target.value }));
    setError((err) => ({ ...err, [e.target.name]: "" }));
  };

  /** Step Validation */
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      ["name", "email", "phone"].forEach((field) => {
        if (!billing[field as keyof typeof billing]) {
          errs[field] = "Required";
        }
      });

      // M-Pesa number validation
      if (
        paymentMethod === "mpesa" &&
        !/^(\+?254|0)?7\d{8}$/.test(billing.phone)
      ) {
        errs.phone = "Enter a valid Safaricom number";
      }
    }

    if (step === 1) {
      if (!paymentMethod) errs.payment = "Select a payment method";
    }

    setError(errs);
    return Object.keys(errs).length === 0;
  }, [step, billing, paymentMethod]);

  const next = () => validate() && setStep((s) => s + 1);
  const prev = () => setStep((s) => s - 1);

  /** Submit Booking Order */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/shop/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_SECRET_KEY!,
        },
        body: JSON.stringify({
          isServiceBooking: true,
          paymentMethod,
          consumerId: session?.user?.id || null,
          date,
          timeSlot,
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
          totalPrice: total,
          items: [
            {
              marketplaceListingId: listingId,
              quantity: 1,
              price: total,
              date,
              timeSlot,
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

  // --------------------------
  // SUCCESS SCREEN
  // --------------------------
  if (orderPlaced) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
        <Confetti />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full"
        >
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto" />
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

  // --------------------------
  // MAIN CHECKOUT UI
  // --------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-12">
      <Section title="Service Booking Checkout">
        {/* Step Indicators */}
        <div className="flex mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center relative">
              <motion.div
                className={`mx-auto w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  step > i
                    ? "bg-indigo-600 border-indigo-600 text-white"
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
          {/* Booking Summary */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-3">Booking Summary</h2>
              <p><strong>Service:</strong> {name}</p>
              <p><strong>Date:</strong> {new Date(date!).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {timeSlot}</p>

              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* FORM AREA */}
          <form
            onSubmit={
              step === steps.length - 1
                ? handleSubmit
                : (e) => e.preventDefault()
            }
            className="md:col-span-2 bg-white rounded-3xl p-8 shadow-2xl space-y-6"
          >
            {/* BILLING STEP */}
            {step === 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Billing Info</h2>

                {["name", "email", "phone"].map((fld) => (
                  <div key={fld} className="mb-4">
                    <input
                      name={fld}
                      value={billing[fld as keyof typeof billing]}
                      onChange={handleBillingChange}
                      placeholder={fld.charAt(0).toUpperCase() + fld.slice(1)}
                      className={`w-full p-3 border rounded-lg ${
                        error[fld] ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {error[fld] && (
                      <p className="text-sm text-red-600 mt-1">
                        {error[fld]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PAYMENT STEP */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  {["mpesa", "paystack", "card"].map((pm) => (
                    <label
                      key={pm}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === pm}
                        onChange={() =>
                          setPaymentMethod(pm as any)
                        }
                      />
                      <span className="capitalize">{pm}</span>
                    </label>
                  ))}
                </div>

                {error.payment && (
                  <p className="text-sm text-red-600 mt-2">
                    {error.payment}
                  </p>
                )}
              </div>
            )}

            {/* REVIEW STEP */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Review Details</h2>

                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {billing.name}</p>
                  <p><strong>Email:</strong> {billing.email}</p>
                  <p><strong>Phone:</strong> {billing.phone}</p>
                  <p><strong>Payment:</strong> {paymentMethod}</p>
                  <p><strong>Total:</strong> {total.toFixed(2)}</p>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={prev}
                  className="px-6 py-2 bg-gray-200 rounded-lg"
                >
                  Back
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
              <p className="text-center text-red-600 mt-4">
                {error.submit}
              </p>
            )}
          </form>
        </div>
      </Section>
      <NewsletterSection />
    </div>
  );
}
