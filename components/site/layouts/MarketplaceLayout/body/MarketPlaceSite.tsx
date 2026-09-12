"use client";
import React, { useState, useEffect, useRef } from "react";
import { ThemeSectionContainer } from "@/lib/website-builder/createThemeSectionAdapter";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon,XMarkIcon, TrashIcon , StarIcon as StarSolid, StarIcon as StarOutline, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShoppingBagIcon, StarIcon, UserIcon,  BellIcon, UserCircleIcon, Bars3CenterLeftIcon, MagnifyingGlassCircleIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import HeroBanner from "./components/HeroSection";
import CategoryCarousel from "./components/CategorySection";
import StorePageSection from "./components/StorePageSection";
import { StoreForm } from "@/types/typings";
import ReviewsSection from "./components/ReviewsSection";
import { useStoreContext } from "@/contexts/StoreContext";

// Sample store data
const store = {
  name: "Urban Shop Hub",
  slug: "urban-shop-hub",
  description: "Discover unique products from local artisans and top brands.",
  bannerUrl: "/images/marketplace-hero.jpg",
  categories: [
    { id: 1, name: "Home & Living", imageUrl: "/categories/home.jpg", slug: "home-and-living" },
    { id: 2, name: "Fashion", imageUrl: "/categories/fashion.jpg", slug: "fashion" },
    { id: 3, name: "Electronics", imageUrl: "/categories/electronics.jpg", slug: "electronics" },
    { id: 4, name: "Beauty", imageUrl: "/categories/beauty.jpg", slug: "beauty" },
    { id: 5, name: "Sports", imageUrl: "/categories/sports.jpg", slug: "sports" },
    { id: 6, name: "Toys", imageUrl: "/categories/toys.jpg", slug: "toys" },
  ],
  featured: [
    { id: "p1", name: "Handcrafted Ceramic Vase", price: 2500, imageUrl: "/products/vase.jpg", slug: "ceramic-vase" },
    { id: "p2", name: "Leather Weekend Bag", price: 4500, imageUrl: "/products/bag.jpg", slug: "weekend-bag" },
    { id: "p3", name: "Wireless Noise-Cancelling Headphones", price: 12000, imageUrl: "/products/headphones.jpg", slug: "headphones" },
    { id: "p4", name: "Organic Skincare Set", price: 3500, imageUrl: "/products/skincare.jpg", slug: "skincare-set" },
  ],
  promotions: [
    { title: "Summer Sale - Up to 50% Off", description: "Refresh your home with stylish decor.", bannerUrl: "/promos/summer-sale.jpg" },
    { title: "New Arrivals", description: "Check out the latest gadgets.", bannerUrl: "/promos/new-arrivals.jpg" },
  ],
  testimonials: [
    { quote: "Best marketplace with unique finds!", author: "Lisa M." },
    { quote: "Fast shipping and great quality.", author: "Carlos R." },
  ],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;



export default function MarketPlaceSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {

  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  
  // Use pageData for all content
  const siteData = pageData || storeFormData;
  
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [showMiniCart, setShowMiniCart] = useState(false);

  useEffect(() => {
    setCategories(store.categories);
    setFeatured(store.featured);
    setPromotions(store.promotions);
    setTestimonials(store.testimonials);
  }, []);


  const sectionMap: Record<string, React.ReactNode> = {
    'hero-banner': <HeroBanner storeFormData={siteData} />,
    'category': <CategoryCarousel store={siteData} />,
    'store-page': <StorePageSection products={siteData.marketplaceListings} storeSlug={siteData.slug} />,
    'reviews': <ReviewsSection />,
  };

  const staticFallback = (
    <>
      <div id="section-hero-banner" data-editor-section="hero-banner" data-editor-component="HeroBanner">
        <HeroBanner storeFormData={siteData} />
      </div>
      <div id="section-category" data-editor-section="category" data-editor-component="CategoryCarousel">
        <CategoryCarousel store={siteData} />
      </div>
      <div id="section-store-page" data-editor-section="store-page" data-editor-component="StorePageSection">
        <StorePageSection products={siteData.marketplaceListings} storeSlug={siteData.slug} />
      </div>
      <div id="section-reviews" data-editor-section="reviews" data-editor-component="ReviewsSection">
        <ReviewsSection />
      </div>
    </>
  );

  return (
    <div>
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
      <AnimatePresence>
        {showMiniCart && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 right-6 z-50 shadow-xl"
          >
            <MiniCartPreview
              items={[
                { name: "Handcrafted Ceramic Vase", qty: 1, price: 2500, thumbnail: "/products/vase.jpg" },
                { name: "Leather Weekend Bag", qty: 1, price: 4500, thumbnail: "/products/bag.jpg" },
                { name: "Wireless Headphones", qty: 1, price: 12000, thumbnail: "/products/headphones.jpg" },
              ]}
              subtotal={19000}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
