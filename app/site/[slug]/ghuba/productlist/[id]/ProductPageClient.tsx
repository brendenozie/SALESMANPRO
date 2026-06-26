"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

// --- HERO ICONS ---
import {
  WifiIcon,
  SunIcon,
  ShieldCheckIcon,
  TruckIcon,
  BoltIcon,
  FireIcon,
  KeyIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  Square2StackIcon,
  HomeIcon,
  BeakerIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
  InformationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";

import { UserIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";
import { useRouter } from "next/navigation";
import GhubaProductCard from "@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard";

type ProductType = "PROPERTY" | "AUTO" | "ECOMMERCE";

const resolveProductType = (listing: any): ProductType => {
  const cat =  listing.productCategory?.name?.toLowerCase() || (listing.category || "").toLowerCase() ;
  if (
    cat.includes("property") ||
    cat.includes("real estate") ||
    listing.bedrooms ||
    listing.area
  ) {
    return "PROPERTY";
  }
  if (
    cat.includes("automotive") ||
    cat.includes("car") || cat.includes("cars") ||
    cat.includes("vehicle") ||
    listing.mileage ||
    listing.engineSize
  ) {
    return "AUTO";
  }
  return "ECOMMERCE";
};

const withCapabilities = (listing: any, type: ProductType) => ({
  ...listing,
  capabilities: {
    canAddToCart: type === "ECOMMERCE",
    canBookSession: type === "PROPERTY",
    canInquire: type === "AUTO",
  },
});

const customLoader = ({ src, width, quality }: { src: string; width?: number; quality?: number }) => {
  return width ? `${src}?w=${width}&q=${quality || 75}` : src;
};

const getAmenityIcon = (value: string) => {
  const v = value.toLowerCase();
  if (v.includes("wifi")) return WifiIcon;
  if (v.includes("pool") || v.includes("bath")) return SunIcon;
  if (v.includes("security") || v.includes("cctv")) return ShieldCheckIcon;
  if (v.includes("parking") || v.includes("valet")) return TruckIcon;
  if (v.includes("air_conditioning") || v.includes("heating")) return BoltIcon;
  if (v.includes("generator")) return FireIcon;
  if (v.includes("lock")) return KeyIcon;
  if (v.includes("cctv")) return VideoCameraIcon;
  return CheckCircleIcon; 
};

// Sub-components
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-1">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="font-black text-slate-900 dark:text-white truncate">{value || "N/A"}</span>
  </div>
);

const UnitCard = ({ unit, type }: { unit: any; type: string }) => (
  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
    <div>
      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{type}</span>
      <h4 className="font-black text-slate-900 dark:text-white mt-1">{unit.type || unit.name}</h4>
    </div>
    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-slate-400">
      <CheckCircleIcon className="w-5 h-5" />
    </div>
  </div>
);

const FormField = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 z-10">
        <Icon className="w-5 h-5 text-slate-400 dark:text-zinc-500 transition-colors" />
      </div>
      {children}
    </div>
  </div>
);

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function GhubaProductDetail({ listing, related }: { listing: any; related: any[] }) {
  const router = useRouter();
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const { data: session } = useSession();

  // Determine Item Type dynamically based on data structure (ECOMMERCE, PROPERTY, AUTO)
  const itemType = useMemo(() => resolveProductType(listing), [listing]);
  const product = useMemo(() => withCapabilities(listing, itemType), [listing, itemType]);

  // -- STATE: Gallery --
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // -- STATE: Scheduling (Property / Auto) --
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [modalType, setModalType] = useState<"showing" | "inquiry">("showing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [formData, setFormData] = useState({
    clientName: "", clientEmail: "", clientPhone: "", consumerId: "",
    message: "", preferredDate: "", preferredTime: "09:00", guests: 1,
  });

  // -- STATE: E-commerce Variants --
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [pageUrl, setPageUrl] = useState("");
  const [mounted, setMounted] = useState(false);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  
  const toggleLike = (id: string) => {
    setLikedItems((prev: Record<string, boolean>) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    setPageUrl(window.location.href);
    setMounted(true);
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        clientName: session.user?.name || "",
        clientEmail: session.user?.email || "",
        consumerId: session.user?.id || "",
      }));
    }
  }, [session]);

  // --- E-COMMERCE LOGIC ---
  const normalizedOptions = useMemo(() => {
    if (itemType !== "ECOMMERCE" || !listing.option) return [];
    try {
      return typeof listing.option === 'string' ? JSON.parse(listing.option) : listing.option;
    } catch { return []; }
  }, [listing.option, itemType]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    normalizedOptions.forEach((opt: any) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [normalizedOptions]);

  useEffect(() => {
    if (itemType === "ECOMMERCE") {
      const initialSelection: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([category, options]) => {
        if (options.length > 0) initialSelection[category] = options[0].name;
      });
      setSelectedOptions(initialSelection);
    }
  }, [groupedOptions, itemType]);

  const livePriceSurcharge = useMemo(() => {
    if (itemType !== "ECOMMERCE") return 0;
    let extra = 0;
    Object.entries(selectedOptions).forEach(([category, selectedValue]) => {
      const match = normalizedOptions.find((o: any) => o.category === category && o.name === selectedValue);
      if (match?.extraPrice) extra += match.extraPrice;
    });
    return extra;
  }, [selectedOptions, normalizedOptions, itemType]);

  const liveFinalPrice = (listing.finalPrice || listing.sellingPrice || 0) + livePriceSurcharge;
  const liveSellingPrice = (listing.sellingPrice || listing.oldPrice || 0) + livePriceSurcharge;

  const currentCartItemId = useMemo(() => {
    const optionSignature = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`).join("-");
    return optionSignature ? `${listing.id}-${optionSignature}` : listing.id;
  }, [listing.id, selectedOptions]);

  const activeVariantQuantity = useMemo(() => {
    return cart.find((item: any) => item.cartItemId === currentCartItemId)?.quantity || 0;
  }, [cart, currentCartItemId]);

  const handleAddToCart = () => {
    addToCart({
      ...listing,
      finalPrice: liveFinalPrice,
      sellingPrice: liveSellingPrice,
      cartItemId: currentCartItemId,
      selectedOptions: { ...selectedOptions },
    });
  };

  const handleDecreaseQuantity = () => decreaseQuantity(currentCartItemId, selectedOptions);

  // --- SCHEDULING LOGIC (Property / Auto) ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError("");
    setIsSubmitting(true);
    try {
      const endpoint = modalType === "showing" ? "/api/admin/showings" : "/api/admin/inquiries";
      const combinedDate = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
      
      const payload = {
        companyId: listing.companyId,
        propertyId: listing.id,
        propertyName: listing.name || listing.title,
        consumerId: formData.consumerId || "",
        clientId: formData.consumerId || listing.userId || "",
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        agentId: listing.agentId,
        agentName: listing.contactName,
        message: formData.message,
        ...(modalType === "showing" && {
          dateTime: combinedDate.toISOString(),
          notes: `Guests: ${formData.guests}\nPhone: ${formData.clientPhone}\nMessage: ${formData.message}`,
        })
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!result.success) throw new Error(result.message || "Something went wrong");
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsScheduleOpen(false);
        setFormData({ ...formData, message: "", preferredDate: "", preferredTime: "09:00", guests: 1 });
      }, 2000);
    } catch (err: any) {
      setScheduleError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NORMALIZATION ---
  const images = listing.images?.length > 0 ? listing.images.map((img: any) => img.url || img) : ["https://placehold.co/1200x800?text=No+Image"];
  const displayTitle = itemType === "AUTO" && listing.make ? `${listing.make} ${listing.model}` : listing.title || listing.name;
  const host = { name: listing.contactName || "Authorized Dealer", role: itemType === "PROPERTY" ? "Property Consultant" : "Sales Specialist", phone: listing.contact, email: listing.email };
  const hasDiscount = liveSellingPrice > liveFinalPrice;

  // --- SUB-RENDERERS ---
  const renderBentoGallery = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-4 h-[400px] md:h-[550px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-100 dark:bg-zinc-900">
      <div className="col-span-1 md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden" onClick={() => setIsGalleryOpen(true)}>
         <Image src={images[0]} loader={customLoader} alt="Primary" fill className="object-cover transition-transform duration-1000 group-hover:scale-105" priority />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {images.slice(1, 5).map((img: string, idx: number) => (
        <div key={idx} className="relative group cursor-pointer hidden md:block overflow-hidden" onClick={() => { setCurrentImageIndex(idx + 1); setIsGalleryOpen(true); }}>
          <Image src={img} loader={customLoader} alt={`View ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
          {idx === 3 && images.length > 5 && (
            <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center backdrop-blur-sm group-hover:bg-zinc-950/60 transition-all">
              <Square2StackIcon className="w-8 h-8 text-white mb-2" />
              <span className="text-white font-bold text-xs uppercase tracking-widest">{images.length - 5}+ More Photos</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSpecsGrid = () => {
    if (itemType === "PROPERTY" || itemType === "REAL ESTATE") {
      const bedroomCount = listing.bedrooms?.length > 0 ? listing.bedrooms[0].type : "N/A";
      const displayArea = listing.area ? `${listing.area.toLocaleString()} sqft` : "TBD";
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
           <StatItem icon={<HomeIcon className="w-6 h-6" />} label="Category" value={listing.category} />
           <StatItem icon={<CheckCircleIcon className="w-6 h-6" />} label="Configuration" value={bedroomCount} />
           <StatItem icon={<BeakerIcon className="w-6 h-6" />} label="Bathrooms" value={listing.bathrooms} />
           <StatItem icon={<Square2StackIcon className="w-6 h-6" />} label="Total Area" value={displayArea} />
        </div>
      );
    }
    if (itemType === "AUTO" || itemType === "AUTOMOTIVE" || itemType === "VEHICLE" || itemType === "CAR" || itemType === "MOTORCYCLE" || itemType === "Cars") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <StatItem icon={<BoltIcon className="w-6 h-6" />} label="Engine" value={`${listing.engineSize || ''}L ${listing.engineType || ''}`} />
          <StatItem icon={<KeyIcon className="w-6 h-6" />} label="Transmission" value={listing.transmission} />
          <StatItem icon={<FireIcon className="w-6 h-6" />} label="Fuel Type" value={listing.fuelType} />
          <StatItem icon={<Square2StackIcon className="w-6 h-6" />} label="Mileage" value={`${Number(listing.mileage).toLocaleString()} km`} />
        </div>
      );
    }
    return null;
  };

  const renderActionSidebar = () => {
    if (itemType === "ECOMMERCE") {
      return (
        <div className="sticky top-24 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl space-y-8">
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                KES {liveFinalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through text-slate-400 font-bold tabular-nums">
                  {liveSellingPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
              In Stock & Ready to Ship
            </p>
          </div>

          {/* Variants */}
          {Object.keys(groupedOptions).length > 0 && (
            <div className="space-y-5">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 block">
                    Select {category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [category]: opt.name }))}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20 scale-[1.02]'
                              : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500'
                          }`}
                        >
                          {opt.name} {opt.extraPrice ? `(+KES ${opt.extraPrice})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cart Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            {activeVariantQuantity > 0 ? (
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleDecreaseQuantity} className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm text-slate-900 dark:text-white">
                  <MinusIcon className="w-5 h-5" />
                </motion.button>
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{activeVariantQuantity}</span>
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 block">In Cart</span>
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <PlusIcon className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
              >
                <ShoppingBagIcon className="w-5 h-5" /> Add to Cart
              </motion.button>
            )}
          </div>
        </div>
      );
    }

    // Property / Auto Sidebar Actions
    return (
      <div className="sticky top-24 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl">
        <div className="mb-8">
          <p className="text-slate-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Total Pricing</p>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(listing.finalPrice || listing.sellingPrice || 0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">Availability</span>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{listing.status === "ACTIVE" ? "Available Now" : "Currently Unavailable"}</p>
          </div>
          <CalendarDaysIcon className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="space-y-3">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => { setModalType("showing"); setIsScheduleOpen(true); }} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all">
            {itemType === "PROPERTY" ? "Schedule a Tour" : "Book Inspection"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => { setModalType("inquiry"); setIsScheduleOpen(true); }} className="w-full py-5 border-2 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
            Place an Offer
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
      
      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <button onClick={() => setIsGalleryOpen(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-white/50 hover:text-white z-[110] transition-colors">
              <XMarkIcon className="w-10 h-10" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }} className="absolute left-4 md:left-12 p-3 md:p-4 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110] transition-all">
              <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <motion.div key={currentImageIndex} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }} className="relative w-full h-full max-w-6xl flex items-center justify-center">
              <Image src={images[currentImageIndex]} alt="Gallery View" fill className="object-contain" loader={customLoader} priority sizes="100vw"/>
            </motion.div>
            <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }} className="absolute right-4 md:right-12 p-3 md:p-4 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110] transition-all">
              <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER NAV --- */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" /> Back
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-full transition-colors"><ShareIcon className="w-4 h-4" /></button>
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-full transition-colors text-rose-500"><HeartIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {/* --- TITLE HEADER --- */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            {listing.category || "Premium Listing"}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none mb-4">
            {displayTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-zinc-400 font-medium text-sm">
            {(listing.location?.name || listing.locationName) && (
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-5 h-5 text-emerald-500" />
                <span>{listing.location?.name || listing.locationName}, {listing.location?.state}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-amber-500">
              <StarIcon className="w-5 h-5 fill-current" />
              <span className="text-slate-900 dark:text-zinc-100 font-bold">{listing.providerRating || "4.9"} Reviews</span>
            </div>
          </div>
        </div>

        {/* --- GALLERY --- */}
        {renderBentoGallery()}

        {/* --- CONTENT MATRIX --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-12">
            
            {renderSpecsGrid()}

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <InformationCircleIcon className="w-8 h-8 text-emerald-500" /> Overview
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 text-lg leading-relaxed font-medium">
                {listing.description || "Premium quality guaranteed. Intuitively designed and engineered to elevate your lifestyle."}
              </p>
            </section>

            {/* Property: Configurations */}
            {itemType === "PROPERTY" && (listing.bedrooms?.length > 0) && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Configurations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.bedrooms.map((unit: any, idx: number) => <UnitCard key={idx} unit={unit} type="Unit" />)}
                </div>
              </section>
            )}

            {/* Features / Amenities */}
            {(listing.amenities?.length > 0 || itemType === "AUTO") && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Features & Amenities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(listing.amenities || []).map((item: string, idx: number) => {
                    const Icon = getAmenityIcon(item);
                    return (
                      <motion.div whileHover={{ x: 5 }} key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm transition-all group">
                        <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-zinc-200 capitalize">{item.replace(/_/g, ' ')}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Host / Dealer Card (Property & Auto) */}
            {itemType !== "ECOMMERCE" && (
              <div className="bg-slate-900 dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-4xl font-black shadow-2xl shrink-0">
                    {host.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-3xl font-black mb-1">{host.name}</h3>
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-6">{host.role}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                      <button 
                        onClick={() => { setModalType("inquiry"); setIsScheduleOpen(true); }} 
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold text-sm transition-colors flex items-center gap-2"
                      >
                        <EnvelopeIcon className="w-5 h-5" /> Message
                      </button>
                      {host.phone && (
                        <a 
                          href={`tel:${host.phone}`} 
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                          <PhoneIcon className="w-5 h-5" /> Call Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1">
            {renderActionSidebar()}
          </div>
        </div>

        {/* --- RELATED ITEMS --- */}
        {related && related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
              {related.slice(0, 4).map((item, idx) => (
                <GhubaProductCard 
                  key={product._id || product.id}
                  product={product} 
                  toggleLike={toggleLike} 
                  likedItems={[]} 
                  addToCart={addToCart} 
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* --- SCHEDULING / INQUIRY MODAL (Fully Completed) --- */}
      <AnimatePresence>
        {isScheduleOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[120] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} 
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 relative shadow-2xl overflow-hidden"
            >
              <button onClick={() => setIsScheduleOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-zinc-800 p-2 rounded-full">
                <XMarkIcon className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {modalType === "showing" ? "Schedule a Tour" : "Send an Inquiry"}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">
                {modalType === "showing" ? "Pick a date and time that works best for you." : "We'll get back to you as soon as possible."}
              </p>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Request Sent!</h3>
                  <p className="text-slate-500">The {itemType === "PROPERTY" ? "agent" : "dealer"} will contact you shortly to confirm.</p>
                </div>
              ) : (
                <form onSubmit={handleSchedule} className="space-y-5">
                  {scheduleError && (
                    <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">
                      {scheduleError}
                    </div>
                  )}

                  <FormField label="Full Name" icon={UserIcon}>
                    <input required type="text" name="clientName" value={formData.clientName} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="John Doe" />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Email" icon={EnvelopeIcon}>
                      <input required type="email" name="clientEmail" value={formData.clientEmail} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="john@example.com" />
                    </FormField>
                    <FormField label="Phone" icon={PhoneIcon}>
                      <input required type="tel" name="clientPhone" value={formData.clientPhone} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="+254..." />
                    </FormField>
                  </div>

                  {modalType === "showing" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Preferred Date" icon={CalendarDaysIcon}>
                        <input required type="date" name="preferredDate" value={formData.preferredDate} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all" />
                      </FormField>
                      <FormField label="Preferred Time" icon={ClockIcon}>
                        <input required type="time" name="preferredTime" value={formData.preferredTime} onChange={handleFormChange} className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all" />
                      </FormField>
                    </div>
                  )}

                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-2">Message</label>
                    <textarea 
                      name="message" 
                      rows={3} 
                      value={formData.message} 
                      onChange={handleFormChange} 
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all resize-none" 
                      placeholder={modalType === "showing" ? "Any specific details you'd like to mention before the tour?" : "What would you like to know about this listing?"} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" /> 
                        {modalType === "showing" ? "Confirm Booking" : "Send Message"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// "use client";

// import React, { useState, useCallback, memo, useMemo } from "react";
// import {
//   ArrowLeftIcon,
//   ArrowRightIcon,
//   XMarkIcon,
//   ShoppingCartIcon,
//   ShieldCheckIcon,
//   TruckIcon,
//   ArrowPathIcon,
// } from "@heroicons/react/24/outline";
// import { HeartIcon } from "@heroicons/react/24/solid";
// import { useRouter } from "next/navigation";
// import { useStateContext } from "@/contexts/ContextProvider";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";
// import load from "@/assets/load.png";
// import PropTypes from "prop-types";

// import GhubaProductCard from "@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard";
// import Modal from "@/components/Modal";
// import WhatsAppInquiry from "@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry";

// // next/image loader
// const loaderProp = ({ src, width, quality }) => {
//   const params = [`w=${width}`];
//   if (quality) params.push(`q=${quality}`);
//   return `${src}?${params.join("&")}`;
// };

// const ProductPageClient = ({ listing, similarListings }) => {
//   const [currentImage, setCurrentImage] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const { addToCart, decreaseQuantity } = useStateContext();
//   const [isZoomed, setIsZoomed] = useState(false);
//   const prevImage = () => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
//   const nextImage = () => setCurrentImage((prev) => prev === images.length - 1 ? 0 : prev + 1  );

//   const images = listing.images ? listing.images: [
//     "https://images.unsplash.com/photo-1559526324-551c9e75d510",
//     "https://images.unsplash.com/photo-1503602642458-232111445657",
//   ];

//   return (
//     <div className="bg-white dark:bg-gray-950 min-h-screen">
//       {/* Breadcrumbs - Minimalist */}
//       <nav className="max-w-7xl mx-auto px-6 py-6 text-xs uppercase tracking-widest text-gray-400">
//         <span className="hover:text-yellow-600 cursor-pointer transition">Home</span> / 
//         <span className="hover:text-yellow-600 cursor-pointer transition ml-2 uppercase">{listing.category}</span> / 
//         <span className="text-gray-900 dark:text-white font-bold ml-2">{listing.title}</span>
//       </nav>

//       <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20">
//         <div className="flex flex-col lg:flex-row gap-12 items-start">
          
//           {/* LEFT: Media Gallery */}
//           <div className="w-full lg:w-3/5  top-6">
//             <ProductImages 
//               images={images} 
//               currentImageIndex={currentImage} 
//               setCurrentImageIndex={setCurrentImage} 
//               prevImage={prevImage}
//               nextImage={nextImage}
//               isZoomed={isZoomed}
//               setIsZoomed={setIsZoomed}
//             />
//           </div>

//           {/* RIGHT: Product Details */}
//           <div className="w-full lg:w-2/5 space-y-8">
//             <ProductHeader listing={listing} />
            
//             <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
//               <ProductPricing listing={listing} />
//               <ColorOptions />
              
//               <div className="mt-8 flex flex-col gap-4">
//                 <QuantitySelector 
//                   quantity={quantity} 
//                   setQuantity={setQuantity} 
//                   listing={listing}
//                   addToCart={addToCart}
//                   decreaseQuantity={decreaseQuantity}
//                 />
                
//                 <div className="flex gap-4">
//                   <motion.button 
//                     whileTap={{ scale: 0.95 }}
//                     className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-2xl transition shadow-xl shadow-yellow-500/20"
//                   >
//                     Buy Now
//                   </motion.button>
//                   <motion.button 
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => addToCart(listing)}
//                     className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//                   >
//                     <ShoppingCartIcon className="h-6 w-6" />
//                   </motion.button>
//                 </div>
//               </div>
//             </div>

//             <TrustBadges />
//           </div>
//         </div>

//         {/* Technical Sections */}
//         <div className="mt-24 space-y-24">
//           <section>
//             <h2 className="text-3xl font-bold mb-10 text-center">Specifications</h2>
//             <ProductSpecifications listing={listing} />
//           </section>

//           <ExtendedDetails listing={listing} />

//           <section>
//             <div className="flex justify-between items-end mb-8">
//               <h2 className="text-3xl font-bold">Recommended for You</h2>
//               <button className="text-yellow-600 font-semibold hover:underline">View All</button>
//             </div>
//             <SimilarItems similarListings={similarListings} addToCart={addToCart} />
//           </section>
//         </div>
//       </main>

//        {isZoomed && (
//         <Modal isOpen={isZoomed} onClose={() => setIsZoomed(false)}  showCloseButton={false}>
//           <div className="flex justify-center items-center ">
//             <button
//               onClick={() => setIsZoomed(false)}
//               className="absolute top-5 right-5 text-white bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition"
//             >
//               <XMarkIcon className="h-6 w-6" />
//             </button>
//             <button
//               onClick={prevImage}
//               className="absolute left-5 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
//             >
//               <ArrowLeftIcon className="h-6 w-6" />
//             </button>
//             <Image
//               width={800}
//               height={800}
//               loader={loaderProp}
//               src={images[currentImage] || images[currentImage].url || 'https://image.unsplash.com/photo-1559526324-551c9e75d510'}
//               alt={`Enlarged Product Image ${currentImage + 1}`}
//               className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-lg"
//             />
//             <button
//               onClick={nextImage}
//               className="absolute right-5 top-1/2 transform -translate-y-1/2 text-white bg-gray-700 p-3 rounded-full hover:bg-gray-600 transition"
//             >
//               <ArrowRightIcon className="h-6 w-6" />
//             </button>
//           </div>
//         </Modal>
//       )}

//       <WhatsAppInquiry 
//         productName={listing.name}
//         productPrice={listing.finalPrice || listing.sellingPrice || 0}
//         productUrl={window.location.href}
//         phoneNumber = "254712345678"
//       />
//     </div>
//   );
// };

// /* --- SUB-COMPONENTS --- */


// const ProductImages = ({ images, currentImageIndex, setCurrentImageIndex, setIsZoomed }) => {
  
//   // Helper to get URL regardless of object or string structure
//   const getImageUrl = (img) => (typeof img === 'string' ? img : img?.url) || 'https://image.unsplash.com/photo-1559526324-551c9e75d510';

//   return (
//     <div className="space-y-4">
//       {/* --- MAIN FEATURED IMAGE --- */}
//       <div className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-900 group">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentImageIndex}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             className="w-full h-full"
//           >
//             <Image
//               fill
//               priority // Tells Next.js to load this immediately (LCP optimization)
//               loader={loaderProp}
//               src={getImageUrl(images[currentImageIndex])}
//               alt={`Product Image ${currentImageIndex + 1}`}
//               className="object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
//               onClick={() => setIsZoomed(true)}
//               sizes="(max-width: 768px) 100vw, 50vw"
//             />
//           </motion.div>
//         </AnimatePresence>
        
//         {/* Scarcity Overlay */}
//         <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black text-red-600 shadow-sm z-10">
//           🔥 Limited Stock
//         </div>
//       </div>

//       {/* --- THUMBNAIL GALLERY --- */}
//       <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
//         {images.map((img , i) => (
//           <button
//             key={i}
//             onClick={() => setCurrentImageIndex(i)}
//             className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
//               i === currentImageIndex 
//                 ? "border-amber-500 scale-105 shadow-lg" 
//                 : "border-transparent opacity-60 hover:opacity-100"
//             }`}
//           >
//             <Image
//               fill
//               loader={loaderProp}
//               src={getImageUrl(img)}
//               alt={`Thumbnail ${i + 1}`}
//               className="object-cover"
//               sizes="80px"
//             />
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };


// const ProductHeader = ({ listing }) => (
//   <div className="space-y-2">
//     <div className="flex justify-between items-start">
//       <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase rounded-md">
//         {listing.brand || 'Premium'}
//       </span>
//       <button className="text-gray-400 hover:text-red-500 transition">
//         <HeartIcon className="h-7 w-7" />
//       </button>
//     </div>
//     <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
//       {listing.title}
//     </h1>
//     <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">
//       {listing.description}
//     </p>
//   </div>
// );

// const ProductPricing = ({ listing }) => (
//   <div className="mb-6">
//     <div className="flex items-baseline gap-3">
//       <span className="text-4xl font-black text-gray-900 dark:text-white">
//         KSh {listing.finalPrice?.toLocaleString()}
//       </span>
//       {listing.oldPrice && (
//         <span className="text-xl text-gray-400 line-through">
//           KSh {listing.oldPrice.toLocaleString()}
//         </span>
//       )}
//     </div>
//     <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-tighter">
//       In Stock - Ready for delivery
//     </p>
//   </div>
// );

// const TrustBadges = () => (
//   <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-100 dark:border-gray-800">
//     <div className="flex flex-col items-center text-center gap-2">
//       <TruckIcon className="h-6 w-6 text-yellow-600" />
//       <span className="text-[10px] font-bold text-gray-500 uppercase">Fast Delivery</span>
//     </div>
//     <div className="flex flex-col items-center text-center gap-2">
//       <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />
//       <span className="text-[10px] font-bold text-gray-500 uppercase">Secure Payment</span>
//     </div>
//     <div className="flex flex-col items-center text-center gap-2">
//       <ArrowPathIcon className="h-6 w-6 text-yellow-600" />
//       <span className="text-[10px] font-bold text-gray-500 uppercase">Easy Returns</span>
//     </div>
//   </div>
// );

// const QuantitySelector = ({ quantity, setQuantity, listing, addToCart, decreaseQuantity }) => (
//   <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
//     <div className="flex items-center gap-6 px-4">
//       <button 
//         onClick={() => { setQuantity(Math.max(1, quantity - 1)); decreaseQuantity(listing); }}
//         className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xl"
//       >
//         −
//       </button>
//       <span className="font-bold text-lg w-4 text-center">{quantity}</span>
//       <button 
//         onClick={() => { setQuantity(quantity + 1); addToCart(listing); }}
//         className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-xl"
//       >
//         +
//       </button>
//     </div>
//     <span className="text-[10px] pr-4 font-bold text-gray-400 uppercase italic">
//       Max 5 per customer
//     </span>
//   </div>
// );

// const ProductSpecifications = memo(({ listing }) => {
//   const specs = [
//     { label: "Condition", value: listing.condition || "New" },
//     { label: "Material", value: listing.material?.join(", ") || "N/A" },
//     { label: "Dimensions", value: listing.dimension || "Standard" },
//     { label: "Weight", value: listing.weight || "N/A" },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
//       {specs.map((spec, idx) => (
//         <div key={idx} className="flex justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/40">
//           <span className="text-gray-500 font-medium">{spec.label}</span>
//           <span className="text-gray-900 dark:text-white font-bold">{spec.value}</span>
//         </div>
//       ))}
//     </div>
//   );
// });

// const SimilarItems = ({ similarListings, addToCart }) => {
//     const [likedItems, setLikedItems] = useState({});
//     const toggleLike = (id) => setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));

//     return (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             {similarListings?.map((product) => (
//                 <GhubaProductCard 
//                     key={product.id}
//                     product={product} 
//                     toggleLike={toggleLike} 
//                     likedItems={likedItems} 
//                     addToCart={addToCart} 
//                 />
//             ))}
//         </div>
//     );
// };


// export default ProductPageClient;

// const categoryConfigs = {
//   Books: {
//     title: "Book Details",
//     fields: [
//       { key: "author", label: "Author" },
//       { key: "publisher", label: "Publisher" },
//       { key: "isbn", label: "ISBN" },
//     ],
//   },
//   Clothing: {
//     title: "Clothing Details",
//     fields: [
//       { key: "fabricComposition", label: "Fabric Composition" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   Fashion: "Clothing",
//   "Home Appliances": {
//     title: "Home Appliance Details",
//     fields: [
//       { key: "energyRating", label: "Energy Rating" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//       { key: "applianceDimensions", label: "Dimensions" },
//     ],
//   },
//   "Beauty Products": {
//     title: "Beauty Product Details",
//     fields: [
//       { key: "ingredients", label: "Ingredients" },
//       { key: "usageInstructions", label: "Usage Instructions" },
//       { key: "expirationDate", label: "Expiration Date", isDate: true },
//     ],
//   },
//   Skincare: "Beauty Products",
//   Haircare: "Beauty Products",
//   Electronics: {
//     title: "Electronics Details",
//     fields: [
//       { key: "batteryLife", label: "Battery Life" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//       { key: "features", label: "Features" },
//     ],
//   },
//   "Mobile Phones": "Electronics",
//   "Laptops & Computers": "Electronics",
//   "Home & Kitchen": {
//     title: "Home & Kitchen Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Sports & Outdoors": {
//     title: "Sports & Outdoors Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Toys & Games": {
//     title: "Toys & Games Details",
//     fields: [
//       { key: "recommendedAge", label: "Recommended Age" },
//       { key: "material", label: "Material" },
//       { key: "safetyCertifications", label: "Safety Certifications" },
//     ],
//   },
//   "Automotive": {
//     title: "Automotive Details",
//     fields: [
//       { key: "vehicleCompatibility", label: "Vehicle Compatibility" },
//       { key: "installationInstructions", label: "Installation Instructions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Sports Equipment": {
//     title: "Sports Equipment Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Health & Personal Care": {
//     title: "Health & Personal Care Details",
//     fields: [
//       { key: "ingredients", label: "Ingredients" },
//       { key: "usageInstructions", label: "Usage Instructions" },
//       { key: "expirationDate", label: "Expiration Date", isDate: true },
//     ],
//   },
//   "Pet Supplies": {
//     title: "Pet Supplies Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Office Supplies": {
//     title: "Office Supplies Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Grocery & Gourmet Food": {
//     title: "Grocery & Gourmet Food Details",
//     fields: [
//       { key: "ingredients", label: "Ingredients" },
//       { key: "expirationDate", label: "Expiration Date", isDate: true },
//       { key: "storageInstructions", label: "Storage Instructions" },
//     ],
//   },
//   "Arts & Crafts": {
//     title: "Arts & Crafts Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Baby Products": {
//     title: "Baby Products Details",
//     fields: [
//       { key: "recommendedAge", label: "Recommended Age" },
//       { key: "material", label: "Material" },
//       { key: "safetyCertifications", label: "Safety Certifications" },
//     ],
//   },
//   "Musical Instruments": {
//     title: "Musical Instruments Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Video Games": {
//     title: "Video Games Details",
//     fields: [
//       { key: "platform", label: "Platform" },
//       { key: "genre", label: "Genre" },
//       { key: "releaseDate", label: "Release Date", isDate: true },
//     ],
//   },
//   "Collectibles": {
//     title: "Collectibles Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Home Decor": {
//     title: "Home Decor Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Gardening Supplies": {
//     title: "Gardening Supplies Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Smart Home Devices": {
//     title: "Smart Home Devices Details",
//     fields: [
//       { key: "compatibility", label: "Compatibility" },
//       { key: "features", label: "Features" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Fitness Equipment": {
//     title: "Fitness Equipment Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Camping & Hiking": {
//     title: "Camping & Hiking Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Travel Accessories": {
//     title: "Travel Accessories Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Bags & Luggage": {
//     title: "Bags & Luggage Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Watches": {
//     title: "Watches Details",
//     fields: [
//       { key: "brand", label: "Brand" },
//       { key: "model", label: "Model" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Jewelry": {
//     title: "Jewelry Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Footwear": {
//     title: "Footwear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "careInstructions", label: "Care Instructions" },
//     ],
//   },
//   "Furniture": {
//     title: "Furniture Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "assemblyInstructions", label: "Assembly Instructions" },
//     ],
//   },
//   "Home Improvement": {
//     title: "Home Improvement Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "assemblyInstructions", label: "Assembly Instructions" },
//     ],
//   },
//   "Office Furniture": {
//     title: "Office Furniture Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "assemblyInstructions", label: "Assembly Instructions" },
//     ],
//   },
//   "Outdoor Furniture": {
//     title: "Outdoor Furniture Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "assemblyInstructions", label: "Assembly Instructions" },
//     ],
//   },
//   "Kitchen Appliances": {
//     title: "Kitchen Appliances Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Small Appliances": {
//     title: "Small Appliances Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Large Appliances": {
//     title: "Large Appliances Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Home Electronics": {
//     title: "Home Electronics Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Outdoor Gear": {
//     title: "Outdoor Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Camping Gear": {
//     title: "Camping Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Fishing Gear": {
//     title: "Fishing Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Hunting Gear": {
//     title: "Hunting Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Cycling Gear": {
//     title: "Cycling Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
//   "Running Gear": {
//     title: "Running Gear Details",
//     fields: [
//       { key: "material", label: "Material" },
//       { key: "dimensions", label: "Dimensions" },
//       { key: "warrantyPeriod", label: "Warranty Period" },
//     ],
//   },
// };

// const DetailSection = ({ title, fields, data }) => (
//   <div className="max-w-7xl mx-auto px-6">
//     <h2 className="text-2xl mt-6 font-extrabold text-gray-800 dark:text-white mb-6 text-center">
//       {title}
//     </h2>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {fields.map((field) => (
//         <div key={field.key} className="bg-white dark:bg-gray-800 shadow-lg p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition hover:shadow-xl">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//             {field.label}
//           </h3>
//           <p className="text-gray-700 dark:text-gray-300">
//             {field.isDate
//               ? new Date(data[field.key]).toLocaleDateString()
//               : data[field.key] || "N/A"}
//           </p>
//         </div>
//       ))}
//     </div>  
//   </div>
// );

// DetailSection.propTypes = {
//   title: PropTypes.string.isRequired,
//   fields: PropTypes.arrayOf(
//     PropTypes.shape({
//       key: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//       isDate: PropTypes.bool,
//     })
//   ).isRequired,
//   data: PropTypes.object.isRequired,
// };

// const ExtendedDetails = memo(({ listing }) => {
//   const { category } = listing;

//   // Resolve config, support aliases
//   const config = useMemo(() => {
//     const entry = categoryConfigs[category];
//     if (typeof entry === "string") {
//       return categoryConfigs[entry];
//     }
//     return entry;
//   }, [category]);

//   if (!config) return null;

//   return <DetailSection title={config.title} fields={config.fields} data={listing} />;
// });

// ExtendedDetails.propTypes = {
//   listing: PropTypes.shape({
//     category: PropTypes.string.isRequired,
//   }).isRequired,
// };



// const ColorOptions = memo(() => {
//   // Enhanced color data with labels for accessibility/tooltips
//   const colors = [
//     { id: "rose", name: "Rose Blush", class: "bg-red-300", hex: "#fda4af" },
//     { id: "charcoal", name: "Charcoal", class: "bg-gray-800", hex: "#1f2937" },
//     { id: "emerald", name: "Emerald", class: "bg-green-500", hex: "#10b981" },
//     { id: "cloud", name: "Cloud White", class: "bg-white", hex: "#ffffff" },
//     { id: "ocean", name: "Ocean Blue", class: "bg-blue-500", hex: "#3b82f6" },
//   ];

//   const [selectedColor, setSelectedColor] = useState(colors[1].id);

//   return (
//     <div className="mb-8">
//       <div className="flex justify-between items-end mb-3">
//         <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">
//           Color: <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">
//             {colors.find(c => c.id === selectedColor)?.name}
//           </span>
//         </h3>
//       </div>

//       <div className="flex flex-wrap gap-4">
//         {colors.map((color) => {
//           const isActive = selectedColor === color.id;
          
//           return (
//             <button
//               key={color.id}
//               onClick={() => setSelectedColor(color.id)}
//               className="relative group outline-none"
//               title={color.name}
//             >
//               {/* Animated Outer Ring */}
//               <motion.div
//                 animate={{
//                   scale: isActive ? 1.2 : 1,
//                   borderColor: isActive ? color.hex : "transparent",
//                 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 className={`absolute -inset-1.5 rounded-full border-2 transition-colors duration-300 ${
//                   isActive ? "" : "border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700"
//                 }`}
//               />

//               {/* Color Swatch */}
//               <div
//                 className={`relative h-8 w-8 rounded-full shadow-inner transition-transform duration-300 ${color.class} ${
//                   color.id === "cloud" ? "border border-gray-200" : ""
//                 }`}
//               >
//                 {/* Active Checkmark (optional subtle indicator) */}
//                 {isActive && (
//                   <motion.div 
//                     initial={{ opacity: 0, scale: 0.5 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="absolute inset-0 flex items-center justify-center"
//                   >
//                     <div className={`h-1.5 w-1.5 rounded-full ${color.id === 'cloud' ? 'bg-gray-800' : 'bg-white'}`} />
//                   </motion.div>
//                 )}
//               </div>

//               {/* Tooltip on Hover */}
//               <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
//                 {color.name}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// });

// ColorOptions.displayName = "ColorOptions";

