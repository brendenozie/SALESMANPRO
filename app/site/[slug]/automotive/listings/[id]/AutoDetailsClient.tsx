"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPinIcon, StarIcon, WifiIcon, SunIcon, TruckIcon, ShieldCheckIcon, 
  CheckCircleIcon, BeakerIcon, Square2StackIcon, ChatBubbleLeftRightIcon, 
  PhoneIcon, CalendarDaysIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
  ShareIcon, HeartIcon, HomeIcon, UserIcon, InformationCircleIcon,
  FireIcon, BoltIcon, KeyIcon, VideoCameraIcon, CalendarIcon, ClockIcon , EnvelopeIcon, UsersIcon } from "@heroicons/react/24/outline";

import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { resolveProductMedia } from '@/lib/product-media-resolver';

// AUTH
import { useSession } from "next-auth/react";

// Internal Helper for consistent input styling
const FormField = ({ label, icon: Icon, children }:any) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">
        {label}
      </label>
    )}
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-600">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      {children}
    </div>
  </div>
);

// --- Improved Icon Mapper based on your AMENITIES_CATEGORIES values ---
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

export default function AutoDetailsClient({ data }: { data: any }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [modalType, setModalType] = useState<"showing" | "inquiry">("showing");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // AUTH SESSION
  const { data: session, status } = useSession();
  const user = session?.user;

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

  // Update form once session data is available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        clientName: session.user?.name || '',
        clientEmail: session.user?.email || '',
        consumerId: session.user?.id || '',
        // Add other fields if they exist in your session object
      }));
    }
  }, [session]); // This runs whenever the 'session' object changes


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
      headers: {
        "Content-Type": "application/json",
      },
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
    const combinedDate = new Date(
      `${formData.preferredDate}T${formData.preferredTime}`
    );

    const response = await fetch("/api/admin/showings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

          notes: `Guest Count: ${formData.guests}
          Phone: ${formData.clientPhone}
          Message: ${formData.message}`,
              }),
      });

    return response.json();
  };

  const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
          let result;

          if (modalType === "showing") {
            result = await submitShowing();
          } else {
            result = await submitInquiry();
          }

          if (!result.success) {
            throw new Error(result.message || "Something went wrong");
          }

          setIsSuccess(true);

          setTimeout(() => {
            setIsSuccess(false);
            setIsScheduleOpen(false);

            setFormData({
              ...formData,
              message: "",
              preferredDate: "",
              preferredTime: "09:00",
              guests: 1,
            });
          }, 2000);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsSubmitting(false);
        }
      };

  // Universal Media Resolution
  const resolvedMedia = React.useMemo(() => resolveProductMedia(data), [data]);
  const gallery = resolvedMedia.gallery;
  
  // Mapping host from root contact fields
  const host = {
    name: data.contactName || "Authorized Agent",
    role: "Autotmotive Consultant",
    phone: data.contact,
    email: data.email
  };

  // Correcting the key from 'features' to 'amenities'
  const amenitiesList = data.amenities || [];

  // Handling complex types for the Stat Bar
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
    <div className="min-h-screen font-sans pb-20 bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300">

      
      {/* --- PREMIUM LIGHTBOX --- */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setIsGalleryOpen(false)}
          >
            <button className="absolute top-8 right-8 text-white/70 hover:text-white z-[110]">
              <XMarkIcon className="w-10 h-10" />
            </button>
            
            <button onClick={prevImage} className="absolute left-4 md:left-8 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]">
              <ChevronLeftIcon className="w-8 h-8" />
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

            <button onClick={nextImage} className="absolute right-4 md:right-8 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]">
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-14 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 min-h-screen transition-colors duration-300 pb-24 md:pb-12">
      
        {/* --- BREADCRUMB / ACTION ROW --- */}
        <div className="flex items-center justify-between mb-4 text-xs md:text-sm font-medium text-slate-500 dark:text-zinc-400">
          <span className="bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-slate-100 dark:border-zinc-800 shadow-sm">
            {data.category} &middot; {data.condition}
          </span>
          <div className="flex gap-2">
            <button className="p-2 bg-white dark:bg-zinc-900 rounded-full border border-slate-100 dark:border-zinc-800 shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <ShareIcon className="w-4 h-4 md:w-5 h-5" />
            </button>
            <button className="p-2 bg-white dark:bg-zinc-900 rounded-full border border-slate-100 dark:border-zinc-800 shadow-sm hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
              <HeartIcon className="w-4 h-4 md:w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 mb-3 capitalize">
              {data.category === "Cars" ? `${data.make} ${data.model}` : data.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 dark:text-zinc-400 text-sm font-medium">
              <div className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                <MapPinIcon className="w-4 h-4 md:w-5 h-5 text-indigo-500" />
                <span>{data.location?.name || data.locationName}, {data.location?.state}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-md font-semibold text-xs md:text-sm">
                <StarIcon className="w-4 h-4 fill-current" />
                <span>{data.providerRating || "5.0"} Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC GALLERY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 h-auto md:h-[500px] lg:h-[580px] rounded-2xl md:rounded-[2rem] overflow-hidden mb-8 md:mb-12 shadow-md dark:shadow-none">
          <div className="col-span-1 md:col-span-2 md:row-span-2 relative group cursor-pointer aspect-[4/3] md:aspect-auto overflow-hidden" onClick={() => { setCurrentImageIndex(0); setIsGalleryOpen(true); }}>
            {gallery[0]?.type === "VIDEO" ? (
              <div className="relative w-full h-full">
                <img src={gallery[0].posterUrl || resolvedMedia.posterUrl} alt="Vehicle Showcase" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                  <div className="w-16 h-16 rounded-full bg-white/95 dark:bg-zinc-900/95 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <VideoCameraIcon className="w-8 h-8 ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-wider">
                  <VideoCameraIcon className="w-4 h-4 text-indigo-400" />
                  <span>Watch Walkaround Video</span>
                </div>
              </div>
            ) : (
              <>
                <img src={gallery[0]?.url || resolvedMedia.primaryImageUrl} alt="Primary View" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
            {/* Mobile view photo counter badge */}
            <button className="md:hidden absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Square2StackIcon className="w-4 h-4" /> {gallery.length} Media
            </button>
          </div>
          
          {gallery.slice(1, 5).map((item, idx: number) => (
            <div key={idx} className="relative group cursor-pointer hidden md:block overflow-hidden" onClick={() => { setCurrentImageIndex(idx + 1); setIsGalleryOpen(true); }}>
              <img src={item.thumbnailUrl || item.posterUrl || item.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {item.type === "VIDEO" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <VideoCameraIcon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
              {idx === 3 && gallery.length > 5 && (
                <div className="absolute inset-0 bg-zinc-950/70 flex flex-col items-center justify-center backdrop-blur-[4px] group-hover:bg-zinc-950/60 transition-all">
                  <Square2StackIcon className="w-7 h-7 text-white mb-1.5" />
                  <span className="text-white font-bold text-xs tracking-wider uppercase">{gallery.length - 5}+ More Media</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- CONTENT LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-2 space-y-10 md:space-y-12">
            
            {/* --- VEHICLE QUICK STATS GRID --- */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 md:p-6 bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-sm">
              {[
                { icon: <BoltIcon className="w-5 h-5 text-indigo-500" />, label: "Engine", value: `${data.engineSize}L ${data.engineType}` },
                { icon: <KeyIcon className="w-5 h-5 text-indigo-500" />, label: "Transmission", value: data.transmission },
                { icon: <FireIcon className="w-5 h-5 text-indigo-500" />, label: "Fuel Type", value: data.fuelType },
                { icon: <Square2StackIcon className="w-5 h-5 text-indigo-500" />, label: "Mileage", value: `${Number(data.mileage).toLocaleString()} km` }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-transparent dark:border-zinc-800/50">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">{stat.icon}</div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200 line-clamp-1">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* --- TECHNICAL SPECIFICATIONS --- */}
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Technical Specifications</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Horsepower", value: `${data.horsepower?.$numberLong || data.horsepower} HP` },
                  { label: "Drivetrain", value: data.drivetrain },
                  { label: "VIN Verified", value: data.vin ? "Yes, Available" : "N/A", mono: data.vin },
                  { label: "Condition", value: data.condition, accent: true }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-xl shadow-sm">
                    <span className="text-slate-500 dark:text-zinc-400 text-sm font-medium">{spec.label}</span>
                    <span className={`text-sm font-bold ${spec.accent ? 'text-indigo-600 dark:text-indigo-400' : spec.mono ? 'font-mono bg-slate-50 dark:bg-zinc-950 px-2 py-0.5 rounded text-xs text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* --- FEATURES & AMENITIES --- */}
            <section className="space-y-4 md:space-y-6">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenitiesList.map((item: string, idx: number) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <motion.div whileHover={{ x: 4 }} key={idx} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 group transition-all">
                      <div className="p-2 bg-slate-50 dark:bg-zinc-950 rounded-lg group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-slate-500 dark:text-zinc-400 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm text-slate-700 dark:text-zinc-300 capitalize">{item.replace(/_/g, ' ')}</span>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* --- HOST CARD --- */}
            <div className="bg-slate-900 dark:bg-zinc-900 border border-slate-800 dark:border-zinc-800/80 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-2xl font-bold border-4 border-slate-800 shadow-lg">
                  {host.name.charAt(0)}
                </div>
                <div className="flex-1 text-center sm:text-left space-y-4 sm:space-y-2">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{host.name}</h3>
                    <p className="text-indigo-400 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">{host.role}</p>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl font-bold text-sm shadow-md shadow-indigo-900/30">
                      <ChatBubbleLeftRightIcon className="w-4 h-4" /> Message
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 transition-colors rounded-xl font-bold text-sm border border-white/10">
                      <PhoneIcon className="w-4 h-4 text-slate-300" /> Contact Dealer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR DESKTOP PRICING PANEL --- */}
          <div className="lg:col-span-1 hidden lg:block sticky top-12">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
              <div>
                <p className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Pricing</p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
                  {new Intl.NumberFormat('en-KE', { 
                    style: 'currency', 
                    currency: 'KES',
                    maximumFractionDigits: 0 
                  }).format(data.finalPrice || data.sellingPrice || 0)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase block tracking-wider">Availability</span>
                  <p className="text-slate-900 dark:text-zinc-200 font-bold text-sm">{data.status === "ACTIVE" ? "Immediate Inspection" : "Unavailable"}</p>
                </div>
                <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="space-y-2">
                <button onClick={() => { setModalType("showing"); setIsScheduleOpen(true); }} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-indigo-600/10">
                  Schedule a Tour
                </button>
                <button onClick={() => { setModalType("inquiry"); setIsScheduleOpen(true); }} className="w-full py-3.5 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-xl font-bold transition-all text-sm">
                  Place an Offer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- PERSISTENT MOBILE BOTTOM SHEET BAR --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-slate-400 dark:text-zinc-500 text-[10px] font-bold uppercase block tracking-wide">Price</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-zinc-50">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(data.finalPrice || data.sellingPrice || 0)}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setModalType("inquiry"); setIsScheduleOpen(true); }} className="px-4 py-2.5 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-sm rounded-xl">
              Offer
            </button>
            <button onClick={() => { setModalType("showing"); setIsScheduleOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20">
              Book Tour
            </button>
          </div>
        </div>

      </main>

      {/* --- SCHEDULING MODAL --- */}
      
      <AnimatePresence>
        {isScheduleOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="absolute top-6 right-6 z-10 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-all active:scale-90"
              >
                <XMarkIcon className="w-6 h-6 text-slate-500" />
              </button>

              <div className="p-8 md:p-12">
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircleIcon className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3">Request Sent!</h3>
                    <p className="text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                      We've notified the agent. They'll reach out to confirm your tour.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <header className="mb-8">
                      <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                        {modalType === "showing" ? "Book a Tour" : "Inquire Now"}
                      </h3>
                      <p className="text-slate-500 mt-2 font-medium">
                        {data.name} • <span className="text-indigo-600">Available Daily</span>
                      </p>
                    </header>
                    
                    <form onSubmit={handleSchedule} className="space-y-6">
                      {/* Contact Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Full Name" icon={UserIcon}>
                          <input
                            required
                            value={formData.clientName}
                            onChange={handleChange}
                            name="clientName"
                            placeholder="Full Name"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                          />
                        </FormField>

                        <FormField label="Phone Number" icon={PhoneIcon}>
                          <input
                            required
                            value={formData.clientPhone}
                            onChange={handleChange}
                            name="clientPhone"
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold"
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
                          placeholder="Email Address"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold"
                        />
                      </FormField>

                      {/* Conditional Scheduling Section */}
                      {modalType === "showing" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 bg-slate-50 rounded-[2rem] space-y-4"
                        >
                          <FormField label="Preferred Date" icon={CalendarIcon}>
                            <input 
                              name="preferredDate"
                              value={formData.preferredDate}
                              onChange={handleChange}
                              required
                              type="date" 
                              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-bold"
                            />
                          </FormField>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField label="Time Slot" icon={ClockIcon}>
                              <select 
                                name="preferredTime"
                                value={formData.preferredTime}
                                onChange={handleChange}
                              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-bold appearance-none">
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Evening</option>
                              </select>
                            </FormField>

                            <FormField label="Guests" icon={UsersIcon}>
                              <input 
                                name="guests"
                                value={formData.guests}
                                onChange={handleChange}
                                required
                                type="number" 
                                min="1"
                                defaultValue={1} 
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-indigo-600 rounded-xl outline-none transition-all font-bold" 
                              />
                            </FormField>
                          </div>
                        </motion.div>
                      )}

                      <FormField label={''}  icon={ChatBubbleLeftRightIcon}>
                        <textarea
                          value={formData.message}
                          onChange={handleChange}
                          name="message"
                          placeholder="Any specific questions for the agent?"
                          rows={3}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold resize-none"
                        />
                      </FormField>

                      <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="group relative w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden"
                      >
                        <span className="relative z-10">
                          {isSubmitting ? "Processing..." : modalType === "showing" ? "Confirm Booking" : "Send Message"}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WhatsAppInquiry 
        productName={data.name}
        productPrice={data.finalPrice || data.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />

    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col items-center md:items-start p-2">
      <div className="text-slate-400 mb-2">{icon}</div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-md font-black text-slate-900">{value || "N/A"}</p>
    </div>
  );
}

{/* --- HELPER COMPONENT: UnitCard --- */}
function UnitCard({ unit, type }: { unit: any; type: string }) {
  // Format price to KES
  const formattedPrice = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(unit.price));

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all group"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            {type}
          </span>
          <h4 className="text-xl font-black text-slate-900 mt-2">{unit.type}</h4>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Square2StackIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400 font-medium">Total Area</span>
          <span className="text-slate-900 font-bold">{Number(unit.size).toLocaleString()} sqft</span>
        </div>
        
        <div className="h-px bg-slate-50" />

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">Price</span>
          <span className="text-lg font-black text-indigo-600">{formattedPrice}</span>
        </div>
      </div>
    </motion.div>
  );
}