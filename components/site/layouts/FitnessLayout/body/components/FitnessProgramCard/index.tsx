'use client';

import React, { useState } from 'react';
import { CalendarDaysIcon, MapPinIcon, ArrowRightIcon, EyeIcon } from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import QuickViewModal from '@/components/site/QuickViewModal';

interface ProductCardProps {
  product: MarketListingForm & { currency?: string; paymentOption?: string };
  slug?: string;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const FitnessProgramCard: React.FC<ProductCardProps> = ({ product, slug = 'fitness' }) => {
  const { storeFormData } = useStoreContext();
  const [showQuickView, setShowQuickView] = useState(false);

  const primary = storeFormData?.themeSettings?.primaryColor || '#6366F1';
  const currencySymbol = product.currency || 'KES';
  const { id, name, images, finalPrice, locationName, bookingSlots, tags, paymentOption } = product;

  // Image Safe Resolution
  const imageSrc = (images as any)?.[0]?.url || 
    (typeof images?.[0] === 'string' ? images[0] : 'https://dozi4r4ug9739.cloudfront.net/images/1779884960821-pexels-ketut-subiyanto-4720807.jpg');

  // Unified routing path for scheduling/booking
  const detailPageUrl = `/${slug}/programs/${id}`;

  // WhatsApp Config Matrix
  const whatsappNumber = `${storeFormData?.contactPhone || '2547003456778'}`.replace(/\s+/g, '');
  const message = encodeURIComponent(`Hi! I'm looking into booking the "${name}" session (${currencySymbol} ${finalPrice?.toLocaleString()}). Are there slots open soon?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const activeTags = Array.isArray(tags) 
    ? tags.slice(0, 2).map(t => t.replace(/"/g, '')) 
    : [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="group relative flex flex-col h-full bg-slate-50/60 dark:bg-slate-900/40 rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        {/* Media Container Aspect-Ratio Grid */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Link href={detailPageUrl} className="block w-full h-full absolute inset-0 z-10">
            <span className="sr-only">View program details for {name}</span>
          </Link>
          
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            loader={({ src }) => src}
            priority={false}
          />

          {/* Premium Gradient Scrim for Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />

          {/* Slots & Status Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
            {bookingSlots && bookingSlots.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Slots Active
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-medium tracking-wide text-slate-100">
              {paymentOption || 'IN-STUDIO'}
            </span>
          </div>

          {/* Quick-Action Utilities Panel */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 shadow-sm transition-all hover:scale-105"
              title="Quick Preview"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500 text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-600"
              title="Inquire via WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Core Metadata Frame */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div className="space-y-3">
            {/* Category tags with minimal look */}
            <div className="flex flex-wrap gap-2 items-center min-h-[18px]">
              {activeTags.map((tag, i) => (
                <span key={i} className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Program Title linked directly to page detail */}
            <Link href={detailPageUrl} className="block group/title">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug tracking-tight group-hover/title:text-indigo-500 dark:group-hover/title:text-indigo-400 transition-colors">
                {name}
              </h3>
            </Link>

            {/* Studio / Location Marker */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPinIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="truncate font-medium">{locationName || 'Nairobi HQ Studio'}</span>
            </div>
          </div>

          {/* Unified Dynamic Booking Interaction Drawer */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Investment</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{currencySymbol}</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {finalPrice?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Navigates straight to your dynamic program scheduling page */}
            <Link 
              href={detailPageUrl}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-sm group/btn hover:shadow-md"
              style={{ backgroundColor: primary }}
            >
              <span>View & Book</span>
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>

      {showQuickView && (
        <QuickViewModal
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          product={product}
          primaryColor={primary}
        />
      )}

      
    </>
  );
};

export default FitnessProgramCard;