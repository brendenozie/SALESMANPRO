"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPinIcon, StarIcon, WifiIcon, SunIcon, TruckIcon, ShieldCheckIcon, 
  CheckCircleIcon, BeakerIcon, Square2StackIcon, ChatBubbleLeftRightIcon, 
  PhoneIcon, CalendarDaysIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
  ShareIcon, HeartIcon, HomeIcon, UserIcon, InformationCircleIcon,
  FireIcon, BoltIcon, KeyIcon, VideoCameraIcon, CalendarIcon, ClockIcon, 
  EnvelopeIcon, UsersIcon, CurrencyDollarIcon, BanknotesIcon 
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { resolveProductMedia } from '@/lib/product-media-resolver';
import { useSession } from "next-auth/react";

// Internal Helper for consistent input styling
const FormField = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400">
        <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
      {children}
    </div>
  </div>
);

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

const customLoader = ({ src }: { src: string }) => src;

export default function PropertyDetailsClient({ data }: { data: any }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [modalType, setModalType] = useState<"showing" | "inquiry" | "offer" | "booking">("showing");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [pageUrl, setPageUrl] = useState("");

  // Wishlist bookmark state
  const [isSaved, setIsSaved] = useState(false);
  const [isSavingWishlist, setIsSavingWishlist] = useState(false);

  // Short-Term Booking & Availability State
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availabilityQuote, setAvailabilityQuote] = useState<any>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Offer State
  const [offerAmount, setOfferAmount] = useState(data.finalPrice || data.sellingPrice || "");
  const [closureDate, setClosureDate] = useState("");

  // AUTH SESSION
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    consumerId: '',
    message: "",
    preferredDate: "",
    preferredTime: "09:00",
    guests: 1,
  });

  // Check if saved to wishlist on load
  useEffect(() => {
    async function checkWishlist() {
      try {
        const res = await fetch("/api/me/wishlist");
        if (res.ok) {
          const json = await res.json();
          const found = json.wishlistItems?.some((item: any) => item.listingId === data.id);
          if (found) setIsSaved(true);
        }
      } catch (e) {}
    }
    checkWishlist();
  }, [data.id]);

  // Grab URL safely
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  // Update form once session data is available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        clientName: session.user?.name || '',
        clientEmail: session.user?.email || '',
        consumerId: (session.user as any)?.id || '',
      }));
    }
  }, [session]);

  // Live availability lookup when dates change
  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setAvailabilityQuote(null);
      return;
    }

    let active = true;
    async function fetchQuote() {
      setIsCheckingAvailability(true);
      try {
        const res = await fetch(`/api/properties/${data.id}/availability?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
        if (res.ok) {
          const json = await res.json();
          if (active) {
            setAvailabilityQuote(json);
          }
        }
      } catch (err) {
        console.error("Availability error:", err);
      } finally {
        if (active) setIsCheckingAvailability(false);
      }
    }

    fetchQuote();
    return () => { active = false; };
  }, [checkInDate, checkOutDate, data.id]);

  const toggleWishlist = async () => {
    setIsSavingWishlist(true);
    try {
      if (isSaved) {
        const res = await fetch(`/api/me/wishlist?listingId=${data.id}`, { method: "DELETE" });
        if (res.ok) setIsSaved(false);
      } else {
        const res = await fetch("/api/me/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: data.id }),
        });
        if (res.ok) setIsSaved(true);
      }
    } catch (e) {
      console.error("Wishlist error:", e);
    } finally {
      setIsSavingWishlist(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const submitInquiry = async () => {
    const response = await fetch("/api/admin/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: data.companyId,
        propertyId: data.id,
        propertyName: data.name,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        consumerId: formData.consumerId,
        message: formData.message,
        assignedToAgentId: data.agentId,
        assignedToAgentName: data.contactName,
      }),
    });
    return response.json();
  };

  const submitShowing = async () => {
    const combinedDate = new Date(`${formData.preferredDate}T${formData.preferredTime}`);
    const response = await fetch("/api/admin/showings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: data.companyId,
        propertyId: data.id,
        propertyName: data.name,
        consumerId: formData.consumerId || "",
        clientId: formData.consumerId || data.userId || "",
        clientName: formData.clientName,
        agentId: data.agentId,
        agentName: data.contactName,
        dateTime: combinedDate.toISOString(),
        notes: `Guest Count: ${formData.guests}\nPhone: ${formData.clientPhone}\nMessage: ${formData.message}`,
      }),
    });
    return response.json();
  };

  const submitOffer = async () => {
    const response = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId: data.companyId,
        propertyId: data.id,
        propertyName: data.name,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientId: formData.consumerId || undefined,
        agentId: data.agentId || undefined,
        offerAmount: Number(offerAmount),
        closureDate: closureDate ? new Date(closureDate).toISOString() : undefined,
        notes: formData.message,
      }),
    });
    return response.json();
  };

  const submitBooking = async () => {
    const response = await fetch(`/api/properties/${data.id}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: formData.guests,
        guestName: formData.clientName,
        guestEmail: formData.clientEmail,
        guestPhone: formData.clientPhone,
        notes: formData.message,
      }),
    });
    return response.json();
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let result;
      if (modalType === "showing") {
        result = await submitShowing();
        setSuccessMessage("Tour requested! The property manager will reach out shortly.");
      } else if (modalType === "offer") {
        result = await submitOffer();
        setSuccessMessage("Your formal offer has been received and presented to the seller!");
      } else if (modalType === "booking") {
        result = await submitBooking();
        setSuccessMessage("Your stay reservation is held! Please proceed to checkout.");
      } else {
        result = await submitInquiry();
        setSuccessMessage("Inquiry sent successfully!");
      }

      if (!result.success && !result.booking) {
        throw new Error(result.error || result.message || "Failed to process request");
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
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolvedMedia = useMemo(() => resolveProductMedia(data), [data]);
  const gallery = resolvedMedia.gallery;

  const host = {
    name: data.contactName || "Authorized Agent",
    role: "Property Consultant",
    phone: data.contact,
    email: data.email
  };

  const amenitiesList = data.amenities || [];
  const bedroomCount = data.bedrooms?.length > 0 ? data.bedrooms[0].type : "N/A";
  const displayArea = data.area ? `${data.area.toLocaleString()} sqft` : "TBD";

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      
      {/* --- LIGHTBOX --- */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsGalleryOpen(false)}
          >
            <button className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white z-[110]">
              <XMarkIcon className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            
            <button onClick={prevImage} className="absolute left-2 md:left-8 p-2 md:p-3 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]">
              <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <motion.div 
              key={currentImageIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full max-w-6xl flex items-center justify-center"
            >
              {gallery[currentImageIndex]?.type === "VIDEO" ? (
                <div className="relative w-full h-full max-h-[85vh] flex items-center justify-center">
                  <video
                    src={gallery[currentImageIndex].url}
                    poster={gallery[currentImageIndex].posterUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
                  />
                </div>
              ) : (
                <Image 
                  src={gallery[currentImageIndex]?.url || resolvedMedia.primaryImageUrl} 
                  alt="Gallery" 
                  fill 
                  className="object-contain" 
                  loader={customLoader}
                  priority
                />
              )}
            </motion.div>

            <button onClick={nextImage} className="absolute right-2 md:right-8 p-2 md:p-3 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]">
              <ChevronRightIcon className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-3 md:mb-4 capitalize">
              {data.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
              <div className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                <MapPinIcon className="w-5 h-5" />
                <span>{data.location?.name || data.locationName || "Nairobi"}, {data.location?.state || "Kenya"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-slate-900 dark:text-white font-bold">{data.providerRating || "5.0"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: data.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Property link copied to clipboard!");
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <ShareIcon className="w-5 h-5" /> Share
            </button>
            <button 
              onClick={toggleWishlist}
              disabled={isSavingWishlist}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shadow-sm font-semibold text-sm ${
                isSaved 
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
              }`}
            >
              {isSaved ? <HeartSolid className="w-5 h-5 text-rose-500" /> : <HeartIcon className="w-5 h-5" />}
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* --- BENTO GALLERY --- */}
        <div className="grid grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-[300px] md:h-[600px] rounded-2xl md:rounded-[2rem] overflow-hidden mb-12 md:mb-16 shadow-2xl shadow-indigo-100/50 dark:shadow-none bg-slate-200 dark:bg-slate-800">
          <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden" onClick={() => { setCurrentImageIndex(0); setIsGalleryOpen(true); }}>
            {gallery[0]?.type === "VIDEO" ? (
              <div className="relative w-full h-full">
                <Image
                  src={gallery[0].posterUrl || resolvedMedia.posterUrl}
                  loader={customLoader}
                  alt="Property Video Tour"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-white/95 dark:bg-zinc-900/95 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <VideoCameraIcon className="w-8 h-8 ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-wider">
                  <VideoCameraIcon className="w-4 h-4 text-emerald-400" />
                  <span>Watch Virtual Video Tour</span>
                </div>
              </div>
            ) : (
              <Image src={gallery[0]?.url || resolvedMedia.primaryImageUrl} loader={customLoader} alt="Primary" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            )}
          </div>
          {gallery.slice(1, 5).map((item, idx: number) => (
            <div key={idx} className="relative group cursor-pointer hidden md:block overflow-hidden" onClick={() => { setCurrentImageIndex(idx + 1); setIsGalleryOpen(true); }}>
              <Image src={item.thumbnailUrl || item.posterUrl || item.url} loader={customLoader} alt={`View ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              {item.type === "VIDEO" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <VideoCameraIcon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
              {idx === 3 && gallery.length > 5 && (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                  <Square2StackIcon className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-bold text-sm uppercase">{gallery.length - 5}+ More Media</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-12 md:space-y-16">
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <StatItem icon={<HomeIcon className="w-6 h-6" />} label="Category" value={data.category || "Property"} />
               <StatItem icon={<CheckCircleIcon className="w-6 h-6" />} label="Configuration" value={bedroomCount} />
               <StatItem icon={<BeakerIcon className="w-6 h-6" />} label="Bathrooms" value={data.bathrooms || "1"} />
               <StatItem icon={<Square2StackIcon className="w-6 h-6" />} label="Total Area" value={displayArea} />
            </div>

            {/* Description */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                  <InformationCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Property Overview</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">{data.description}</p>
            </section>

            {(data.bedrooms?.length > 0 || data.studios?.length > 0) && (
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                    <HomeIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Available Configurations</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {data.bedrooms?.map((unit: any, idx: number) => (
                    <UnitCard key={`bed-${idx}`} unit={unit} type="Bedroom" />
                  ))}
                  {data.studios?.map((unit: any, idx: number) => (
                    <UnitCard key={`studio-${idx}`} unit={unit} type="Studio" />
                  ))}
                </div>
              </section>
            )}

            {/* Amenities Section */}
            <section>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 md:mb-8">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {amenitiesList.map((item: string, idx: number) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <motion.div whileHover={{ x: 5 }} key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-colors">
                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{item.replace(/_/g, ' ')}</span>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Host Card */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] p-6 md:p-12 text-white relative overflow-hidden shadow-xl dark:shadow-none border border-transparent dark:border-slate-700">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-500 flex items-center justify-center text-2xl md:text-3xl font-black border-4 border-white/10 shrink-0">
                  {host.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-black mb-1">{host.name}</h3>
                  <p className="text-indigo-300 dark:text-indigo-400 text-xs uppercase tracking-widest mb-6">{host.role}</p>
                  <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3 md:gap-4">
                    <button 
                      onClick={() => {
                        setModalType("inquiry");
                        setIsScheduleOpen(true);
                      }} 
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-bold w-full sm:w-auto"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5" /> Message
                    </button>
                    {host.phone && (
                      <a href={`tel:${host.phone}`} className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                        <PhoneIcon className="w-5 h-5" />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR: PRICING, SHORT-TERM BOOKING & ACTIONS --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-2xl">
              
              <div className="mb-6">
                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-wider mb-1">Listed Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('en-KE', { 
                      style: 'currency', 
                      currency: 'KES',
                      maximumFractionDigits: 0 
                    }).format(data.finalPrice || data.sellingPrice || 0)}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {data.duration ? `/${data.duration}` : "/night or purchase"}
                  </span>
                </div>
              </div>

              {/* Short-Term Stay Date Picker */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Stay Reservation
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    Live Availability
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Check-in</label>
                    <input 
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full text-xs font-bold py-2 px-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Check-out</label>
                    <input 
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full text-xs font-bold py-2 px-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                {/* Live quote breakdown */}
                {isCheckingAvailability ? (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold animate-pulse text-center py-1">
                    Checking calendar...
                  </p>
                ) : availabilityQuote ? (
                  availabilityQuote.isAvailable ? (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{availabilityQuote.pricing?.nights} Nights</span>
                        <span>${availabilityQuote.pricing?.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Cleaning fee</span>
                        <span>${availabilityQuote.pricing?.cleaningFee}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Total (inc. taxes)</span>
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm">
                          ${availabilityQuote.pricing?.total}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
                      Dates are already booked. Please choose other dates.
                    </div>
                  )
                ) : null}

                <button
                  disabled={!checkInDate || !checkOutDate || (availabilityQuote && !availabilityQuote.isAvailable)}
                  onClick={() => {
                    setModalType("booking");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <CalendarDaysIcon className="w-4 h-4" /> Book Stay Now
                </button>
              </div>

              {/* Core Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setModalType("showing");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" /> Schedule a Tour
                </button>

                <button  
                  onClick={() => {
                    setModalType("offer");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-3.5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors rounded-xl font-black text-sm flex items-center justify-center gap-2"
                >
                  <BanknotesIcon className="w-4 h-4" /> Place an Offer
                </button>

                <button  
                  onClick={() => {
                    setModalType("inquiry");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> Send Direct Inquiry
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* --- INTERACTIVE ACTION MODAL --- */}
      <AnimatePresence>
        {isScheduleOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleOpen(false)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-transparent dark:border-slate-800"
            >
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all active:scale-90"
              >
                <XMarkIcon className="w-5 h-5 md:w-6 md:h-6 text-slate-500 dark:text-slate-400" />
              </button>

              <div className="p-6 md:p-12">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 md:py-12"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
                      <CheckCircleIcon className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-3">
                      Action Completed!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed text-sm md:text-base">
                      {successMessage}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <header className="mb-6 md:mb-8">
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                        {modalType === "showing" && "Book a Showing Tour"}
                        {modalType === "offer" && "Submit Formal Offer"}
                        {modalType === "booking" && "Confirm Stay Reservation"}
                        {modalType === "inquiry" && "Inquire About Property"}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm md:text-base">
                        {data.name}
                      </p>
                    </header>

                    {error && (
                      <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleModalSubmit} className="space-y-4 md:space-y-5">
                      
                      {/* Guest/Client Contact */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Full Name" icon={UserIcon}>
                          <input
                            required
                            value={formData.clientName}
                            onChange={handleChange}
                            name="clientName"
                            placeholder="Your full name"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 text-slate-900 dark:text-white rounded-xl outline-none font-bold text-sm"
                          />
                        </FormField>

                        <FormField label="Phone Number" icon={PhoneIcon}>
                          <input
                            required
                            value={formData.clientPhone}
                            onChange={handleChange}
                            name="clientPhone"
                            type="tel"
                            placeholder="+254 700 000000"
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 text-slate-900 dark:text-white rounded-xl outline-none font-bold text-sm"
                          />
                        </FormField>
                      </div>

                      <FormField label="Email Address" icon={EnvelopeIcon}>
                        <input
                          required
                          value={formData.clientEmail}
                          onChange={handleChange}
                          name="clientEmail"
                          type="email"
                          placeholder="your.email@example.com"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 text-slate-900 dark:text-white rounded-xl outline-none font-bold text-sm"
                        />
                      </FormField>

                      {/* Modal Type: Showing Tour */}
                      {modalType === "showing" && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                          <FormField label="Preferred Date" icon={CalendarIcon}>
                            <input 
                              name="preferredDate"
                              value={formData.preferredDate}
                              onChange={handleChange}
                              required
                              type="date" 
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-sm"
                            />
                          </FormField>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField label="Time Slot" icon={ClockIcon}>
                              <select 
                                name="preferredTime"
                                value={formData.preferredTime}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-sm">
                                <option value="09:00">Morning (09:00 AM)</option>
                                <option value="14:00">Afternoon (02:00 PM)</option>
                                <option value="17:00">Evening (05:00 PM)</option>
                              </select>
                            </FormField>

                            <FormField label="Attendees" icon={UsersIcon}>
                              <input 
                                name="guests"
                                value={formData.guests}
                                onChange={handleChange}
                                required
                                type="number" 
                                min="1"
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-sm" 
                              />
                            </FormField>
                          </div>
                        </div>
                      )}

                      {/* Modal Type: Offer */}
                      {modalType === "offer" && (
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl space-y-4 border border-indigo-100 dark:border-indigo-900">
                          <FormField label="Your Offer Amount (KES)" icon={CurrencyDollarIcon}>
                            <input 
                              type="number"
                              required
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              placeholder="e.g. 15000000"
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-sm"
                            />
                          </FormField>

                          <FormField label="Target Closing Date" icon={CalendarIcon}>
                            <input 
                              type="date"
                              value={closureDate}
                              onChange={(e) => setClosureDate(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-sm"
                            />
                          </FormField>
                        </div>
                      )}

                      {/* Modal Type: Booking */}
                      {modalType === "booking" && availabilityQuote?.pricing && (
                        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl space-y-2 border border-emerald-100 dark:border-emerald-900 text-xs">
                          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                            <span>Check-in: {checkInDate}</span>
                            <span>Check-out: {checkOutDate}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>{availabilityQuote.pricing.nights} Nights Stay</span>
                            <span>${availabilityQuote.pricing.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Cleaning & Service Fees</span>
                            <span>${availabilityQuote.pricing.cleaningFee + availabilityQuote.pricing.serviceFee}</span>
                          </div>
                          <div className="flex justify-between font-black text-sm text-emerald-600 dark:text-emerald-400 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                            <span>Total Due</span>
                            <span>${availabilityQuote.pricing.total}</span>
                          </div>
                        </div>
                      )}

                      <FormField label={''} icon={ChatBubbleLeftRightIcon}>
                        <textarea
                          value={formData.message}
                          onChange={handleChange}
                          name="message"
                          placeholder="Additional requests, terms, or questions..."
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 text-slate-900 dark:text-white rounded-xl outline-none font-bold resize-none text-sm"
                        />
                      </FormField>

                      <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-base shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70"
                      >
                        {isSubmitting ? "Submitting..." : 
                          modalType === "showing" ? "Confirm Showing Appointment" : 
                          modalType === "offer" ? "Submit Formal Offer" : 
                          modalType === "booking" ? "Hold & Proceed to Booking" : 
                          "Send Inquiry"
                        }
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Contact */}
      {pageUrl && (
        <WhatsAppInquiry 
          productName={data.name}
          productPrice={data.finalPrice || data.sellingPrice || 0}
          productUrl={pageUrl}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col items-center md:items-start p-2">
      <div className="text-slate-400 dark:text-slate-500 mb-2">{icon}</div>
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm md:text-md font-black text-slate-900 dark:text-white text-center md:text-left">{value || "N/A"}</p>
    </div>
  );
}

function UnitCard({ unit, type }: { unit: any; type: string }) {
  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(unit.price || 0));

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="flex justify-between items-start mb-5 md:mb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            {type}
          </span>
          <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-2">{unit.type}</h4>
        </div>
        <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800 rounded-xl md:rounded-2xl group-hover:bg-indigo-600 text-slate-600 dark:text-slate-400 group-hover:text-white transition-colors">
          <Square2StackIcon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Total Area</span>
          <span className="text-slate-900 dark:text-white font-bold">{Number(unit.size || 0).toLocaleString()} sqft</span>
        </div>
        <div className="h-px bg-slate-50 dark:bg-slate-800" />
        <div className="flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500 text-xs md:text-sm font-medium">Price</span>
          <span className="text-base md:text-lg font-black text-indigo-600 dark:text-indigo-400">{formattedPrice}</span>
        </div>
      </div>
    </motion.div>
  );
}