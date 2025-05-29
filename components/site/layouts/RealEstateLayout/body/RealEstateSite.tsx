import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import banner from "../../../../../assets/homebanner.png"
import { MapPinIcon, CurrencyDollarIcon, MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Sample store data (ideally fetched via API)
// Sample store data
const store = {
  name: "UrbanNest Realty",
  slug: "urbannest",
  description: "Find your perfect home with ease and style.",
  bannerUrl: banner.src,
  StoreCategory: [
    { id: 1, name: "Apartments", slug: "apartments", imageUrl: "/categories/apartment.jpg" },
    { id: 2, name: "Villas", slug: "villas", imageUrl: "/categories/villa.jpg" },
    { id: 3, name: "Offices", slug: "offices", imageUrl: "/categories/office.jpg" },
    { id: 4, name: "Land Plots", slug: "land-plots", imageUrl: "/categories/land.jpg" },
  ],
  products: [
    { id: "h1", name: "Luxury City Apartment", price: 8500000, imageUrl: "/properties/apartment1.jpg" },
    { id: "h2", name: "Beachside Villa", price: 15000000, imageUrl: "/properties/villa1.jpg" },
    { id: "h3", name: "Downtown Office Space", price: 6000000, imageUrl: "/properties/office1.jpg" },
    { id: "h4", name: "Private Land Plot", price: 3000000, imageUrl: "/properties/land1.jpg" },
    { id: "h5", name: "Modern Loft", price: 9500000, imageUrl: "/properties/loft1.jpg" },
    { id: "h6", name: "Suburban Family Home", price: 7000000, imageUrl: "/properties/home1.jpg" },
  ],
  testimonials: [
    { quote: "UrbanNest made finding our dream home a breeze!", author: "Alice K." },
    { quote: "Professional, transparent and efficient. Highly recommend!", author: "Brian M." },
    { quote: "Great selection of properties and friendly agents.", author: "Cindy L." },
  ],
  faqs: [
    { question: "Can I schedule a viewing?", answer: "Yes, book a viewing directly through the listing page." },
    { question: "Do you offer mortgage assistance?", answer: "We partner with top banks for mortgage support." },
    { question: "Is there a buyer's guarantee?", answer: "Yes, we offer a money-back guarantee within 7 days." },
  ],
  agents: [
    { id: 1, name: "Sarah M.", role: "Lead Agent", photoUrl: "/agents/sarah.jpg", rating: 4.8 },
    { id: 2, name: "David T.", role: "Senior Agent", photoUrl: "/agents/david.jpg", rating: 4.6 },
    { id: 3, name: "Emily R.", role: "Junior Agent", photoUrl: "/agents/emily.jpg", rating: 4.7 },
  ],
  metrics: [
    { id: 1, label: "Homes Sold This Month", value: 500 },
    { id: 2, label: "Visitors Online", value: 120 },
  ],
  awards: [
    { id: 1, name: "REALTOR® Association Member", iconUrl: "/badges/realtor.png" },
    { id: 2, name: "Top Rated 2024", iconUrl: "/badges/top-rated.png" },
  ],
  featuredListings :[
    {"id": 1, "image": "/images/house1.jpg", "price": 350000, "address": "123 Maple Street, Springfield", "beds": 3,
    "baths": 2, "sqft": 1800, "badge": "New"},
    {"id": 2, "image": "/images/house2.jpg", "price": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths":
    3, "sqft": 2500, "badge": "Hot"},
    {"id": 3, "image": "/images/house3.jpg", "price": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths":
    2.5, "sqft": 2000, "badge": "Price Reduced"}
  ],
  listings :[
    {"id": 1, "image": "/images/house1.jpg", "price": 350000, "address": "123 Maple Street, Springfield", "beds": 3,
    "baths": 2, "sqft": 1800, "badge": "New"},
    {"id": 2, "image": "/images/house2.jpg", "price": 550000, "address": "456 Oak Avenue, Metropolis", "beds": 4, "baths":
    3, "sqft": 2500, "badge": "Hot"},
    {"id": 3, "image": "/images/house3.jpg", "price": 450000, "address": "789 Pine Road, Centerville", "beds": 3, "baths":
    2.5, "sqft": 2000, "badge": "Price Reduced"}
  ],
  locations :  [
    {"id": 1, "name": "Downtown", "image": "/images/city1.jpg", "listings": 120, "avgPrice": 420000},
    {"id": 2, "name": "Uptown", "image": "/images/city2.jpg", "listings": 80, "avgPrice": 380000},
    {"id": 3, "name": "Riverside", "image": "/images/city3.jpg", "listings": 60, "avgPrice": 310000}
  ],
  blogPosts : [
    {"id": 1, "title": "5 Tips for First-Time Home Buyers", "link": "#"},
    {"id": 2, "title": "Market Trends: 2025 Housing", "link": "#"},
    {"id": 3, "title": "How to Stage Your Home", "link": "#"}
  ],
  };
  
const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateSite() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(true);

  useEffect(() => {
    // initialize if fetching from server
  }, []);

  const handleSearch = () => alert(`Searching in ${location} between KES ${minPrice} and KES ${maxPrice}`);
  const handleNewsletter = (e:any) => { e.preventDefault(); setShowNewsletter(false); /* send email */ };


  return (
    <div className=" font-sans text-gray-800">
      {/* Sticky Contact Agent Button */}
      <a
        href="https://wa.me/254712345678?text=Hi%20UrbanNest%20Realty,%20I%27d%20like%20to%20inquire%20about%20a%20listing"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl z-50"
      >
        <img src="/icons/whatsapp.svg" alt="Chat" className="h-6 w-6" />
      </a>

      {/* Hero Section */}
      <HeroSection
        location={location}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setLocation={setLocation}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        handleSearch={handleSearch}
      />

      <CategoriesSection categories={store.StoreCategory} />

      <FeaturedListings listings={store.featuredListings} storeSlug={store.slug} />

      <TrendingLocations locations={store.locations} storeSlug={store.slug} />

      <ListingsSection products={store.products} storeSlug={store.slug} />

        {/* Newsletter Signup */}
        {showNewsletter && (
          <NewsletterSection handleNewsletter={handleNewsletter} />
        )}
        
        <BlogSection posts={store.blogPosts} storeSlug={store.slug} />
      
        {/* Our Agents */}
        <AgentsSection agents={store.agents} />

        {/* Metrics & Awards */}
        <WhyChooseUs metrics={store.metrics} awards={store.awards} />
        
      {/* Testimonials Carousel */}
      <TestimonialsSection testimonials={store.testimonials} />
      
      {/* FAQs */}
      <FAQSection faqs={store.faqs} />

    </div>
  );
}

const variants = {
  fadeInUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

function HeroSection({ location, minPrice, maxPrice, setLocation, setMinPrice, setMaxPrice, handleSearch }:any) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Background Image + Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src={store.bannerUrl || "/images/realestate-hero.jpg"}
          alt="Decorative illustration" // decorative, so empty alt if purely decorative
          layout="fill"
          objectFit="cover"
          className="opacity-60 dark:opacity-30"
          aria-hidden="true"
          loader={loader}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-700 dark:to-teal-900" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl text-center px-4 sm:px-6 lg:px-8">
        {/* Main Heading */}
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold leading-tight text-gray-900 dark:text-white drop-shadow-lg"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
        >
          Find Your Perfect Stay
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-4 text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Search properties by location and price range to discover the ideal place to call home.
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={e => { e.preventDefault(); handleSearch(); }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-80 backdrop-blur-2xl rounded-2xl p-6 shadow-xl"
          variants={variants.fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.8 }}
          aria-label="Search properties form"
        >
          {/* Location Input */}
          <label className="relative flex items-center">
            <MapPinIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 absolute left-3" aria-hidden="true" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              aria-label="Location"
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 transition transform focus:scale-105"
            />
          </label>

          {/* Min Price Input */}
          <label className="relative flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 absolute left-3" aria-hidden="true" />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              aria-label="Minimum price"
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 transition transform focus:scale-105"
            />
          </label>

          {/* Max Price Input */}
          <label className="relative flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 text-emerald-500 dark:text-emerald-400 absolute left-3" aria-hidden="true" />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              aria-label="Maximum price"
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50 transition transform focus:scale-105"
            />
          </label>

          {/* Search Button */}
          <motion.button
            type="submit"
            className="md:col-span-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-teal-600 dark:to-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400 focus:ring-opacity-60"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search listings"
          >
            <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
            <span>Search</span>
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
}


function QuickSearch() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      className="sticky top-0 bg-white dark:bg-gray-800 p-4 shadow-md z-20">
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {/* Toggle, inputs, sliders - placeholders */}
        <button className="px-3 py-1 bg-blue-600 text-white rounded-full">Buy</button>
        <button
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">Rent</button>
        <input placeholder="Location" className="p-2 border rounded-lg flex-1 min-w-[150px] focus:ring-2" />
        <input type="number" placeholder="Min Price" className="p-2 border rounded-lg w-[120px]" />
        <input type="number" placeholder="Max Price" className="p-2 border rounded-lg w-[120px]" />
      </div>
    </motion.div>
  );
}

/*
Featured Listings Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Container: max-w-7xl, centered, padded with px-6, py-16.
   • Heading: text-4xl sm:text-5xl, font-extrabold, text-gray-900 dark:text-gray-100, mb-8.

2. Grid Layout:
   • Responsive: grid-cols-1 on mobile, 2-col sm, 3-col lg, gap-8.

3. Card UI & Imagery:
   • Card: bg-white dark:bg-gray-800, rounded-3xl, shadow-xl, overflow-hidden, focus-ring.
   • Image: h-64 aspect-video, object-cover, transition scale on hover.
   • Price & Badge: price in text-emerald-600, badge uses bg-amber-500 for high contrast.

4. Details & CTA:
   • Text: gray-700 dark:text-gray-300 for address and specs, spaced with space-y-1.
   • Button: full-width, gradient bg (emerald→teal), rounded-xl, uppercase font-medium, hover scale.

5. Micro-interactions & Animation:
   • Framer Motion: cards fade in on scroll (y-axis) and lift on hover (y:-8, shadow intensify).
   • Button: scale on hover/tap.

6. Accessibility:
   • role="button" & tabIndex="0" on card for keyboard.
   • focus-visible outline ring-2 ring-amber-500.
   • aria-labels on clickable elements.
*/

function FeaturedListings({ listings, storeSlug }:any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
          Featured Listings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item:any) => (
            <motion.div
              key={item.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 250 }}
              onClick={() => window.location.href = `/site/${storeSlug}/property/${item.id}`}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.address}
                  layout="fill"
                  objectFit="cover"
                  className="transform transition-transform duration-500 hover:scale-110"
                  loader={loader}
                />
                {item.badge && (
                  <span className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>

              <div className="p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    KES {item.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {item.address}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.beds} beds • {item.baths} baths • {item.sqft.toLocaleString()} sqft
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/site/${storeSlug}/property/${item.id}`; }}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label={`View details for ${item.address}`}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

  /*
Trending Locations Section Redesign

Design Decisions:

1. Section Styling:
   • Background: bg-gray-50 / dark:bg-gray-900 with py-16 px-6 for breathing room.
   • Heading: text-4xl sm:text-5xl font-extrabold text-gray-900 / dark:text-gray-100 centered mb-8.

2. Carousel Layout:
   • Uses horizontal scroll with snap alignment.
   • Flex container with space-x-6 pb-4 overflow-x-auto snap-x snap-mandatory.
   • Cards: snap-center to snap each card into view.

3. Card UI & Imagery:
   • Card: min-w-[220px] sm:min-w-[260px], rounded-3xl, overflow-hidden, shadow-lg.
   • Image: h-48 sm:h-56 w-full object-cover, transition-scale on hover.
   • Overlay: gradient-to-t from-black/60 to-transparent for text legibility.

4. Content & Badge:
   • Title: text-xl font-semibold text-white, mb-1.
   • Subtext: text-sm text-gray-200.
   • Badge: absolute top-4 left-4 bg-emerald-500 text-white text-xs uppercase px-3 py-1 rounded-full.

5. Micro-interactions & Animation:
   • Framer Motion: cards slide-in with opacity transition while in view.
   • Hover: card elevates (translateY -5px) and image scales (1.05).

6. Accessibility:
   • role="group" and tabIndex="0" on each card for keyboard.
   • focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500.
   • Alt text for images.
*/

function TrendingLocations({ locations, storeSlug }:any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-8">
          Trending Locations
        </h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {locations.map((loc:any) => (
            <motion.div
              key={loc.id}
              role="group"
              tabIndex={0}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="snap-center min-w-[220px] sm:min-w-[260px] relative rounded-3xl overflow-hidden shadow-lg bg-black/5 dark:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              onClick={() => window.location.href = `/site/${storeSlug}/location/${loc.id}`}
            >
              <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  layout="fill"
                  objectFit="cover"
                  className="transform transition-transform duration-500 group-hover:scale-105"
                  loader={loader}
                />
                <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs uppercase px-3 py-1 rounded-full">
                  {loc.listings} Listings
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {loc.name}
                </h3>
                <p className="text-sm text-gray-200">
                  Avg KES {loc.avgPrice.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

    /*
Categories Section Redesign

Design Decisions:
1. Typography & Layout:
   • Section Title: text-4xl (sm:text-5xl) font-extrabold, centered with generous bottom margin.
   • Grid: 2-col mobile, 3-col md, 4-col lg, with consistent gap-6 and px-6.

2. Card Styling & Imagery:
   • Cards: rounded-2xl, overflow-hidden, shadow-lg, bg-white dark:bg-gray-800.
   • Image: aspect-video, object-cover, hover-scale effect.
   • Overlay: gradient from transparent to rgba(0,0,0,0.6) with smooth fade-in on hover.
   • Title Badge: centered flex, uppercase, tracking-wide, bg-emerald-600 with padding, rounded-lg.

3. Micro-interactions & Animation:
   • Framer Motion: card scales on hover and slight lift animation on in-view.
   • Use whileInView={{ opacity:1, y:0 }} initial={{ opacity:0, y:20 }} transition per card.

4. Accessibility & Responsiveness:
   • Link is semantic and focus-visible ring-2 ring-amber-500.
   • Alt text for images.
   • Mobile-friendly touch area.
*/

function CategoriesSection({ categories }:any) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Property Types
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat:any) => (
            <Link key={cat.id} href={`/site/${cat.slug}`}>
              <motion.a
                className="block relative rounded-2xl overflow-hidden shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                aria-label={cat.name}
              >
                <div className="relative h-40 sm:h-48 w-full">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 hover:scale-110"
                    loader={loader}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-emerald-600 text-white text-sm uppercase tracking-wide rounded-lg">
                    {cat.name}
                  </span>
                </div>
              </motion.a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


/*
Listings Section Redesign

Design Decisions:

1. Typography & Layout:
   • Section Title: text-4xl sm:text-5xl font-extrabold, centered with mb-12.
   • Grid: 1-col mobile, 2-col md, 3-col lg with gap-8 and responsive px-6.

2. Card Design & Imagery:
   • Cards: white/dark backgrounds, rounded-3xl, overflow-hidden, shadow-xl.
   • Image: aspect-video (h-72), object-cover with smooth zoom on hover container.
   • Details: padded container with title and price, using emerald for price.

3. Micro-interactions & Animation:
   • Framer Motion: lift and shadow intensify on hover with spring transition.
   • Cards animate into view with fade-in and slight upward motion.

4. Accessibility & Responsiveness:
   • Entire card is clickable via onClick in motion.div with role="button" and tabIndex="0" for keyboard.
   • Focus-visible outline ring-2 ring-amber-500.
   • Alt text provided for images.
*/

function ListingsSection({ products, storeSlug }:any) {
  const router = useRouter();
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Listings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((prop:any) => (
            <motion.div
              key={prop.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/site/${storeSlug}/property/${prop.id}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-md hover:shadow-xl"
            >
              <div className="relative h-72 w-full overflow-hidden">
                <Image
                  src={prop.imageUrl}
                  alt={prop.name}
                  layout="fill"
                  objectFit="cover"
                  className="transform transition-transform duration-500 hover:scale-110"
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                />
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {prop.name}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                  KES {prop.price.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
Newsletter Signup Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900 for consistency.
   • Container: max-w-3xl centered with px-6 py-20.
   • Heading: text-4xl sm:text-5xl font-extrabold, text-gray-900 / dark:text-gray-100, mb-4.
   • Description: text-lg text-gray-700 / dark:text-gray-300, mb-8.

2. Form Layout & Inputs:
   • Flex layout on md+: input and button inline, stack on mobile.
   • Input: full-width, rounded-xl, bg-white / dark:bg-gray-800, border-2 border-gray-200 focus:ring-2 focus:ring-amber-500.
   • Button: gradient bg from emerald-500 to teal-400, uppercase font-semibold, rounded-xl, hover and tap animations.

3. Micro-interactions & Animation:
   • Framer Motion: section content fades in on scroll (opacity + y-axis).
   • Input & Button: hover scale for button, focus-visible outlines.

4. Accessibility:
   • aria-label on input and button.
   • Semantic <section>, <h2>, <p>, <form>.
   • Keyboard-focus friendly with focus-visible utilities.
*/

function NewsletterSection({ handleNewsletter }:any) {
  return (
    <motion.section
      className="bg-gray-50 dark:bg-gray-900 py-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Stay Updated
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Subscribe to our newsletter for the latest listings and market insights.
        </p>

        <form
          onSubmit={handleNewsletter}
          className="flex flex-col md:flex-row items-center gap-4 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            required
            aria-label="Email address"
            className="flex-1 w-full p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <motion.button
            type="submit"
            aria-label="Subscribe to newsletter"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-semibold uppercase py-4 px-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          >
            Subscribe
          </motion.button>
        </form>
      </div>
    </motion.section>
  );
}

/*
Agents Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900, py-20 for vertical rhythm.
   • Container: max-w-7xl mx-auto px-6 for consistent layout.
   • Heading: text-4xl sm:text-5xl font-extrabold, text-gray-900 / dark:text-gray-100, centered mb-12.

2. Grid Layout:
   • Responsive grid: 1-col on mobile, 2-col md, 3-col lg with gap-8.
   • Centered card alignment.

3. Card UI & Imagery:
   • Card: bg-white / dark:bg-gray-800, rounded-3xl, shadow-xl, p-6, focus-ring.
   • Portrait: rounded-full frame with ring-2 ring-amber-500 focus-ring, h-32 w-32.
   • Details: agent name, role in emerald-600, rating badge.

4. Micro-interactions & Animation:
   • Framer Motion: entry fade-in and slight lift on hover (scale 1.03).
   • Rating badge pulse animation for emphasis.

5. Accessibility:
   • role="group" and tabIndex="0" on cards for keyboard navigation.
   • aria-label on interactive cards.
   • Alt text for images.
*/

function AgentsSection({ agents, storeSlug }:any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Meet Our Agents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent:any) => (
            <motion.div
              key={agent.id}
              role="group"
              tabIndex={0}
              aria-label={`Agent ${agent.name}, ${agent.role}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
              onClick={() => window.location.href = `/site/${storeSlug}/agent/${agent.id}`}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <div className="mx-auto mb-4 relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-amber-500">
                <Image
                  src={agent.photoUrl}
                  alt={agent.name}
                  loader={loader}
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {agent.name}
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                {agent.role}
              </p>

              <motion.span
                className="inline-block bg-amber-500 text-white text-sm font-semibold px-3 py-1 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {agent.rating.toFixed(1)} ★
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
Blog Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900, py-20 for consistent spacing.
   • Container: max-w-7xl mx-auto px-6.
   • Heading: text-4xl sm:text-5xl font-extrabold text-gray-900 / dark:text-gray-100, centered mb-12.

2. Grid Layout:
   • Responsive grid: 1-col on mobile, 2-col sm, 3-col lg with gap-8.

3. Card UI & Imagery:
   • Card: bg-white / dark:bg-gray-800, rounded-3xl, shadow-xl, overflow-hidden, focus-ring.
   • Featured Image: if available, displayed atop card with h-48, object-cover and hover-scale.
   • Content: padded container with title, excerpt, date, and author avatar.

4. Content Elements:
   • Title: text-2xl font-semibold text-gray-900 / dark:text-gray-100, mb-2.
   • Excerpt: text-gray-700 / dark:text-gray-300, text-base mb-4.
   • Meta: flex items-center text-sm text-gray-500 / dark:text-gray-400 with author image and publish date.
   • CTA Button: inline gradient bg-button, uppercase text-sm, rounded-full, hover-scale.

5. Micro-interactions & Animation:
   • Framer Motion: card fades-in and lifts on hover (scale 1.03, shadow intensify).
   • Image: subtle zoom on hover.

6. Accessibility:
   • role="article" and tabIndex="0" on cards. aria-label on read more button.
   • focus-visible:ring for keyboard.
   • Alt text for images.
*/

function BlogSection({ posts, storeSlug }:any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-12">
          Latest Insights
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post:any) => (
            <motion.article
              key={post.id}
              role="article"
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
            >
              {post.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 hover:scale-110"
                    loader={loader}
                  />
                </div>
              )}

              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2">
                    {post.author?.avatarUrl && (
                      <Image
                        src={post.author.avatarUrl}
                        alt={post.author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(post.publishedAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <Link href={`/site/${storeSlug}/blog/${post.slug}`}>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      className="text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-400 text-white uppercase px-4 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={`Read more about ${post.title}`}
                    >
                      Read More
                    </motion.a>
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
Why Choose Us Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900 for consistency.
   • Container: max-w-7xl mx-auto px-6 py-20 text-center.
   • Heading: text-4xl sm:text-5xl font-extrabold text-gray-900 / dark:text-gray-100 mb-12.

2. Metrics Grid:
   • Responsive: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12.
   • Cards: bg-white / dark:bg-gray-800 rounded-3xl p-6 shadow-lg focus-ring.
   • Icons: display metric-specific icon above value (optional).
   • Values: animated count-up using Framer Motion’s useAnimation, large text-5xl font-extrabold in emerald-600.
   • Labels: text-lg font-medium text-gray-700 / dark:text-gray-300.

3. Awards Display:
   • Flex grid: wrap, justify-center with gap-8.
   • Award logos: grayscale by default, hover to full color, size 16.
   • Caption: text-sm text-gray-600 / dark:text-gray-400 mt-2.

4. Accessibility & Animation:
   • Semantic <section>, ARIA roles for metrics group.
   • Focus-visible rings on metric cards.
   • Framer Motion: fade-in & upward motion on metrics and hover slight lift.
*/


function WhyChooseUs({ metrics, awards }:any) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({ y: 0, opacity: 1, transition: { delay: i * 0.2, duration: 0.6 } }));
  }, [controls]);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-12">
          Why Choose Us
        </h2>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12" role="group" aria-label="Company metrics">
          {metrics.map((m:any, idx:any) => (
            <motion.div
              key={m.id}
              custom={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              {m.iconUrl && (
                <div className="mx-auto mb-4 w-12 h-12">
                  <Image
                    src={m.iconUrl}
                    alt={`${m.label} icon`}
                    width={48}
                    height={48}
                    className="object-contain"
                    loader={loader}
                  />
                </div>
              )}
              <motion.p
                className="text-5xl font-extrabold text-emerald-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.2 + 0.3 }}
              >
                {m.value.toLocaleString()}+
              </motion.p>
              <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                {m.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Awards */}
        <div className="flex flex-wrap justify-center gap-8" role="group" aria-label="Awards and recognitions">
          {awards.map((a:any) => (
            <motion.div
              key={a.id}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center w-32"
            >
              <div className="relative w-16 h-16 filter grayscale hover:grayscale-0 transition">
                <Image
                  src={a.iconUrl}
                  alt={a.name}
                  layout="fill"
                  objectFit="contain"
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality||75}`}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {a.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
Testimonials Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900 for consistency.
   • Container: max-w-4xl mx-auto px-6 py-20 text-center.
   • Heading: text-4xl sm:text-5xl font-extrabold text-gray-900 / dark:text-gray-100 mb-12.

2. Carousel Implementation:
   • Horizontal carousel with snap-x and drag via Framer Motion’s drag.
   • Each testimonial card snaps into center focus.

3. Card UI & Content:
   • Card: bg-white / dark:bg-gray-800 rounded-3xl p-8 shadow-xl, focus-ring.
   • Quote: italic text-lg text-gray-700 / dark:text-gray-300 leading-relaxed.
   • Author: block mt-6 text-base font-semibold text-gray-900 / dark:text-gray-100.
   • Avatar: circular avatar above quote if available.

4. Micro-interactions & Animation:
   • Framer Motion: cards fade-in and slide from sides on initial load.
   • Drag on X-axis with momentum and snap to cards.
   • Hover: slight scale-up (1.02) on testimonials.

5. Accessibility:
   • role="region" and aria-label="Testimonials carousel".
   • Each card role="group" and tabIndex="0".
*/

function TestimonialsSection({ testimonials }:any) {
  const carouselRef = useRef(null);

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-12">
          What Clients Say
        </h2>

        <motion.div
          ref={carouselRef}
          className="flex space-x-6 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab"
          drag="x"
          dragConstraints={carouselRef}
          dragElastic={0.1}
          role="region"
          aria-label="Testimonials carousel"
        >
          {testimonials.map((t:any, idx:any) => (
            <motion.div
              key={t.author + idx}
              role="group"
              tabIndex={0}
              className="snap-center min-w-[300px] bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              {t.avatarUrl && (
                <div className="mx-auto mb-4 w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500">
                  <Image
                    src={t.avatarUrl}
                    alt={t.author}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              )}
              <p className="italic text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                “{t.quote}”
              </p>
              <span className="mt-6 block font-semibold text-gray-900 dark:text-gray-100">
                — {t.author}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/*
FAQ Section Redesign

Design Decisions:

1. Section Styling & Typography:
   • Background: bg-gray-50 / dark:bg-gray-900, py-20 for vertical rhythm.
   • Container: max-w-3xl mx-auto px-6.
   • Heading: text-4xl sm:text-5xl font-extrabold text-gray-900 / dark:text-gray-100, centered mb-10.

2. Accordion Layout:
   • Custom accordion using <details> with styled summary and content.
   • Cards: bg-white / dark:bg-gray-800, rounded-3xl, shadow-lg, p-6, focus-visible.
   • Summary: flex justify-between items-center, text-xl font-semibold, hover:text-emerald-600.
   • Icon indicator: chevron rotates on open via Framer Motion.

3. Animation & Interaction:
   • Framer Motion: details fade-in on scroll and content slide-down on toggle.
   • Chevron icon rotates 180° when expanded.

4. Accessibility:
   • role="region" aria-labelledby linking summary IDs.
   • Keyboard navigable with focus-visible:ring-2 ring-amber-500.
*/

function FAQSection({ faqs }: any) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 text-center mb-10">
          FAQs
        </h2>
        <div className="space-y-4">
          {faqs.map((q: any, idx: any) => (
            <motion.details
              key={q.question}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500"
            >
              <summary
                className="flex justify-between items-center cursor-pointer px-6 py-4 text-xl font-semibold text-gray-900 dark:text-gray-100 hover:text-emerald-600 transition"
                aria-controls={`faq-content-${idx}`}
                id={`faq-summary-${idx}`}
              >
                {q.question}
                <motion.span
                  className="ml-2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: (document.getElementById(`faq-summary-${idx}`)?.closest('details')?.hasAttribute('open') ? 180 : 0) }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDownIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </motion.span>
              </summary>
              <motion.div
                id={`faq-content-${idx}`}
                className="px-6 pb-6 text-gray-700 dark:text-gray-300"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <p className="mt-2">
                  {q.answer}
                </p>
              </motion.div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
