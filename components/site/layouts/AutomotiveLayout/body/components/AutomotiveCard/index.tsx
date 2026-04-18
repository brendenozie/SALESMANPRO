'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';
import { 
  MapPinIcon, 
  FireIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  ScaleIcon,
  Cog6ToothIcon,
  BeakerIcon,
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

// High-Performance WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SpecItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
    <span className="text-[8px] uppercase font-black text-zinc-400 tracking-tighter">{label}</span>
    <span className="text-[10px] font-bold text-zinc-900 dark:text-white truncate w-full text-center">{value}</span>
  </div>
);

const AutomotiveCard = ({ item, badge, location, mileage, transmission, fuelType }: any) => {

  const { storeFormData } = useStoreContext();
  
  // WhatsApp "Dealer Inquiry" Config
  const whatsappNumber =  `${storeFormData?.contactPhone || "254700000000"}`;

  const message = encodeURIComponent(`AUTOMOTIVE_INQUIRY: I'm interested in the "${item.name}". Please let me know the availability for a test drive and if financing is available.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <Link href={`/automotive/listings/${item.id}`} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -10 }}
        className="group relative block h-full bg-white dark:bg-[#0E0E0E] rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]"
      >
        {/* --- IMAGE SECTION --- */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={item.images?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            loader={loader}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Luxury Tags */}
          <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
            {badge && (
              <span className={clsx(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] text-white flex items-center gap-1.5 shadow-2xl backdrop-blur-md border border-white/20",
                badge === "New" ? "bg-emerald-600/90" : 
                badge === "Hot" ? "bg-orange-600/90" : "bg-blue-600/90"
              )}>
                {badge === "Hot" ? <FireIcon className="w-3.5 h-3.5"/> : <SparklesIcon className="w-3.5 h-3.5"/>}
                {badge}
              </span>
            )}
            <div className="bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-zinc-100 dark:border-zinc-800">
               <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-500" />
               <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Certified Pre-Owned</span>
            </div>
          </div>

          {/* Immediate Dealer Link (WhatsApp) */}
          <div 
            onClick={(e) => { e.preventDefault(); window.open(whatsappUrl, '_blank'); }}
            className="absolute top-5 right-5 z-20 p-3 bg-[#25D366] text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform cursor-pointer"
            title="Chat with Dealer"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </div>

          {/* Price Podium */}
          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10">
            <div className="bg-zinc-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
              <span className="block text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Price</span>
              <p className="text-lg font-black text-white tabular-nums leading-none">
                Kes {item.finalPrice?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 transition-colors uppercase italic">
              {item.name}
            </h3>
            <div className="flex items-center text-[10px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">
              <MapPinIcon className="w-4 h-4 mr-1.5 text-red-500" />
              {location || "Showroom: Nairobi, KE"}
            </div>
          </div>

          {/* Performance Specs Grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
             <SpecItem icon={ScaleIcon} label="Mileage" value={`${mileage?.toLocaleString() || '0'} KM`} />
             <SpecItem icon={Cog6ToothIcon} label="Trans" value={transmission || 'Automatic'} />
             <SpecItem icon={BeakerIcon} label="Fuel" value={fuelType || 'Petrol'} />
          </div>

          {/* Footer Action */}
          <div className="mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-zinc-400 uppercase">Available for</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-300">Bank Financing</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Full Specs</span>
               <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-xl transition-all duration-300 group-hover:rotate-[360deg] group-hover:scale-110">
                 <ArrowRightIcon className="w-5 h-5" />
               </div>
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
};

export default AutomotiveCard;