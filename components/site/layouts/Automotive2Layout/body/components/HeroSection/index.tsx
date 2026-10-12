"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ChevronDownIcon,
  TruckIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { IStoreCategory, ISubcategory, StoreForm, HeroSlide } from "@/types/typings";
import { EditableElement } from "@/components/site/EditableElement";
import { useWebsiteBuilderStore } from "@/lib/website-builder/websiteBuilderStore";

export interface SearchFilters {
  location: string;
  vehicleType: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  isBuy: boolean;
  category?: string;
  subcategory?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=2560",
    headline: "AFRICA'S\n#1 TRUCK\nMARKETPLACE",
    subline: "Buy. Sell. Finance. Deliver.\nAll in one powerful platform.",
    type: null,
    companyId: "",
    productImageUrl: null,
    ctaText: null,
    ctaLink: null,
    videoLink: null,
    badgeText: "#1 COMMERCIAL TRUCK PLATFORM IN AFRICA",
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    stats: null,
  },
];

export default function HeroCommandSection({
  store,
  onSearch,
  trendingLocations = [{ name: "Nairobi" }, { name: "Mombasa" }, { name: "Nakuru" }, { name: "Kiambu" }],
}: {
  store?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  trendingLocations?: { name: string }[];
}) {
  const isEditorMode = useWebsiteBuilderStore((s) => s.isEditorMode);
  const isPreviewMode = useWebsiteBuilderStore((s) => s.isPreviewMode);

  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultSlides;
  const categories = (store?.StoreCategory ?? []).filter((c) => c.visible ?? true);

  const [current, setCurrent] = useState(0);
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 25);
    mouseY.set((clientY / innerHeight - 0.5) * 25);
  };

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);

  useEffect(() => {
    if (isEditorMode && !isPreviewMode) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, isEditorMode, isPreviewMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const slide = heroSlides[current];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] w-full bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white selection:bg-amber-500/30 overflow-hidden flex flex-col justify-between pt-16 pb-10 px-4 md:px-8 transition-colors duration-300"
    >
      {/* 1. BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            style={{ x: springX, y: springY, scale: 1.05 }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <EditableElement
              targetId={`automotive2.home.hero.slide${current}.imageUrl`}
              label="Hero Background Image"
              field="imageUrl"
              type="image"
              className="absolute inset-0 w-full h-full"
            >
              <Image decoding="async"
                src={slide.imageUrl || defaultSlides[0].imageUrl!}
                alt="Hero Background"
                fill
                className="object-cover brightness-[0.85] dark:brightness-[0.25] saturate-[1.1]"
                priority
              />
            </EditableElement>
            {/* Visual Overlays & Gradients - Flipped for Light/Dark Mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-slate-50/70 to-slate-50/90 dark:from-[#05070A] dark:via-[#080B10]/70 dark:to-[#080B10]/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(248,250,252,0.7)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. MAIN HERO CONTENT */}
      <div className="relative z-10 my-auto w-full max-w-7xl mx-auto flex flex-col items-start justify-center pt-8">
        {/* Editor Slide Switcher Toolbar */}
        {isEditorMode && !isPreviewMode && heroSlides.length > 1 && (
          <div className="relative z-50 mb-4 inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 text-white border border-amber-500/40 backdrop-blur-md shadow-lg text-xs">
            <span className="font-bold text-amber-400 mr-1 px-1">Edit Slide:</span>
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  current === idx
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Slide #{idx + 1}
              </button>
            ))}
          </div>
        )}

        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 dark:border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15 px-4 py-1.5 backdrop-blur-md shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
          <EditableElement
            targetId={`automotive2.home.hero.slide${current}.badgeText`}
            label="Hero Badge Text"
            inline
          >
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {slide.badgeText || "#1 COMMERCIAL TRUCK PLATFORM IN AFRICA"}
            </span>
          </EditableElement>
        </motion.div>

        {/* Dynamic Headline */}
        <div className="mb-8 select-none max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <EditableElement
                targetId={`automotive2.home.hero.slide${current}.headline`}
                label="Hero Headline"
                inline
              >
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-black leading-[0.95] tracking-tight uppercase text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-xl whitespace-pre-line">
                  {slide.headline.includes("#1 TRUCK") ? (
                    <>
                      AFRICA’S{"\n"}
                      <span className="text-amber-500 dark:text-amber-400 drop-shadow-[0_4px_15px_rgba(245,158,11,0.2)] dark:drop-shadow-[0_4px_25px_rgba(245,158,11,0.3)]">
                        #1 TRUCK
                      </span>
                      {"\n"}MARKETPLACE
                    </>
                  ) : (
                    slide.headline
                  )}
                </h1>
              </EditableElement>

              {slide.subline && (
                <EditableElement
                  targetId={`automotive2.home.hero.slide${current}.subline`}
                  label="Hero Subline"
                  inline
                >
                  <div className="mt-2 text-base sm:text-lg md:text-xl font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-snug">
                    <span className="font-bold text-slate-900 dark:text-white block sm:inline">{slide.subline.split("\n")[0]}</span>{" "}
                    <span className="text-slate-600 dark:text-slate-400 font-normal">{slide.subline.split("\n")[1]}</span>
                  </div>
                </EditableElement>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. COMMAND SEARCH BAR CONSOLE */}
        <motion.div
          ref={containerRef}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-[999] w-full max-w-4xl"
        >
          <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-0 bg-white/90 dark:bg-[#0F141C]/90 backdrop-blur-2xl p-2 md:p-2.5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl ring-1 ring-black/5 dark:ring-black/40 transition-colors duration-300">
            {/* Category / Type Selector */}
            <CommandInput
              label="TYPE"
              value={selectedCategory?.displayName || "All Trucks"}
              icon={<TruckIcon className="h-4 w-4" />}
              active={activeDropdown === "cat"}
              onClick={() => setActiveDropdown(activeDropdown === "cat" ? null : "cat")}
              isFirst
            >
              <Dropdown isOpen={activeDropdown === "cat"}>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                    setActiveDropdown(null);
                  }}
                  className="dropdown-item"
                >
                  All Trucks
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubcategory(null);
                      setActiveDropdown(null);
                    }}
                    className="dropdown-item"
                  >
                    {cat.displayName}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            {/* Subcategory / Make Selector */}
            <CommandInput
              label="MAKE"
              value={selectedSubcategory?.name || "All Makes"}
              icon={<TagIcon className="h-4 w-4" />}
              active={activeDropdown === "sub"}
              disabled={!selectedCategory}
              onClick={() => setActiveDropdown(activeDropdown === "sub" ? null : "sub")}
            >
              <Dropdown isOpen={activeDropdown === "sub"}>
                <button
                  onClick={() => {
                    setSelectedSubcategory(null);
                    setActiveDropdown(null);
                  }}
                  className="dropdown-item"
                >
                  All Makes
                </button>
                {(selectedCategory?.subcategories || []).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubcategory(sub);
                      setActiveDropdown(null);
                    }}
                    className="dropdown-item"
                  >
                    {sub.name}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            {/* Location Selector */}
            <CommandInput
              label="LOCATION"
              value={location || "All Locations"}
              icon={<MapPinIcon className="h-4 w-4" />}
              active={activeDropdown === "loc"}
              onClick={() => setActiveDropdown(activeDropdown === "loc" ? null : "loc")}
            >
              <Dropdown isOpen={activeDropdown === "loc"}>
                <button
                  onClick={() => {
                    setLocation("");
                    setActiveDropdown(null);
                  }}
                  className="dropdown-item"
                >
                  All Locations
                </button>
                <div className="p-2.5 border-b border-slate-200 dark:border-slate-700/50 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Popular Locations
                  </span>
                </div>
                {trendingLocations.map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setLocation(loc.name);
                      setActiveDropdown(null);
                    }}
                    className="dropdown-item"
                  >
                    {loc.name}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            {/* Primary Search CTA Button */}
            <button
              onClick={() =>
                onSearch({
                  location,
                  minPrice: "",
                  maxPrice: "",
                  category: selectedCategory?.id,
                  subcategory: selectedSubcategory?.id,
                  vehicleType: "",
                  make: "",
                  model: "",
                  isBuy: true,
                })
              }
              className="group/btn relative overflow-hidden rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98] mt-2 md:mt-0 md:ml-2 px-8 py-4 flex items-center justify-center gap-2.5 font-bold flex-shrink-0"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-950 transition-transform duration-300 group-hover/btn:scale-110" />
              <EditableElement
                targetId="automotive2.home.hero.ctaText"
                label="Search Button CTA"
                inline
              >
                <span className="text-sm font-extrabold uppercase tracking-wide">Search Trucks</span>
              </EditableElement>
            </button>
          </div>
        </motion.div>
      </div>

      {/* 4. BOTTOM TRUST BADGES / HIGHLIGHTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 w-full max-w-7xl mx-auto pt-10 border-t border-slate-200 dark:border-slate-800/40 mt-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <TrustFeature
            icon={<ShieldCheckIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
            title={
              <EditableElement targetId="automotive2.home.hero.feature0.title" label="Feature #1 Title" inline>
                <span>AA Kenya Certified</span>
              </EditableElement>
            }
            subtitle={
              <EditableElement targetId="automotive2.home.hero.feature0.subtitle" label="Feature #1 Subtitle" inline>
                <span>Independent valuations</span>
              </EditableElement>
            }
          />
          <TrustFeature
            icon={<DevicePhoneMobileIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
            title={
              <EditableElement targetId="automotive2.home.hero.feature1.title" label="Feature #2 Title" inline>
                <span>M-Pesa Payments</span>
              </EditableElement>
            }
            subtitle={
              <EditableElement targetId="automotive2.home.hero.feature1.subtitle" label="Feature #2 Subtitle" inline>
                <span>Pay securely, your way</span>
              </EditableElement>
            }
          />
          <TrustFeature
            icon={<MapPinIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
            title={
              <EditableElement targetId="automotive2.home.hero.feature2.title" label="Feature #3 Title" inline>
                <span>47 Counties Covered</span>
              </EditableElement>
            }
            subtitle={
              <EditableElement targetId="automotive2.home.hero.feature2.subtitle" label="Feature #3 Subtitle" inline>
                <span>Nationwide reach</span>
              </EditableElement>
            }
          />
        </div>
      </motion.div>

      {/* STYLES */}
      <style jsx global>{`
        .dropdown-item {
          @apply block w-full text-left px-4 py-2.5 text-xs font-semibold
          text-slate-700 hover:text-amber-600 dark:text-slate-200 dark:hover:text-amber-400
          hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl
          transition-colors tracking-wide;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          @apply bg-slate-300 dark:bg-slate-700/60 rounded-full;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          @apply bg-slate-400 dark:bg-slate-600;
        }
      `}</style>
    </section>
  );
}

// --- SUB-COMPONENTS ---

interface CommandInputProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
}

function CommandInput({ label, value, icon, active, disabled, onClick, children }: CommandInputProps) {
  return (
    <div className="relative flex-1 w-full overflow-visible">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full h-full flex flex-col justify-center px-4 py-3.5 rounded-2xl md:rounded-xl transition-all text-left group
          ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-100/80 dark:hover:bg-slate-800/50"}
          ${active ? "bg-slate-100 dark:bg-slate-800/80 ring-1 ring-slate-300 dark:ring-slate-700" : ""}`}
      >
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {icon}
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[130px] lg:max-w-none">
            {value}
          </span>
          <ChevronDownIcon
            className={`h-4 w-4 ml-auto text-slate-400 transition-transform duration-200 ${
              active ? "rotate-180 text-amber-500 dark:text-amber-400" : "group-hover:translate-y-0.5"
            }`}
          />
        </div>
      </button>
      {children}
    </div>
  );
}

function Dropdown({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="
            absolute left-0 right-0 top-[calc(100%+8px)]
            md:w-[260px] z-[99999] overflow-hidden
            rounded-2xl bg-white/95 dark:bg-[#0F141C]/95 backdrop-blur-2xl
            border border-slate-200 dark:border-slate-800 shadow-2xl p-2
          "
        >
          <div className="custom-scrollbar flex max-h-[280px] flex-col gap-0.5 overflow-y-auto">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TrustFeature({ icon, title, subtitle }: { icon: React.ReactNode; title: React.ReactNode; subtitle: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</span>
        <span className="text-xs text-slate-600 dark:text-slate-400 leading-tight mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
}