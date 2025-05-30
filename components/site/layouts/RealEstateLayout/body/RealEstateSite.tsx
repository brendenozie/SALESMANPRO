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
