"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  ScaleIcon,
  MapPinIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  PhoneArrowUpRightIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import { EditableElement } from "@/contexts/EditableContentContext";

export interface BookingSectionProps {
  storeFormData?: any;
  config?: any;
  sectionId?: string;
}

export function BookingSection({ storeFormData, config, sectionId }: BookingSectionProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("quote");
  const marketplaceListings = storeFormData?.marketplaceListings || [];
  const sId = sectionId || "booking";
  const slug = storeFormData?.slug || "";

  const badgeText = config?.badge || "Global Logistics Hub";
  const titleText = config?.title || "Streamline Your Supply Chain";
  const descriptionText =
    config?.description ||
    "Get instant access to real-time quotes and tracking. We don't just move freight; we move your business forward with precision.";
  const buttonText = config?.buttonText || "Get Estimate";

  // Form State
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [weightKg, setWeightKg] = useState("10");
  const [serviceType, setServiceType] = useState("STANDARD");
  const [trackingCode, setTrackingCode] = useState("");

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any | null>(null);

  const tabs = [
    { id: "quote", label: "Request a Quote", icon: <PaperAirplaneIcon className="w-4 h-4" /> },
    { id: "track", label: "Track Cargo", icon: <MagnifyingGlassIcon className="w-4 h-4" /> },
    { id: "support", label: "Live Support", icon: <PhoneArrowUpRightIcon className="w-4 h-4" /> },
  ];

  const handleCalculateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      alert("Please provide both pickup and destination addresses");
      return;
    }

    setLoadingQuote(true);
    try {
      const res = await fetch("/api/logistics/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companySlug: slug,
          pickupAddress,
          dropoffAddress,
          weightKg: Number(weightKg) || 1,
          serviceType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.quote) {
        setQuoteResult(data.quote);
      } else {
        alert(data.error || "Failed to calculate quote");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error estimating quote");
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    const targetUrl = slug
      ? `/site/${slug}/logistics/trackorder?tracking=${encodeURIComponent(trackingCode.trim())}`
      : `/logistics/trackorder?tracking=${encodeURIComponent(trackingCode.trim())}`;
    router.push(targetUrl);
  };

  const handleProceedToBook = () => {
    const query = new URLSearchParams({
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      weight: weightKg,
      service: serviceType,
    });
    const targetUrl = slug
      ? `/site/${slug}/logistics/book?${query.toString()}`
      : `/logistics/book?${query.toString()}`;
    router.push(targetUrl);
  };

  return (
    <section id="booking" className="relative min-h-[900px] bg-[#050505] overflow-hidden flex items-center py-20">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-orange-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Dynamic Copy */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#f7941d] animate-ping" />
              <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.2em]">
                {badgeText}
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-none uppercase italic">
                Streamline <br />
                <span className="text-[#f7941d] not-italic">Your Supply</span> <br />
                Chain
              </h2>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <p className="text-gray-400 max-w-md text-base md:text-lg leading-relaxed font-light">
                {descriptionText}
              </p>
            </motion.div>
          </div>

          {/* Right Side: Interactive Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-600 rounded-3xl blur opacity-20"></div>

            <div className="relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all relative ${
                      activeTab === tab.id ? "text-[#f7941d]" : "text-white/40 hover:text-white"
                    }`}
                  >
                    {tab.icon}
                    <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#f7941d]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {/* QUOTE CALCULATOR TAB */}
                  {activeTab === "quote" && (
                    <motion.form
                      key="quote"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleCalculateQuote}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          icon={<MapPinIcon className="w-4 h-4" />}
                          label="Pickup Address"
                          placeholder="e.g. Nairobi CBD"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                        />
                        <InputField
                          icon={<MapPinIcon className="w-4 h-4" />}
                          label="Destination Address"
                          placeholder="e.g. Westlands, Delta Corner"
                          value={dropoffAddress}
                          onChange={(e) => setDropoffAddress(e.target.value)}
                        />
                        <InputField
                          icon={<ScaleIcon className="w-4 h-4" />}
                          label="Approx Weight (KG)"
                          placeholder="10"
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(e.target.value)}
                        />
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">
                            Service Tier
                          </label>
                          <div className="relative">
                            <select
                              value={serviceType}
                              onChange={(e) => setServiceType(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-xs font-bold outline-none appearance-none focus:border-[#f7941d]/50"
                            >
                              <option value="STANDARD" className="bg-[#111]">Standard Dispatch</option>
                              <option value="EXPRESS" className="bg-[#111]">Express Courier</option>
                              <option value="SAME_DAY" className="bg-[#111]">Same-Day Urgent</option>
                              <option value="COLD_CHAIN" className="bg-[#111]">Cold-Chain Refrig</option>
                            </select>
                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Display Quote Results If Available */}
                      {quoteResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 border border-[#f7941d]/40 rounded-2xl p-5 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-black uppercase text-white/50 tracking-wider">
                                Calculated Dispatch Fee
                              </p>
                              <p className="text-3xl font-black text-[#f7941d] font-mono">
                                ${quoteResult.total.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">
                                Distance: ~{quoteResult.estimatedDistanceKm} KM
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                ETA: ~{quoteResult.estimatedTimeMins} Mins
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleProceedToBook}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl"
                          >
                            Proceed to Book Delivery <ArrowRightIcon className="w-4 h-4" />
                          </button>
                        </motion.div>
                      )}

                      {!quoteResult && (
                        <button
                          type="submit"
                          disabled={loadingQuote}
                          className="w-full py-5 bg-[#f7941d] hover:bg-white hover:text-black text-white font-black uppercase text-xs tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {loadingQuote ? "Calculating Optimal Route..." : buttonText}
                          <PaperAirplaneIcon className="w-4 h-4" />
                        </button>
                      )}
                    </motion.form>
                  )}

                  {/* TRACK CARGO TAB */}
                  {activeTab === "track" && (
                    <motion.form
                      key="track"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleTrackSubmit}
                      className="py-8 flex flex-col items-center text-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <MagnifyingGlassIcon className="w-8 h-8 text-[#f7941d]" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-white text-xl font-bold">Track Shipment</h3>
                        <p className="text-white/40 text-xs max-w-[280px]">
                          Enter your Consignment Tracking ID (e.g. TRK-xxxx) to view live location and timeline.
                        </p>
                      </div>
                      <div className="w-full">
                        <input
                          type="text"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          placeholder="TRK-990-221-X"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-center font-mono tracking-widest outline-none focus:border-[#f7941d] transition-all text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!trackingCode.trim()}
                          className="mt-4 w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#f7941d] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Locate Consignment Now
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* LIVE SUPPORT TAB */}
                  {activeTab === "support" && (
                    <motion.div
                      key="support"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-8 text-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-orange-600/10 rounded-full flex items-center justify-center border border-orange-500/20 mx-auto">
                        <PhoneArrowUpRightIcon className="w-8 h-8 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-white text-xl font-bold">24/7 Logistics Dispatch Desk</h3>
                        <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">
                          Our operations dispatch team is available around the clock to support customs, bulk cargo manifests, and fleet re-routing.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <a
                          href={slug ? `/site/${slug}/contact` : "/contact"}
                          className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold uppercase tracking-wider"
                        >
                          Send Inquiry
                        </a>
                        <button
                          onClick={() => {
                            if (slug) router.push(`/site/${slug}/logistics/book`);
                          }}
                          className="px-6 py-3.5 bg-[#f7941d] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-white hover:text-black transition-colors"
                        >
                          Book Custom Fleet
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] group-focus-within:text-[#f7941d] transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#f7941d] transition-colors">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white text-xs placeholder:text-white/15 outline-none focus:border-[#f7941d]/50 transition-colors"
        />
      </div>
    </div>
  );
}