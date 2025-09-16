"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import FeaturedVehicleSection from "./components/FeaturedVehicleSection";
import HeroSection from "./components/HeroSection";
import TrendingLocations from "./components/TrendingLocationsSection";
import VideoShowcaseSection from "./components/VideoShowcaseSection";
import FilterBarSection from "./components/FilterBarSection";
import MarketInsightsSection from "./components/MarketInsightsSection";
// import Testimonials from "./components/TestimonialsSection";
import BrowseByCategory from "./components/BrowseByCategorySection";
import FeaturedListings from "./components/FeaturedListingsSection";
import HowItWorks from "./components/HowItWorksSection";
import TestimonialsCarouselSection from "./components/TestimonialsCarouselSection";

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
]






export default function AutomotiveSite() {
  const { storeFormData } = useStoreContext();
  const [promos, setPromos] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<VehicleCardProps[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  
  // marketplaceListings from storeFormData → map to VehicleCardProps
  const listings = storeFormData?.marketplaceListings || [];

  useEffect(() => {
    // Pull promotions from storeFormData.promotions
    setPromos(storeFormData?.promotions || []);


    // const formattedVehicles: VehicleCardProps[] = listings.map((listing: any) => ({
    //   id: listing.id,
    //   make: listing.product.brand || "Unknown",
    //   model: listing.product.name,
    //   year: new Date().getFullYear(), // or derive from listing if available
    //   price: listing.finalPrice,
    //   image: listing.images[0] || "/assets/placeholder.png",
    //   type: listing.product.color || "Vehicle",
    //   mileage: listing.product.size ? Number(listing.product.size) : 0, // fallback if size used as mileage
    //   badge: listing.isFeatured ? "Hot" : undefined,
    // }));
    // setVehicles(formattedVehicles);

    // Testimonials from storeFormData.testimonials
    setTestimonials(storeFormData?.testimonials || []);
  }, [storeFormData]);

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
      {storeFormData?.blogs && <VideoShowcaseSection blogs={storeFormData?.blogs || []} />}

      <MarketInsightsSection />

      <TestimonialsCarouselSection  testimonials={storeFormData?.testimonials || []} />

      {/* <PromotionSection/> */}

      {/* <AppPromoSection /> */}
    </div>
  );
}

