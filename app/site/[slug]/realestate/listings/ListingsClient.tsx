"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon, MapPinIcon, Square2StackIcon, StarIcon } from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";
import Link from "next/link";
import Image from "next/image";
import PropertyCard from "./PropertyCard";

const customLoader = ({ src }: { src: string }) => {
  return src;
}

// Utility to check if a date is within the last 30 days
const isRecent = (dateStr: string | Date | undefined) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
};

// Utility to stringify location from possible JSON structure
const stringifyLocation = (location: any): string | null => {
  if (!location) return null;
  if (typeof location === "string") return location;
  if (typeof location === "object") {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(", ");
  }
  return null;
};

/* -------------------------
  Property Card (wired to MarketListingForm)
------------------------- */

function PropertyCardV1({ item }: { item: MarketListingForm }) {
  // local favorite state (persisted to localStorage by id)
  const [liked, setLiked] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      return !!localStorage.getItem(`fav:${item.id}`);
    } catch {
      return false;
    }
  });

  const toggleLiked = () => {
    try {
      const key = `fav:${item.id}`;
      if (liked) {
        localStorage.removeItem(key);
        setLiked(false);
      } else {
        localStorage.setItem(key, JSON.stringify(true));
        setLiked(true);
      }
    } catch {
      setLiked((s) => !s);
    }
  };

  // Field mapping (see mapping in message)
  const title = item.name || "Untitled property";
  const image = item.images?.[0] || `https://placehold.co/1200x900/059669/D1FAE5?text=Property`;
  const price = item.finalPrice ?? item.sellingPrice ?? item.buyingPrice ?? 0;
  const priceLabel = typeof price === "number" ? `KES ${price.toLocaleString()}` : String(price || "Price on request");
  const location = item.locationName || stringifyLocation(item.location) || "Location Not Specified";
  const beds = typeof item.bedrooms === "number" ? item.bedrooms : (Array.isArray(item.bedrooms) ? item.bedrooms.length : "-");
  const baths = item.bathrooms ?? "-";
  const sqft = item.area ?? "-";
  const tag = item.badge || (item.isFeatured ? "Featured" : (item.isNewArrival ? "New" : ""));
  const isNew = item.isNewArrival || isRecent(item.createdAt || undefined);
  const isUrgent = item.badge === "urgent";
  const isFurnished = item.features?.includes?.("furnished");

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          loader={customLoader}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />

        {tag ? (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 uppercase tracking-wider">
            {tag}
          </div>
        ) : null}

        <button
          onClick={toggleLiked}
          className="absolute top-4 right-4 p-2.5 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-colors"
          aria-label="Favorite listing"
        >
          {liked ? <HeartIcon className="w-5 h-5 text-rose-500" /> : <HeartIcon className="w-5 h-5 text-white" />}
        </button>

        {/* subtle badges */}
        <div className="absolute left-4 bottom-4 flex gap-2">
          {isNew && <span className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold">New</span>}
          {isUrgent && <span className="px-2 py-1 rounded-full bg-rose-500 text-white text-xs font-semibold">Urgent</span>}
          {isFurnished && <span className="px-2 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">Furnished</span>}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPinIcon className="w-4 h-4" />
              {location}
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            {(item.providerRating ?? item.sellerId) ? (item.providerRating ?? "—") : "-"}
          </div>
        </div>

        <div className="my-4 border-t border-gray-100"></div>

        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              {beds} <span className="hidden sm:inline">Beds</span>
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v13" strokeWidth="2" strokeLinecap="round"/></svg>
              {baths} <span className="hidden sm:inline">Baths</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Square2StackIcon className="w-4 h-4" />
              {sqft} <span className="hidden sm:inline">sqft</span>
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">{priceLabel}</span>
          <Link href={`/realestate/listings/${item.id}`}  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors">
              View Details
          </Link>
        </div>
      </div>
    </div>
  );
}


interface ListingsClientProps {
  initialListings: any[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

export default function ListingsClient({
  initialListings,
  totalCount,
  pageSize,
  currentPage,
}: ListingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", newPage.toString());
    // Scroll to the listings section ID we defined in the server page
    router.push(`?${params.toString()}#listings-section`);
  };

  if (initialListings.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="text-2xl font-bold text-gray-800">No properties found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
        <button 
           onClick={() => router.push("?")}
           className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Latest Properties</h2>
          <p className="text-gray-500 mt-1">Showing {initialListings.length} of {totalCount} properties</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {initialListings.map((listing) => (
          <PropertyCard key={listing.id} item={listing} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <span className="text-sm font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ArrowRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}