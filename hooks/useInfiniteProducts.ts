"use client";

import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") return "/api";
  if (process.env.NEXT_PUBLIC_BASE_URL) return `${process.env.NEXT_PUBLIC_BASE_URL}/api`;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return "/api";
};

export function useInfiniteProducts({
  searchTerm,
  filters,
  scope = "GHUBA",
  companyId,
}: {
  searchTerm: string;
  filters: any;
  scope?: "GHUBA" | "STORE";
  companyId?: string;
}) {
  const brandSorted = [...(filters.brand || [])].sort();
  const categorySorted = [...(filters.category || [])].sort();
  const subCategorySorted = [...(filters.subCategory || [])].sort();
  const conditionSorted = [...(filters.condition || [])].sort();
  const makeSorted = [...(filters.make || [])].sort();

  const queryKey = [
    "search-products",
    scope,
    companyId || "global",
    searchTerm,
    brandSorted,
    categorySorted,
    subCategorySorted,
    conditionSorted,
    makeSorted,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ];

  return useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        limit: "24",
        scope,
        sort: filters.sort || "newest",
      });

      if (searchTerm) params.set("q", searchTerm);
      if (companyId) params.set("companyId", companyId);
      if (pageParam) params.set("cursor", pageParam);

      if (filters.minPrice !== undefined && filters.minPrice > 0) {
        params.set("minPrice", String(filters.minPrice));
      }
      if (filters.maxPrice !== undefined && filters.maxPrice < 1e7) {
        params.set("maxPrice", String(filters.maxPrice));
      }

      (filters.brand || []).forEach((b: string) => params.append("brand", b));
      (filters.category || []).forEach((c: string) => params.append("category", c));
      (filters.subCategory || []).forEach((s: string) => params.append("subCategory", s));
      (filters.condition || []).forEach((c: string) => params.append("condition", c));
      (filters.make || []).forEach((m: string) => params.append("make", m));
      (filters.transmission || []).forEach((t: string) => params.append("transmission", t));
      (filters.fuelType || []).forEach((f: string) => params.append("fuelType", f));
      (filters.bodyType || []).forEach((b: string) => params.append("bodyType", b));
      (filters.propertyType || []).forEach((p: string) => params.append("propertyType", p));
      (filters.bedrooms || []).forEach((b: string) => params.append("bedrooms", b));
      (filters.bathrooms || []).forEach((b: string) => params.append("bathrooms", b));

      if (filters.yearFrom) params.set("yearFrom", String(filters.yearFrom));
      if (filters.yearTo) params.set("yearTo", String(filters.yearTo));

      const response = await fetch(`${getApiBaseUrl()}/search?${params}`, {
        signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      return response.json();
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.meta?.nextCursor ?? undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
}
