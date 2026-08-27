"use client";

import React from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { createCachedFetcher } from "@/lib/swrCachedFetcher";
import { MarketListingForm } from "@/types/typings";
import PopularVehiclesSection from "./PopularVehiclesSection"; // your Popular UI component

// API base
const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Build dynamic URL for vehicle search
const buildQuery = (companyId: string, params: URLSearchParams) => {
  const q = new URLSearchParams();

  q.set("companyId", companyId);

  const filters = [
    "location",
    "minPrice",
    "maxPrice",
    "fuelType",
    "transmission",
    "bodyType",
    "keywords",
    "limit",
    "page",
  ];

  filters.forEach((key) => {
    const value = params.get(key);
    if (value) q.set(key, value);
  });

  // Popular Vehicle flag
  return `${apiBaseUrl}/site/productsByFlag?${q.toString()}&flag=isPopularListing`;
};

export default function PopularVehiclesWrapper({
  companyId,
}: {
  companyId: string;
}) {
  const params = useSearchParams();

  const url = buildQuery(companyId, params);

  const cacheKey = `popular-vehicles-${companyId}`;
  const fallbackKey = `swr-cache:${cacheKey}:${url}`;
  const fetcher = createCachedFetcher(cacheKey);

  const fallbackData =
    typeof window !== "undefined"
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem(fallbackKey) || "null");
          } catch {
            return null;
          }
        })()
      : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: fallbackData || undefined,
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
  });

  const listings: MarketListingForm[] = data?.data || [];

  // Pass functional data to your original UI
  return (
    <PopularVehiclesSection
      listings={listings}
      isLoading={isLoading}
      error={error}
      slug={companyId}
    />
  );
}
