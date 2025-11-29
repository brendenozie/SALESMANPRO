"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";
import Testimonials from "./components/TestimonialsSection";
import Hero from "./components/HeroSection";
import FilterBar from "./components/FilterBarSection";
import Listings from "./components/ListingsSection";
import MarketInsights from "./components/MarketInsightsSection";
import MeetAgents from "./components/MeetAgentsSection";
import MobileAppPromo from "./components/MobileAppPromoSection";
import NewsletterSignup from "./components/NewsletterSignupSection";
import TrendingLocations from "./components/TrendingLocationsSection";
import VirtualTours from "./components/VirtualToursSection";

// Sample store & travel data
const store = {
  name: "Wanderlust Travels",
  slug: "wanderlust-travels",
  description: "Discover breathtaking destinations and immersive experiences worldwide.",
  bannerUrl: "/images/travel-hero.jpg",
  categories: [
  { id: 1, name: "Beaches", icon: "https://example.com/icons/beach.svg" },
  { id: 2, name: "Mountains", icon: "https://example.com/icons/mountain.svg" },
  { id: 3, name: "Cities", icon: "https://example.com/icons/city.svg" },
  { id: 4, name: "Adventure", icon: "https://example.com/icons/adventure.svg" },
  { id: 5, name: "Cruises", icon: "https://example.com/icons/cruise.svg" },
  { id: 6, name: "Wellness", icon: "https://example.com/icons/wellness.svg" },
  ],
  featured: [
  { id: "d1", name: "Maldives Getaway", subtitle: "Crystal clear waters & private villas", imageUrl: "/destinations/maldives.jpg" },
  { id: "d2", name: "Swiss Alps Escape", subtitle: "Snow-capped peaks & cozy chalets", imageUrl: "/destinations/alps.jpg" },
  { id: "d3", name: "Tokyo Explorer", subtitle: "Vibrant city life & cultural wonders", imageUrl: "/destinations/tokyo.jpg" },
  ],
  testimonials: [
  { quote: "An unforgettable journey!", author: "Alex P." },
  { quote: "Perfectly curated experiences.", author: "Maria S." },
  { quote: "Wanderlust made my dream trip come true.", author: "Javier L." },
  ],
  faqs: [
  { question: "Do you offer customizable itineraries?", answer: "Yes, tailor every detail to your preferences." },
  { question: "What is your cancellation policy?", answer: "Full refund up to 14 days before departure." },
  { question: "Are group discounts available?", answer: "Yes, for parties of 5 or more travelers." },
  ],
  };
    
  const travelTypes = ['Adventure', 'Relaxation', 'Cultural', 'Family'];
  const regions = ['Europe', 'Asia', 'South America', 'Africa', 'Oceania'];
  
  // data/listings.ts
  export interface Listing {
    id: string
    title: string
    thumbnail: string
    price: number
    beds: number
    baths: number
    area: number
    badge?: 'New' | 'Hot' | 'Price Reduced'
  }
  
  export const listings: Listing[] = [
    {
      id: '1',
      title: 'Tropical Bali Getaway',
      thumbnail: '/assets/bali.jpg',
      price: 1200,
      beds: 1,
      baths: 1,
      area: 500,
      badge: 'Hot',
    },
    {
      id: '2',
      title: 'Alpine Ski Retreat',
      thumbnail: '/assets/alps.jpg',
      price: 2500,
      beds: 3,
      baths: 2,
      area: 1200,
      badge: 'New',
    },
    {
      id: '3',
      title: 'Santorini Sunset Villa',
      thumbnail: '/assets/santorini.jpg',
      price: 3200,
      beds: 2,
      baths: 2,
      area: 900,
    },
    {
      id: '4',
      title: 'Safari Lodge Adventure',
      thumbnail: '/assets/safari.jpg',
      price: 1800,
      beds: 2,
      baths: 2,
      area: 1100,
      badge: 'Price Reduced',
    },
    // …add as many as you like
  ]
  
  
  
  // data/trendingLocations.ts
  export interface TrendingLocation {
    id: string
    name: string
    image: string
    listingsCount: number
    avgPrice: number
  }
  
  export const trendingLocations: TrendingLocation[] = [
    {
      id: 'tokyo',
      name: 'Tokyo, Japan',
      image: '/assets/trending/tokyo.jpg',
      listingsCount: 342,
      avgPrice: 2200,
    },
    {
      id: 'bali',
      name: 'Bali, Indonesia',
      image: '/assets/trending/bali.jpg',
      listingsCount: 289,
      avgPrice: 1250,
    },
    {
      id: 'paris',
      name: 'Paris, France',
      image: '/assets/trending/paris.jpg',
      listingsCount: 410,
      avgPrice: 3000,
    },
    {
      id: 'cape-town',
      name: 'Cape Town, South Africa',
      image: '/assets/trending/capetown.jpg',
      listingsCount: 157,
      avgPrice: 1400,
    },
    // …more locations
  ]
  
  // data/virtualTours.ts
  export interface VirtualTour {
    id: string
    title: string
    thumbnail: string
    videoUrl: string
  }
  
  // components/VirtualTourCard.tsx
  interface Props {
    tour: VirtualTour
    onOpen: (videoUrl: string) => void  
    loc: TrendingLocation;
    listing: Listing;
    testimonial: Testimonial;
    agent: Agent
  }
  
  
  export const virtualTours: VirtualTour[] = [
    {
      id: 'tour1',
      title: 'Eiffel Tower 360° Tour',
      thumbnail: '/assets/tours/eiffel.jpg',
      videoUrl: 'https://www.youtube.com/embed/Scxs7L0vhZ4',
    },
    {
      id: 'tour2',
      title: 'Santorini Cliffside Villa',
      thumbnail: '/assets/tours/santorini-villa.jpg',
      videoUrl: 'https://www.youtube.com/embed/aqz-KE-bpKQ',
    },
    {
      id: 'tour3',
      title: 'Amazon Rainforest Lodge',
      thumbnail: '/assets/tours/amazon.jpg',
      videoUrl: 'https://www.youtube.com/embed/5qap5aO4i9A',
    },
  ]
  
  // data/agents.ts
  export interface Agent {
    id: string
    name: string
    photo: string
    specialty: string
    experience: number  // years
  }
  
  export const agents: Agent[] = [
    {
      id: 'a1',
      name: 'Sophia Lin',
      photo: '/assets/agents/sophia.jpg',
      specialty: 'Cultural Tours',
      experience: 8,
    },
    {
      id: 'a2',
      name: 'Liam Carter',
      photo: '/assets/agents/liam.jpg',
      specialty: 'Adventure Travel',
      experience: 5,
    },
    {
      id: 'a3',
      name: 'Aria Patel',
      photo: '/assets/agents/aria.jpg',
      specialty: 'Luxury Escapes',
      experience: 10,
    },
    {
      id: 'a4',
      name: 'Ethan Zhao',
      photo: '/assets/agents/ethan.jpg',
      specialty: 'Family Trips',
      experience: 6,
    },
    // …more agents
  ]
  // components/AgentCard.tsx
  
  
  // data/insights.ts
  
  export interface RegionCost {
    id: string
    region: string
    avgCost: number
    icon: string   // any icon name or image path
  }
  
  export interface BlogPost {
    id: string
    title: string
    url: string
    date: string
  }
  
  export const regionCosts: RegionCost[] = [
    { id: 'r1', region: 'Europe',     avgCost: 2500, icon: '/assets/icons/europe.svg' },
    { id: 'r2', region: 'Asia',       avgCost: 1800, icon: '/assets/icons/asia.svg' },
    { id: 'r3', region: 'Americas',   avgCost: 2200, icon: '/assets/icons/americas.svg' },
    { id: 'r4', region: 'Oceania',    avgCost: 3000, icon: '/assets/icons/oceania.svg' },
  ]
  
  export const blogPosts: BlogPost[] = [
    { id: 'b1', title: 'Top 10 Hidden Gems in Europe',         url: '/blog/europe-hidden-gems',    date: '2025-04-10' },
    { id: 'b2', title: 'How to Pack Light for Any Trip',       url: '/blog/pack-light',            date: '2025-05-02' },
    { id: 'b3', title: 'Family-Friendly Destinations 2025',    url: '/blog/family-destinations',   date: '2025-03-25' },
  ]
  
  // data/testimonials.ts
  export interface Testimonial {
    id: string
    name: string
    avatar: string
    quote: string
    role: string
  }
  
  export const testimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Emily Carter',
      avatar: '/assets/testimonials/emily.jpg',
      quote:
        'Booking my trip was a breeze! The virtual tours gave me confidence, and the experts answered all my questions.',
      role: 'Solo Traveler',
    },
    {
      id: 't2',
      name: 'Michael Nguyen',
      avatar: '/assets/testimonials/michael.jpg',
      quote:
        'Our family vacation was unforgettable. The featured tours and clear pricing options made planning stress-free.',
      role: 'Family of 4',
    },
    {
      id: 't3',
      name: 'Sara Lee',
      avatar: '/assets/testimonials/sara.jpg',
      quote:
        'I found hidden gems in Europe I never knew existed! The travel tips blog posts were pure gold.',
      role: 'Couple Traveler',
    },
  ]
  
  
  

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface TravelSiteProps {
  params: { storeFormData: any };
}

// const travelTypes = ["Adventure", "Relaxation", "Cultural", "Family"];
// const regions = ["Europe", "Asia", "South America", "Africa", "Oceania"];

export default function TravelSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const router = useRouter();
  const { storeFormData } = useStoreContext(); // Use for global theme settings only

  // Use pageData for all content
  const siteData = pageData || storeFormData;

  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(siteData?.StoreCategory || []);
    setFeatured(siteData?.marketplaceListings || []);
    setTestimonials(siteData?.testimonials || []);
    setFaqs(siteData?.faqs || []);
  }, [siteData]);

  // State for the search form is now managed here
  const [filters, setFilters] = useState<any>({
    destination: "",
    tripType: "Adventure Travel", // Set a default type
    date: "",
    guests: 2,
  });
  
  const handleSearch = (e: any) => {
    e.preventDefault();
    console.log("Searching with filters:", filters);
    // Add your search/navigation logic here
  };
  

  return (
    <div className="font-sans">
      {/* Hero Section  */}
      {/* <Hero storeFormData={storeFormData} /> */}
      <Hero 
        storeFormData={storeFormData}
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        trendingLocations={
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
      />
        {/* Filter Bar */}
        <FilterBar />

        {/* Listings Section */}
        <Listings listings={pageData?.marketplaceListings} slug={pageData?.slug}/>

        {/* Trending Locations */}
        <TrendingLocations />

        {/* Meet Agents */}
        <MeetAgents experts={pageData?.Expert} />

        {/* Market Insights */}
        <MarketInsights
          virtualTours={[]}//pageData?.virtualTours
          blogPosts={pageData?.blogs}
          regionCosts={[]}//pageData?.RegionCosts
        />

        {/* Virtual Tours */}
        <VirtualTours />

        {/* Testimonials */}
        <Testimonials />

        {/* Mobile App Promo */}
        <MobileAppPromo />

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Chat Button */}
        <motion.div whileHover={{ scale: 1.2 }} className="fixed bottom-8 right-8">
          <button className="bg-indigo-500 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-600 transition">
            💬
          </button>
        </motion.div>
    </div>
  );
}















