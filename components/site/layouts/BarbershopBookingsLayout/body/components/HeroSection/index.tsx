"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarDaysIcon,
  ClockIcon,
  TicketIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

interface HeroProps {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  heroSlides?: HeroSlide[] | null;
  marketplaceListings?: MarketListingForm[] | null;
}

const defaultHeroData = {
  name: "CRAFTED GROOMING",
  description: "Experience absolute precision from master barbers who treat your haircut like a fine art form.",
  bannerUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2940&auto=format&fit=crop",
  marketplaceListings: [],
  badgeText: "The Art of the Blade",
};

const TIME_SLOTS = [
  "09:00 AM - 11:30 AM",
  "11:30 AM - 02:00 PM",
  "02:00 PM - 04:30 PM",
  "04:30 PM - 07:00 PM",
];

export default function Hero({
  name,
  description,
  bannerUrl,
  heroSlides,
  marketplaceListings,
}: HeroProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#D4AF37"; // Signature Premium Gold
  const router = useRouter();

  // --- Multi-slide Orchestration Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = useMemo(() => {
    if (heroSlides && heroSlides.length > 0) {
      return heroSlides.map((slide) => ({
        name: slide.headline || name || defaultHeroData.name,
        description: slide.subline || description || defaultHeroData.description,
        bannerUrl: slide.imageUrl || bannerUrl || defaultHeroData.bannerUrl,
        badgeText: slide.badgeText || defaultHeroData.badgeText,
      }));
    }
    return [
      {
        name: name || defaultHeroData.name,
        description: description || defaultHeroData.description,
        bannerUrl: bannerUrl || defaultHeroData.bannerUrl,
        badgeText: defaultHeroData.badgeText,
      },
    ];
  }, [name, description, bannerUrl, heroSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      handleNextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[currentSlide];
  const verifiedListings = marketplaceListings?.length ? marketplaceListings : defaultHeroData.marketplaceListings;

  // --- Functional Booking State Logic ---
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (verifiedListings.length > 0 && !selectedServiceId) {
      setSelectedServiceId(String(verifiedListings[0].id));
    }
  }, [verifiedListings, selectedServiceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const currentService = verifiedListings.find(
      (item) => String(item.id) === selectedServiceId
    );

    if (!currentService) {
      setError("Please choose a styling treatment service.");
      return;
    }
    if (!date || !timeSlot) {
      setError("Please designate your preferred date and runtime window slot.");
      return;
    }

    setLoading(true);

    const query: Record<string, string> = {
      listingId: String(currentService.id),
      name: currentService.name ?? "",
      price: currentService.finalPrice !== undefined ? String(currentService.finalPrice) : String(currentService.sellingPrice ?? 0),
      date: date.toISOString().split("T")[0],
      timeSlot,
    };
    const params = new URLSearchParams(query);
    router.push(`/bookings/checkout?${params.toString()}`);
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 0.45, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, transition: { duration: 0.5 } }),
  };

  return (
    <section className="relative min-h-[100vh] lg:min-h-screen w-full bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden flex items-center pt-28 pb-16 lg:py-0">
      
      {/* 1. BACKGROUND WITH SLIDESHOW ENGINE */}
      <div className="absolute inset-0 z-0 bg-black">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full grayscale opacity-45 select-none pointer-events-none"
          >
            <Image
              src={activeSlide.bannerUrl}
              loader={loader}
              alt={activeSlide.name}
              fill
              priority
              className="object-cover object-center transform scale-100 dark:brightness-90"
            />
          </motion.div>
        </AnimatePresence>
        {/* Responsive Atmospheric Masks */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#050505] dark:via-[#050505]/85 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white dark:from-[#050505]/95 dark:via-[#050505]/70 dark:to-[#050505] lg:hidden" />
      </div>

      {/* 2. COMPOSITIONAL MARQUEE LOGO BACKGROUND LAYER */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-10 select-none">
        <motion.h2 
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="text-[20vw] font-black text-black/[0.02] dark:text-white/[0.015] whitespace-nowrap uppercase leading-none tracking-tighter font-mono"
        >
          SHARP & CLASSIC • {activeSlide.name} • THE ART OF THE BLADE • 
        </motion.h2>
      </div>

      <div className="relative z-20 w-full max-w-[1440px] my-auto pt-8 mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* 3. TEXTUAL CONTENT SLIDER PANEL */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-slate-800 dark:text-slate-200">
                  {activeSlide.badgeText}
                </p>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tight uppercase">
                {activeSlide.name.split(" ")[0]} <br />
                <span className="italic font-serif font-light normal-case" style={{ color: primaryColor }}>
                  {activeSlide.name.split(" ").slice(1).join(" ") || "Confidence."}
                </span>
              </h1>

              <p className="max-w-lg text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Info Badge Panels */}
          <div className="flex flex-wrap gap-6 sm:gap-8 items-center mt-8 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
            <div className="group flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-colors group-hover:bg-slate-900 dark:group-hover:bg-white text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-black">
                <TicketIcon className="h-5 w-5 transition-colors" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase font-mono">View Pricing</p>
                <p className="text-slate-400 text-xs mt-0.5">Haircuts from $35.00</p>
              </div>
            </div>

            <div className="group flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center transition-colors group-hover:bg-slate-900 dark:group-hover:bg-white text-slate-900 dark:text-white group-hover:text-white dark:group-hover:text-black">
                <ClockIcon className="h-5 w-5 transition-colors" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase font-mono">Open Daily</p>
                <p className="text-slate-400 text-xs mt-0.5">9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>

          {/* Carousel Dot Selectors */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-8">
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentSlide ? 1 : -1);
                      setCurrentSlide(idx);
                    }}
                    className="h-1.5 transition-all duration-300"
                    style={{
                      width: idx === currentSlide ? "24px" : "6px",
                      backgroundColor: idx === currentSlide ? primaryColor : "rgba(156, 163, 175, 0.4)",
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={handlePrevSlide} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button onClick={handleNextSlide} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. THE BOOKING ENGINE CARD CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 w-full flex items-center z-20"
        >
          <div 
            className="relative w-full bg-white/95 dark:bg-[#0d0d0d]/90 backdrop-blur-2xl p-6 sm:p-10 rounded-sm border-l-4 shadow-2xl transition-colors duration-300 border-slate-200 dark:border-slate-900"
            style={{ borderLeftColor: primaryColor }}
          >
            {/* Structural Geometric Top Accent Accent Frame */}
            <div className="absolute top-0 right-0 p-4 opacity-30">
              <div className="w-6 h-6 border-t-2 border-r-2 border-black dark:border-white" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">
              Book the Chair
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs tracking-widest uppercase mt-1 mb-8 font-medium">
              Select your next experience
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Service Select Row Input */}
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: primaryColor }}>
                  Service Treatment
                </label>
                <div className="flex items-center border-b border-black/10 dark:border-white/10 group-focus-within:border-slate-900 dark:group-focus-within:border-white transition-colors pb-1.5">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="bg-transparent w-full text-slate-900 dark:text-white outline-none cursor-pointer text-sm font-medium appearance-none py-1"
                  >
                    {verifiedListings.length === 0 ? (
                      <option value="" className="dark:bg-black">No services found</option>
                    ) : (
                      verifiedListings.map((service) => (
                        <option key={service.id} value={service.id} className="dark:bg-[#0d0d0d] dark:text-white">
                          {service.name} — ${service.finalPrice ?? service.sellingPrice ?? "35.00"}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Datepicker Wrapper Row */}
              <div className="group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: primaryColor }}>
                  Desired Appointment Date
                </label>
                <div className="flex items-center border-b border-black/10 dark:border-white/10 group-focus-within:border-slate-900 dark:group-focus-within:border-white transition-colors pb-1.5 custom-barber-picker">
                  <CalendarDaysIcon className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    minDate={new Date()}
                    className="bg-transparent w-full text-slate-900 dark:text-white outline-none cursor-pointer text-sm font-medium"
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
              </div>

              {/* Functional Horizontal Time Slots Strip Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: primaryColor }}>
                  Select Time Window
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`p-2.5 text-left text-xs tracking-tight transition-all font-mono border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white font-bold"
                            : "bg-slate-50 dark:bg-slate-900/50 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        {slot.split(" - ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Error Alerts UI */}
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-rose-500 font-semibold">
                  {error}
                </motion.p>
              )}

              {/* Elegant Barbershop Themed Sweep Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs sm:text-sm py-4 group transition-all duration-300 disabled:opacity-50"
              >
                {/* Background sliding accent block layout interaction on mouse hover */}
                <div 
                  className="absolute inset-0 w-0 group-hover:w-full transition-all duration-500 ease-[0.76,0,0.24,1]" 
                  style={{ backgroundColor: primaryColor }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Check Chair Availability <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <p className="mt-6 text-center text-slate-400 dark:text-slate-600 text-[9px] uppercase tracking-[0.15em] font-bold font-mono">
              Instant Confirmation • Premium Experience
            </p>
          </div>
        </motion.div>
      </div>

      {/* 5. VERTICAL PROGRESS SCROLL TIMELINE TICKER ACCENT */}
      <div className="absolute right-8 bottom-12 hidden xl:flex flex-col items-center gap-6 select-none pointer-events-none">
        <div className="h-32 w-[1px] bg-black/10 dark:bg-white/10 relative overflow-hidden">
          <motion.div 
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 w-full h-1/2"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
        <span className="text-slate-400 font-bold text-[10px] [writing-mode:vertical-lr] tracking-[0.4em] uppercase font-mono opacity-60">
          Scroll to Explore
        </span>
      </div>

      {/* Global CSS Datepicker Overrides matching Barbershop Palette */}
      <style jsx global>{`
        .custom-barber-picker .react-datepicker-wrapper {
          width: 100%;
        }
        .dark .react-datepicker {
          background-color: #0d0d0d !important;
          border-color: #1a1a1a !important;
          color: white !important;
          font-family: monospace;
        }
        .dark .react-datepicker__header {
          background-color: #050505 !important;
          border-bottom-color: #1a1a1a !important;
        }
        .dark .react-datepicker__current-month,
        .dark .react-datepicker__day-name,
        .dark .react-datepicker__day {
          color: #e5e7eb !important;
        }
        .dark .react-datepicker__day:hover {
          background-color: #1a1a1a !important;
          color: ${primaryColor} !important;
        }
        .dark .react-datepicker__day--selected {
          background-color: ${primaryColor} !important;
          color: black !important;
        }
      `}</style>
    </section>
  );
}