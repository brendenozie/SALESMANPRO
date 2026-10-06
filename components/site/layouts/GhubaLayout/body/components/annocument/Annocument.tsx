"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Make sure to have a fallback image in your assets or use a standard placeholder
// import load from "@/assets/load.png"; 

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop";

const loaderProp = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  const params = [`w=${width || 800}`];
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

// Extracted into a separate component so each banner manages its own image error state
const BannerCard = ({ item }: { item: any }) => {
  const [imgError, setImgError] = useState(false);

  // Map the flexible data structure (supports both IPromotion and HeroSlide formats)
  const title = item.title || item.headline || "Special Offer";
  const description = item.description || item.subline || "Don't miss out on our exclusive deals.";
  const imageSrc = item.bannerUrl || item.imageUrl || FALLBACK_IMAGE;
  const link = item.ctaLink || "#";

  return (
    <Link href={link} className="block w-full h-full">
      <div className="relative group overflow-hidden rounded-2xl shadow-xl h-80 border border-yellow-400/30 transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20">
        <Image decoding="async"
          src={imgError ? FALLBACK_IMAGE : imageSrc}
          alt={`Promotional banner: ${title}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
          onError={() => setImgError(true)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        
        {/* Content */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          {item.badgeText && (
            <span className="inline-block px-2 py-1 mb-3 text-[10px] font-black uppercase tracking-widest text-black bg-yellow-400 rounded-sm">
              {item.badgeText}
            </span>
          )}
          <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 drop-shadow-md mb-2 group-hover:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-200 dark:text-gray-300 text-sm md:text-base line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

const Announcement = ({ pageData }: { pageData?: any }) => {
  // Sample fallback data using the unified data structure
  const defaultBanners = [
    {
      title: "Special Deals",
      description: "Don’t miss out on our exclusive offers! Hand-picked items just for you.",
      bannerUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=1000&auto=format&fit=crop",
      ctaLink: "/shop",
      badgeText: "Limited Time"
    },
    {
      title: "New Arrivals",
      description: "Hurry up! Grab your favorite new items now before they run out.",
      bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
      ctaLink: "/shop/new",
      badgeText: "Just Dropped"
    },
  ];

  // Safely extract promotions, falling back to heroSlides if promotions aren't explicitly defined, 
  // and finally falling back to the default data.
  const promotionsData = 
    pageData?.promotions?.length > 0 ? pageData.promotions 
    : pageData?.heroSlides?.length > 0 ? pageData.heroSlides.slice(0, 2) 
    : defaultBanners;

  // We only want to display 2 banners maximum to fit the grid design
  const displayBanners = promotionsData.slice(0, 2);

  if (!displayBanners || displayBanners.length === 0) return null;

  return (
    <section className="py-14 px-6 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-[#080808] dark:via-zinc-900 dark:to-[#080808] text-gray-900 dark:text-white transition-colors duration-500">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {displayBanners.map((banner: any, index: number) => (
          <BannerCard key={banner.id || index} item={banner} />
        ))}
      </div>
    </section>
  );
};

export default Announcement;