"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

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
  BriefcaseIcon,
  LockClosedIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/outline";

import { useStateContext } from "@/contexts/ContextProvider";
import { SkeletonGrid } from "@/components/site/layouts/GhubaLayout/body/components/SkeletonGrid/SkeletonGrid";
import { MarketListingForm } from "@/types/typings";

const DynamicGhubaProductCard = dynamic(
  () => import("@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard"),
  {
    loading: () => (
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <SkeletonGrid count={4} />
      </div>
    ),
    ssr: false,
  }
);

// --- TYPE DEFINITIONS ---
export type ProductType = "PROPERTY" | "AUTO" | "SERVICE" | "ECOMMERCE";

export interface OptionItem {
  category: string;
  name: string;
  extraPrice?: number;
}

export interface BedroomUnit {
  type?: string;
  name?: string;
  count?: number;
}

export interface LocationInfo {
  name?: string;
  state?: string;
  city?: string;
}

export interface ImageObject {
  url?: string;
}



export interface ProductCapabilities {
  canAddToCart: boolean;
  canBookSession: boolean;
  canInquire: boolean;
  isPhysicalAsset: boolean;
}

export interface ProductWithCapabilities extends MarketListingForm {
  capabilities: ProductCapabilities;
}

export interface ProductPageProps {
  listing: MarketListingForm;
  related?: MarketListingForm[];
}

// --- UTILITY & RESOLUTION FUNCTIONS ---
const resolveProductType = (listing: MarketListingForm): ProductType => {
  const cat = (listing.category?.toLowerCase() === "cars" || listing.productCategory?.name?.toLowerCase() === "cars")
    ? (listing.subCategoryName || listing.subCategory.name || listing.subCategory.displayName || listing.productCategory?.name || "").toLowerCase()
    : (listing.productCategory?.name || listing.category || "").toLowerCase();

  // 1. EXPLICIT E-COMMERCE OVERRIDES
  // Forces agricultural items, farm inputs, and specific brands to always show "Add to Cart"
  const explicitEcommerceKeywords = [
    "seeds", "fertilizers", "animal feeds", "veterinary", "farm tools", "equipment",
    "pest control", "irrigation", "greenhouse", "agricultural", "livestock", "medicine",
    "farm machinery", "agribusiness", "farming", "agroforestry", "hydroponics",
    "aquaponics", "agro-processing", "agro-inputs", "ppe", "agro"
  ];
  
  const isExplicitEcommerce = explicitEcommerceKeywords.some(k => cat.includes(k));

  // Auto accessories override
  const autoAccessoryKeywords = [
    "accessories", "performance parts", "car care", "charging stations", "tires", "wheels",
    "audio", "navigation", "interior", "exterior", "safety", "emergency", "fluids", "oils",
    "batteries", "power systems", "lighting", "bulbs", "dash cams", "cameras", "security",
    "tracking", "diagnostic", "electronics", "tools", "parts", "camper", "sunroof", "wipers",
    "washers", "steering", "pedals", "seat covers", "mats", "wraps", "decals", "towing", 
    "trailers", "exhaust", "mufflers", "transmission", "drivetrain", "cooling", "radiators", 
    "suspension", "engine"
  ];
  
  const isAutoAccessory = autoAccessoryKeywords.some(k => cat.includes(k));

  // Priority Interception: If it's an accessory or explicitly agriculture/ecommerce, return immediately
  if (isExplicitEcommerce || isAutoAccessory) {
    return "ECOMMERCE";
  }

  // 2. STANDARD CATEGORY KEYWORDS
  const propertyKeywords = [
    "real estate", "property", "houses", "land", "commercial", "apartments", 
    "vacation rentals", "warehouses", "gated communities", "offices", 
    "serviced apartments", "hostels", "shared housing", "shops", "farms", 
    "hotels", "event spaces"
  ];
  
  const autoKeywords = [
    "automotive", "cars", "motorcycles", "electric vehicles", "luxury cars", 
    "off-road vehicles", "classic & vintage cars", "used cars", "salvage vehicles", 
    "new cars", "pickup trucks", "commercial vehicles", "sports cars", "vans", 
    "delivery trucks", "buses"
  ];
  
  const serviceKeywords = [
    "services", "company services", "cleaning", "drycleaning", "plumbing", 
    "electrical", "landscaping", "catering", "transportation", "it services", 
    "beauty services", "barbershop", "tutoring", "event planning", "tutors", 
    "travel & experiences", "tour packages", "consulting", "coaching", "consultant", 
    "coach", "therapist", "security services", "fitness & wellness", "delivery & logistics", 
    "logistics & delivery", "booking"
  ];

  // 3. Check for Property (Refined area check to prevent coverage metrics from triggering property)
  if (propertyKeywords.some(k => cat.includes(k) || cat === k) || Boolean(listing.bedrooms)) {
    return "PROPERTY";
  }

  // 4. Check for Auto
  if (
    autoKeywords.some(k => cat === k || cat.includes(k)) || 
    (cat.includes("automotive")) || 
    Boolean(listing.vin) || 
    Boolean(listing.logbookStatus)
  ) {
    return "AUTO";
  }

  // 5. Check for Service
  if (serviceKeywords.some(k => cat.includes(k) || cat === k) || Boolean(listing.duration)) {
    return "SERVICE";
  }

  // 6. Default to Ecommerce
  return "ECOMMERCE";
};

const withCapabilities = (listing: MarketListingForm, type: ProductType): ProductWithCapabilities => ({
  ...listing,
  capabilities: {
    canAddToCart: type === "ECOMMERCE",
    canBookSession: type === "PROPERTY" || type === "SERVICE",
    canInquire: type === "AUTO" || type === "PROPERTY" || type === "SERVICE",
    isPhysicalAsset: type === "PROPERTY" || type === "AUTO",
  },
});

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}w=${width}&q=${quality || 75}`;
  }
  return src;
};

const getAmenityIcon = (value: string) => {
  const v = value.toLowerCase();
  if (v.includes("wifi")) return WifiIcon;
  if (v.includes("pool") || v.includes("bath")) return SunIcon;
  if (v.includes("security") || v.includes("cctv")) return ShieldCheckIcon;
  if (v.includes("parking") || v.includes("valet")) return TruckIcon;
  if (v.includes("air_conditioning") || v.includes("heating") || v.includes("ac")) return BoltIcon;
  if (v.includes("generator") || v.includes("power")) return FireIcon;
  if (v.includes("lock")) return KeyIcon;
  if (v.includes("camera")) return VideoCameraIcon;
  return CheckCircleIcon;
};

// --- SUB-COMPONENTS ---
const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="flex flex-col gap-1 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80">
    <div className="flex items-center gap-2 text-slate-400 dark:text-zinc-500 mb-0.5">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="font-black text-slate-900 dark:text-white truncate">{value || "N/A"}</span>
  </div>
);

const UnitCard = ({ unit, type }: { unit: BedroomUnit; type: string }) => (
  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm flex items-center justify-between">
    <div>
      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{type}</span>
      <h4 className="font-black text-slate-900 dark:text-white mt-1">{unit.type || unit.name || "Standard Unit"}</h4>
    </div>
    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-zinc-950 flex items-center justify-center text-emerald-500">
      <CheckCircleIcon className="w-5 h-5" />
    </div>
  </div>
);

const FormField = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 z-10 pointer-events-none">
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          //@ts-ignore
          <Icon className="w-5 h-5 text-slate-400 dark:text-zinc-500 transition-colors" />
        )}
      </div>
      {children}
    </div>
  </div>
);

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function ProductPageClient({ listing, related = [] }: ProductPageProps) {
  const router = useRouter();
  const { addToCart, decreaseQuantity, cart = [] } = useStateContext();
  const { data: session } = useSession();

  // Dynamic Item Resolution
  const itemType = useMemo(() => resolveProductType(listing), [listing]);
  const product = useMemo(() => withCapabilities(listing, itemType), [listing, itemType]);

  // Lightbox & Gallery State
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scheduling & Inquiries State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [modalType, setModalType] = useState<"showing" | "inquiry">("showing");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    consumerId: "",
    message: "",
    preferredDate: "",
    preferredTime: "09:00",
    guests: 1,
  });

  // Dynamic Options & Cart State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  // Auto-fill user information when session changes[cite: 1]
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        clientName: session.user?.name || prev.clientName,
        clientEmail: session.user?.email || prev.clientEmail,
        //@ts-ignore
        consumerId: session.user?.id || prev.consumerId,
      }));
    }
  }, [session]);

  const toggleLike = useCallback((id: string) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // --- E-COMMERCE VARIANTS LOGIC ---[cite: 1]
  const normalizedOptions = useMemo<OptionItem[]>(() => {
    if (!product.capabilities.canAddToCart || !listing.option) return [];
    try {
      return typeof listing.option === "string" ? JSON.parse(listing.option) : listing.option;
    } catch {
      return [];
    }
  }, [listing.option, product.capabilities.canAddToCart]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, OptionItem[]> = {};
    normalizedOptions.forEach((opt) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [normalizedOptions]);

  useEffect(() => {
    if (product.capabilities.canAddToCart && Object.keys(groupedOptions).length > 0) {
      const initialSelection: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([category, options]) => {
        if (options.length > 0) {
          initialSelection[category] = options[0].name;
        }
      });
      setSelectedOptions(initialSelection);
    }
  }, [groupedOptions, product.capabilities.canAddToCart]);

  const livePriceSurcharge = useMemo(() => {
    if (!product.capabilities.canAddToCart) return 0;
    let extra = 0;
    Object.entries(selectedOptions).forEach(([category, selectedValue]) => {
      const match = normalizedOptions.find((o) => o.category === category && o.name === selectedValue);
      if (match?.extraPrice) extra += match.extraPrice;
    });
    return extra;
  }, [selectedOptions, normalizedOptions, product.capabilities.canAddToCart]);

  const liveFinalPrice = (listing.finalPrice || listing.sellingPrice || listing.buyingPrice || 0) + livePriceSurcharge;
  const liveSellingPrice = (listing.finalPrice || listing.sellingPrice || listing.buyingPrice || 0) + livePriceSurcharge;
  const hasDiscount = liveSellingPrice > liveFinalPrice;

  const currentCartItemId = useMemo(() => {
    const optionSignature = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join("-");
    return optionSignature ? `${listing.id}-${optionSignature}` : listing.id;
  }, [listing.id, selectedOptions]);

  const activeVariantQuantity = useMemo(() => {
    const found = cart.find((item: any) => item.cartItemId === currentCartItemId || item.id === currentCartItemId);
    return found?.quantity || 0;
  }, [cart, currentCartItemId]);

  const handleAddToCart = () => {
    addToCart({
      ...listing,
      id: listing.id,
      finalPrice: liveFinalPrice,
      sellingPrice: liveSellingPrice,
      cartItemId: currentCartItemId,
      selectedOptions: { ...selectedOptions },
    });
    
    // Interactive feedback
    setJustAddedToCart(true);
    setTimeout(() => setJustAddedToCart(false), 1500);
  };

  const handleDecreaseQuantity = () => {
    decreaseQuantity(currentCartItemId, selectedOptions);
  };

  // --- LIGHTBOX HOTKEYS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;
      if (e.key === "Escape") setIsGalleryOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGalleryOpen]);

  // --- SCHEDULING / INQUIRY HANDLERS ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError("");
    setIsSubmitting(true);

    try {
      const endpoint = modalType === "showing" ? "/api/admin/showings" : "/api/admin/inquiries";
      const combinedDate =
        formData.preferredDate && formData.preferredTime
          ? new Date(`${formData.preferredDate}T${formData.preferredTime}`)
          : new Date();

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
        }),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Something went wrong processing your request.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsScheduleOpen(false);
        setFormData((prev) => ({
          ...prev,
          message: "",
          preferredDate: "",
          preferredTime: "09:00",
          guests: 1,
        }));
      }, 2000);
    } catch (err: any) {
      setScheduleError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image Array Resolution[cite: 1]
  const rawImages = listing.images && listing.images.length > 0 ? listing.images : [];
  const images = useMemo(() => {
    if (!rawImages.length) return ["https://placehold.co/1200x800?text=No+Image+Available"];
    return rawImages.map((img) => (typeof img === "string" ? img : img.url || "https://placehold.co/1200x800?text=No+Image+Available"));
  }, [rawImages]);

  const handleNextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const handlePrevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const displayTitle = itemType === "AUTO" && listing.make ? `${listing.make} ${listing.model || ""}` : listing.title || listing.name || "Untitled Listing";
  const hostRole = itemType === "PROPERTY" ? "Property Consultant" : itemType === "AUTO" ? "Sales Specialist" : "Service Provider";
  const host = {
    name: listing.contactName || "Authorized Representative",
    role: hostRole,
    phone: listing.contact,
    email: listing.email,
  };

  // --- RENDER SPECS GRID ---
  const renderSpecsGrid = () => {
    if (itemType === "PROPERTY") {
      let bedroomDisplay = "N/A";
      if (Array.isArray(listing.bedrooms) && listing.bedrooms.length > 0) {
        bedroomDisplay = listing.bedrooms[0].type || `${listing.bedrooms.length} Bedrooms`;
      } else if (typeof listing.bedrooms === "number") {
        bedroomDisplay = `${listing.bedrooms} Beds`;
      }

      const displayArea = listing.area ? `${listing.area.toLocaleString()} sqft` : "N/A";
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <StatItem icon={<HomeIcon className="w-5 h-5 text-emerald-500" />} label="Category" value={listing.category || "Property"} />
          <StatItem icon={<CheckCircleIcon className="w-5 h-5 text-emerald-500" />} label="Bedrooms" value={bedroomDisplay} />
          <StatItem icon={<BeakerIcon className="w-5 h-5 text-emerald-500" />} label="Bathrooms" value={listing.bathrooms ? `${listing.bathrooms} Baths` : "N/A"} />
          <StatItem icon={<Square2StackIcon className="w-5 h-5 text-emerald-500" />} label="Total Area" value={displayArea} />
        </div>
      );
    }

    if (itemType === "AUTO") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <StatItem icon={<BoltIcon className="w-5 h-5 text-emerald-500" />} label="Engine" value={`${listing.engineSize || ""} ${listing.engineType || ""}`.trim() || "N/A"} />
          <StatItem icon={<KeyIcon className="w-5 h-5 text-emerald-500" />} label="Transmission" value={listing.transmission || "N/A"} />
          <StatItem icon={<FireIcon className="w-5 h-5 text-emerald-500" />} label="Fuel Type" value={listing.fuelType || "N/A"} />
          <StatItem icon={<Square2StackIcon className="w-5 h-5 text-emerald-500" />} label="Mileage" value={listing.mileage ? `${Number(listing.mileage).toLocaleString()} km` : "N/A"} />
        </div>
      );
    }

    if (itemType === "SERVICE") {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
          <StatItem icon={<BriefcaseIcon className="w-5 h-5 text-emerald-500" />} label="Service Type" value={listing.category || "General"} />
          <StatItem icon={<ClockIcon className="w-5 h-5 text-emerald-500" />} label="Duration" value={listing.duration || "Flexible"} />
          <StatItem icon={<MapPinIcon className="w-5 h-5 text-emerald-500" />} label="Location" value={listing.location?.name || listing.locationName || "On-Demand / Remote"} />
          <StatItem icon={<CheckCircleIcon className="w-5 h-5 text-emerald-500" />} label="Availability" value={listing.status === "ACTIVE" ? "Open Now" : "Closed"} />
        </div>
      );
    }

    return null;
  };

  // --- RENDER ACTION SIDEBAR ---
  const renderActionSidebar = () => {
    // E-Commerce Flow
    if (product.capabilities.canAddToCart) {
      return (
        <div className="sticky top-24 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl space-y-8">
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                KES {liveFinalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through text-slate-400 font-bold tabular-nums">
                  KES {liveSellingPrice.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
              In Stock & Ready to Dispatch
            </p>
          </div>

          {/* Variants selector */}
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
                          type="button"
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [category]: opt.name }))}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                            isSelected
                              ? "bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-500/20 scale-[1.02]"
                              : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:border-emerald-500"
                          }`}
                        >
                          {opt.name} {opt.extraPrice ? `(+KES ${opt.extraPrice.toLocaleString()})` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cart Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            {activeVariantQuantity > 0 ? (
              <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-700">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDecreaseQuantity}
                  className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  <MinusIcon className="w-5 h-5" />
                </motion.button>
                <div className="text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{activeVariantQuantity}</span>
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 block">In Cart</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all ${
                  justAddedToCart 
                    ? "bg-green-600 shadow-green-600/20 text-white scale-[0.98]" 
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                }`}
              >
                {justAddedToCart ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-5 h-5" /> Add to Cart
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      );
    }

    // Booking / Inquiry Flow
    let primaryActionText = "Book Now";
    if (itemType === "PROPERTY") primaryActionText = "Schedule a Tour";
    if (itemType === "AUTO") primaryActionText = "Book Inspection";
    if (itemType === "SERVICE") primaryActionText = "Book Service";

    return (
      <div className="sticky top-24 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-xl">
        <div className="mb-8">
          <p className="text-slate-400 dark:text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">
            Estimated Pricing
          </p>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              maximumFractionDigits: 0,
            }).format(listing.finalPrice || listing.sellingPrice || 0)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center mb-8">
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
              Status
            </span>
            <p className="text-slate-900 dark:text-white font-bold text-sm">
              {listing.status === "ACTIVE" || !listing.status ? "Available / Open" : "Currently Unavailable"}
            </p>
          </div>
          {product.capabilities.isPhysicalAsset ? (
            <ShieldCheckIcon className="w-6 h-6 text-amber-500" />
          ) : (
            <CalendarDaysIcon className="w-6 h-6 text-blue-500" />
          )}
        </div>

        <div className="space-y-3">
          {product.capabilities.canBookSession && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setModalType("showing");
                setIsScheduleOpen(true);
              }}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CalendarDaysIcon className="w-5 h-5" />
              {primaryActionText}
            </motion.button>
          )}

          {product.capabilities.canInquire && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setModalType("inquiry");
                setIsScheduleOpen(true);
              }}
              className="w-full py-5 border-2 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <InformationCircleIcon className="w-5 h-5" />
              {itemType === "SERVICE" ? "Inquire Further" : "Request Details & Offer"}
            </motion.button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 pb-32 transition-colors duration-300">
      
      {/* Lightbox / Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <button
              onClick={() => setIsGalleryOpen(false)}
              aria-label="Close Lightbox"
              className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white z-[110] transition-colors p-2 rounded-full bg-white/10"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Previous Image"
              className="absolute left-4 md:left-12 p-3 md:p-4 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110] transition-all"
            >
              <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>
            <motion.div
              key={currentImageIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full h-full max-w-6xl flex items-center justify-center"
            >
              <Image
                src={images[currentImageIndex]}
                alt={`Gallery View ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                loader={customLoader}
                priority
                sizes="100vw"
              />
            </motion.div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Next Image"
              className="absolute right-4 md:right-12 p-3 md:p-4 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110] transition-all"
            >
              <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" /> Back
          </button>
          <div className="flex items-center gap-3">
            <button
              aria-label="Share listing"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: displayTitle, url: window.location.href }).catch(() => {});
                }
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-full transition-colors text-slate-700 dark:text-zinc-200"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
            <button
              aria-label="Like listing"
              onClick={() => toggleLike(listing.id)}
              className={`p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-full transition-colors ${
                likedItems[listing.id] ? "text-rose-500" : "text-slate-400"
              }`}
            >
              <HeartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {/* Header Header Info */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            {listing.category || "Premium Listing"}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic leading-none mb-4">
            {displayTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-zinc-400 font-medium text-sm mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/50 dark:bg-zinc-800 text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-zinc-300">
              {product.capabilities.canAddToCart && (
                <>
                  <TagIcon className="w-4 h-4 text-emerald-500" /> Buy Online
                </>
              )}
              {!product.capabilities.canAddToCart && product.capabilities.isPhysicalAsset && (
                <>
                  <LockClosedIcon className="w-4 h-4 text-amber-500" /> Physical Asset / Inquire
                </>
              )}
              {!product.capabilities.canAddToCart && itemType === "SERVICE" && (
                <>
                  <CalendarDaysIcon className="w-4 h-4 text-blue-500" /> Bookable Service
                </>
              )}
            </div>

            {(listing.location?.name || listing.locationName || listing.location?.address) && (
              <div className="flex items-center gap-1.5">
                <MapPinIcon className="w-5 h-5 text-emerald-500" />
                <span>
                  {listing.location?.name || listing.locationName}
                  {listing.location?.state ? `, ${listing.location.state}` : ""}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-amber-500">
              <StarIcon className="w-5 h-5 fill-current" />
              <span className="text-slate-900 dark:text-zinc-100 font-bold">
                {listing.providerRating || "4.9"} Ratings
              </span>
            </div>
          </div>
        </div>

        {/* Bento Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 md:gap-4 h-[400px] md:h-[550px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-slate-100 dark:bg-zinc-900">
          <div
            className="col-span-1 md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden"
            onClick={() => {
              setCurrentImageIndex(0);
              setIsGalleryOpen(true);
            }}
          >
            <Image
              src={images[0]}
              loader={customLoader}
              alt="Primary Feature"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {images.slice(1, 5).map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer hidden md:block overflow-hidden"
              onClick={() => {
                setCurrentImageIndex(idx + 1);
                setIsGalleryOpen(true);
              }}
            >
              <Image
                src={imgUrl}
                loader={customLoader}
                alt={`Listing View ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center backdrop-blur-sm group-hover:bg-zinc-950/60 transition-all">
                  <Square2StackIcon className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-bold text-xs uppercase tracking-widest">
                    +{images.length - 5} More Photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Body Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-12">
            {renderSpecsGrid()}

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <InformationCircleIcon className="w-8 h-8 text-emerald-500" /> Overview
              </h2>
              <p className="text-slate-600 dark:text-zinc-300 text-lg leading-relaxed font-medium whitespace-pre-line">
                {listing.description ||
                  "Premium quality guaranteed. Intuitively designed and engineered to meet your standard of expectations."}
              </p>
            </section>

            {/* Sub-configurations for properties */}
            {itemType === "PROPERTY" && Array.isArray(listing.bedrooms) && listing.bedrooms.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Unit Configurations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.bedrooms.map((unit, idx) => (
                    <UnitCard key={idx} unit={unit} type="Configuration" />
                  ))}
                </div>
              </section>
            )}

            {/* Amenities Grid */}
            {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Included Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.amenities.map((item, idx) => {
                    const Icon = getAmenityIcon(item);
                    return (
                      <motion.div
                        whileHover={{ x: 5 }}
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-sm transition-all group"
                      >
                        <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-zinc-200 capitalize">
                          {item.replace(/_/g, " ")}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Provider Card for Non-Ecommerce Listings */}
            {!product.capabilities.canAddToCart && (
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
                        type="button"
                        onClick={() => {
                          setModalType("inquiry");
                          setIsScheduleOpen(true);
                        }}
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

          {/* Action Sidebar */}
          <div className="lg:col-span-1">{renderActionSidebar()}</div>
        </div>

        {/* Related Items View */}
        {related.length > 0 && (
          <section className="mt-24">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Related Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map((item) => (
                <DynamicGhubaProductCard
                  key={item._id || item.id}
                  product={item}
                  toggleLike={toggleLike}
                  likedItems={likedItems}
                  addToCart={addToCart}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Booking / Inquiry Modal */}
      <AnimatePresence>
        {isScheduleOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-lg p-8 relative shadow-2xl overflow-hidden my-8"
            >
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 dark:bg-zinc-800 p-2 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {modalType === "showing" ? "Schedule a Tour / Service" : "Send Inquiry"}
              </h2>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mb-8">
                {modalType === "showing"
                  ? "Pick a date and time that works best for you."
                  : "We'll get back to you with details as soon as possible."}
              </p>

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Request Submitted!</h3>
                  <p className="text-slate-500 dark:text-zinc-400 text-sm">
                    Our representative will contact you shortly to confirm details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-5">
                  {scheduleError && (
                    <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl border border-red-100">
                      {scheduleError}
                    </div>
                  )}

                  <FormField label="Full Name" icon={UserIcon}>
                    <input
                      required
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleFormChange}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all"
                      placeholder="Jane Doe"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Email" icon={EnvelopeIcon}>
                      <input
                        required
                        type="email"
                        name="clientEmail"
                        value={formData.clientEmail}
                        onChange={handleFormChange}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all"
                        placeholder="jane@example.com"
                      />
                    </FormField>
                    <FormField label="Phone" icon={PhoneIcon}>
                      <input
                        required
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleFormChange}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all"
                        placeholder="+254..."
                      />
                    </FormField>
                  </div>

                  {modalType === "showing" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Preferred Date" icon={CalendarDaysIcon}>
                        <input
                          required
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all"
                        />
                      </FormField>
                      <FormField label="Preferred Time" icon={ClockIcon}>
                        <input
                          required
                          type="time"
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleFormChange}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all"
                        />
                      </FormField>
                    </div>
                  )}

                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleFormChange}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all resize-none"
                      placeholder={
                        modalType === "showing"
                          ? "Any specific requirements for your appointment?"
                          : "What would you like to know about this listing?"
                      }
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
                        {modalType === "showing" ? "Confirm Booking" : "Send Inquiry"}
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