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

export default function PropertyDetailsClient({ data }: { data: any }) {
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
        consumer: formData.consumerId,
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

          clientId: data.consumerId || data.userId || "guest-user",

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

  // Data Normalization
  const images = data.images?.length > 0 ? data.images : ["https://placehold.co/1200x800?text=No+Image"];
  
  // Mapping host from root contact fields
  const host = {
    name: data.contactName || "Authorized Agent",
    role: "Property Consultant",
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
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      
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
              <Image 
                src={images[currentImageIndex]} 
                alt="Gallery" 
                fill 
                className="object-contain" 
                loader={customLoader}
                priority
              />
            </motion.div>

            <button onClick={nextImage} className="absolute right-4 md:right-8 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md z-[110]">
              <ChevronRightIcon className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-12">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4 capitalize">
              {data.name}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer">
                <MapPinIcon className="w-5 h-5" />
                <span>{data.location?.name || data.locationName}, {data.location?.state}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-slate-900 font-bold">{data.providerRating || "5.0"}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm">
              <ShareIcon className="w-5 h-5" /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-sm">
              <HeartIcon className="w-5 h-5" /> Save
            </button>
          </div>
        </div>

        {/* --- BENTO GALLERY --- */}
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[600px] rounded-[2rem] overflow-hidden mb-16 shadow-2xl shadow-indigo-100/50">
          <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden" onClick={() => setIsGalleryOpen(true)}>
             <Image src={images[0]} loader={customLoader} alt="Primary" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
          {images.slice(1, 5).map((img: string, idx: number) => (
            <div key={idx} className="relative group cursor-pointer hidden md:block overflow-hidden" onClick={() => { setCurrentImageIndex(idx + 1); setIsGalleryOpen(true); }}>
              <Image src={img} loader={customLoader} alt={`View ${idx}`} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
              {idx === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                  <Square2StackIcon className="w-8 h-8 text-white mb-2" />
                  <span className="text-white font-bold text-sm uppercase">{images.length}+ Photos</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
            
            {/* Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
               <StatItem icon={<HomeIcon className="w-6 h-6" />} label="Category" value={data.category} />
               <StatItem icon={<CheckCircleIcon className="w-6 h-6" />} label="Configuration" value={bedroomCount} />
               <StatItem icon={<BeakerIcon className="w-6 h-6" />} label="Bathrooms" value={data.bathrooms} />
               <StatItem icon={<Square2StackIcon className="w-6 h-6" />} label="Total Area" value={displayArea} />
            </div>

            {/* Description */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <InformationCircleIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Property Overview</h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed">{data.description}</p>
            </section>

            {(data.bedrooms?.length > 0 || data.studios?.length > 0) && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <HomeIcon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Available Configurations</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Map Bedrooms */}
                  {data.bedrooms?.map((unit: any, idx: number) => (
                    <UnitCard key={`bed-${idx}`} unit={unit} type="Bedroom" />
                  ))}

                  {/* Map Studios */}
                  {data.studios?.map((unit: any, idx: number) => (
                    <UnitCard key={`studio-${idx}`} unit={unit} type="Studio" />
                  ))}
                </div>
              </section>
            )}

            {/* Amenities Section */}
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenitiesList.map((item: string, idx: number) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <motion.div whileHover={{ x: 5 }} key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 group">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50">
                        <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
                      </div>
                      <span className="font-bold text-slate-700 capitalize">{item.replace(/_/g, ' ')}</span>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Host Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-black border-4 border-white/10">
                  {host.name.charAt(0)}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black mb-1">{host.name}</h3>
                  <p className="text-indigo-300 text-xs uppercase tracking-widest mb-6">{host.role}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-bold">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" /> Message
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl font-bold border border-white/10">
                      <PhoneIcon className="w-5 h-5" /> {host.phone}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <div className="mb-8">
                <p className="text-slate-400 text-xs font-black uppercase tracking-tighter mb-1">Pricing From</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">
                    {new Intl.NumberFormat('en-KE', { 
                      style: 'currency', 
                      currency: 'KES',
                      maximumFractionDigits: 0 
                    }).format(data.finalPrice || data.sellingPrice || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Availability</span>
                    <CalendarDaysIcon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-slate-900 font-bold">{data.status === "ACTIVE" ? "Immediate Viewing" : "Closed"}</p>
                </div>
              </div>

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