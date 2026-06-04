"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  SparklesIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface HeroProps {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  heroSlides?: HeroSlide[] | null;
  marketplaceListings?: MarketListingForm[] | null;
}

const defaultHeroData = {
  name: "Premium Dry Cleaning",
  description: "Professional laundry services delivered to your doorstep. We treat your garments like the investment they are.",
  bannerUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2940&auto=format&fit=crop",
  marketplaceListings: [],
  badgeText: "Premium Service",
  type: "Hero",
  imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2940&auto=format&fit=crop",
  productImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2940&auto=format&fit=crop",
  headline: "Premium Dry Cleaning",
  subline: "Professional laundry services delivered to your doorstep. We treat your garments like the investment they are.",
  ctaText: "Book Now",
  ctaLink: "/bookings",
  videoLink: null,
  price: 29.99,
  endsAt: null,
  stats: { customers: 1000, countries: 20 },
  order: 0,
  iconKey: null,
  backgroundColor: null,
  textColor: null,
};

// Available time slots configuration
const TIME_SLOTS = [
  "08:00 AM - 11:00 AM",
  "11:00 AM - 02:00 PM",
  "02:00 PM - 05:00 PM",
  "05:00 PM - 08:00 PM",
];

export default function Hero({
  name,
  description,
  bannerUrl,
  heroSlides,
  marketplaceListings,
}: HeroProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#00A880";
  const router = useRouter();

  // --- Multi-slide Orchestration Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  // Normalize slide data so single items and multiple items use the exact same render pipe
  const slides = useMemo(() => {
    if (heroSlides && heroSlides.length > 0) {
      return heroSlides.map((slide) => ({
        name: slide.headline || name || defaultHeroData.name,
        description: slide.subline || description || defaultHeroData.description,
        bannerUrl: slide.imageUrl || slide.productImageUrl || bannerUrl || defaultHeroData.bannerUrl,
        badgeText: slide.badgeText || defaultHeroData.badgeText,
        ctaText: slide.ctaText || defaultHeroData.ctaText,
        ctaLink: slide.ctaLink || defaultHeroData.ctaLink,
      }));
    }
    return [
      {
        name: name || defaultHeroData.name,
        description: description || defaultHeroData.description,
        bannerUrl: bannerUrl || defaultHeroData.bannerUrl,
        badgeText: defaultHeroData.badgeText,
        ctaText: defaultHeroData.ctaText,
        ctaLink: defaultHeroData.ctaLink,
      },
    ];
  }, [name, description, bannerUrl, heroSlides]);

  // Autoplay functionality
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      handleNextSlide();
    }, 7000);
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

  // Get active configurations based on pointer index
  const activeSlide = slides[currentSlide];
  const verifiedListings = marketplaceListings?.length ? marketplaceListings : defaultHeroData.marketplaceListings;

  // --- Booking Bar Local Functional State ---
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [date, setDate] = useState<Date | null>(new Date());
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Automatically select the first listing if available
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
      setError("Please pick a valid service type.");
      return;
    }
    if (!date || !timeSlot) {
      setError("Please supply both your preferred date and time range.");
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

  // Modern Slide Animations
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 100 : -100,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -100 : 100,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section className="relative min-h-[100vh] lg:min-h-screen w-full bg-slate-50 dark:bg-[#090d16] transition-colors duration-300 overflow-hidden flex items-center pt-24 pb-12 lg:py-0">
      
      {/* Background Slideshow Engine */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={activeSlide.bannerUrl}
              loader={loader}
              alt={activeSlide.name}
              fill
              priority
              className="object-cover object-center scale-105 motion-safe:animate-[zoom_20s_infinite_alternate]"
            />
            {/* Ambient gradients optimized dynamically across Light (white overlay tint) and Dark (dark masking) modes */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent dark:from-[#05070c]/95 dark:via-[#05070c]/70 dark:to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 lg:hidden" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Kinetic Ambient Background Typography */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10 hidden md:block overflow-hidden select-none">
        <motion.h2
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="text-[14vw] font-black text-white/[0.03] dark:text-white/[0.015] uppercase whitespace-nowrap leading-none tracking-tighter"
        >
          Freshness • 24H Delivery • Eco-Friendly • Premium • Care • Clean • Care • 
        </motion.h2>
      </div>

      <div className="relative z-20 w-full max-w-[1440px] mx-auto pt-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: Context Slider Text Panel */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left text-white h-full min-h-[320px] lg:min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md bg-white/10 text-white border border-white/20"
                  style={{ color: primaryColor }}
                >
                  <SparklesIcon className="h-3.5 w-3.5 animate-pulse" />
                  {activeSlide.badgeText}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                {activeSlide.name}
              </h1>

              <p className="max-w-xl text-slate-200 text-sm sm:text-base md:text-lg font-light leading-relaxed">
                {activeSlide.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2 backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <ShoppingBagIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" style={{ color: primaryColor }} />
                  <span>On-Demand Custom Services</span>
                </div>
                <div className="flex items-center gap-2 backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <TruckIcon className="h-4 sm:h-5 w-4 sm:w-5 text-white" style={{ color: primaryColor }} />
                  <span>Contactless Doorstep Pickup</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Pagination Controls (Rendered if multi-slide context is active) */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-8 sm:mt-12 z-30">
              <div className="flex gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentSlide ? 1 : -1);
                      setCurrentSlide(idx);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevSlide}
                  className="p-1.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="p-1.5 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Ultra-Clean Smart Booking Card Component */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 w-full flex items-center z-20"
        >
          <div className="bg-white/90 dark:bg-[#111827]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] w-full border border-slate-200/50 dark:border-slate-800/50 shadow-2xl transition-colors duration-300">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Book Appointment
              </h3>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5">
                Select options & check slot availability
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service selection array */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Select Laundry Service
                </label>
                <div className="relative">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full appearance-none p-3.5 sm:p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-transparent focus:border-slate-300 dark:focus:border-slate-700 outline-none transition text-sm font-medium"
                  >
                    {verifiedListings.length === 0 ? (
                      <option value="">No services available</option>
                    ) : (
                      verifiedListings.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} — ${service.finalPrice ?? service.sellingPrice ?? "0.00"}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <ChevronRightIcon className="h-4 w-4 transform rotate-90" />
                  </div>
                </div>
              </div>

              {/* Datepicker Wrapper */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Preferred Pickup Date
                </label>
                <div className="relative custom-datepicker-container">
                  <DatePicker
                    selected={date}
                    onChange={(d) => setDate(d)}
                    minDate={new Date()}
                    className="w-full p-3.5 sm:p-4 pl-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-transparent outline-none transition text-sm font-medium"
                    placeholderText="Choose date"
                    dateFormat="MMMM d, yyyy"
                  />
                  <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Functional Dynamic Time Slots Picker */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Preferred Window Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white font-semibold"
                            : "bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ClockIcon className={`h-4 w-4 shrink-0 ${isSelected ? "text-inherit" : "text-slate-400"}`} />
                        <span className="line-clamp-1">{slot.split(" - ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Errors Feedback System */}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-xs text-rose-500 font-medium"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit CTA Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative mt-4 text-white rounded-xl py-4 font-semibold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Find Availability
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Embedded CSS Overrides for React Datepicker to inherit dark-mode compatibility cleanly */}
      <style jsx global>{`
        .custom-datepicker-container .react-datepicker-wrapper {
          width: 100%;
        }
        .dark .react-datepicker {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
          color: white !important;
        }
        .dark .react-datepicker__header {
          background-color: #111827 !important;
          border-bottom-color: #374151 !important;
        }
        .dark .react-datepicker__current-month,
        .dark .react-datepicker__day-name,
        .dark .react-datepicker__day {
          color: #f3f4f6 !important;
        }
        .dark .react-datepicker__day:hover {
          background-color: #374151 !important;
        }
        .dark .react-datepicker__day--disabled {
          color: #4b5563 !important;
        }
        @keyframes zoom {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
      `}</style>
    </section>
  );
}