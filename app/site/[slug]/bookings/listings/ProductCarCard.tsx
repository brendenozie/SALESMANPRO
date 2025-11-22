"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  CheckBadgeIcon,
  ClockIcon,
  PhoneIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

// ---------------------------
// SAMPLE SERVICE DATA
// ---------------------------
export interface IService {
  id: string;
  name: string;
  title?: string | null | undefined;
  category: string;
  images: string[];
  location: string;
  priceRange: string;
  finalPrice: string;
  rating: number;
  verified: boolean;
  phone: string;
  closingTime?: string; // Default: 20:00 (8 PM)
}

const loader = ({ src }: { src: string }) => src;

export const sampleService: IService = {
  id: "svc_123",
  name: "Prestige Barber Studio",
  category: "Barbershop",
  images: [
    "/samples/barber1.jpg",
    "/samples/barber2.jpg",
    "/samples/barber3.jpg",
  ],
  location: "Nairobi CBD • Kimathi Street",
  priceRange: "KES 300 - 1,000",
  finalPrice: "KES 300",
  rating: 4.7,
  verified: true,
  phone: "+254712345678",
  closingTime: "20:00",
};

// ---------------------------
// SERVICE CARD
// ---------------------------
const ServiceCard = ({ service = sampleService }: { service: IService }) => {
  const {
    name,
    title,
    category,
    images,
    location,
    priceRange,
    finalPrice,
    rating,
    verified,
    phone,
    closingTime = "20:00",
  } = service;

  // Carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const previousImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(nextImage, 4000);
    return () => clearInterval(interval);
  }, []);

  // Determine if still open
  const isOpen = () => {
    const now = new Date();
    const [closeHour, closeMin] = closingTime.split(":").map(Number);
    const closing = new Date();
    closing.setHours(closeHour, closeMin, 0);
    return now < closing;
  };

  // ---------------------------
  // SKELETON LOADER STATE
  // ---------------------------
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (loading)
    return (
      <div className="w-full bg-white rounded-lg animate-pulse border shadow-sm p-4">
        <div className="h-48 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg shadow-sm hover:shadow-xl border overflow-hidden group transition"
    >
      {/* --------------------------- */}
      {/* IMAGE CAROUSEL */}
      {/* --------------------------- */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={images[currentIndex]}
          alt={name}
          loader={loader}
          fill
          className="object-cover transition-all duration-500"
        />

        {/* Left Arrow */}
        <button
          onClick={previousImage}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* --------------------------- */}
      {/* SERVICE DETAILS */}
      {/* --------------------------- */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-lg line-clamp-1">{name || title || ""}</h3>

          {verified && (
            <CheckBadgeIcon className="h-5 w-5 text-green-600" />
          )}
        </div>

        <p className="text-sm text-gray-600">{category}</p>

        <p className="mt-2 text-gray-700 font-medium">{priceRange || finalPrice || ""}</p>

        <p className="text-sm text-gray-500 mt-1">{location}</p>

        <p className="mt-2 text-sm flex items-center gap-1">
          <ClockIcon className="h-4 w-4 text-gray-600" />
          {isOpen() ? (
            <span className="text-green-600 font-medium">
              Open till {closingTime}
            </span>
          ) : (
            <span className="text-red-600 font-medium">Closed</span>
          )}
        </p>

        {/* Rating */}
        <p className="mt-1 text-yellow-600 text-sm">⭐ {rating}</p>

        {/* --------------------------- */}
        {/* WHATSAPP BOOKING BUTTON */}
        {/* --------------------------- */}
        <a
          href={`https://wa.me/${phone?.replace("+", "")}?text=Hello, I would like to book ${name}`}
          target="_blank"
          className="mt-4 block bg-green-600 text-white text-center py-2 rounded-md font-medium shadow hover:bg-green-700 transition"
        >
          Book on WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

export default ServiceCard;


// 'use client';

// import React, { useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { HeartIcon, MapPinIcon, CalendarIcon, CogIcon, BeakerIcon } from '@heroicons/react/24/outline';
// import { WrenchIcon } from '@heroicons/react/24/solid';

// const loader = ({ src }: { src: string }) => src;

// export default function CarCard({ business }: { business: any }) {
//   const [liked, setLiked] = useState(false);

//   const img =
//     Array.isArray(business.images) && business.images[0]
//       ? business.images[0]
//       : '/placeholder-business.png';

//   return (
//     <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">

//       {/* IMAGE */}
//       <div className="relative h-48 overflow-hidden">
//         <Image
//           src={img}
//           loader={loader}
//           alt={business.name || `${business.make} ${business.model}`}
//           fill
//           className="object-cover transition-transform duration-500 group-hover:scale-110"
//         />

//         {/* LIKE BUTTON */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setLiked(!liked);
//           }}
//           className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-transform z-10"
//         >
//           <HeartIcon
//             className={
//               liked
//                 ? 'w-5 h-5 text-rose-500 fill-rose-500'
//                 : 'w-5 h-5 text-gray-600'
//             }
//           />
//         </button>

//         {/* BADGES */}
//         {Array.isArray(business.badges) && business.badges.length > 0 && (
//           <div className="absolute bottom-3 left-3 flex gap-2">
//             {business.badges.map((b: string, i: number) => (
//               <span
//                 key={i}
//                 className="bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/10"
//               >
//                 {b}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* CONTENT */}
//       <div className="p-5 flex-1 flex flex-col">

//         {/* TITLE + LOCATION + RATING */}
//         <div className="flex justify-between items-start mb-2">
//           <div>
//             <h3 className="font-bold text-lg text-gray-900 group-hover:text-violet-600 transition-colors line-clamp-1">
//               {business.name || `${business.make} ${business.model}`}
//             </h3>

//             {business.location && (
//               <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
//                 <MapPinIcon className="w-4 h-4" />
//                 {business.location}
//               </p>
//             )}
//           </div>

//           {business.rating && (
//             <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
//               <svg
//                 className="w-4 h-4 fill-amber-400 text-amber-400"
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.777 1.48 8.265L12 18.896l-7.416 4.452 1.48-8.265L.0 9.306l8.332-1.151z" />
//               </svg>
//               <span className="text-sm font-bold text-amber-700">
//                 {business.rating}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* STATUS + TAGS (reusing spec / type / year as tags) */}
//         <div className="space-y-3 mb-4">
//           {/* Status */}
//           {business.status && (
//             <div className="flex items-center gap-4 text-sm">
//               <div
//                 className={`font-semibold flex items-center gap-1.5 ${
//                   business.status === 'Closed'
//                     ? 'text-rose-600'
//                     : 'text-emerald-600'
//                 }`}
//               >
//                 <span className="relative flex h-2.5 w-2.5">
//                   <span
//                     className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
//                       business.status === 'Closed'
//                         ? 'bg-rose-400'
//                         : 'bg-emerald-400'
//                     }`}
//                   ></span>
//                   <span
//                     className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
//                       business.status === 'Closed'
//                         ? 'bg-rose-500'
//                         : 'bg-emerald-500'
//                     }`}
//                   ></span>
//                 </span>
//                 {business.status}
//               </div>

//               {business.nextSlot && (
//                 <div className="text-gray-400 text-xs flex items-center gap-1">
//                   <CalendarIcon className="w-3 h-3" />
//                   {business.nextSlot}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Tags (use existing car specs/tags if available) */}
//           {Array.isArray(business.tags) && (
//             <div className="flex flex-wrap gap-2">
//               {business.tags.map((tag: string, i: number) => (
//                 <span
//                   key={i}
//                   className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium group-hover:bg-gray-200 transition-colors"
//                 >
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* SPECS GRID — REUSED FROM CAR VERSION */}
//         {business.specs && (
//           <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 py-3 border-t border-b border-gray-100">
//             <div className="flex items-center gap-2 text-sm text-slate-600">
//               <CogIcon className="w-4 h-4 text-slate-400" />
//               <span>{Number(business.mileage || 0).toLocaleString()} mi</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-slate-600">
//               <WrenchIcon className="w-4 h-4 text-slate-400" />
//               <span>{business.transmission}</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-slate-600">
//               <BeakerIcon className="w-4 h-4 text-slate-400" />
//               <span>{business.fuel}</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm text-slate-600">
//               <CalendarIcon className="w-4 h-4 text-slate-400" />
//               <span>One Owner</span>
//             </div>
//           </div>
//         )}

//         {/* FOOTER — PRICE + DETAILS */}
//         <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
//           <div>
//             <p className="text-sm text-slate-400 font-medium">Cash Price</p>
//             <p className="text-2xl font-bold text-slate-900">
//               ${Number(business.price || 0).toLocaleString()}
//             </p>
//           </div>

//           <Link
//             href={`/cars/${business.slug || business.id}`}
//             className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
//           >
//             Details
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }
