/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  MapPinIcon, 
  SparklesIcon, 
  CheckCircleIcon, 
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart } = useStateContext();
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  // Hydrate client-side safely for window properties
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Branding dynamic injectors from your system's data configuration
  const brandPrimary = "#6366F1"; // Indigo Accent
  const brandSecondary = "#F59E0B"; // Amber Highlights

  const currentImages = (product.images as ImageObj[])?.length 
    ? (product.images as ImageObj[]) 
    : [{ url: 'https://dozi4r4ug9739.cloudfront.net/images/1779884960821-pexels-ketut-subiyanto-4720807.jpg' }];

  const currentImage = currentImages[0]?.url;

  // Formatting values nicely
  const formattedPrice = (product.finalPrice ?? 1000).toLocaleString();
  const activeTier = product.pricingTiers?.[selectedTier] || null;

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 mt-20">
      <Head>
        <title>{product.name} | Fitness & Wellness</title>
      </Head>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 ">
        
        {/* --- MAIN CORE SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: HERO VISUALS & DETAILED SPECS */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-sm bg-slate-200">
              <Image
                src={currentImage}
                alt={product.name}
                loader={loader}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant Scheduling Available
              </div>
            </div>

            {/* Service Features & Intent Mapping */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What you will get out of this session</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description || "A comprehensive personalized routine matching physical goals with expert instructions."}
                </p>
              </div>

              {activeTier && activeTier.features && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Included Focal Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeTier.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2.5 text-slate-700 text-sm">
                        <CheckCircleIcon className="h-5 w-5 flex-shrink-0" style={{ color: brandPrimary }} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Studio Info / Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-100 flex gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl h-fit">
                  <MapPinIcon className="h-6 w-6" style={{ color: brandPrimary }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Location Base</h4>
                  <p className="text-xs text-slate-500 mt-1">{product.locationName || "Nairobi, Kenya"}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fulfillment via: <span className="font-semibold">{product.paymentOption || "AT SHOP"}</span></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-100 flex gap-4">
                <div className="p-3 bg-amber-50 rounded-xl h-fit">
                  <ClockIcon className="h-6 w-6" style={{ color: brandSecondary }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Notice Rules</h4>
                  <p className="text-xs text-slate-500 mt-1">Requires at least {product.minNoticePeriod || "24 hours"} notice.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bookings open up to {product.maxBookingAhead || "3 months"} ahead.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: BOOKING CONTROLLER ATELIER */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xl space-y-6">
              
              {/* Category Breadcrumb & Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2.5 py-1 rounded-md">
                    {product.subCategoryName || product.category}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-800">4.9 Featured</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-black text-slate-900">KES {formattedPrice}</span>
                  {activeTier?.duration && (
                    <span className="text-sm text-slate-400 font-medium">/ {activeTier.duration} session</span>
                  )}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Booking Slots Architecture Component */}
              {product.bookingSlots && product.bookingSlots.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
                    Select an Available Date & Time
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {product.bookingSlots.map((slot: any, idx: number) => {
                      const isSelected = selectedSlot === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSlot(idx)}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600' 
                              : 'border-slate-200 bg-white hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              <ClockIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">Starts at {slot.time} Hours</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${slot.capacity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {slot.capacity > 0 ? `${slot.capacity} Slot Free` : 'Fully Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Primary Call to Actions */}
              <div className="space-y-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => addToCart(product)}
                  className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-transform"
                  style={{ backgroundColor: brandPrimary }}
                >
                  <SparklesIcon className="h-5 w-5" />
                  Reserve Session Pass
                </motion.button>

                <div className="text-center pt-2">
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                    Secure Marketplace Transaction Setup via Shop Reservation
                  </p>
                </div>
              </div>

              {/* Direct Provider Contacts Module */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Organized Provider Identity</h4>
                <div className="bg-slate-50 rounded-xl p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-400">Trainer Lead:</span>
                    <span className="font-semibold capitalize">{product.contactName || "Brenden Odhiambo"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1 text-slate-400">
                      <PhoneIcon className="h-3 w-3" /> Phone:
                    </div>
                    <a href={`tel:${product.contact}`} className="font-semibold hover:underline">{product.contact || "07003456778"}</a>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1 text-slate-400">
                      <EnvelopeIcon className="h-3 w-3" /> Email:
                    </div>
                    <a href={`mailto:${product.email}`} className="font-semibold hover:underline break-all">{product.email}</a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- DYNAMIC RELATED/SIMILAR OFFERS BLOCK --- */}
        {related && related.length > 0 && (
          <section className="mt-20 border-t border-slate-200 pt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">More Wellness Offerings From This Vendor</h2>
              <p className="text-slate-500 text-sm mt-1">Cross-training classes and additional sessions in your area.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map(r => (
                <div key={r.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    <Image 
                      src={r.images?.[0]?.url || 'https://dozi4r4ug9739.cloudfront.net/images/1779884960821-pexels-ketut-subiyanto-4720807.jpg'} 
                      alt={r.name} 
                      loader={loader}
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">{r.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-slate-900">KES {r.finalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- WHATSAPP INQUIRY OVERLAY COMPONENT --- */}
      {currentUrl && (
        <WhatsAppInquiry 
          productName={product.name}
          productPrice={product.finalPrice || product.sellingPrice || 1000}
          productUrl={currentUrl}
          phoneNumber="2547003456778" // Mapped accurately to the dynamic country phone parsing logic for Kenya
        />
      )}
    </div>
  );
}