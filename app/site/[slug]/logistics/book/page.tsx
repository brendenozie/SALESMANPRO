"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

export default function LogisticsBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";

  const [step, setStep] = useState(1);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Form states
  const [pickup, setPickup] = useState({
    address: searchParams.get("pickup") || "",
    contactName: "",
    contactPhone: "",
    notes: "",
  });

  const [dropoff, setDropoff] = useState({
    address: searchParams.get("dropoff") || "",
    contactName: "",
    contactPhone: "",
    notes: "",
    scheduledAt: "",
  });

  const [packageInfo, setPackageInfo] = useState({
    description: "Carton / Goods",
    packageType: "box",
    weightKg: searchParams.get("weight") || "5",
    isFragile: false,
    requiresColdChain: false,
    declaredValue: "",
    notes: "",
  });

  const [serviceType, setServiceType] = useState<"STANDARD" | "EXPRESS" | "SAME_DAY" | "BULK" | "COLD_CHAIN">(
    (searchParams.get("service") as any) || "STANDARD"
  );
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [quote, setQuote] = useState<any | null>(null);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  // Fetch server-side quote whenever addresses/specs change
  const fetchQuote = async () => {
    if (!pickup.address.trim() || !dropoff.address.trim()) return;
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/logistics/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: slug,
          pickupAddress: pickup.address,
          dropoffAddress: dropoff.address,
          weightKg: Number(packageInfo.weightKg) || 1,
          serviceType,
          isFragile: packageInfo.isFragile,
          requiresColdChain: packageInfo.requiresColdChain,
          declaredValue: packageInfo.declaredValue ? Number(packageInfo.declaredValue) : 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.quote) {
        setQuote(data.quote);
      }
    } catch (e) {
      console.error("Failed to calculate quote:", e);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    if (pickup.address && dropoff.address) {
      const timer = setTimeout(() => {
        fetchQuote();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pickup.address, dropoff.address, packageInfo.weightKg, serviceType, packageInfo.isFragile, packageInfo.requiresColdChain]);

  const handleNextFromStep1 = () => {
    if (!pickup.address.trim() || !dropoff.address.trim()) {
      toast.error("Please enter both pickup and dropoff addresses");
      return;
    }
    fetchQuote();
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!packageInfo.weightKg || Number(packageInfo.weightKg) <= 0) {
      toast.error("Please provide a valid package weight");
      return;
    }
    fetchQuote();
    setStep(3);
  };

  const handleNextFromStep3 = () => {
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!customer.name.trim() || (!customer.phone.trim() && !customer.email.trim())) {
      toast.error("Please provide your contact name and phone number");
      return;
    }

    setBookingInProgress(true);
    try {
      const res = await fetch("/api/logistics/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: slug,
          customer,
          pickup,
          dropoff,
          packageInfo,
          serviceType,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete delivery booking");
      }

      setBookingResult(data);
      setStep(5);
      toast.success("Delivery booked successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while booking");
    } finally {
      setBookingInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            <SparklesIcon className="w-4 h-4" /> Seamless Freight & Parcel Booking
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Schedule a Delivery
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Book professional dispatch with automated server-side quote calculation, tracking milestones, and verified delivery evidence.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="flex items-center justify-between relative max-w-md mx-auto px-4">
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-white/10 -z-10" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step === s
                  ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  : step > s
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-900 border border-white/20 text-slate-500"
              }`}
            >
              {step > s ? <CheckCircleIcon className="w-5 h-5" /> : s}
            </div>
          ))}
        </div>

        {/* Card Body with Progressive Disclosure */}
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: ROUTE & WAYPOINTS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <MapPinIcon className="w-6 h-6 text-cyan-400" /> 1. Pickup & Destination
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Provide the pickup point and delivery destination addresses.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Pickup Address *
                    </label>
                    <input
                      type="text"
                      value={pickup.address}
                      onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                      placeholder="e.g. 104 Industrial Way, Gate 3, Nairobi"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Pickup Contact Name
                      </label>
                      <input
                        type="text"
                        value={pickup.contactName}
                        onChange={(e) => setPickup({ ...pickup, contactName: e.target.value })}
                        placeholder="Sender name"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Pickup Contact Phone
                      </label>
                      <input
                        type="text"
                        value={pickup.contactPhone}
                        onChange={(e) => setPickup({ ...pickup, contactPhone: e.target.value })}
                        placeholder="+254 700 000 000"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Delivery Destination Address *
                    </label>
                    <input
                      type="text"
                      value={dropoff.address}
                      onChange={(e) => setDropoff({ ...dropoff, address: e.target.value })}
                      placeholder="e.g. 52 Commercial Street, Suite 400"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={dropoff.contactName}
                        onChange={(e) => setDropoff({ ...dropoff, contactName: e.target.value })}
                        placeholder="Receiver name"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Recipient Phone
                      </label>
                      <input
                        type="text"
                        value={dropoff.contactPhone}
                        onChange={(e) => setDropoff({ ...dropoff, contactPhone: e.target.value })}
                        placeholder="+254 711 000 000"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 mt-6 shadow-xl"
                >
                  Continue to Package Specs <ArrowRightIcon className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: PACKAGE DETAILS & SERVICE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <ArchiveBoxIcon className="w-6 h-6 text-cyan-400" /> 2. Cargo & Service Speed
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select delivery tier and declare cargo specifications.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Service Speed Tier
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(["STANDARD", "EXPRESS", "SAME_DAY", "COLD_CHAIN"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setServiceType(st)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            serviceType === st
                              ? "bg-cyan-500/20 border-cyan-500 text-white shadow-lg"
                              : "bg-slate-950 border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="block text-xs font-black uppercase tracking-wider">
                            {st.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {st === "STANDARD"
                              ? "Next-day / Eco"
                              : st === "EXPRESS"
                              ? "Priority Dispatch"
                              : st === "SAME_DAY"
                              ? "Within 4 Hours"
                              : "Temperature Control"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Cargo Weight (KG) *
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={packageInfo.weightKg}
                        onChange={(e) => setPackageInfo({ ...packageInfo, weightKg: e.target.value })}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Cargo Description
                      </label>
                      <input
                        type="text"
                        value={packageInfo.description}
                        onChange={(e) => setPackageInfo({ ...packageInfo, description: e.target.value })}
                        placeholder="e.g. Electronics, Documents, Parts"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-3 rounded-2xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={packageInfo.isFragile}
                        onChange={(e) => setPackageInfo({ ...packageInfo, isFragile: e.target.checked })}
                        className="rounded text-cyan-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-300">Fragile Goods Handling</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-4 py-3 rounded-2xl border border-white/10">
                      <input
                        type="checkbox"
                        checked={packageInfo.requiresColdChain}
                        onChange={(e) => setPackageInfo({ ...packageInfo, requiresColdChain: e.target.checked })}
                        className="rounded text-cyan-500 focus:ring-0"
                      />
                      <span className="text-xs font-bold text-slate-300">Refrigerated / Cold Storage</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep2}
                    className="w-2/3 py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    Review Quote Breakdown <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QUOTE BREAKDOWN */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <CurrencyDollarIcon className="w-6 h-6 text-emerald-400" /> 3. Guaranteed Price Quote
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Computed server-side based on route distance, weight, and handling surcharge.
                  </p>
                </div>

                {loadingQuote ? (
                  <div className="py-12 text-center text-slate-400">
                    <ClockIcon className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
                    <p className="text-xs">Calculating optimal route & pricing...</p>
                  </div>
                ) : quote ? (
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 space-y-3">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Base Dispatch Fee</span>
                        <span className="font-mono text-white">${quote.baseFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Estimated Route Distance ({quote.estimatedDistanceKm} KM)</span>
                        <span className="font-mono text-white">${quote.distanceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Weight Charge ({packageInfo.weightKg} KG)</span>
                        <span className="font-mono text-white">${quote.weightFee.toFixed(2)}</span>
                      </div>
                      {quote.surcharges > 0 && (
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Special Handling Surcharge</span>
                          <span className="font-mono text-white">${quote.surcharges.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>VAT / Taxes (16%)</span>
                        <span className="font-mono text-white">${quote.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                        <span className="text-sm font-black text-white uppercase tracking-wider">
                          Total Payable
                        </span>
                        <span className="text-3xl font-black text-emerald-400 font-mono">
                          ${quote.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Transit Estimate
                        </p>
                        <p className="text-lg font-black text-white mt-1">
                          ~{quote.estimatedTimeMins} Minutes
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Assigned Priority
                        </p>
                        <p className="text-lg font-black text-cyan-400 mt-1 uppercase">
                          {serviceType}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-rose-400">Could not calculate quote. Check addresses.</p>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextFromStep3}
                    className="w-2/3 py-5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    Proceed to Customer Details <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONTACT & PAYMENT SELECTION */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <CreditCardIcon className="w-6 h-6 text-cyan-400" /> 4. Customer Contact & Payment
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter booking contact info and select payment option.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="+254 700 000 000"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Email Address (for Receipt)
                      </label>
                      <input
                        type="email"
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Payment Terms
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "CASH_ON_DELIVERY", label: "Pay on Delivery (Cash / POS)", desc: "Settle with driver upon handover" },
                        { id: "PESAPAL", label: "Instant Online Payment", desc: "M-Pesa, Visa, Mastercard via PesaPal" },
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            paymentMethod === pm.id
                              ? "bg-cyan-500/20 border-cyan-500 text-white"
                              : "bg-slate-950 border-white/10 text-slate-400"
                          }`}
                        >
                          <span className="block text-xs font-black uppercase">{pm.label}</span>
                          <span className="text-[10px] text-slate-400 mt-1 block">{pm.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-1/3 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={bookingInProgress}
                    onClick={handleConfirmBooking}
                    className="w-2/3 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xl disabled:opacity-50"
                  >
                    {bookingInProgress ? "Booking Delivery..." : "Confirm & Authorize Dispatch"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS CONFIRMATION */}
            {step === 5 && bookingResult && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-3xl font-black text-white">Delivery Confirmed!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your dispatch order has been created and assigned to the operations hub.
                  </p>
                </div>

                <div className="bg-slate-950 border border-white/10 rounded-2xl p-6 max-w-md mx-auto space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                      Consignment Tracking #
                    </span>
                    <p className="text-2xl font-black text-cyan-400 font-mono mt-1">
                      {bookingResult.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                      Order Reference
                    </span>
                    <p className="text-sm font-bold text-white font-mono">
                      {bookingResult.orderNumber}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    onClick={() =>
                      router.push(
                        `/site/${slug}/logistics/trackorder?tracking=${bookingResult.trackingNumber}`
                      )
                    }
                    className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Track Live Consignment
                  </button>
                  <button
                    onClick={() => router.push(`/site/${slug}/logistics/profile`)}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition-all"
                  >
                    View My Deliveries
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
