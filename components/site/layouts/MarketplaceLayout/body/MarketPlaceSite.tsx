import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCartIcon,XMarkIcon, TrashIcon , StarIcon as StarSolid, StarIcon as StarOutline, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShoppingBagIcon, StarIcon, UserIcon,  BellIcon, UserCircleIcon, Bars3CenterLeftIcon, MagnifyingGlassCircleIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

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

export default function MarketplaceSite() {
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
    <div className="space-y-20 font-sans">
      
       <HeroBanner />

       <CategoryCarousel />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <FilterSidebar  
              categories={categories}
              onCategorySelect={(category:any) => router.push(`/${store.slug}/category/${category.slug}`)}
              onSearch={(query:any) => router.push(`/${store.slug}/search?q=${query}`)}
              filters={[
                { name: "Price", options: ["Under KES 1000", "KES 1000 - KES 5000", "KES 5000 - KES 10000", "Over KES 10000"] },
                { name: "Brand", options: ["Brand A", "Brand B", "Brand C"] },
                { name: "Rating", options: ["4 stars & up", "3 stars & up"] },
                { name: "Availability", options: ["In Stock", "Out of Stock"] },
              ]}
            />
          </div>
          {/* Product Grid */}
          <div className="w-full lg:w-3/4">
            <ProductGrid products={featured} />
          </div>
        </div>
      </div>

        <SellerProfileCard
          storeName={store.name}
          location="Nairobi, Kenya"
          rating={4.8}
          badge="Top Seller"
          avatarUrl="/images/store-avatar.jpg"
        />
        
      {/* Reviews Breakdown */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12 text-gray-800"
          >
            Store Ratings & Reviews
          </motion.h2>
          <ReviewWidget
            averageScore={4.5}
            breakdown={{
              "5 stars": 70,
              "4 stars": 20,
              "3 stars": 5,
              "2 stars": 3,
              "1 star": 2,
            }}
            reviews={[
              {
                user: "John D.",
                date: "2023-10-01",
                rating: 5,
                comment: "Amazing products and fast delivery!",
              },
              {
                user: "Sarah K.",
                date: "2023-09-28",
                rating: 4,
                comment: "Great selection, will shop again.",
              },
              {
                user: "Mike L.",
                date: "2023-09-20",
                rating: 3,
                comment: "Decent quality, but shipping took a while.",
              },
            ]}
          />
        </div>
      </section>

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

      <Footer />

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

/* 2. Hero Banner */

export function HeroBannerV() {
  return (
    <section className="relative h-[600px] overflow-hidden">
      <img
        src="https://via.placeholder.com/1600x600?text=Stylish+Sneakers+on+Urban+Steps"
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent flex flex-col items-center justify-center text-center px-4 text-white">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight animate-fadeInUp mb-4">
          Step Up Your Style
        </h1>
        <p className="text-lg sm:text-2xl font-light animate-fadeInUp delay-100 mb-8">
          Discover the latest arrivals made for movement
        </p>
        <div className="flex gap-4 animate-fadeInUp delay-200">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:brightness-110 transition">
            Shop New Arrivals
          </button>
          <a
            href="#learn-more"
            className="inline-flex items-center text-white/80 hover:text-white underline underline-offset-4"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}

function HeroBanner() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir:any) => {
    if (!carouselRef.current) return;
    const { clientWidth, scrollLeft } = carouselRef.current;
    const offset = dir === "left" ? -clientWidth : clientWidth;
    carouselRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
  };

  const products = [
    { id: 1, name: 'Urban Runner', img: '/images/runner.jpg' },
    { id: 2, name: 'Sky High', img: '/images/high.jpg' },
    { id: 3, name: 'Trail Blazer', img: '/images/trail.jpg' },
    { id: 4, name: 'Night Glide', img: '/images/night.jpg' },
    { id: 5, name: 'Street Pro', img: '/images/pro.jpg' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[600px] sm:h-[700px]">
        <Image
          src="/images/hero-banner.jpg"
          alt="Stylish Sneakers on Urban Steps"
          fill
          className="object-cover"
          loader={loader}
        />

        {/* Gradient Shapes */}
        <motion.div
          className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full filter blur-3xl opacity-50"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-red-400 rounded-full filter blur-2xl opacity-40"
          animate={{ y: [0, 30, 0], x: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
        />

        {/* Text Overlay */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white uppercase tracking-wide"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Step Up Your Style
          </motion.h1>
          <motion.p
            className="mt-4 text-lg sm:text-2xl text-gray-200 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Discover the latest arrivals made for movement
          </motion.p>
          <motion.div
            className="mt-8 flex space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <button className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-lg font-semibold shadow-xl hover:scale-105 transition">
              Shop New Arrivals
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full text-lg font-medium hover:bg-white hover:text-black transition">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>

      {/* Product Carousel */}
      <div className="mt-12 relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition"
        >
          <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-800" />
        </button>

        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory space-x-6 px-8 py-8 scrollbar-hide"
        >
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              className="min-w-[220px] snap-center bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={p.img}
                alt={p.name}
                width={240}
                height={160}
                className="object-cover"
                loader={loader}
              />
              <div className="p-4 text-center bg-gray-50">
                <h3 className="font-semibold text-lg mb-2">{p.name}</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition">
                  View Product
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3. Category Carousel */
function CategoryCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cats = [
    { icon: '👜', name: 'Bags' },
    { icon: '👟', name: 'Sneakers' },
    { icon: '⌚', name: 'Watches' },
    { icon: '🎧', name: 'Audio' },
    { icon: '💻', name: 'Tech' },
    { icon: '🕶️', name: 'Sunglasses' },
  ];
  const scroll = (dir:any) => {
    if (!carouselRef.current) return;
    const { clientWidth, scrollLeft } = carouselRef.current;
    const delta = dir === 'left' ? -clientWidth * 0.6 : clientWidth * 0.6;
    carouselRef.current.scrollTo({ left: scrollLeft + delta, behavior: 'smooth' });
  };

  return (
    <section className="relative py-12 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 bg-purple-200 rounded-full opacity-30 filter blur-2xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 filter blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <div className="container mx-auto relative py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Shop by Category
        </motion.h2>

        {/* Prev Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeftIcon className="h-6 w-6 text-indigo-600" />
        </button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex overflow-x-auto space-x-6 px-8 snap-x snap-mandatory scrollbar-hide py-8 "
        >
          {cats.map((c, i) => (
            <motion.div
              key={c.name}
              className="snap-center flex-shrink-0 w-32 flex flex-col items-center"
              whileHover={{ scale: 1.1, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white shadow-2xl"
                whileHover={{ rotate: -10 }}
                transition={{ duration: 0.3 }}
              >
                {c.icon}
              </motion.div>
              <span className="mt-4 text-lg font-medium text-gray-700">
                {c.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10 transition-colors"
          aria-label="Next"
        >
          <ChevronRightIcon className="h-6 w-6 text-purple-600" />
        </button>
      </div>
    </section>
  );
}

/* 6. Seller Profile Card */
export function SellerProfileCard({
  storeName,
  location,
  rating,
  badge,
  avatarUrl
}: any) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg p-6 flex items-center space-x-4 transform transition hover:-translate-y-2 hover:shadow-2xl">
      
      {/* Avatar */}
      <div className="relative">
        <img
          src={avatarUrl || 'https://via.placeholder.com/80'}
          alt={storeName}
          className="w-16 h-16 rounded-full ring-2 ring-indigo-500 object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 truncate">
          <span className="truncate">{storeName}</span>
          {badge && (
            <span className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold uppercase px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </h3>
        <p className="text-sm text-gray-500 truncate">{location}</p>

        {/* Rating */}
        <div className="mt-2 flex items-center text-sm text-gray-700">
          <StarIcon className="w-4 h-4 text-amber-500" />
          <span className="ml-1 font-medium">5</span>
          {/* {rating.toFixed(1)} */}
        </div>
      </div>

      {/* Visit Button */}
      <button
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium shadow-md transform transition active:scale-95"
      >
        Visit Store
      </button>
    </div>
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

/* Footer */
export function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-6 px-6">
        <div>
          <h6 className="font-semibold mb-2">About</h6>
          <p className="text-sm text-gray-600">We connect buyers with the newest trends.</p>
        </div>
        <div>
          <h6 className="font-semibold mb-2">Help</h6>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Support</li>
            <li>FAQ</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h6 className="font-semibold mb-2">Legal</h6>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
            <li>Cookies</li>
          </ul>
        </div>
        <div>
          <h6 className="font-semibold mb-2">Social</h6>
          <div className="flex gap-3">
            <span className="cursor-pointer">🌐</span>
            <span className="cursor-pointer">🐦</span>
            <span className="cursor-pointer">📘</span>
          </div>
          <div className="mt-4">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 border rounded-l-lg focus:outline-none"
            />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </div>
    </footer>
  );
}

// Filter Sidebar
export function FilterSidebar({ onClear, onApply, filters, setFilters }:any) {
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'];
  const colors = ['#000', '#fff', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <aside className="sticky top-24 w-64 bg-white p-6 shadow-2xl rounded-3xl space-y-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2">
        {/* Category */}
        <Details label="Category">
          {['Shoes','Bags','Accessories','Electronics'].map(cat => (
            <Checkbox key={cat} label={cat}  onChange={() => setFilters('category', cat)} />
            // checked={filters.category.includes(cat)}
          ))}
        </Details>

        {/* Price */}
        <Details label="Price">
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="500"
              value={filters.price}
              onChange={e => setFilters('price', e.target.value)}
              className="w-full h-1 bg-gray-200 rounded-lg accent-indigo-600"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>$0</span>
              <span>$500+</span>
            </div>
          </div>
        </Details>

        {/* Brand */}
        <Details label="Brand">
          {brands.map(b => (
            <Checkbox key={b} label={b} onChange={() => setFilters('brand', b)} />
            // checked={filters.brand.includes(b)} 
          ))}
        </Details>

        {/* Rating */}
        <Details label="Rating">
          {[5,4,3,2,1].map(r => (
            <Radio key={r} label={`${r} Stars & Up`} name="rating" checked={filters.rating===r} onChange={() => setFilters('rating', r)}>
              <div className="flex">
                {Array.from({ length: r }).map((_,i) => <StarSolid key={i} className="w-5 h-5 text-amber-500" />)}
              </div>
            </Radio>
          ))}
        </Details>

        {/* Colors */}
        <Details label="Color">
          <div className="flex flex-wrap gap-2">
            {colors.map(c => (
              <ColorSwatch key={c} color={c}  onClick={() => setFilters('colors', c)} />
              // selected={filters.colors.includes(c)}
            ))}
          </div>
        </Details>
      </div>

      <button
        onClick={onApply}
        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-semibold shadow-xl hover:scale-105 transition"
      >
        Apply Filters
      </button>
    </aside>
  );
}

// Product Grid & Card
export function ProductGrid({ products }:any) {
  return (
    <section >
      <div className="container mx-auto px-6">
        <motion.h2
          className="text-4xl font-extrabold text-center text-gray-800 mb-12"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8 }}
        >
          Popular Products
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((item:any) => <ProductCard key={item.id} {...item} />)}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ id, title, price, rating, image, badge='New' }:any) {
  const stars = Array.from({ length:5 }, (_,i) => i<Math.floor(rating)?'full':i<rating?'half':'empty');

  return (
    <motion.div
      className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer"
      whileHover={{ y:-10, boxShadow:'0px 20px 30px rgba(0,0,0,0.2)' }}
      transition={{ duration:0.3 }}
    >
      {/* Ribbon */}
      {badge && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">
          {badge}
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-64">
        <Image src={image} alt={title} fill className="object-cover" loader={loader}/>
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-gray-800 font-semibold">
          ${price.toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate-2">
          {title}
        </h3>
        <div className="flex items-center mb-4">
          {stars.map((type,i) => (
            <motion.div key={i} whileHover={{ scale:1.2 }}>
              {type==='full'?<StarSolid className="w-5 h-5 text-amber-500" />:
               type==='half'?<StarSolid className="w-5 h-5 text-amber-500 clip-half" />:
               <StarOutline className="w-5 h-5 text-gray-300" />}
            </motion.div>
          ))}
          <span className="ml-2 text-sm text-gray-600">5</span>
          {/* ({rating.toFixed(1)}) */}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full font-medium shadow-lg"
            whileHover={{ scale:1.05 }}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Add to Cart
          </motion.button>
          <motion.button
            whileHover={{ scale:1.1 }}
            className="p-2 bg-white rounded-full shadow-md"
          >
            <HeartIcon className="w-5 h-5 text-gray-500 hover:text-red-500" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Small UI primitives
function Details({ label, children }:any) {
  return (
    <details className="group">
      <summary className="flex justify-between items-center cursor-pointer text-gray-800 font-medium group-open:text-indigo-600">
        {label}
        <motion.span
          className="transition-transform rotate-0 group-open:rotate-180"
          initial={false}
          animate={{ rotate: children ? 180 : 0 }}
        >▼
        </motion.span>
      </summary>
      <div className="mt-3 pl-2 space-y-2">
        {children}
      </div>
    </details>
  );
}

function Checkbox({ label, checked, onChange }:any) {
  return (
    <label className="flex items-center space-x-2 text-gray-700">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-indigo-600 rounded transition" />
      <span>{label}</span>
    </label>
  );
}

function Radio({ label, name, checked, onChange, children }:any) {
  return (
    <label className="flex items-center space-x-2 text-gray-700">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 text-indigo-600 transition" />
      {children}
      <span>{label}</span>
    </label>
  );
}

function ColorSwatch({ color, selected, onClick }:any) {
  return (
    <div
      onClick={onClick}
      className={`w-8 h-8 rounded-full border-2 ${selected? 'border-indigo-600':''} cursor-pointer transition-transform transform hover:scale-110`}
      style={{ backgroundColor: color }}
    />
  );
}

