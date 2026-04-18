'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPinIcon, 
  StarIcon, 
  ClockIcon, 
  ArrowRightIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Travel Consultants
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
// --- Utilities --- //
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

// --- Components --- //

// --- Utilities --- //
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const Badge = ({ text }: { text: string }) => {
  let colors = "bg-gray-900 text-white";
  if (text === "Best Seller") colors = "bg-amber-400 text-amber-950";
  if (text === "Trending") colors = "bg-rose-500 text-white";
  if (text === "Luxury") colors = "bg-purple-600 text-white";
  if (text === "Adventure") colors = "bg-emerald-600 text-white";

  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${colors}`}>
      {text}
    </span>
  );
};

const TravelCard = ({ listing, }: any) => {
  const [isLiked, setIsLiked] = useState(false);
  const { storeFormData } = useStoreContext();

  // WhatsApp "Travel Guide" Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm planning a trip to "${listing.title}". Could you help me with the itinerary and let me know if there are slots available for next month?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 flex flex-col h-full transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)]"
      whileHover={{ y: -10 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative h-80 w-full overflow-hidden">
        <div className="absolute inset-0 transform transition-transform duration-1000 ease-out group-hover:scale-110">
          <Image
            src={listing.images?.[0] || listing.thumbnail || "https://images.unsplash.com/photo-1533414417583-f0eb64df94e9"}
            alt={listing.title || "Adventure"}
            loader={customLoader}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Floating Controls */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          <div className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 border border-white/20">
            <GlobeAltIcon className="w-3.5 h-3.5" />
            {listing.badge || "Exploration"}
          </div>
          
          <button
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-rose-500 text-white transition-all duration-300"
          >
            {isLiked ? <HeartSolid className="h-5 w-5 text-rose-500" /> : <HeartOutline className="h-5 w-5" />}
          </button>
        </div>

        {/* WhatsApp Concierge */}
        <div className="absolute bottom-5 left-5 z-20">
          <a 
            href={whatsappUrl}
            target="_blank"
            className="flex items-center gap-2 bg-[#25D366] text-white px-3 py-2 rounded-xl shadow-2xl hover:scale-105 transition-transform text-[10px] font-bold uppercase tracking-tighter"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Talk to Guide
          </a>
        </div>

        {/* Price Podium */}
        <div className="absolute bottom-5 right-5 z-20">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl border border-white/20">
            <span className="block text-[8px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1 text-right">From</span>
            <p className="text-lg font-black text-zinc-900 dark:text-white leading-none tabular-nums">
              {formatCurrency(listing.finalPrice || listing.price)}
              <span className="text-[10px] text-zinc-400 font-bold ml-1 uppercase tracking-tighter">/pp</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Meta Row */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em]">
            <MapPinIcon className="h-4 w-4 mr-1.5 text-rose-500" />
            {listing.location}
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
            <StarIcon className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-black text-amber-700 dark:text-amber-400">{listing.rating}</span>
          </div>
        </div>

        {/* Title & Description */}
        <Link href={`/travel/listings/${listing.id}`} className="group/title">
          <h3 className="text-2xl font-serif italic font-black text-zinc-900 dark:text-white mb-3 leading-tight group-hover/title:text-indigo-600 transition-colors">
            {listing.title || listing.name}
          </h3>
        </Link>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
          {listing.description || "Embark on a journey through hidden trails and breathtaking vistas curated for the modern explorer."}
        </p>

        {/* Logistics Grid */}
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-zinc-50 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              <ClockIcon className="h-4 w-4 mr-2 text-indigo-500" />
              {listing.duration}
            </div>
            <div className="flex items-center text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
              <UserGroupIcon className="h-4 w-4 mr-2 text-indigo-500" />
              Small Group
            </div>
          </div>

          <Link href={`/travel/listings/${listing.id}`} className="flex items-center gap-2 group/cta">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white group-hover/cta:mr-2 transition-all">
              Details
            </span>
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-indigo-600 text-white flex items-center justify-center transition-transform group-hover/cta:scale-110">
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TravelCard;