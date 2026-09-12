'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  ChevronDownIcon,
  CalendarDaysIcon,
  ArrowRightIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { HeroSlide, MarketListingForm } from "@/types/typings";
import { EditableElement } from "@/contexts/EditableContentContext";

import bannerLaundry from "@/assets/homebanner.png";

const TIME_SLOTS = [
  "09:00 AM - 11:30 AM",
  "11:30 AM - 02:00 PM",
  "02:00 PM - 04:30 PM",
  "04:30 PM - 07:00 PM",
];

export default function HeroSection({
  storeFormData,
  heroSlides,
  marketplaceListings,
}: {
  storeFormData: any;
  heroSlides?: HeroSlide[];
  marketplaceListings?: MarketListingForm[] | null;
}) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // --- Theme & Fallback Orchestration ---
  const defaultStoreData = {
    slug: "your-business",
    name: "Your Life.",
    description: "Effortless solutions for your everyday needs.",
    themeSettings: { primaryColor: "#43A047", secondaryColor: "#FFB300" },
    storeCategories: [
      { id: "cat1", name: "Washing & Laundry", shortDescription: "Fresh clothes, clean delivery.", banner: bannerLaundry.src, slug: "laundry" },
    ],
  };

  const currentStoreData = storeFormData || defaultStoreData;
  const { slug, name, description, themeSettings } = currentStoreData;
  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50"; 
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107"; 

  const firstSlide = heroSlides?.[0] || {
    productImageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    headline: name,
    subline: "Simplified.",
    badgeText: description,
    ctaText: "Book Your Session",
  };

  // --- Functional Booking Core Engine ---
  const verifiedListings = marketplaceListings?.length ? marketplaceListings : [];
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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const currentService = verifiedListings.find(item => String(item.id) === selectedServiceId);
    if (!currentService && verifiedListings.length > 0) {
      setError("Please select a service experience.");
      return;
    }
    if (!date || !timeSlot) {
      setError("Please designate your preferred date and timeline window slot.");
      return;
    }

    setLoading(true);

    const query: Record<string, string> = {
      listingId: currentService ? String(currentService.id) : "",
      name: currentService?.name ?? "General Premium Session",
      price: currentService?.finalPrice !== undefined ? String(currentService.finalPrice) : String(currentService?.sellingPrice ?? 0),
      date: date.toISOString().split("T")[0],
      timeSlot,
    };
    const params = new URLSearchParams(query);
    router.push(`/bookings/checkout?${params.toString()}`);
  };

  // --- Unified Animation Presets ---
  const slideInRight = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    exit: { x: "100%", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeOverlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-stretch overflow-hidden bg-gray-50 text-gray-900 font-sans">
      
      {/* Structural Geometry Accents */}
      <div
        className="absolute top-0 right-0 w-[60%] h-full hidden lg:block pointer-events-none z-0"
        style={{
          background: `linear-gradient(145deg, ${primaryColor}0d 0%, ${secondaryColor}1a 100%)`, 
          clipPath: "polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      />

      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-stretch">
        
        {/* Left Side: Editorial Image Block */}
        <div className="relative w-full lg:w-1/2 min-h-[45vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${firstSlide.productImageUrl || firstSlide.imageUrl})` }}
          >
            {/* Soft Contrast Shading Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 mix-blend-multiply" />
            <div className="absolute inset-0 bg-radial-gradient" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.2) 100%)' }} />
          </motion.div>
          
          {/* Subtle Frame Border Lines */}
          <div className="absolute inset-6 border border-white/10 pointer-events-none hidden sm:block" />
        </div>

        {/* Right Side: Typographic Hero Pane */}
        <div className="relative w-full lg:w-1/2 p-6 sm:p-12 lg:p-24 flex flex-col justify-center text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-auto lg:mx-0 flex flex-col items-center lg:items-start"
          >
            {/* Interactive Concept Sub-Badge */}
            <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-700">
              <SparklesIcon className="h-3.5 w-3.5" style={{ color: primaryColor }} />
              <EditableElement
                targetId="services.home.hero.HeroSection.main.badgeText"
                componentKey="HeroSection"
                elementKey="badgeText"
                label="Badge Text"
                defaultValue={firstSlide.badgeText || description}
                inline
              >
                {(val) => <span>{val}</span>}
              </EditableElement>
            </div>

            {/* Dynamic Headline Composition */}
            <EditableElement
              targetId="services.home.hero.HeroSection.main.headline"
              componentKey="HeroSection"
              elementKey="headline"
              label="Headline"
              defaultValue={firstSlide.headline}
            >
              {(val) => {
                const hl = typeof val === "string" ? val : (firstSlide.headline || "");
                const firstWord = hl.split(" ")[0] || "";
                const restWords = hl.split(" ").slice(1).join(" ");
                return (
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-gray-900 uppercase">
                    {firstWord} <br />
                    <span className="font-light italic lowercase tracking-normal" style={{ color: primaryColor }}>
                      {restWords || "Redefined."}
                    </span>
                  </h1>
                );
              }}
            </EditableElement>

            {/* Narrative Sub-Description */}
            <EditableElement
              targetId="services.home.hero.HeroSection.main.subline"
              componentKey="HeroSection"
              elementKey="subline"
              label="Subline"
              defaultValue={firstSlide.subline || "Experience customized operational perfection built cleanly around your custom calendar framework."}
            >
              {(val) => (
                <p className="mt-6 text-lg sm:text-xl font-normal text-gray-600 leading-relaxed max-w-md">
                  {val}
                </p>
              )}
            </EditableElement>

            {/* Cinematic Interaction Trigger Button */}
            <div className="mt-10 w-full sm:w-auto">
              <motion.button
                onClick={() => setIsDrawerOpen(true)}
                className="group relative w-full sm:w-auto px-10 py-5 overflow-hidden rounded-xl font-bold tracking-widest text-xs uppercase shadow-xl transition-all duration-300"
                style={{ backgroundColor: primaryColor, color: "#fff" }}
                whileHover={{ scale: 1.03, boxShadow: `0 20px 35px -10px ${primaryColor}50` }}
                whileTap={{ scale: 0.98 }}
              >
                <EditableElement
                  targetId="services.home.hero.HeroSection.main.ctaText"
                  componentKey="HeroSection"
                  elementKey="ctaText"
                  label="Button Text"
                  defaultValue={firstSlide.ctaText || "Secure Your Session"}
                  inline
                >
                  {(val) => (
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {val} 
                      <ArrowRightIcon className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-2" />
                    </span>
                  )}
                </EditableElement>
                {/* Micro Glare Shimmer Track Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out" />
              </motion.button>
            </div>

            {/* Premium Micro-Trust Verification Grid */}
            <div className="mt-16 w-full pt-8 border-t border-gray-200/60 grid grid-cols-3 gap-4 text-left">
              <div className="flex flex-col gap-1">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 mt-1">Verified</span>
                <span className="text-[11px] text-gray-400">Top Tier Services</span>
              </div>
              <div className="flex flex-col gap-1">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 mt-1">Flexible</span>
                <span className="text-[11px] text-gray-400">Easy Rescheduling</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-5 w-5 flex items-center justify-center text-xs font-mono font-bold bg-gray-200 text-gray-700 rounded-full scale-90 -ml-1">★</div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 mt-1">Premium</span>
                <span className="text-[11px] text-gray-400">5-Star Experiences</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* Embedded Booking Context Side-Drawer System Layout */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dimmed Overlay Matte Layer */}
            <motion.div
              variants={fadeOverlay}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
            />

            {/* Slide-out Context Form Container Workspace */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col p-6 sm:p-10 border-l border-gray-100"
            >
              {/* Header Configuration Panel */}
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">Configure Session</h3>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Tailor your next experience</p>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-900"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form Input Scrolling Environment Panel */}
              <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto py-8 space-y-8 pr-1 select-none">
                
                {/* Dynamic Selection Input Matrix Column */}
                {verifiedListings.length > 0 && (
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                      Select Desired Experience
                    </label>
                    <div className="relative flex items-center border-b-2 border-gray-100 group-focus-within:border-gray-900 transition-colors pb-2">
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="bg-transparent w-full text-gray-900 outline-none cursor-pointer text-base font-semibold appearance-none pr-8"
                      >
                        {verifiedListings.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} — ${service.finalPrice ?? service.sellingPrice ?? "0.00"}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-0 h-4 w-4 pointer-events-none text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Date Selection Layer Configuration Row */}
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                    Designated Calendar Date
                  </label>
                  <div className="flex items-center border-b-2 border-gray-100 group-focus-within:border-gray-900 transition-colors pb-2 custom-service-picker">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                    <DatePicker
                      selected={date}
                      onChange={(d) => setDate(d)}
                      minDate={new Date()}
                      className="bg-transparent w-full text-gray-900 outline-none cursor-pointer text-base font-semibold"
                      dateFormat="EEEE, MMMM d, yyyy"
                    />
                  </div>
                </div>

                {/* Grid-based Time Allocation Framework Row */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Preferred Timing Window Slot
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-4 text-left text-sm font-bold rounded-xl transition-all border-2 ${
                            isSelected
                              ? "text-white shadow-md"
                              : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100"
                          }`}
                          style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Validation Response Overlay Block */}
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg">
                    {error}
                  </motion.p>
                )}
              </form>

              {/* Sticky Action Dynamic Execution Area */}
              <div className="pt-4 border-t border-gray-100 bg-white">
                <button
                  type="submit"
                  onClick={handleBookingSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirm & Checkout <ArrowRightIcon className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Decorative Interactive Page Navigation Element */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-gray-300 animate-bounce hidden lg:block pointer-events-none z-0">
        <ChevronDownIcon className="w-6 h-6" />
      </div>

      {/* Global CSS Styling Framework Adaptations for Datepicker */}
      <style jsx global>{`
        .custom-service-picker .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          border: 1px solid #f3f4f6 !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          font-family: inherit !important;
          padding: 8px;
        }
        .react-datepicker__header {
          background-color: #ffffff !important;
          border-bottom: 1px solid #f3f4f6 !important;
          border-radius: 16px 16px 0 0 !important;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected {
          background-color: ${primaryColor} !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: bold;
        }
        .react-datepicker__day:hover {
          background-color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
      `}</style>
    </section>
  );
}