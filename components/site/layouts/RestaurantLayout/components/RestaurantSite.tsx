"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { HeroSlide } from "@/types/typings";

// New type definition based on the Prisma Banner model
// export type Banner = {
//   id: string;
//   imageUrl: string;
//   headline?: string | null;
//   subline?: string | null;
//   ctaText?: string | null;
//   ctaLink?: string | null;
//   videoLink?: string | null;
//   badgeText?: string | null;
//   price?: string | null;
//   endsAt?: Date | null;
//   order?: number;
//   iconKey?: string | null;
//   backgroundColor?: string | null;
//   textColor?: string | null;
// };

// Define types for the data expected from StoreContext
export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  themeSettings?: ThemeSettings;
  banners?: HeroSlide[]; // Use the new HeroSlide type for the hero slider
};

// Mock slider data for demonstration and as a fallback
const defaultSliderItems: HeroSlide[] = [
  {
    id: "1",
    headline: "Mouth-Watering Truffle Pasta",
    subline: "A creamy, decadent pasta dish you won't forget.",
    imageUrl: "https://images.unsplash.com/photo-1543360641-f09b2e0e9803?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    productImageUrl: "https://images.unsplash.com/photo-1543360641-f09b2e0e9803?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ctaText: "Order Now",
    ctaLink: "/menu/truffle-pasta",
    badgeText: "NEW MENU ITEM",
    companyId: "",
    type: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null
  },
  {
    id: "2",
    headline: "Fresh Catch of the Day",
    subline: "Locally sourced seafood, prepared with a zesty lemon-herb marinade.",
    imageUrl: "https://images.unsplash.com/photo-1579227129535-64d1f2e96d38?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    productImageUrl: "https://images.unsplash.com/photo-1579227129535-64d1f2e96d38?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ctaText: "View Today's Special",
    ctaLink: "/specials",
    badgeText: "DAILY SPECIAL",
    companyId: "",
    type: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null
  },
  {
    id: "3",
    headline: "Signature Cocktails & Bites",
    subline: "Join us from 4-6 PM for amazing deals on drinks and appetizers!",
    imageUrl: "https://images.unsplash.com/photo-1551030230-c3d38e7894a4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    productImageUrl: "https://images.unsplash.com/photo-1551030230-c3d38e7894a4?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ctaText: "See Happy Hour Menu",
    ctaLink: "/happy-hour",
    badgeText: "HAPPY HOUR",
    companyId: "",
    type: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null
  },
];

// Optimized image loader for Next.js Image component
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

interface RestaurantHeroProps {
  heroSlides?: HeroSlide[];
  themeSettings?: Record<string, any> | null;
  slug?: string;
}

export default function RestaurantHero({ heroSlides, themeSettings, slug }: RestaurantHeroProps) {
  // const { storeFormData } = useStoreContext();


  // Determine the slider items to use, sorting by 'order' and falling back to default
  // const sortedBanners = heroSlides
  //   ? [...heroSlides].sort((a, b) => (a.order || 0) - (b.order || 0))
  //   : [];
  const sliderItems = heroSlides && heroSlides.length > 0 ? heroSlides : defaultSliderItems;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (sliderItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === sliderItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderItems.length]);

  const primaryColor = themeSettings?.primaryColor || "#FF5722";
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5";
  const restaurantSlug = slug || "restaurant-slug";

  const currentItem = sliderItems[currentIndex];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://placehold.co/1920x1080/CCCCCC/333333?text=Image+Error";
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Slider with Overlay */}
      <AnimatePresence>
        <motion.div
          key={currentItem.id}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Image
            src={currentItem.productImageUrl || currentItem.imageUrl ||  "https://images.unsplash.com/photo-1543360641-f09b2e0e9803?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
            alt={currentItem.headline || "Hero Image"}
            fill
            className="object-cover brightness-[0.7] saturate-125"
            loader={loader}
            priority
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center text-white px-4 max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        {currentItem.badgeText && (
          <motion.span
            className="px-3 py-1 rounded-full text-xs font-semibold mb-2 inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            style={{ backgroundColor: currentItem.backgroundColor || "#dc2626", color: currentItem.textColor || "white" }}
          >
            {currentItem.badgeText}
          </motion.span>
        )}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-4"
          key={currentItem.headline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {currentItem.headline}
        </motion.h1>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl mb-8 font-light text-white/90 drop-shadow-lg"
          key={currentItem.subline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          {currentItem.subline}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {currentItem.ctaLink && currentItem.ctaText && (
            <Link
              href={currentItem.ctaLink.startsWith('/') ? `/${restaurantSlug}${currentItem.ctaLink}` : `/${restaurantSlug}/${currentItem.ctaLink}`}
              className="px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              style={{ backgroundColor: primaryColor, color: "white" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = secondaryColor)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
            >
              {currentItem.ctaText}
            </Link>
          )}
          <Link
            href={`/${restaurantSlug}/menu`}
            className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            View Full Menu
          </Link>
        </motion.div>
      </motion.div>

      {currentItem.videoLink && (
        <motion.button
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-white text-lg font-semibold hover:text-opacity-80 transition-colors duration-300 group z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <PlayCircleIcon className="h-10 w-10 text-white group-hover:text-yellow-400 transition-colors duration-300" />
          <span>Watch Our Story</span>
        </motion.button>
      )}
    </section>
  );
}