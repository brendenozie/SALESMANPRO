'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPinIcon, 
  Square2StackIcon, 
  ViewColumnsIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon,
  InformationCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { resolveProductMedia } from '@/lib/product-media-resolver';

// Custom WhatsApp Icon for Real Estate Agents
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// Placeholder Icons (Cleaned up for brevity)
const BedIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.154.218-2.266.608-3.302A8.96 8.96 0 0 1 12 3.75c3.046 0 5.892 1.144 8.042 3.098A9 9 0 0 1 21.75 12h-2.25a6.75 6.75 0 0 0-13.5 0H2.25ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const BathIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75h1.838zM17.864 12.35L14.004 15.2h6.299c.552 0 1.082-.149 1.55-.432a3.75 3.75 0 0 0-1.077-4.702M1.082 14.542A3.75 3.75 0 0 1 3.51 12.02l4.851-3.784a2.25 2.25 0 0 1 2.924-.764 2.25 2.25 0 0 1 .764 2.924l-3.784 4.851H1.082z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 12h.008v.008h-.008V12z" /></svg>);
const SquareFootIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-3.75h.008v.008H7.5v-.008Zm0 2.25h.008v.008H7.5V16.5Zm0 2.25h.008v.008H7.5V18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 0 0-1.5 0v.562a49.168 49.168 0 0 1-3.478 1.197 50.554 50.554 0 0 0-1.5.124.75.75 0 0 0-.75.75v3.626a.75.75 0 0 0 .61.745c.386.065.779.117 1.17.155L12 12l2.695-1.84c.39-.038.783-.09 1.17-.155a.75.75 0 0 0 .61-.745V4.877a.75.75 0 0 0-.75-.75 2.25 2.25 0 0 0-.124-1.5 50.554 50.554 0 0 0-1.197-3.478V2.25Zm-4.25 10.25a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Zm8.5 0a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Z" /></svg>);
const LocationIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>);

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper to extract a value if the field is an object or a primitive
const safeRender = (val: any) => {
  if (val === null || val === undefined) return "-";
  if (typeof val === "number" || typeof val === "string") return val;
  
  // If it's the object from your error {type, size, price}
  if (typeof val === "object") {
    return val.size || val.value || val.price || "-"; 
  }
  return "-";
};



const PropertyCard = ({ item, key }: any) => {

  const { storeFormData } = useStoreContext();
  const resolvedMedia = React.useMemo(() => resolveProductMedia(item), [item]);

  // WhatsApp Agent Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi, I'm interested in viewing the property: "${item.name}" (ID: ${item.id.slice(0, 6)}). Is it currently available for a site visit?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const beds = typeof item.bedrooms === "number" 
    ? item.bedrooms 
    : (Array.isArray(item.bedrooms) ? item.bedrooms.length : safeRender(item.bedrooms));
  
  const baths = safeRender(item.bathrooms);
  const sqft = safeRender(item.area);
  
  // Ensure price isn't an object either
  const rawPrice = item.finalPrice ?? item.sellingPrice ?? item.buyingPrice;
  const priceLabel = (rawPrice && typeof rawPrice === "object") 
    ? `KES ${rawPrice.price?.toLocaleString() || "0"}`
    : (typeof rawPrice === "number" ? `KES ${rawPrice.toLocaleString()}` : "Price on request");

  return (
    <Link key={key} href={`/realestate/listings/${item.id}`} passHref legacyBehavior>
      <motion.a
        className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]"
        variants={itemVariants}
        whileHover={{ y: -8 }}
      >
        {/* --- IMAGE AREA --- */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={resolvedMedia.primaryImageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
            loader={customLoader}
          />

          {resolvedMedia.hasVideo && (
            <div className="absolute bottom-5 left-5 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md border border-white/10 uppercase tracking-wider pointer-events-none">
              <VideoCameraIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video</span>
            </div>
          )}
          
          {/* Status Badges */}
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5" />
              {item.type || "Market Listing"}
            </div>
            <div className="bg-white/90 backdrop-blur-md text-zinc-900 text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
               <CheckBadgeIcon className="w-3.5 h-3.5 text-blue-500" />
               Verified Listing
            </div>
          </div>

          {/* Quick Contact Agent (WhatsApp Floating) */}
          <div 
            onClick={(e) => {
              e.preventDefault();
              window.open(whatsappUrl, '_blank');
            }}
            className="absolute bottom-5 right-5 z-20 p-3 bg-[#25D366] text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Chat with Agent"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Price Podium */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Asking Price</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter tabular-nums">
                {priceLabel}
              </p>
            </div>
            <InformationCircleIcon className="w-5 h-5 text-zinc-300 hover:text-emerald-500 cursor-help transition-colors" />
          </div>

          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate leading-tight group-hover:text-emerald-600 transition-colors mb-2">
            {item.name}
          </h3>
          
          <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center mb-5 italic">
            <MapPinIcon className="w-4 h-4 mr-1 text-red-500" />
            {item.locationName || "Location details upon request"}
          </p>

          {/* Architectural Specs Grid */}
          <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border-y border-zinc-100 dark:border-zinc-800 py-4 mb-5">
            <div className="flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800">
              <ViewColumnsIcon className="w-4 h-4 mb-1 text-emerald-500" />
              <span>{beds} BR</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800">
              <Square2StackIcon className="w-4 h-4 mb-1 text-emerald-500" />
              <span>{baths} Bath</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mb-1 text-emerald-500" />
              <span>Modern</span>
            </div>
          </div>

          {/* Description Overlay */}
          <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-6">
            {item.description || "Expertly designed architectural marvel offering world-class finishes and premium security in a prime residential hub."}
          </p>

          {/* CTA Footer */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800/50">
            <span className="text-[10px] font-mono text-zinc-400 uppercase">REF: {item.id.slice(-8).toUpperCase()}</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:underline underline-offset-4 decoration-2">
              View Property &rarr;
            </span>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

export default PropertyCard;