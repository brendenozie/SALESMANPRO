"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

export function useInfiniteProducts({ searchTerm, filters }) {
  const queryKey = [
    "shop-products",
    searchTerm,
    [...filters.brand].sort(),
    [...filters.category].sort(),
    [...filters.subCategory].sort(),
    filters.priceRange[0],
    filters.priceRange[1],
    filters.sort,
  ];

  return useInfiniteQuery({
    queryKey,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      const params = new URLSearchParams({
        limit: "24", // Increased limit to satisfy virtualizer grid constraints
        search: searchTerm ?? "",
        minPrice: String(filters.priceRange[0]),
        maxPrice: String(filters.priceRange[1]),
        sort: filters.sort,
      });

      if (pageParam) {
        params.set("cursor", pageParam);
      }

      filters.brand.forEach((b) => params.append("brand", b));
      filters.category.forEach((c) => params.append("category", c));
      filters.subCategory.forEach((s) => params.append("subCategory", s));

      const response = await fetch(`${apiBaseUrl}/shop/products?${params}`, {
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
