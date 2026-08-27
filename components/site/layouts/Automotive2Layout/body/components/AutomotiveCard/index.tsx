"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import {
  MapPinIcon,
  FireIcon,
  SparklesIcon,
  ArrowRightIcon,
  ScaleIcon,
  Cog6ToothIcon,
  BeakerIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";

/* -------------------------------------------------------------------------- */
/* Custom Image Loader */
/* -------------------------------------------------------------------------- */
const imageLoader = ({ src }: { src: string }) => src;

/* -------------------------------------------------------------------------- */
/* WhatsApp Brand Icon */
/* -------------------------------------------------------------------------- */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/* Spec Feature Pill */
/* -------------------------------------------------------------------------- */
const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800/60 dark:bg-[#080B10]/80 border border-slate-700/50">
    <Icon className="w-3.5 h-3.5 text-amber-500 mb-1" />
    <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">{label}</span>
    <span className="text-[10px] font-bold text-white truncate w-full text-center">{value}</span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main Automotive Card Component */
/* -------------------------------------------------------------------------- */
export default function AutomotiveCard({ item }: { item: any }) {
  const { storeFormData } = useStoreContext();

  // Dynamic Data Extraction
  const price = item.finalPrice || item.sellingPrice;
  const location = item.locationName || "Nairobi Yard";
  const mileage = item.mileage || "0";
  const year = item.year?.$numberLong || item.year || "N/A";
  const transmission = item.transmission || "Auto";
  const fuel = item.fuelType || "Diesel";
  const vehicleName = item.name || `${item.make || ""} ${item.model || ""}`.trim() || "Commercial Vehicle";

  // Badges logic
  const showHotBadge = item.isFeatured || item.tags?.includes("trending");
  const showNewBadge = item.isNewArrival || item.condition === "New";

  // WhatsApp Inquiry Setup
  const whatsappNumber = item.contact || storeFormData?.contactPhone || "254732771353";
  const message = encodeURIComponent(
    `Hello, I'm interested in the ${vehicleName} (${year}) listed at KES ${Number(price || 0).toLocaleString()}. Is it currently available at the yard?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const listingId = item._id?.$oid || item.id || "#";

  return (
    <Link href={`/automotive/listings/${listingId}`} passHref legacyBehavior>
      <motion.a
        whileHover={{ y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative block h-full bg-slate-800/40 dark:bg-[#0F141C] rounded-3xl border border-slate-700/60 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      >
        {/* --- IMAGE CONTAINER --- */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <Image
            src={item.images?.[0] || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d"}
            alt={vehicleName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loader={imageLoader}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            {showHotBadge && (
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-lg bg-amber-600/90 backdrop-blur-md border border-amber-400/30">
                <FireIcon className="w-3 h-3" />
                Featured
              </span>
            )}
            {showNewBadge && (
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1 shadow-lg bg-emerald-600/90 backdrop-blur-md border border-emerald-400/30">
                <SparklesIcon className="w-3 h-3" />
                New Fleet
              </span>
            )}
          </div>

          {/* Quick WhatsApp Inquiry Action */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(whatsappUrl, "_blank");
            }}
            title="Inquire on WhatsApp"
            className="absolute top-4 right-4 z-20 p-2.5 bg-[#25D366] text-white rounded-xl shadow-xl hover:scale-110 transition-transform cursor-pointer border border-white/20"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </button>

          {/* Price Floating Capsule */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/80 shadow-lg">
              <span className="block text-[8px] font-black text-amber-500 uppercase tracking-widest">Price</span>
              <p className="text-base font-black text-white tabular-nums leading-tight">
                {price ? `KES ${Number(price).toLocaleString()}` : "Contact for Price"}
              </p>
            </div>
          </div>
        </div>

        {/* --- DETAILS CONTENT --- */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2 mb-2">
              <h3 className="text-base font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors uppercase line-clamp-1">
                {vehicleName}
              </h3>
              <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md flex-shrink-0">
                {year}
              </span>
            </div>

            <div className="flex items-center text-[10px] font-bold text-slate-400 mb-5 tracking-wider uppercase">
              <MapPinIcon className="w-3.5 h-3.5 mr-1 text-rose-500 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            {/* Performance Specifications */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <SpecItem
                icon={ScaleIcon}
                label="Mileage"
                value={`${Number(mileage).toLocaleString()} KM`}
              />
              <SpecItem
                icon={Cog6ToothIcon}
                label="Trans"
                value={transmission}
              />
              <SpecItem
                icon={BeakerIcon}
                label="Fuel"
                value={fuel}
              />
            </div>
          </div>

          {/* Bottom Card Action Footer */}
          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckBadgeIcon className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.financingAvailable ? "Financing Ready" : "Verified Dealer"}
              </span>
            </div>

            <div className="flex items-center gap-2 group/btn">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Details
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-slate-900 group-hover:border-amber-500 transition-all">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
}