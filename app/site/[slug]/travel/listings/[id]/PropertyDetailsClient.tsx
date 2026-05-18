"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  MapIcon, 
  UserGroupIcon, 
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  HeartIcon,
  ShareIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { MarketListingForm } from '@/types/typings';
import { useSession } from 'next-auth/react';

const imageLoader = ({ src }: { src: string }) => src;

interface TravelDestinationViewProps {
  product: MarketListingForm & {
    pricingTiers?: Array<{
      name: string;
      price: number;
      description: string;
      features: string[];
      isFeatured: boolean;
    }>;
    quantity?: { $numberLong: string } | any;
    location?: any;
    tags?: string[];
  };
  company?: any; // Received from parent context or fallback state
}

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

export default function TravelDestinationView({ product, company }: TravelDestinationViewProps) {
  // 1. Safe Structural Fallbacks mapped directly to your database payload
  const agency = company?.company || {
    name: "Travel & Tourism",
    tagline: "The best safari experiences",
    logoUrl: "https://dozi4r4ug9739.cloudfront.net/images/1762621132470-OFAAX40.png",
    themeSettings: { primaryColor: "#0837c4" },
    currency: "KES",
    contactPhone: "0706448146",
    contactEmail: "brendenodhiambo@gmail.com",
    address: "Nairobi, Kenya"
  };

  const primaryColor = agency.themeSettings?.primaryColor || '#0837c4';
  const itemImages = product?.images || [];
  
  // 2. State & Safe Client Mount Variables
  const [activeTab, setActiveTab] = useState('Itinerary');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
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
          companyId: product.companyId,
          propertyId: product.id,
          propertyName: product.name,
  
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          consumerId: formData.consumerId,
          message: formData.message,
  
          assignedToAgentId: product.agentId,
          assignedToAgentName: product.contactName,
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
            companyId: product.companyId,
  
            propertyId: product.id,
            propertyName: product.name,
  
            consumerId: formData.consumerId || "",
            clientId: formData.consumerId || product.userId || "",
  
            clientName: formData.clientName,
  
            agentId: product.agentId,
            agentName: product.contactName,
  
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // 3. Image Slider Controls
  const nextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % (itemImages.length || 1));
  };
  const prevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + (itemImages.length || 1)) % (itemImages.length || 1));
  };

  // Extract dynamic parameters from payload definitions
  const slotsAvailable = product?.quantity?.$numberLong 
    ? parseInt(product.quantity.$numberLong, 10) 
    : Number(product?.quantity || 0);

  const displayPrice = product?.finalPrice || product?.sellingPrice || 45500;
  const tourItinerary = product?.pricingTiers && product.pricingTiers.length > 0 
    ? product.pricingTiers 
    : [
        { name: 'Arrival & Sunset Safari', description: 'Touch down and head straight into the wild for a golden hour drive.' },
        { name: 'The Great Migration', description: 'Witness the breathtaking movement of wildlife across the plains.' },
        { name: 'Cultural Immersion', description: 'A private visit to a local community to learn ancient traditions.' }
      ];

  const tripSpecs = [
    { label: 'Available Slots', value: `${slotsAvailable} spaces left`, icon: <UserGroupIcon className="w-5 h-5" /> },
    { label: 'Location Base', value: `${product?.location?.city || 'Nairobi'}, ${product?.locationName || 'Kenya'}`, icon: <MapPinIcon className="w-5 h-5" /> },
    { label: 'Category', value: product?.subCategoryName || 'Tour Packages', icon: <MapIcon className="w-5 h-5" /> },
    { label: 'Status', value: product?.status || 'Active', icon: <ShieldCheckIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-100 antialiased">
      
      {/* --- PREMIUM CINEMATIC GALLERY HERO --- */}
      <section className="relative h-[65vh] lg:h-[75vh] w-full bg-black overflow-hidden group">
        {itemImages.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeImageIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={itemImages[activeImageIdx]?.url || itemImages[activeImageIdx] || 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1600'}
                alt={`${product?.name} Gallery View`}
                fill
                className="object-cover brightness-75"
                loader={imageLoader}
                unoptimized
                priority
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-white">No Images Loaded</div>
        )}
        
        {/* Soft UI Layer Protection Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />

        {/* Gallery Control Arrows */}
        {itemImages.length > 1 && (
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={prevImage} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all pointer-events-auto">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={nextImage} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-all pointer-events-auto">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Dynamic Image Thumbnails Navigation Overlay (Desktop) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 bg-black/20 backdrop-blur-md p-2 rounded-2xl max-w-[90%] overflow-x-auto border border-white/10 scrollbar-none">
          {itemImages.map((img: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 ${
                activeImageIdx === idx ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={img?.url || img} alt="thumb" fill className="object-cover" loader={imageLoader} unoptimized />
            </button>
          ))}
        </div>

        {/* Hero Meta Description Block */}
        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 lg:px-16 pb-12 pt-24 max-w-7xl mx-auto flex flex-col justify-end text-white z-10 pointer-events-none">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product?.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-xs font-bold tracking-widest uppercase rounded-full border border-white/10">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-white leading-tight drop-shadow-md max-w-4xl">
            {product?.name || "The Great Wildebeest Migration"}
          </h1>
        </div>
      </section>

      {/* --- SPECIFICATIONS PULSE BAR --- */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white rounded-2xl shadow-xl border border-slate-200/60">
          {tripSpecs.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">{s.label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- EXPLORATION & RESERVATION MATRIX --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Side: Product Details & Core Itinerary Content */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Copy Description Block */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <h2 className="text-[11px] font-extrabold uppercase tracking-[0.3em] mb-4 text-slate-400 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" style={{ color: primaryColor }} /> Core Experience Essentials
            </h2>
            <p className="text-xl sm:text-2xl font-serif font-bold text-slate-800 leading-snug mb-6">
              "An unparalleled, immersive journey capturing structural wonders across geographic landscapes."
            </p>
            <p className="text-slate-600 font-normal leading-relaxed text-base">
              {product?.description || "Experience nature's most spectacular theatre under the endless skies."}
            </p>
          </section>

          {/* Interactive Structured Section Selector */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex gap-8 border-b border-slate-100 mb-8">
              {['Itinerary', 'Host Agency'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                    activeTab === tab ? 'text-slate-900 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tabBarIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="min-h-[200px]"
              >
                {/* Tab Component: Realized Route / Pricing Tiers mapping */}
                {activeTab === 'Itinerary' && (
                  <div className="space-y-8 relative before:absolute before:inset-y-1 before:left-5 before:w-0.5 before:bg-slate-100">
                    {tourItinerary.map((item: any, i: number) => (
                      <div key={i} className="flex gap-6 relative group">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 z-10 group-hover:border-slate-400 transition-colors bg-white font-serif font-bold text-sm text-slate-600">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="pt-1">
                          <h4 className="text-base font-bold text-slate-900 mb-1.5">{item.name}</h4>
                          <p className="text-slate-500 text-sm font-light leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab Component: Host Profile Settings Mapping */}
                {activeTab === 'Host Agency' && (
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-slate-50 p-6 rounded-xl border border-slate-200/50">
                    <div className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden border border-slate-200 p-2 flex-shrink-0">
                      <Image src={agency.logoUrl} alt={agency.name} fill className="object-contain p-2" loader={imageLoader} unoptimized />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-slate-900">{agency.name}</h4>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md border border-blue-100">
                          {agency.variant || 'Verified Partner'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 italic">"{agency.tagline}"</p>
                      <p className="text-xs text-slate-500 max-w-xl">{agency.description || 'No direct company overview listed.'}</p>
                      
                      <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5 text-slate-400" /> {agency.contactPhone}</span>
                        <span className="flex items-center gap-1.5"><EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" /> {agency.contactEmail}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        {/* Right Side: Execution & Reservation Action Engine */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-8 space-y-6">
            
            {/* Real Price Display Card */}
            <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Total Pricing Value</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                    {agency.currency} {displayPrice.toLocaleString()}
                  </h3>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                  {/* {product?.paymentOption || 'ALL INCLUSIVE'} */}
                </div>
              </div>

              {/* Form Interactivity Point */}
              <div className="space-y-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5"><CalendarDaysIcon className="w-4 h-4 text-slate-400" /> Booking Mode</span>
                  <span className="font-bold text-slate-800">Instant Access Confirmation</span>
                </div>
              </div>

              {/* WhatsApp Transaction Module Integration */}
              <div className="space-y-3">
                

                {/* Secondary Engagement Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`py-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      isWishlisted 
                        ? 'bg-rose-50 border-rose-200 text-rose-600' 
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <HeartIcon className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} /> 
                    {isWishlisted ? 'Saved' : 'Wishlist'}
                  </button>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: currentUrl });
                      } else {
                        navigator.clipboard.writeText(currentUrl);
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="py-3 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" /> Share Tour
                  </button>
                </div>

                {/* <div className="space-y-4 mb-8">
                                <div className="p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Availability</span>
                                    <CalendarDaysIcon className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <p className="text-slate-900 font-bold">{data.status === "ACTIVE" ? "Immediate Viewing" : "Closed"}</p>
                                </div>
                              </div> */}
                
                              <button
                                onClick={() => {
                                  setModalType("showing");
                                  setIsScheduleOpen(true);
                                }}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-100 mb-4">
                                Schedule a Tour
                              </button>
                              <button  onClick={() => {
                                          setModalType("inquiry");
                                          setIsScheduleOpen(true);
                                        }}
                                        className="w-full py-5 border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-lg">
                                Place an Offer
                              </button>
              </div>

              {/* Eco/Community Guarantee Footer Notice */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-start gap-3 text-slate-400">
                <GlobeAltIcon className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed font-medium">
                  Processed securely by <span className="font-bold text-slate-600">{agency.name}</span>. Secure allocations guaranteed directly by onsite provider registration.
                </p>
              </div>
            </div>

            {/* Travel Insight Sidebar Feature Card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden shadow-md">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex p-2 bg-white/10 rounded-xl backdrop-blur-md text-amber-400">
                  <StarSolid className="w-5 h-5 fill-current" />
                </div>
                <h5 className="text-base font-bold tracking-tight">Location Footprint Summary</h5>
                <p className="text-xs text-slate-300 leading-relaxed font-light italic">
                  "This trip takes place in {product?.locationName || 'the destination area'}, managed locally under optimization guidelines. Ensure compliance with reservation parameters before checkout."
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10 bg-white blur-2xl pointer-events-none" />
            </div>

          </div>
        </aside>


            
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
                              {product.name} • <span className="text-indigo-600">Available Daily</span>
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
          productName={product?.name || "The Great Wildebeest Migration"}
          productPrice={displayPrice}
          productUrl={currentUrl || '#'}
          phoneNumber={agency.contactPhone || "254706448146"}
        />
      </main>
    </div>
  );
}