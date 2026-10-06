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

  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': (
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
    ),
    'automotive-featured-listings': <AutomotiveFeaturedListingsWrapper companyId={pageData.id}/>,
    'how-it-works': <HowItWorks />,
    'browse-by-category': <BrowseByCategory store={storeFormData}/>,
    'trending-locations': (
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
    ),
    'popular-vehicles': <PopularVehiclesWrapper companyId={pageData.id} />,
    'video-showcase': blogsData?.data ? <VideoShowcaseSection blogs={blogsData.data || []} /> : null,
    'market-insights': <MarketInsightsSection />,
    'testimonials': testimonialsData?.data ? <TestimonialsCarouselSection testimonials={testimonials} /> : null,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
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
      </div>
      <div id="section-automotive-featured-listings" data-editor-section="automotive-featured-listings" data-editor-component="AutomotiveFeaturedListingsWrapper">
        <AutomotiveFeaturedListingsWrapper companyId={pageData.id}/>
      </div>
      <div id="section-how-it-works" data-editor-section="how-it-works" data-editor-component="HowItWorks">
        <HowItWorks />
      </div>
      <div id="section-browse-by-category" data-editor-section="browse-by-category" data-editor-component="BrowseByCategory">
        <BrowseByCategory store={storeFormData}/>
      </div>
      <div id="section-trending-locations" data-editor-section="trending-locations" data-editor-component="TrendingLocations">
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
      </div>      
      <div id="section-popular-vehicles" data-editor-section="popular-vehicles" data-editor-component="PopularVehiclesWrapper">
        <PopularVehiclesWrapper companyId={pageData.id} />
      </div>
      {blogsData?.data && (
        <div id="section-video-showcase" data-editor-section="video-showcase" data-editor-component="VideoShowcaseSection">
          <VideoShowcaseSection blogs={blogsData.data || []} />
        </div>
      )}
      <div id="section-market-insights" data-editor-section="market-insights" data-editor-component="MarketInsightsSection">
        <MarketInsightsSection />
      </div>
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
          <TestimonialsCarouselSection testimonials={testimonials} />
        </div>
      )}
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
