"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, HeartIcon, MapPinIcon, Square2StackIcon, StarIcon } from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";
import Link from "next/link";
import Image from "next/image";
import PropertyCard from "@/components/site/layouts/RealEstateLayout/body/components/PropertyCard";

const customLoader = ({ src }: { src: string }) => {
  return src;
};

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

interface ListingsClientProps {
  initialListings: any[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  companyId: string;
}

export default function ListingsClient({
  initialListings,
  totalCount,
  pageSize,
  currentPage,
  companyId,
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
      <div className="py-12 md:py-20 text-center px-4">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
          No properties found
        </h3>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2">
          Try adjusting your filters to find what you're looking for.
        </p>
        <button
          onClick={() => router.push("?")}
          className="mt-6 px-6 py-2.5 text-sm md:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition"
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-16">
      {/* Header section: Stacks on mobile, row on larger screens */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-2 sm:gap-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Latest Properties
          </h2>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Showing {initialListings.length} of {totalCount} properties
          </p>
        </div>
      </div>

      {/* Grid: 1 col on mobile, 2 cols on tablets, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
        {initialListings.map((listing: any, index: number) => (
          <PropertyCard
            key={`${listing.id}-${index}`}
            item={listing}
            companyId={companyId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 md:gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2.5 md:p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Previous page"
          >
            <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <span className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2.5 md:p-3 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Next page"
          >
            <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
}