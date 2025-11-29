"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  MapPinIcon, StarIcon, WifiIcon, SunIcon, TruckIcon, ShieldCheckIcon, 
  CheckCircleIcon, BeakerIcon, Square2StackIcon, ChatBubbleLeftRightIcon, 
  PhoneIcon, CalendarDaysIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { format } from "date-fns"; // Optional: for date formatting

// --- Helper: Icon Mapper ---
const getAmenityIcon = (label: string) => {
  const lower = label.toLowerCase();
  if (lower.includes("wifi") || lower.includes("internet")) return WifiIcon;
  if (lower.includes("pool") || lower.includes("water")) return SunIcon;
  if (lower.includes("security") || lower.includes("safe")) return ShieldCheckIcon;
  if (lower.includes("parking") || lower.includes("garage")) return TruckIcon;
  return CheckCircleIcon; // Default
};

const customLoader = ({ src }: { src: string }) => src;

export default function PropertyDetailsClient({ data }: { data: any }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fallbacks
  const images = data.images && data.images.length > 0 
    ? data.images 
    : ["https://placehold.co/1200x800?text=No+Image"];
  
  const host = data.seller || { name: "Agency Agent", role: "Property Manager" };
  const amenities = data.features || [" detailed amenities available on request"];

  // --- Gallery Handlers ---
  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setIsGalleryOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 py-20">
      
      {/* --- LIGHTBOX MODAL --- */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setIsGalleryOpen(false)}>
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/20 rounded-full">
            <XMarkIcon className="w-8 h-8" />
          </button>
          
          <button onClick={prevImage} className="absolute left-4 p-4 text-white hover:bg-white/10 rounded-full">
            <ChevronLeftIcon className="w-10 h-10" />
          </button>

          <div className="relative w-full h-[80vh] max-w-5xl aspect-video">
             <Image 
               src={images[currentImageIndex]} 
               alt="Gallery" 
               fill 
               className="object-contain" 
               loader={customLoader}
             />
             <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                {currentImageIndex + 1} / {images.length}
             </div>
          </div>

          <button onClick={nextImage} className="absolute right-4 p-4 text-white hover:bg-white/10 rounded-full">
            <ChevronRightIcon className="w-10 h-10" />
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-8">
        
        {/* --- HEADER --- */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{data.name}</h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <MapPinIcon className="w-5 h-5 text-indigo-600" />
              {data.locationName || "Location details upon request"}
            </div>
            {data.providerRating && (
              <div className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-gray-900">{data.providerRating}</span>
              </div>
            )}
          </div>
        </div>

        {/* --- BENTO GRID GALLERY --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12">
          {/* Main Large Image */}
          <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer" onClick={() => openGallery(0)}>
             <Image 
               src={images[0]} 
               loader={customLoader}
               alt="Main property" 
               fill
               className="object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Side Images */}
          {images.slice(1, 5).map((img: string, idx: number) => (
            <div key={idx} className="relative group cursor-pointer hidden md:block" onClick={() => openGallery(idx + 1)}>
              <Image 
                src={img} 
                loader={customLoader}
                alt={`Detail ${idx}`} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* "View All" Overlay on the last visible image */}
              {idx === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <span className="text-white font-semibold text-sm border border-white/30 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    View all {images.length} photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* LEFT COLUMN (Details) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Quick Stats */}
            <div className="flex items-center justify-between md:justify-start md:gap-16 py-8 border-y border-gray-100">
               <StatItem icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>} label="Bedrooms" value={data.bedrooms} />
               <div className="hidden md:block w-px h-12 bg-gray-100"></div>
               <StatItem icon={<BeakerIcon className="w-6 h-6" />} label="Bathrooms" value={data.bathrooms} />
               <div className="hidden md:block w-px h-12 bg-gray-100"></div>
               <StatItem icon={<Square2StackIcon className="w-6 h-6" />} label="Square Area" value={`${data.area?.toLocaleString() || '-'} sqft`} />
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Trip</h2>
              <div className="prose prose-indigo text-gray-600 leading-relaxed whitespace-pre-line text-lg max-w-none">
                {data.description || "No description provided."}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4">
                {amenities.map((item: string, idx: number) => {
                  const Icon = getAmenityIcon(item);
                  return (
                    <div key={idx} className="flex items-center gap-3 text-gray-700 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Icon className="w-6 h-6 text-indigo-600" />
                      <span className="font-medium capitalize">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Card */}
            <div className="bg-gray-50 p-8 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-gray-100">
              <div className="relative w-20 h-20 shrink-0">
                <Image 
                  src={host.image || "https://placehold.co/100x100?text=Agent"} 
                  alt={host.name || "Agent"}
                  loader={customLoader}
                  fill
                  className="object-cover rounded-full border-4 border-white shadow-md"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-gray-900">Hosted by {host.name || "Real Estate Agency"}</h3>
                <p className="text-indigo-600 font-medium mb-1">{ "Licensed Agent"}</p>
                <div className="flex justify-center sm:justify-start gap-3 mt-4">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Message
                  </button>
                   {host.phoneNumber && (
                    <a href={`tel:${host.phoneNumber}`} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                      <PhoneIcon className="w-5 h-5" />
                      Call
                    </a>
                   )}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-gray-500 text-sm font-medium">Price</span>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {data.finalPrice 
                      ? `KES ${data.finalPrice.toLocaleString()}` 
                      : "Price on Request"}
                  </div>
                </div>
                {data.badge && (
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100">
                    {data.badge}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-200 hover:border-indigo-600 cursor-pointer transition-colors group bg-gray-50/50">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule a tour</div>
                  <div className="flex items-center gap-2 text-gray-900 font-medium group-hover:text-indigo-600">
                     <CalendarDaysIcon className="w-5 h-5" />
                     <span>Select a Date</span>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0">
                  Request Tour
                </button>
                <button className="w-full py-4 bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-900 rounded-xl font-bold text-lg transition-colors">
                  Make an Offer
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-400">
                <p>Protected by our Secure Payment Guarantee.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Small helper component for the stats row
function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col gap-1 items-center md:items-start">
      <span className="flex items-center gap-2 text-gray-400 text-sm font-medium">
        {icon}
        {label}
      </span>
      <span className="text-xl font-bold text-gray-900">{value || "-"}</span>
    </div>
  )
}