"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
// Assuming the following imports are necessary for context/types
// import { useStoreContext } from "@/contexts/StoreContext";
import { HeroSlide } from "@/types/typings"; 


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
    type: null, videoLink: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null,
    companyId: ""
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
    companyId: "", type: null, videoLink: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null
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
    companyId: "", type: null, videoLink: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null
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

// --- END: Mocked/Utility Code ---


interface RestaurantHeroProps {
  heroSlides?: HeroSlide[];
  themeSettings?: Record<string, any> | null;
  slug?: string;
}

const TRANSITION_DURATION = 1.2; // seconds
const SLIDE_INTERVAL = 5000; // milliseconds

export default function RestaurantHero({ heroSlides, themeSettings, slug }: RestaurantHeroProps) {

  const sliderItems = heroSlides && heroSlides.length > 0 ? heroSlides : defaultSliderItems;

  console.log("Slider Items:", sliderItems);

  // Use an index state and a "previous" index state for cross-fading
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(sliderItems.length - 1); // Start with the last one to simulate a loop

  useEffect(() => {
    if (sliderItems.length <= 1) return;
    
    const interval = setInterval(() => {
      // 1. Update the previous index to the current one
      setPrevIndex(currentIndex);
      
      // 2. Update the current index to the next one
      setCurrentIndex((prevIndex) =>
        prevIndex === sliderItems.length - 1 ? 0 : prevIndex + 1
      );
    }, SLIDE_INTERVAL); // 5 seconds

    return () => clearInterval(interval);
  }, [currentIndex, sliderItems.length]); // Re-run effect when currentIndex changes

  const primaryColor = themeSettings?.primaryColor || "#FF5722";
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5";
  const restaurantSlug = slug || "restaurant-slug";

  const currentItem = sliderItems[currentIndex];
  const prevItem = sliderItems[prevIndex];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src =
      "https://placehold.co/1920x1080/CCCCCC/333333?text=Image+Error";
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Image Slider with Cross-fade and Cinematic Zoom */}
      <div className="absolute inset-0 z-0">
        
        {/* Layer 1: Previous Image (Stays for fade-out) */}
        {prevItem.id !== currentItem.id && (
          <motion.div
            key={prevItem.id + "-prev"}
            className="absolute inset-0"
            // Start with full opacity
            initial={{ opacity: 1 }}
            // Fade out during transition
            animate={{ opacity: 0 }}
            // Transition duration should match the current image fade-in
            transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
          >
            <Image
              src={prevItem.imageUrl || prevItem.productImageUrl ||  defaultSliderItems[0].imageUrl || "https://"}
              alt={prevItem.headline || "Hero Image (Previous)"}
              fill
              className="object-cover brightness-[0.7] saturate-125"
              loader={loader}
              priority={false} // Only active image should be priority
              onError={handleImageError}
            />
          </motion.div>
        )}

        {/* Layer 2: Current Image (Fades in on top) */}
        <motion.div
          key={currentItem.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }} // Start slightly zoomed and fully transparent
          animate={{ opacity: 1, scale: 1 }}   // Fade in and zoom out subtly (Cinematic Effect)
          transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
        >
          <Image
            src={currentItem.imageUrl || currentItem.productImageUrl || defaultSliderItems[0].imageUrl || ""}
            alt={currentItem.headline || "Hero Image (Current)"}
            fill
            className="object-cover brightness-[0.7] saturate-125"
            loader={loader}
            // Use 'eager' for better first-load experience, but manage priority
            priority={true} 
            onError={handleImageError}
          />
        </motion.div>
        
        {/* Persistent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Hero Content (Uses AnimatePresence for a full content transition) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id + "-content"} // Key the content to force re-render/re-animate on slide change
          className="relative z-10 text-center text-white px-4 max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }} // Add an exit animation for content
          transition={{ duration: 0.5, ease: "easeOut" }} // Shorter content transition
        >
          {currentItem.badgeText && (
            <motion.span
              className="px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block tracking-wider uppercase"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{ 
                backgroundColor: currentItem.backgroundColor || primaryColor, 
                color: currentItem.textColor || "white",
                // Add a slight box shadow for badge pop
                boxShadow: `0 0 10px ${currentItem.backgroundColor || primaryColor}66`
              }}
            >
              {currentItem.badgeText}
            </motion.span>
          )}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {currentItem.headline}
          </motion.h1>

          <motion.p
            className="max-w-3xl mx-auto text-lg md:text-xl mb-10 font-light text-white/90 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {currentItem.subline}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {currentItem.ctaLink && currentItem.ctaText && (
              <Link
                href={currentItem.ctaLink.startsWith('/') ? `/${restaurantSlug}${currentItem.ctaLink}` : `/${restaurantSlug}/${currentItem.ctaLink}`}
                className="px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
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
              className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105 bg-white/10 hover:bg-white/30"
            >
              View Full Menu
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>


      {currentItem.videoLink && (
        <motion.button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-white text-base md:text-lg font-semibold hover:text-opacity-80 transition-colors duration-300 group z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <PlayCircleIcon className="h-8 w-8 md:h-10 md:w-10 text-white group-hover:text-yellow-400 transition-colors duration-300" />
          <span>Watch Our Story</span>
        </motion.button>
      )}
      
      {/* Navigation/Indicator Dots (New Feature for Engagement) */}
      <div className="absolute bottom-8 right-8 z-20 flex space-x-2">
        {sliderItems.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setPrevIndex(currentIndex);
              setCurrentIndex(index);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125 shadow-md' 
                : 'bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
    </section>
  );
}