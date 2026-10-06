'use client';

import React from 'react';
import { CalendarDaysIcon, MapPinIcon, TicketIcon, ShareIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface EventCardProps {
  event: any; // Swap with your structured MarketListingForm or Event types definition
  index?: number;
}

const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/600x400';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// Custom WhatsApp Icon for booking/inquiries
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const EventCard: React.FC<EventCardProps> = ({ event, index = 0 }) => {
  const { storeFormData } = useStoreContext();
  
  // Custom theme fallback
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10b981';

  // Format date parts safely for the visual badge (e.g., "OCT", "24")
  const eventDate = event.date ? new Date(event.date) : new Date();
  const monthStr = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = eventDate.getDate();

  // WhatsApp Config for Group Booking/Inquiries
  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in getting tickets / more details for the upcoming event: "${event.name}". Could you provide availability details?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const isSoldOut = event.ticketsAvailable === 0 || event.isSoldOut;
  const isFree = !event.finalPrice || event.finalPrice === 0;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-zinc-200/60 dark:hover:border-zinc-700/50 p-4 transition-all duration-300">
      {/* Event Hero Media Container */}
      <div className="relative aspect-[16/10] w-full rounded-[1.8rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-5">
        <Link href={`/events/products/${event.id}`} className="block w-full h-full">
          <Image decoding="async"
            src={event.images?.[0] || event.imageUrl || FALLBACK_IMAGE_URL}
            alt={event.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay Hover Effect */}
          <div className="absolute inset-0 bg-zinc-950/0 group-hover:bg-zinc-950/30 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all bg-white text-zinc-900 px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl">
              View Event Details
            </div>
          </div>
        </Link>

        {/* Floating Date Badge Component */}
        <div className="absolute top-4 left-4 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 shadow-xl rounded-2xl px-3.5 py-2 min-w-[52px] text-center">
          <span className="text-[10px] font-black tracking-wider text-zinc-400 dark:text-zinc-500 uppercase leading-none">
            {monthStr}
          </span>
          <span className="text-xl font-mono font-black text-zinc-900 dark:text-white mt-1 leading-none">
            {dayStr}
          </span>
        </div>

        {/* Floating Category/Status Pill */}
        {event.category && (
          <div className="absolute top-4 right-4 bg-zinc-900/95 text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-xl border border-white/10">
            {event.category}
          </div>
        )}
      </div>

      {/* Event Meta Content */}
      <div className="flex flex-col flex-grow px-2">
        
        {/* Title and Rating Info */}
        <div className="space-y-1.5 mb-4">
          <Link href={`/events/products/${event.id}`}>
            <h3 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              {event.name}
            </h3>
          </Link>
        </div>

        {/* Structural Info Stack (Time, Locations, and Access Tiers) */}
        <div className="space-y-2.5 text-zinc-500 dark:text-zinc-400 font-medium text-xs mb-5">
          <div className="flex items-center gap-2.5">
            <CalendarDaysIcon className="w-4 h-4 shrink-0 text-zinc-400" />
            <span className="truncate">{event.timeString || 'Starts at 7:00 PM'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPinIcon className="w-4 h-4 shrink-0 text-zinc-400" />
            <span className="truncate font-semibold text-zinc-700 dark:text-zinc-300">
              {event.location || 'Virtual / Online'}
            </span>
          </div>
        </div>

        <hr className="border-zinc-100 dark:border-zinc-800/80 mb-4" />

        {/* Pricing Layout and Action Row */}
        <div className="mt-auto pt-1 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tickets From</span>
            <span className="text-lg font-mono font-bold text-zinc-950 dark:text-white tracking-tighter">
              {isFree ? 'FREE' : `KSh ${event.finalPrice?.toLocaleString()}`}
            </span>
          </div>

          <Link href={`/events/products/${event.id}`} className="flex-1">
            <motion.button
              whileHover={{ scale: isSoldOut ? 1 : 1.02 }}
              whileTap={{ scale: isSoldOut ? 1 : 0.98 }}
              disabled={isSoldOut}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm
                ${isSoldOut 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                  : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white'
                }`}
            >
              <TicketIcon className="w-4 h-4" />
              {isSoldOut ? 'Sold Out' : 'Secure Access'}
            </motion.button>
          </Link>

          {/* WhatsApp Direct Inquiry Icon Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-[#25D366] rounded-2xl border border-zinc-100 dark:border-zinc-700/40 transition-colors"
            title="Inquire on WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};

export default EventCard;