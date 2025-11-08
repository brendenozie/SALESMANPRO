'use client';

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

// Above-the-fold components - statically imported
import HeroSection from "./components/HeroSection";

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const FeaturedListings = dynamic(() => import('./components/FeaturedListingsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const HowItWorks = dynamic(() => import('./components/HowItWorksSection'), { loading: () => <SectionSkeleton />, ssr: false });
const BrowseByCategory = dynamic(() => import('./components/BrowseByCategorySection'), { loading: () => <SectionSkeleton />, ssr: false });
const FilterBarSection = dynamic(() => import('./components/FilterBarSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TrendingLocations = dynamic(() => import('./components/TrendingLocationsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FeaturedVehicleSection = dynamic(() => import('./components/FeaturedVehicleSection'), { loading: () => <SectionSkeleton />, ssr: false });
const VideoShowcaseSection = dynamic(() => import('./components/VideoShowcaseSection'), { loading: () => <SectionSkeleton />, ssr: false });
const MarketInsightsSection = dynamic(() => import('./components/MarketInsightsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsCarouselSection = dynamic(() => import('./components/TestimonialsCarouselSection'), { loading: () => <SectionSkeleton />, ssr: false });

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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

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

  return (
    <div className="space-y-24 font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      {/* Hero */}
      <HeroSection
        store={storeFormData}
        trendingLocations={storeFormData?.CompanyLocation
          ? storeFormData?.CompanyLocation.map((loc: any) => ({
            // Map/transform to Location type as needed
            name: loc.name,
            slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
            metaKeywords: loc.metaKeywords || "",
            status: loc.status || "active",
            parentId: loc.parentId || null,
            // Spread any additional fields if needed
            ...loc,
          }))
          : []} 
          filters={undefined} setFilters={function (filters: any): void {

          } } 
          onSearch={function (e: React.FormEvent): void {
            
          } }    
      />

      <FeaturedListings listings={listings} slug=""/>

      <HowItWorks />

      <BrowseByCategory store={ storeFormData }/>

      <FilterBarSection  
        store={storeFormData}
        trendingLocations={storeFormData?.CompanyLocation
          ? storeFormData?.CompanyLocation.map((loc: any) => ({
            // Map/transform to Location type as needed
            name: loc.name,
            slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
            metaKeywords: loc.metaKeywords || "",
            status: loc.status || "active",
            parentId: loc.parentId || null,
            // Spread any additional fields if needed
            ...loc,
          }))
          : []} 
          filters={undefined} setFilters={function (filters: any): void {

          } } 
          onSearch={function (e: React.FormEvent): void {
            
          } }    
        />

      {/* Trending Locations Section */}
      <TrendingLocations
        locations={
          storeFormData?.CompanyLocation
            ? storeFormData?.CompanyLocation.map((loc: any) => ({
                // Map/transform to Location type as needed
                name: loc.name,
                slug: loc.slug || loc.name?.toLowerCase().replace(/\s+/g, "-"),
                metaKeywords: loc.metaKeywords || "",
                status: loc.status || "active",
                parentId: loc.parentId || null,
                // Spread any additional fields if needed
                ...loc,
              }))
            : []
        }
        slug={"slug"}
      />      

      {/* Featured Vehicles */}
      <FeaturedVehicleSection  listings={listings} slug=""/>

      {/* If videos are stored under latestVideos */}
      {blogsData?.data && <VideoShowcaseSection blogs={blogsData.data || []} />}

      <MarketInsightsSection />

      {testimonialsData?.data && <TestimonialsCarouselSection  testimonials={testimonials} />}

    </div>
  );
}

