// Create a new file: HeroSectionWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import HeroSection from "./HeroSection";

export default function HeroSectionWrapper({ store, categories, initialLocations, slug }: { store: any, categories: any, initialLocations: any[], slug: string }) {
  const router = useRouter();

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams();
    if (filters.location) params.set("location", filters.location);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.category) params.set("category", filters.category);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);

    // This scrolls the user down to the results after searching
    router.push(`/${slug}/listings?${params.toString()}#listings-section`);
  };

  return <HeroSection store={store} categories={categories} initialLocations={initialLocations} slug={slug}/>;
}