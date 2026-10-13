'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React, { useState, useEffect, useCallback } from "react";
import useSWR from 'swr';
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection, { SearchFilters } from "./components/HeroSection";

// Below-the-fold components - statically imported
import AutomotiveFeaturedListingsWrapper from './components/FeaturedListingsSection';
import HowItWorks from './components/HowItWorksSection';
import BrowseByCategory from './components/BrowseByCategorySection';
import FilterBarSection from './components/FilterBarSection';
import TrendingLocations from './components/TrendingLocationsSection';
import PopularVehiclesWrapper from './components/PopularVehicleSection';
import VideoShowcaseSection from './components/VideoShowcaseSection';
import MarketInsightsSection from './components/MarketInsightsSection';
import TestimonialsCarouselSection from './components/TestimonialsCarouselSection';

interface VehicleCardProps {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  type: string;
  mileage: number;
  badge?: "New" | "Hot" | "Price Reduced";
}

const tours = [
  {
    id: 'tour1',
    thumbnail: '/assets/tour1-thumb.jpg',
    videoId: 'XxVg_s8xAms', // e.g. YouTube ID or internal asset
    title: 'Modern Loft in Downtown',
  },
  {
    id: 'tour2',
    thumbnail: '/assets/tour2-thumb.jpg',
    videoId: 'L61p2uyiMSo',
    title: 'Beachfront Villa Tour',
  },
  {
    id: 'tour3',
    thumbnail: '/assets/tour3-thumb.jpg',
    videoId: '3fumBcKC6RE',
    title: 'Suburban Family Home',
  },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AutomotiveSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  const [promos, setPromos] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<VehicleCardProps[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);

  // Use pageData for all content
  const siteData = pageData || storeFormData;
  
  // marketplaceListings from siteData → map to VehicleCardProps
  const listings = siteData?.marketplaceListings || [];

  useEffect(() => {
    // Pull promotions from siteData.promotions
    setPromos(siteData?.promotions || []);
  }, [siteData]);

  useEffect(() => {
    if (testimonialsData?.data) {
      setTestimonials(testimonialsData.data);
    }
  }, [testimonialsData]);
  
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    vehicleType: "",
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    isBuy: true
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Build query params based on filters
    const queryParams = new URLSearchParams();
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.vehicleType) queryParams.append("vehicleType", filters.vehicleType);
    if (filters.make) queryParams.append("make", filters.make);
    if (filters.model) queryParams.append("model", filters.model);
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    queryParams.append("isBuy", String(filters.isBuy));
    // Navigate to search results page with query params
    window.location.href = `/search?${queryParams.toString()}`;
  }, [filters]);

  
  const heroNode = (
    <HeroSection
      store={storeFormData}
      trendingLocations={storeFormData?.CompanyLocation
        ? storeFormData?.CompanyLocation.map((loc: any) => ({
          name: loc.name,
          slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
          metaKeywords: loc.metaKeywords || "",
          status: loc.status || "active",
          parentId: loc.parentId || null,
          ...loc,
        }))
        : []} 
      onSearch={() => {}}
    />
  );

  const featuredNode = <AutomotiveFeaturedListingsWrapper companyId={pageData.id}/>;
  const howItWorksNode = <HowItWorks />;
  const categoriesNode = <BrowseByCategory store={storeFormData}/>;
  const locationsNode = (
    <TrendingLocations
      locations={
        storeFormData?.CompanyLocation
          ? storeFormData?.CompanyLocation.map((loc: any) => ({
              name: loc.name,
              slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
              metaKeywords: loc.metaKeywords || "",
              status: loc.status || "active",
              parentId: loc.parentId || null,
              ...loc,
            }))
          : []
      }
      slug={"slug"}
    />
  );
  const popularVehiclesNode = <PopularVehiclesWrapper companyId={pageData.id} />;
  const videoNode = <VideoShowcaseSection blogs={blogsData?.data || []} />;
  const insightsNode = <MarketInsightsSection />;
  const testimonialsNode = <TestimonialsCarouselSection testimonials={testimonials} />;

  const sectionMap: Record<string, React.ReactNode> = {
    'hero': heroNode,
    'automotive2-hero': heroNode,
    'automotive-featured-listings': featuredNode,
    'automotive2-featured-listings': featuredNode,
    'automotive-featured': featuredNode,
    'featured-listings': featuredNode,
    'how-it-works': howItWorksNode,
    'automotive2-how-it-works': howItWorksNode,
    'browse-by-category': categoriesNode,
    'automotive2-browse-by-category': categoriesNode,
    'categories': categoriesNode,
    'automotive2-categories': categoriesNode,
    'trending-locations': locationsNode,
    'automotive2-trending-locations': locationsNode,
    'locations': locationsNode,
    'automotive2-locations': locationsNode,
    'popular-vehicles': popularVehiclesNode,
    'automotive2-popular-vehicles': popularVehiclesNode,
    'video-showcase': videoNode,
    'automotive2-video-showcase': videoNode,
    'videos': videoNode,
    'automotive2-video': videoNode,
    'market-insights': insightsNode,
    'automotive2-market-insights': insightsNode,
    'insights': insightsNode,
    'testimonials': testimonialsNode,
    'automotive2-testimonials': testimonialsNode,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        {heroNode}
      </div>
      <div id="section-automotive-featured-listings" data-editor-section="automotive-featured-listings" data-editor-component="AutomotiveFeaturedListingsWrapper">
        {featuredNode}
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        {howItWorksNode}
      </div>
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        {categoriesNode}
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
        {locationsNode}
      </div>      
      <div id="section-popular-vehicles" data-editor-section="popular-vehicles" data-editor-component="PopularVehiclesWrapper">
        {popularVehiclesNode}
      </div>
      <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
        {videoNode}
      </div>
      <div id="section-market-insights" data-editor-section="market-insights" data-editor-component="MarketInsightsSection">
        {insightsNode}
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
        {testimonialsNode}
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
