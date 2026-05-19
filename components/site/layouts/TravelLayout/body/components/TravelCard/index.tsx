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
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

// Custom WhatsApp Icon for Travel Consultants
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const customLoader = ({ src }: { src: string }) => src;

const TravelCard = ({ listing }: any) => {
  const [isLiked, setIsLiked] = useState(false);
  const { storeFormData } = useStoreContext();

  const whatsappNumber = storeFormData?.contactPhone || "254706448146";
  const message = encodeURIComponent(`Hi! I'm interested in the "${listing.name || listing.title}" experience. Could you provide more details regarding availability?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-US", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(val);

  return (
    <motion.div
      className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-100 flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* --- IMAGE LAYER --- */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={listing.images?.[0] || listing.thumbnail || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800"}
          alt={listing.name || "Destination"}
          loader={customLoader}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Floating Badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
          <div className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border border-white/20 shadow-lg">
            {listing.subCategoryName || "Exclusive Luxury"}
          </div>
          
          <button
            onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
            className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-rose-500 transition-all"
          >
            {isLiked ? <HeartSolid className="h-5 w-5 text-rose-500" /> : <HeartOutline className="h-5 w-5" />}
          </button>
        </div>

        {/* Price Tag */}
        <div className="absolute bottom-5 right-5 z-20">
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-xl">
            <p className="text-white text-sm font-black tracking-tight">
              {formatCurrency(listing.finalPrice || listing.sellingPrice || 0)}
              <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">/pp</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="p-7 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-[10px] font-black text-indigo-600 uppercase tracking-[0.15em]">
            <MapPinIcon className="h-3.5 w-3.5 mr-1.5" />
            {listing.locationName || "Kenya"}
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="h-3.5 w-3.5 text-amber-400 fill-current" />
            <span className="text-[11px] font-black text-slate-700">{listing.rating || "5.0"}</span>
          </div>
        </div>

        <Link href={`/travel/listings/${listing.id}`}>
          <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {listing.name || listing.title}
          </h3>
        </Link>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 font-medium">
          {listing.description || "A curated experience designed for premium comfort and unforgettable exploration."}
        </p>

        {/* Footer Logistics */}
        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
              {listing.duration || "3 Days"}
            </div>
            <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <UserGroupIcon className="h-3.5 w-3.5 mr-1.5" />
              {listing.capacity || "Private"}
            </div>
          </div>

          <a 
            href={whatsappUrl}
            target="_blank"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-900 border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default TravelCard;