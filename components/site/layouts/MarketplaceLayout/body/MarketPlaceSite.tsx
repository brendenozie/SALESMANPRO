"use client";
import React, { useState, useEffect, useRef } from "react";
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

  return (
    <div>
      
       <HeroBanner storeFormData={siteData} />

       <CategoryCarousel store={siteData}  />

        <StorePageSection products={siteData.marketplaceListings} storeSlug={siteData.slug} />
          
        <ReviewsSection />

        {/* Promotions Section */}
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


export function HeaderV() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand & Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <Bars3CenterLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
          {/* Brand */}
          <div className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors">
            YourBrand
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, brands & more"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-6">
          <button className="relative p-2 hover:scale-110 transition-transform focus:outline-none">
            <ShoppingBagIcon className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              3
            </span>
          </button>

          <button className="relative p-2 hover:scale-110 transition-transform focus:outline-none">
            <BellIcon className="h-6 w-6 text-gray-700" />
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              5
            </span>
          </button>

          <button className="p-2 hover:scale-110 transition-transform focus:outline-none">
            <UserCircleIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="lg:hidden px-6 pb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products, brands & more"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </header>
  );
}



// Review Widget
export function ReviewWidget({ averageScore, breakdown, reviews }:any) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 space-y-8">
      {/* Average Score */}
      <div className="flex items-center space-x-6">
        <motion.div
          className="text-6xl font-extrabold text-indigo-700"
          initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.6 }}
        >{averageScore.toFixed(1)}</motion.div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {i < Math.round(averageScore) ? (
                <StarSolid className="h-7 w-7 text-amber-500 drop-shadow" />
              ) : (
                <StarOutline className="h-7 w-7 text-gray-300" />
              )}
            </motion.div>
          ))}
        </div>
        <span className="text-gray-500 text-lg">out of 5</span>
      </div>

      {/* Breakdown Bars */}
      <div className="space-y-4">
        {([5,4,3,2,1]).map(star => {
          const pct = breakdown[star] || 0;
          return (
            <div key={star} className="flex items-center space-x-4">
              <span className="w-8 text-gray-700 font-medium">{star}★</span>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="w-12 text-right text-gray-600 font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((r:any, idx:any) => (<ReviewItem key={idx} review={r} />))}
      </div>
    </div>
  );
}

function ReviewItem({ review }:any) {
  const [expanded, setExpanded] = useState(false);
  const { user, date, rating, comment, avatarUrl } = review;
  const truncated = comment.length > 100 && !expanded;
  return (
    <motion.div className="flex space-x-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
      <motion.img
        src={avatarUrl || '/avatar-placeholder.png'}
        alt={user}
        className="w-14 h-14 rounded-full shadow-inner"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-inner space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">{user}</span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < rating ? 'text-amber-500' : 'text-gray-300'}>
              <StarSolid className="h-5 w-5" />
            </span>
          ))}
        </div>
        <p className="text-gray-700 text-sm">
          {truncated ? comment.slice(0, 100) + '…' : comment}
        </p>
        {comment.length > 100 && (
          <button onClick={() => setExpanded(!expanded)} className="text-indigo-600 text-xs hover:underline">
            {expanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Mini Cart Preview
export function MiniCartPreview({ items, subtotal, onClose }:any) {
  return (
    <motion.div
      className="relative bg-white rounded-3xl shadow-2xl w-80 p-6 flex flex-col space-y-6"
      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-bold text-gray-900">Your Cart</h5>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition">
          <XMarkIcon className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {items.slice(0, 3).map((item:any, i:any) => (
          <motion.div key={i} className="flex items-center space-x-3" whileHover={{ x: 10 }}>
            <img src={item.thumbnail} alt={item.name} className="w-12 h-12 object-cover rounded-xl shadow-inner" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.qty}</p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</span>
              <button className="p-1 rounded-full hover:bg-red-50 transition">
                <TrashIcon className="w-5 h-5 text-red-400 hover:text-red-600" />
              </button>
            </div>
          </motion.div>
        ))}
        {items.length > 3 && (
          <motion.div className="text-center text-sm text-gray-500" whileHover={{ scale: 1.05 }}>
            +{items.length - 3} more items
          </motion.div>
        )}
      </div>

      {/* Subtotal & Actions */}
      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-4">
          <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition">
            View Cart
          </button>
          <button className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:brightness-110 transition">
            Checkout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
