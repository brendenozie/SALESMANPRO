"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { 
  MapPinIcon, StarIcon, WifiIcon, SunIcon, TruckIcon, ShieldCheckIcon, 
  CheckCircleIcon, BeakerIcon, Square2StackIcon, ChatBubbleLeftRightIcon, 
  PhoneIcon, CalendarDaysIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
  ShareIcon, HeartIcon, HomeIcon, UserIcon, InformationCircleIcon,
  FireIcon, BoltIcon, KeyIcon, VideoCameraIcon, CalendarIcon, ClockIcon , EnvelopeIcon, UsersIcon, 
  ViewfinderCircleIcon} from "@heroicons/react/24/outline";

import { AnimatePresence, motion } from "framer-motion";

import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { resolveProductMedia } from '@/lib/product-media-resolver';


// AUTH
import { useSession } from "next-auth/react";
// Internal Helper for consistent input styling
const FormField = ({ label, icon: Icon, children }:any) => (
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

const formatAmenity = (label: string) => {
  return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const customLoader = ({ src }: { src: string }) => src;

export default function PropertyDetailsClient({ data }: { data: any }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [modalType, setModalType] = useState<"showing" | "inquiry">("showing");
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [pageUrl, setPageUrl] = useState("");
  
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
  
    // Safely grab URL to avoid hydration mismatch
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
          consumerId: session.user?.id || '',
        }));
      }
    }, [session]); 
  
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
            notes: `Guest Count: ${formData.guests}\nPhone: ${formData.clientPhone}\nMessage: ${formData.message}`,
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
  
  const host = { 
    name: data.contactName || "Property Manager", 
    role: "Property Manager",
    phone: data.contact,
    email: data.email
  };
  
  const amenities = data.amenities || data.features || ["Detailed amenities available on request"];
  const pricingTiers = data.pricingTiers || [];

  // Calculate Starting Price
  const startingPrice = pricingTiers.length > 0 
    ? Math.min(...pricingTiers.map((t: any) => t.price))
    : data.finalPrice;

  // Format Location (Fallback to tags if locationName is purely coordinates)
  const readableLocation = data.tags?.find((tag: string) => tag.toLowerCase() === 'kilimani') 
    || (data.locationName && !data.locationName.includes('-1.') ? data.locationName : 'Kilimani, Nairobi');

  // Available units summary
  const availableUnits = pricingTiers.map((t: any) => t.name).join(', ') || "Various layouts";

  // --- Gallery Handlers ---
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      
      {/* --- LIGHTBOX MODAL --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setIsGalleryOpen(false)}>
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/20 rounded-full transition-colors">
            <XMarkIcon className="w-8 h-8" />
          </button>
          
          <button onClick={prevImage} className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeftIcon className="w-10 h-10" />
          </button>

          <div className="relative w-full h-[80vh] max-w-5xl aspect-video flex items-center justify-center">
             {gallery[currentImageIndex]?.type === "VIDEO" ? (
               <video
                 src={gallery[currentImageIndex].url}
                 poster={gallery[currentImageIndex].posterUrl}
                 controls
                 autoPlay
                 playsInline
                 className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
               />
             ) : (
               <Image 
                 src={gallery[currentImageIndex]?.url || resolvedMedia.primaryImageUrl} 
                 alt={`Gallery Image ${currentImageIndex + 1}`}
                 fill 
                 className="object-contain" 
                 loader={customLoader}
               />
             )}
             <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                {currentImageIndex + 1} / {gallery.length}
             </div>
          </div>

          <button onClick={nextImage} className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full transition-colors">
            <ChevronRightIcon className="w-10 h-10" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8">
          <div className="flex gap-2 mb-3">
             <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {data.listingTransactionType || "RENT"}
             </span>
             {data.isFeatured && (
               <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Featured
               </span>
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{data.name}</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <MapPinIcon className="w-5 h-5 text-emerald-600" />
              {readableLocation}
            </div>
            {data.providerRating && (
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">{data.providerRating}</span>
              </div>
            )}
          </div>
        </div>

        {/* --- BENTO GRID GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12">
          {/* Main Large Image */}
          <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden" onClick={() => openGallery(0)}>
             {gallery[0]?.type === "VIDEO" ? (
               <div className="relative w-full h-full">
                 <Image 
                   src={gallery[0].posterUrl || resolvedMedia.posterUrl} 
                   loader={customLoader}
                   alt="Main property showcase" 
                   fill
                   className="object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-colors group-hover:bg-black/40">
                   <div className="w-16 h-16 rounded-full bg-white/95 dark:bg-zinc-900/95 text-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                     <VideoCameraIcon className="w-8 h-8 ml-0.5" />
                   </div>
                 </div>
                 <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/10 uppercase tracking-wider">
                   <VideoCameraIcon className="w-4 h-4 text-emerald-400" />
                   <span>Watch Virtual Video Tour</span>
                 </div>
               </div>
             ) : (
               <>
                 <Image 
                   src={gallery[0]?.url || resolvedMedia.primaryImageUrl} 
                   loader={customLoader}
                   alt="Main property" 
                   fill
                   className="object-cover transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
               </>
             )}
          </div>

          {/* Side Images */}
          {gallery.slice(1, 5).map((item, idx: number) => (
            <div key={idx} className="relative group cursor-pointer hidden md:block overflow-hidden" onClick={() => openGallery(idx + 1)}>
              <Image 
                src={item.thumbnailUrl || item.posterUrl || item.url} 
                loader={customLoader}
                alt={`Detail ${idx + 1}`} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {item.type === "VIDEO" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                  <VideoCameraIcon className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
              {/* "View All" Overlay on the last visible image */}
              {idx === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <span className="text-white font-semibold text-sm border border-white/30 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    View all {gallery.length} media
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* LEFT COLUMN (Details) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Quick Stats */}
            <div className="flex items-center justify-between md:justify-start md:gap-16 py-8 border-y border-gray-100">
               <StatItem icon={<HomeIcon className="w-6 h-6" />} label="Property Type" value={data.subCategoryName || "Apartments"} />
               <div className="hidden md:block w-px h-12 bg-gray-100"></div>
               <StatItem icon={<ViewfinderCircleIcon className="w-6 h-6" />} label="Available Units" value={pricingTiers.length || "-"} />
               <div className="hidden md:block w-px h-12 bg-gray-100"></div>
               <StatItem icon={<CheckCircleIcon className="w-6 h-6" />} label="Status" value="Available Now" />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {data.name}</h2>
              <div className="prose prose-emerald text-gray-600 leading-relaxed whitespace-pre-line text-lg max-w-none">
                {data.description || "No description provided."}
              </div>
            </div>

            {/* Pricing Tiers / Floor Plans */}
            {pricingTiers.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Floor Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingTiers.map((tier: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-lg transition-all bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg text-sm">
                          KES {tier.price.toLocaleString()} / mo
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{tier.description}</p>
                      <ul className="space-y-2">
                        {tier.features?.map((feature: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-start text-sm text-gray-700">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                            <span className="capitalize">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {amenities.map((item: string, idx: number) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <div key={idx} className="flex items-center gap-3 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Icon className="w-6 h-6 text-emerald-600" />
                      <span className="font-medium">{formatAmenity(item)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent / Contact Card */}
            <div className="bg-emerald-50/50 p-8 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-emerald-100">
              <div className="relative w-20 h-20 shrink-0">
                <Image 
                  src={"https://placehold.co/100x100?text=Agent"} 
                  alt={host.name}
                  loader={customLoader}
                  fill
                  className="object-cover rounded-full border-4 border-white shadow-md"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-gray-900">Managed by {host.name}</h3>
                <p className="text-emerald-700 font-medium mb-1">{host.role}</p>
                <div className="flex justify-center sm:justify-start gap-3 mt-4">
                  <button 
                    onClick={() => {
                      setModalType("inquiry");
                      setIsScheduleOpen(true);
                    }  }                
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Message
                  </button>
                   {host.phone && (
                    <a href={`tel:${host.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-emerald-50 transition-colors">
                      <PhoneIcon className="w-5 h-5" />
                      Call
                    </a>
                   )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
              <div className="flex flex-col mb-6 pb-6 border-b border-gray-100">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">Starting From</span>
                <div className="text-3xl font-extrabold text-gray-900">
                  {startingPrice 
                    ? `KES ${startingPrice.toLocaleString()}` 
                    : "Price on Request"}
                  <span className="text-lg text-gray-500 font-medium"> / mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Units available: <span className="font-semibold text-gray-700">{availableUnits}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-500 cursor-pointer transition-colors group bg-gray-50/50">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule a viewing</div>
                  <div className="flex items-center gap-2 text-gray-900 font-medium group-hover:text-emerald-600">
                     <CalendarDaysIcon className="w-5 h-5" />
                     <span>Select a Date & Time</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setModalType("showing");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-4 md:py-5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-2xl font-black text-base md:text-lg shadow-lg shadow-indigo-100 dark:shadow-none mb-3 md:mb-4">
                  Schedule a Tour
                </button>
                <button  
                  onClick={() => {
                    setModalType("inquiry");
                    setIsScheduleOpen(true);
                  }}
                  className="w-full py-4 md:py-5 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white rounded-2xl font-black text-base md:text-lg">
                  Place an Offer
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                <p>No commitments until you sign the lease.</p>
              </div>
            </div>
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
                  className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
                />
                
                {/* Modal Card */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 30 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-2xl overflow-y-auto max-h-[90vh] border border-transparent dark:border-slate-800"
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
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 md:mb-3">Request Sent!</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto leading-relaxed text-sm md:text-base">
                          We've notified the agent. They'll reach out to confirm your tour.
                        </p>
                      </motion.div>
                    ) : (
                      <>
                        <header className="mb-6 md:mb-8">
                          <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            {modalType === "showing" ? "Book a Tour" : "Inquire Now"}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm md:text-base">
                            {data.name} • <span className="text-indigo-600 dark:text-indigo-400">Available Daily</span>
                          </p>
                        </header>
                        
                        <form onSubmit={handleSchedule} className="space-y-4 md:space-y-6">
                          {/* Contact Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Full Name" icon={UserIcon}>
                              <input
                                required
                                value={formData.clientName}
                                onChange={handleChange}
                                name="clientName"
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-xl md:rounded-2xl outline-none transition-all font-bold text-sm md:text-base"
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
                                className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-xl md:rounded-2xl outline-none transition-all font-bold text-sm md:text-base"
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
                              className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-xl md:rounded-2xl outline-none transition-all font-bold text-sm md:text-base"
                            />
                          </FormField>
      
                          {/* Conditional Scheduling Section */}
                          {modalType === "showing" && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] md:rounded-[2rem] space-y-4 border border-slate-100 dark:border-slate-800"
                            >
                              <FormField label="Preferred Date" icon={CalendarIcon}>
                                <input 
                                  name="preferredDate"
                                  value={formData.preferredDate}
                                  onChange={handleChange}
                                  required
                                  type="date" 
                                  className="w-full pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl outline-none transition-all font-bold text-sm md:text-base [color-scheme:light] dark:[color-scheme:dark]"
                                />
                              </FormField>
      
                              <div className="grid grid-cols-2 gap-4">
                                <FormField label="Time Slot" icon={ClockIcon}>
                                  <select 
                                    name="preferredTime"
                                    value={formData.preferredTime}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl outline-none transition-all font-bold appearance-none text-sm md:text-base">
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
                                    className="w-full pl-12 pr-4 py-3 md:py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 text-slate-900 dark:text-white rounded-xl outline-none transition-all font-bold text-sm md:text-base" 
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
                              className="w-full pl-12 pr-4 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white rounded-xl md:rounded-2xl outline-none transition-all font-bold resize-none text-sm md:text-base"
                            />
                          </FormField>
      
                          <button 
                            disabled={isSubmitting}
                            type="submit"
                            className="group relative w-full py-4 md:py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg shadow-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 overflow-hidden"
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
      
          {/* Only pass URL if it's resolved to avoid hydration issues */}
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

// Small helper component for the stats row
function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col gap-1 items-center md:items-start">
      <span className="flex items-center gap-2 text-gray-500 text-sm font-medium">
        {icon}
        {label}
      </span>
      <span className="text-lg md:text-xl font-bold text-gray-900">{value || "-"}</span>
    </div>
  )
}