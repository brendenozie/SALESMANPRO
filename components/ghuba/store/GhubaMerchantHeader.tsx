"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  PhoneIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  VideoCameraIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
  GlobeAltIcon
} from "@heroicons/react/24/solid";
import { FaWhatsapp } from "react-icons/fa";
import { StoreForm } from "@/types/typings";

const WhatsAppIcon = FaWhatsapp as any;

interface GhubaMerchantHeaderProps {
  pageData: StoreForm;
}

export default function GhubaMerchantHeader({ pageData }: GhubaMerchantHeaderProps) {
  const storeName = pageData.name || "Verified Merchant";
  const storeCategory = pageData.category && pageData.category !== "portal" ? pageData.category : "Retail & Electronics";
  const rawPhone = pageData.contactPhone || "254706448146";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") 
    ? `254${cleanPhone.slice(1)}` 
    : cleanPhone.startsWith("254") 
      ? cleanPhone 
      : `254${cleanPhone}`;

  // Physical address with CBD fallback
  const storeAddress = pageData.address || "Kimathi Street, Nairobi CBD, Kenya";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeName} ${storeAddress}`)}`;

  const bannerImg = pageData.bannerUrl || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80";
  const logoInitial = storeName.charAt(0).toUpperCase();

  const whatsappMessage = encodeURIComponent(
    `Hello ${storeName}, I found your verified store on Ghuba Marketplace. I would like to inquire about your products and in-store stock.`
  );

  return (
    <div className="w-full bg-white dark:bg-[#080808] border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all">
      
      {/* 1. Merchant Hero Banner */}
      <div className="relative h-52 sm:h-64 md:h-80 w-full overflow-hidden bg-zinc-950">
        <Image
          src={bannerImg}
          alt={`${storeName} storefront banner`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-lg border border-emerald-400/20">
              <CheckBadgeIcon className="w-4 h-4" />
              Verified Physical Store
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-black/70 text-amber-400 border border-white/10 backdrop-blur-md shadow-sm">
              <StarIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>4.9 (120+ M-Pesa Escrow Orders)</span>
            </span>
          </div>

          {/* Watch Reels Button */}
          <Link
            href="/ghuba/feed"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-md hover:scale-105 active:scale-95"
          >
            <VideoCameraIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Watch</span>
            <span>Store Reels</span>
          </Link>
        </div>

        {/* Category Pill Over Banner Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 hidden sm:block">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10 shadow-sm">
            {storeCategory}
          </span>
        </div>
      </div>

      {/* 2. Merchant Info Bar & Trust Controls */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-12 sm:-mt-16 z-20">
          
          {/* Left: Logo Avatar & Identity */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-amber-500 text-zinc-950 font-black text-3xl sm:text-5xl flex items-center justify-center shadow-2xl ring-4 ring-white dark:ring-[#080808] shrink-0 overflow-hidden">
              {pageData.logoUrl ? (
                <Image
                  src={pageData.logoUrl}
                  alt={storeName}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <span>{logoInitial}</span>
              )}
            </div>

            <div className="min-w-0 pt-2">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {storeName}
                </h1>
                <CheckBadgeIcon className="w-6 h-6 text-emerald-500 shrink-0" title="Verified Physical Storefront" />
              </div>

              {pageData.tagline && (
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 max-w-xl line-clamp-1 mb-2">
                  {pageData.tagline}
                </p>
              )}

              {/* Physical Shop Address & Directions */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                  <MapPinIcon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{storeAddress}</span>
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 font-bold hover:underline"
                  title="Open in Google Maps for walking or driving directions"
                >
                  <span>Google Maps Directions</span>
                  <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Primary Contact & Inquiry CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {pageData.domain && !pageData.domain.includes("ghuba.shop") && (
              <a
                href={pageData.domain.startsWith("http") ? pageData.domain : `https://${pageData.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm transition-all shadow-sm border border-zinc-200/80 dark:border-zinc-700/80"
                title={`Visit ${storeName}'s independent website`}
              >
                <GlobeAltIcon className="w-4 h-4 text-amber-500" />
                <span>Visit Website</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            )}

            <a
              href={`https://wa.me/${formattedPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>WhatsApp Store</span>
            </a>

            <a
              href={`tel:+${formattedPhone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs sm:text-sm transition-all shadow-sm border border-zinc-200/80 dark:border-zinc-700/80"
              title="Call store directly"
            >
              <PhoneIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* 3. Operational Badges & Escrow Protection Strip */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Operating Hours */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open Today: 8:00 AM – 7:30 PM</span>
              </div>
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Physical CBD Walk-ins & Instant Dispatch</span>
            </div>
          </div>

          {/* M-Pesa Escrow Protection Guarantee */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs md:col-span-1 lg:col-span-2 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-amber-700 dark:text-amber-400 mb-0.5">
                Ghuba M-Pesa Escrow Protection Guarantee
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                Funds are held in secure escrow. The merchant is paid only after you inspect and accept your delivery in Nairobi or across Kenya.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}