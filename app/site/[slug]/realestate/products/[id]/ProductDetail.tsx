"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Square3Stack3DIcon, 
  MapPinIcon, 
  HomeIcon, 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ShareIcon,
  HeartIcon,
  ArrowsPointingOutIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

// Mapping internal amenity keys to readable labels
const AMENITY_MAP: Record<string, string> = {
  air_conditioning: "Air Conditioning",
  heating: "Heating",
  backup_generator: "Backup Power",
  elevator: "Elevator",
  ceiling_fans: "Ceiling Fans",
  smart_locks: "Smart Locks",
  security: "24/7 Security",
  cctv: "CCTV",
  gym: "Fitness Center",
  pool: "Swimming Pool",
  golf_course: "Golf Course Access",
  bike_storage: "Bike Storage",
  valet_parking: "Valet Parking",
  bbq_area: "BBQ Area",
  dog_park: "Dog Park",
  wine_cellar: "Wine Cellar",
  Butlar: "Butler Service"
};

export default function RealEstatePropertyView({ property, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0f172a';
  const [activeImage, setActiveImage] = useState(0);
  const [isTourModalOpen, setTourModalOpen] = useState(false);
  const [isOfferModalOpen, setOfferModalOpen] = useState(false);

  // Extract counts from the arrays in the DB object
  const bedCount = property?.bedrooms?.length || 0;
  const studioCount = property?.studios?.length || 0;
  const price = property?.finalPrice || 0;

  const features = [
    { label: 'Bedrooms', value: bedCount, icon: <HomeIcon className="w-5 h-5" /> },
    { label: 'Studios', value: studioCount, icon: <Square3Stack3DIcon className="w-5 h-5" /> },
    { label: 'Condition', value: property?.logbookStatus || 'New', icon: <CheckBadgeIcon className="w-5 h-5" /> },
    { label: 'Quantity', value: property?.quantity?.$numberLong || 1, icon: <ArrowsPointingOutIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#050505] selection:bg-slate-200">
      
      {/* --- CINEMATIC GALLERY GRID --- */}
      <section className="relative px-4 lg:px-10 py-6">
        <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-4 h-[60vh] lg:h-[75vh]">
          {/* Main Feature Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-12 lg:col-span-9 relative rounded-[2.5rem] overflow-hidden group shadow-2xl"
          >
            <Image
              src={property?.images?.[activeImage] || 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200'}
              alt={property?.name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              loader={loader}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-10 left-10 flex gap-3">
               <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl">
                 {property?.category}
               </span>
               <span className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                 {property?.tags?.[1] || 'Trending'}
               </span>
            </div>
          </motion.div>

          {/* Thumbnail Strip */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {property?.images?.map((img: string, i: number) => (
              <motion.div 
                key={i}
                whileHover={{ x: -10 }}
                onClick={() => setActiveImage(i)}
                className={`relative h-48 rounded-[2rem] overflow-hidden cursor-pointer border-4 transition-all ${activeImage === i ? 'border-indigo-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <Image src={img} alt="Property" fill className="object-cover" loader={loader} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MAIN PROPERTY INFO --- */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-10 py-12 grid lg:grid-cols-12 gap-16">
        
        {/* LEFT SIDE: THE DETAILS */}
        <div className="lg:col-span-8">
          <header className="mb-12">
            <div className="flex items-center gap-2 text-slate-400 mb-6">
              <MapPinIcon className="w-5 h-5 text-rose-500" />
              <span className="text-sm font-bold uppercase tracking-widest">
                {property?.location?.city}, {property?.location?.state}
              </span>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <h1 className="text-5xl lg:text-7xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
                  {property?.name}
                </h1>
                <p className="text-lg text-slate-400 mt-2 font-medium">Built with {property?.material?.[0]}</p>
              </div>
              <div className="lg:text-right bg-slate-50 dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Investment Price</p>
                <h2 className="text-4xl lg:text-5xl font-black" style={{ color: primaryColor }}>
                  KSh {price.toLocaleString()}
                </h2>
              </div>
            </div>
          </header>

          {/* Key Specs Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {features.map((f, i) => (
              <div key={i} className="p-8 rounded-[2.2rem] bg-white dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 text-center hover:shadow-2xl transition-all duration-500">
                <div className="flex justify-center text-slate-300 mb-4">{f.icon}</div>
                <p className="text-2xl font-bold dark:text-white mb-1">{f.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{f.label}</p>
              </div>
            ))}
          </section>

          {/* Description */}
          <section className="mb-16">
            <h3 className="text-2xl font-bold tracking-tight mb-6 dark:text-white">The Lifestyle</h3>
            <p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed font-light">
              {property?.description} {property?.longDescription}
            </p>
          </section>

          {/* Amenities Grid */}
          <section>
            <h3 className="text-2xl font-bold tracking-tight mb-8 dark:text-white">Included Amenities</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {property?.amenities?.map((key: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-semibold dark:text-zinc-300">{AMENITY_MAP[key] || key}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDE: INTERACTIVE WIDGETS */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-10">
            {/* Agent Card */}
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-[3rem] border border-slate-100 dark:border-zinc-800 shadow-2xl mb-6">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 relative rounded-2xl overflow-hidden shadow-lg">
                  <Image src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200" alt="Agent" fill className="object-cover" loader={loader}/>
                </div>
                <div>
                  <h4 className="text-lg font-bold dark:text-white">{property?.contactName}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Property Consultant</p>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setTourModalOpen(true)}
                  className="w-full py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <CalendarIcon className="w-4 h-4" /> Schedule a Tour
                </button>
                <button 
                  onClick={() => setOfferModalOpen(true)}
                  className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <CurrencyDollarIcon className="w-4 h-4" /> Make an Offer
                </button>
              </div>

              <div className="flex gap-4 mt-6">
                <a href={`tel:${property?.contact}`} className="flex-1 py-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800">
                  <PhoneIcon className="w-4 h-4" /> Call
                </a>
                <a href={`mailto:${property?.email}`} className="flex-1 py-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" /> Email
                </a>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-2xl">
               <h5 className="text-lg font-bold mb-4">Location Perks</h5>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 opacity-80">
                    <StarSolid className="w-4 h-4 text-amber-400" />
                    <span className="text-xs">Highly Rated Area (4.9/5)</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-80">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs">Secure Perimeter & Patrol</span>
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </main>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isTourModalOpen && (
          <TourModal onClose={() => setTourModalOpen(false)} propertyName={property?.name} />
        )}
        {isOfferModalOpen && (
          <OfferModal 
            onClose={() => setOfferModalOpen(false)} 
            propertyName={property?.name} 
            askingPrice={price}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- SUB-COMPONENTS --- */

function TourModal({ onClose, propertyName }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-black dark:hover:text-white">
          <ArrowsPointingOutIcon className="w-6 h-6 rotate-45" />
        </button>
        <h2 className="text-3xl font-bold mb-2 dark:text-white">Schedule Tour</h2>
        <p className="text-slate-500 mb-8">Choose your preferred time to visit {propertyName}.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select Date</label>
            <input type="date" className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Preferred Time</label>
            <div className="grid grid-cols-3 gap-2">
              {['Morning', 'Afternoon', 'Evening'].map(t => (
                <button key={t} className="py-3 rounded-xl bg-slate-50 dark:bg-zinc-800 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-5 mt-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase text-[10px] tracking-widest">
            Confirm Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function OfferModal({ onClose, propertyName, askingPrice }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[3rem] p-10 relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-black dark:hover:text-white">
          <ArrowsPointingOutIcon className="w-6 h-6 rotate-45" />
        </button>
        <h2 className="text-3xl font-bold mb-2 dark:text-white">Make an Offer</h2>
        <p className="text-slate-500 mb-8">Property: {propertyName}</p>
        
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Asking Price</p>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-300">KSh {askingPrice.toLocaleString()}</p>
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Your Offer (KSh)</label>
            <input 
              type="number" 
              placeholder="Enter amount..."
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-xl font-bold focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Notes to Owner</label>
            <textarea 
              rows={3}
              placeholder="Any conditions or messages..."
              className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold uppercase text-[10px] tracking-widest shadow-xl">
            Submit Binding Offer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}