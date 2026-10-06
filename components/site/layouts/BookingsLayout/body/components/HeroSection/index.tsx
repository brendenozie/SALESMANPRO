"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const defaultHeroData = {
  name: "Premium Services on Demand",
  description: "Connect with elite, vetted independent professionals. Instantly scheduled, zero friction.",
  bannerUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
  marketplaceListings: [],
};

export interface HeroProps {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  heroSlides?: HeroSlide[] | null;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function Hero({
  name,
  description,
  bannerUrl,
  heroSlides,
  marketplaceListings,
}: HeroProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#00A880';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedListing, setSelectedListing] = useState<MarketListingForm | null>(null);
  const [activeStep, setActiveStep] = useState<"service" | "date" | "time">("service");
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const heroData = useMemo(() => {
    let firstSlide: Partial<HeroSlide> = heroSlides?.[0] ?? {};
    return {
      name: firstSlide.headline || name || defaultHeroData.name,
      description: firstSlide.subline || description || defaultHeroData.description,
      bannerUrl: firstSlide.imageUrl || bannerUrl || defaultHeroData.bannerUrl,
      marketplaceListings: marketplaceListings?.length ? marketplaceListings : defaultHeroData.marketplaceListings,
    };
  }, [name, description, bannerUrl, heroSlides, marketplaceListings]);

  const filteredListings = useMemo(() => {
    if (!searchTerm) return [];
    return heroData.marketplaceListings
      ?.filter((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      ?.slice(0, 4)
      ?.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0] ?? null,
        category: item.category || "Service",
        price: item.finalPrice ?? item.sellingPrice ?? 0
      }));
  }, [heroData.marketplaceListings, searchTerm]);

  const handleSelectListing = useCallback((listingId: string | number, name: string) => {
    const fullListing = heroData.marketplaceListings?.find(l => l.id === listingId) || null;
    setSelectedListing(fullListing);
    setSearchTerm(name);
    setError("");
    setActiveStep("date");
  }, [heroData.marketplaceListings]);

  const handleSubmit = () => {
    setError("");
    if (!selectedListing) {
      setError("Please select a service first.");
      setActiveStep("service");
      return;
    }
    if (!date) {
      setError("Please pick your appointment date.");
      setActiveStep("date");
      return;
    }
    if (!timeSlot) {
      setError("Please choose a time slot.");
      setActiveStep("time");
      return;
    }

    setLoading(true);
    const query: Record<string, string> = {
      listingId: String(selectedListing.id),
      name: selectedListing.name ?? "",
      price: selectedListing.finalPrice !== undefined ? String(selectedListing.finalPrice) : String(selectedListing.sellingPrice ?? 0),
      date: date.toISOString().split('T')[0],
      timeSlot,
    };
    router.push(`/bookings/checkout?${new URLSearchParams(query).toString()}`);
  };

  return (
    <section className="relative min-h-screen w-full bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20 lg:py-0 transition-colors duration-300">
      
      {/* BACKGROUND VISUAL CONTEXT OVERLAYS */}
      <div className="absolute inset-0 z-0 opacity-15 dark:opacity-40 mix-blend-luminosity pointer-events-none select-none transition-opacity duration-300">
        {heroData.bannerUrl && (
          <Image decoding="async"
            src={heroData.bannerUrl}
            alt="Context Visual Background"
            fill
            priority
            className="object-cover object-center scale-100"
          />
        )}
      </div>
      
      {/* Dynamic Ambient Gradients tailored to layout theme */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-50 via-neutral-50/95 to-neutral-100/40 dark:from-neutral-950 dark:via-neutral-950/90 dark:to-neutral-900/50 z-0 pointer-events-none transition-colors duration-300" />
      
      {/* Decorative Blur Ambient Orb */}
      <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full opacity-5 dark:opacity-10 blur-3xl pointer-events-none transition-opacity duration-300" style={{ backgroundColor: primaryColor }} />

      {/* CORE WRAPPER GRID */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* LEFT REGION: ASYMMETRIC CONTENT & TYPOGRAPHY */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-neutral-200/50 dark:bg-white/5 border border-neutral-300/60 dark:border-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-neutral-600 dark:text-neutral-300 font-semibold uppercase tracking-wider transition-colors"
          >
            <SparklesIcon className="h-4 w-4" style={{ color: primaryColor }} />
            <span>Verified Professional Marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.05] transition-colors"
          >
            {heroData.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed font-light transition-colors"
          >
            {heroData.description}
          </motion.p>

          {/* Quick-Discovery Chip Tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4 space-y-2.5"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 transition-colors">Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['House Cleaning', 'Plumbing', 'Massage', 'Tutors'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchTerm(tag);
                    setActiveStep("service");
                    const match = heroData.marketplaceListings?.find(i => i.name?.toLowerCase().includes(tag.toLowerCase()));
                    if (match) handleSelectListing(match.id, match.name || "");
                  }}
                  className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-700 shadow-sm dark:shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT REGION: LIGHT/DARK INTERACTIVE STEPPED BOOKING TICKET */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white/90 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/80 flex flex-col relative transition-all duration-300"
          >
            {/* Inline Dynamic Form Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-4 left-6 right-6 z-20 bg-red-500 dark:bg-red-500/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-xl text-center shadow-md"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slate Header Module */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6 transition-colors">
              <span className="text-sm font-bold tracking-tight text-neutral-800 dark:text-white transition-colors">Instant Booking Slate</span>
              <div className="flex items-center gap-1.5">
                {(["service", "date", "time"] as const).map((step, idx) => (
                  <div 
                    key={step} 
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: activeStep === step ? '24px' : '6px',
                      backgroundColor: activeStep === step ? primaryColor : (idx < ["service", "date", "time"].indexOf(activeStep) ? `${primaryColor}60` : '#d4d4d4')
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === step ? '' : (idx < ["service", "date", "time"].indexOf(activeStep) ? '' : 'bg-neutral-200 dark:bg-neutral-800')
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* COLLAPSIBLE ACCORDION DISCLOSURE ITEMS */}
            <div className="space-y-3 flex-grow unique-datepicker-theme-wrapper">
              
              {/* SLOT 01: SERVICE FINDER */}
              <div 
                onClick={() => setActiveStep("service")}
                className={`p-4 rounded-2xl transition-all border text-left ${
                  activeStep === "service" 
                    ? "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-700 shadow-sm dark:shadow-inner" 
                    : "bg-neutral-100/40 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-900 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase transition-colors">01. Choose Service</p>
                      <p className="text-sm font-bold text-neutral-800 dark:text-white mt-0.5 transition-colors">
                        {selectedListing ? selectedListing.name : "Select from listings..."}
                      </p>
                    </div>
                  </div>
                  {selectedListing && <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                </div>

                {activeStep === "service" && (
                  <div className="mt-4 space-y-2" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type keywords (e.g. Clean)..."
                      className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 transition-colors"
                      style={{ focusRingColor: primaryColor }}
                    />
                    <AnimatePresence>
                      {filteredListings.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-900 shadow-lg"
                        >
                          {filteredListings.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectListing(item.id, item.name || "")}
                              className="p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-bold text-neutral-800 dark:text-white">{item.name}</p>
                                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{item.category}</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">${item.price}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* SLOT 02: DYNAMIC CALENDAR SLATE */}
              <div 
                onClick={() => selectedListing && setActiveStep("date")}
                className={`p-4 rounded-2xl transition-all border text-left ${
                  !selectedListing ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                } ${
                  activeStep === "date" 
                    ? "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-700 shadow-sm dark:shadow-inner" 
                    : "bg-neutral-100/40 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors">
                      <CalendarDaysIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase transition-colors">02. Setup Date</p>
                      <p className="text-sm font-bold text-neutral-800 dark:text-white mt-0.5 transition-colors">
                        {date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "Select target date"}
                      </p>
                    </div>
                  </div>
                  {date && <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                </div>

                {activeStep === "date" && selectedListing && (
                  <div className="mt-3 flex justify-center bg-white dark:bg-neutral-900 rounded-xl p-2 border border-neutral-200 dark:border-neutral-800" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      selected={date}
                      onChange={(d) => { setDate(d); setActiveStep("time"); }}
                      inline
                      minDate={new Date()}
                    />
                  </div>
                )}
              </div>

              {/* SLOT 03: ARRIVAL WINDOW MATRICES */}
              <div 
                onClick={() => date && setActiveStep("time")}
                className={`p-4 rounded-2xl transition-all border text-left ${
                  !date ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                } ${
                  activeStep === "time" 
                    ? "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-300 dark:border-neutral-700 shadow-sm dark:shadow-inner" 
                    : "bg-neutral-100/40 dark:bg-neutral-950/40 border-neutral-200/60 dark:border-neutral-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors">
                      <ClockIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase transition-colors">03. Select Time</p>
                      <p className="text-sm font-bold text-neutral-800 dark:text-white mt-0.5 transition-colors">
                        {timeSlot ? timeSlot : "Pick arrival window"}
                      </p>
                    </div>
                  </div>
                  {timeSlot && <CheckCircleIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                </div>

                {activeStep === "time" && date && (
                  <div className="mt-3 grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                    {["09:00", "11:30", "14:00", "16:30"].map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTimeSlot(slot)}
                        className="py-2 text-xs font-mono font-bold rounded-xl border transition-all text-center focus:outline-none"
                        style={{
                          backgroundColor: timeSlot === slot ? primaryColor : undefined,
                          borderColor: timeSlot === slot ? primaryColor : undefined,
                          color: timeSlot === slot ? '#fff' : undefined
                        }}
                        className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all text-center ${
                          timeSlot === slot 
                            ? "shadow-sm" 
                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* SECURE FORM COMPLETION ACTION FOOTER */}
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transition-all"
                style={{ background: primaryColor }}
              >
                <span>{loading ? "Constructing Booking..." : "Secure Checkout Session"}</span>
                <ChevronRightIcon className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>

          </motion.div>
        </div>

      </div>

      {/* Global CSS Theme Injection Injector for Third-Party DatePicker Overrides */}
      <style jsx global>{`
        .unique-datepicker-theme-wrapper .react-datepicker {
          background-color: transparent !important;
          border: none !important;
          font-family: inherit !important;
        }
        .dark .unique-datepicker-theme-wrapper .react-datepicker__header {
          background-color: #171717 !important;
          border-bottom: 1px solid #262626 !important;
        }
        .dark .unique-datepicker-theme-wrapper .react-datepicker__day-name,
        .dark .unique-datepicker-theme-wrapper .react-datepicker__day {
          color: #e5e5e5 !important;
        }
        .dark .unique-datepicker-theme-wrapper .react-datepicker__day:hover {
          background-color: #262626 !important;
        }
        .dark .unique-datepicker-theme-wrapper .react-datepicker__day--current-day {
          border: 1px solid ${primaryColor} !important;
          background: transparent !important;
          border-radius: 0.375rem;
        }
        .dark .unique-datepicker-theme-wrapper .react-datepicker__day--selected {
          background-color: ${primaryColor} !important;
          color: white !important;
        }
        .unique-datepicker-theme-wrapper .react-datepicker__day--disabled {
          color: #bfbfbf !important;
          opacity: 0.35;
        }
      `}</style>
    </section>
  );
}