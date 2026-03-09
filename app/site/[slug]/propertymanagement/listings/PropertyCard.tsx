"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, StarIcon } from "@heroicons/react/24/solid";

const loader = ({ src }: { src: string }) => {
  return src;
};

// A robust formatter for numbers
const formatPrice = (price: number | null) => {
  if (!price) return "Price on Request";
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES', 
    maximumFractionDigits: 0 
  }).format(price);
};

export default function PropertyCard({ item }: { item: any }) {
  const [isLiked, setIsLiked] = useState(false);

  // Safety checks
  const image = item.images?.[0] || "https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image";
  const title = item.name;
  const location = item.locationName || "Location unavailable";
  
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={image}
          alt={title}
          loader={loader}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Badge */}
        {item.badge && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 rounded-md shadow-sm">
            {item.badge}
          </span>
        )}

        {/* Like Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsLiked(!isLiked); }}
          className="absolute top-4 right-4 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-rose-500 transition-all"
        >
          {isLiked ? <HeartIconSolid className="w-5 h-5 text-rose-500"/> : <HeartIcon className="w-5 h-5"/>}
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          {item.isFeatured && <StarIcon className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPinIcon className="w-4 h-4" />
          <span className="truncate">{location}</span>
        </div>

        {/* Features Row */}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6 border-t border-gray-50 pt-4 mt-auto">
          <div className="flex items-center gap-1">
            <span className="text-gray-900 font-bold">{item.bedrooms || '-'}</span> Beds
          </div>
          <div className="w-px h-3 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <span className="text-gray-900 font-bold">{item.bathrooms || '-'}</span> Baths
          </div>
          <div className="w-px h-3 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <span className="text-gray-900 font-bold">{item.area ? item.area.toLocaleString() : '-'}</span> sqft
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <p className="text-xl font-bold text-indigo-600">
            {formatPrice(item.finalPrice || item.sellingPrice)}
          </p>
          <Link 
            href={`/listings/${item.id}`}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}