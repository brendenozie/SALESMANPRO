"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useStoreContext } from "@/contexts/StoreContext";
import PromotionSection from "../../DirectoryLayout/body/components/PromotionSection";
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
import AppPromoSection from "./components/AppPromoSection";

const vehicleTypes = ["Sedan", "SUV", "Truck", "Coupe", "Electric"];

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

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

// Sample data
const store = {
  name: "Elite Auto Hub",
  slug: "elite-auto",
  bannerUrl: "/images/auto-banner.jpg",
  promotions: [
    {
      title: "Summer Service Special",
      description: "20% off all maintenance services.",
      bannerUrl: "/promos/summer.jpg",
    },
    {
      title: "New Arrivals",
      description: "Explore the latest 2025 models.",
      bannerUrl: "/promos/arrivals.jpg",
    },
    {
      title: "Trade-In Bonus",
      description: "Get up to $2,000 trade-in bonus.",
      bannerUrl: "/promos/tradein.jpg",
    },
  ],
  products: [
    {
      id: "v1",
      name: "2025 Mustang GT",
      price: 4500000,
      imageUrl: "/cars/mustang.jpg",
      slug: "mustang-gt",
    },
    {
      id: "v2",
      name: "2025 Camaro ZL1",
      price: 5000000,
      imageUrl: "/cars/camaro.jpg",
      slug: "camaro-zl1",
    },
    {
      id: "v3",
      name: "2025 Tesla Model S",
      price: 7000000,
      imageUrl: "/cars/tesla.jpg",
      slug: "tesla-model-s",
    },
  ],
  testimonials: [
    {
      quote: "Best car-buying experience ever!",
      author: "Alex P.",
      avatarUrl: "/avatars/alex.jpg",
    },
    {
      quote: "Amazing service and great deals.",
      author: "Jamie L.",
      avatarUrl: "/avatars/jamie.jpg",
    },
  ],
};


const locations = [
  { id: 'la', name: 'Los Angeles', listings: 1245, avgPrice: 950000, img: '/assets/la.jpg' },
  { id: 'nyc', name: 'New York City', listings: 987, avgPrice: 1200000, img: '/assets/nyc.jpg' },
  { id: 'miami', name: 'Miami', listings: 756, avgPrice: 780000, img: '/assets/miami.jpg' },
  // …more
];

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

const regions = [
  { name: 'North America', avgPrice: 42000 },
  { name: 'Europe',       avgPrice: 38000 },
  { name: 'Asia Pacific', avgPrice: 30000 },
]

const blogPosts = [
  { id: 'buying-tips', title: '5 Tips for Negotiating Your Car Price', href: '/blog/buying-tips' },
  { id: 'lease-vs-finance', title: 'Lease vs. Finance: Which Is Right for You?', href: '/blog/lease-vs-finance' },
  { id: 'ev-guide', title: 'EV Buying Guide: What to Know Before You Shop', href: '/blog/ev-guide' },
]

const reviews = [
  {
    id: 1,
    name: 'Alex Morgan',
    avatar: '/assets/avatars/alex.jpg',
    quote: 'I found my perfect car in under 5 minutes. The process was seamless and fun!',
  },
  {
    id: 2,
    name: 'Jamie Lee',
    avatar: '/assets/avatars/jamie.jpg',
    quote: 'Great selection and amazing customer service. Highly recommend!',
  },
  {
    id: 3,
    name: 'Sam Patel',
    avatar: '/assets/avatars/sam.jpg',
    quote: 'The finance tools helped me understand my payments. Love this platform!',
  },
]

const screenshots = [
  '/assets/app-screen1.png',
  '/assets/app-screen2.png',
  '/assets/app-screen3.png',
]

const badgeColorMap = {
  New: 'bg-green-500',
  Hot: 'bg-red-500',
  'Price Reduced': 'bg-yellow-500',
};

export default function AutomotiveSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [promos, setPromos] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<VehicleCardProps[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    // Pull promotions from storeFormData.promotions
    setPromos(storeFormData.promotions || []);

    // marketplaceListings from storeFormData → map to VehicleCardProps
    const listings = storeFormData.marketplaceListings || [];
    const formattedVehicles: VehicleCardProps[] = listings.map((listing: any) => ({
      id: listing.id,
      make: listing.product.brand || "Unknown",
      model: listing.product.name,
      year: new Date().getFullYear(), // or derive from listing if available
      price: listing.finalPrice,
      image: listing.images[0] || "/assets/placeholder.png",
      type: listing.product.color || "Vehicle",
      mileage: listing.product.size ? Number(listing.product.size) : 0, // fallback if size used as mileage
      badge: listing.isFeatured ? "Hot" : undefined,
    }));
    setVehicles(formattedVehicles);

    // Testimonials from storeFormData.testimonials
    setTestimonials(storeFormData.testimonials || []);
  }, [storeFormData]);

  return (
    <div className="space-y-24 font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">

      {/* Hero */}
      <HeroSection bannerUrl={storeFormData.heroSlides?.[0]?.imageUrl || ""} />

      <FeaturedListings />

      <HowItWorks />

      <BrowseByCategory />
      
      {/* <Testimonials /> */}

      <FilterBarSection />

      <TrendingLocations />

      {/* If videos are stored under latestVideos */}
      {tours && <VideoShowcaseSection />}

      <MarketInsightsSection />

      <TestimonialsCarouselSection />

      {/* Featured Vehicles */}
      <FeaturedVehicleSection />

      {/* <PromotionSection/> */}

      {/* <AppPromoSection /> */}
    </div>
  );
}

