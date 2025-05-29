import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, ChevronDownIcon, UserGroupIcon } from "@heroicons/react/24/outline";

// Sample store & travel data
const store = {
name: "Wanderlust Travels",
slug: "wanderlust-travels",
description: "Discover breathtaking destinations and immersive experiences worldwide.",
bannerUrl: "/images/travel-hero.jpg",
categories: [
{ id: 1, name: "Beaches", icon: "/icons/beach.svg" },
{ id: 2, name: "Mountains", icon: "/icons/mountain.svg" },
{ id: 3, name: "Cities", icon: "/icons/city.svg" },
{ id: 4, name: "Adventure", icon: "/icons/adventure.svg" },
{ id: 5, name: "Cruises", icon: "/icons/cruise.svg" },
{ id: 6, name: "Wellness", icon: "/icons/wellness.svg" },
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

export default function TravelSite() {
const router = useRouter();
const [categories, setCategories] = useState<any[]>([]);
const [featured, setFeatured] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setCategories(store.categories);
setFeatured(store.featured);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-20 font-sans">
 {/* Hero Section  */}
 <Hero />

 <main className="space-y-16 px-4 lg:px-24">
  {/* Filter Bar */}
  <FilterBar />

  {/* Listings Section */}
  <section className="py-12 bg-gray-50">
    <div className="container mx-auto px-6">
      <Listings />
    </div>
  </section>

  {/* Trending Locations */}
  <TrendingLocations />

  <MeetAgents />

  <MarketInsights />

  {/* Virtual Tours */}
  <VirtualTours />
  
  <Testimonials />

  <MobileAppPromo />

  <NewsletterSignup />

  {/* Chat Button */}
  
 </main>


  {/* Chat Button */}
  <motion.div whileHover={{ scale: 1.2 }} className="fixed bottom-8 right-8">
    <button className="bg-indigo-500 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-600 transition">
      💬
    </button>
  </motion.div>
  {/* <div className="container mx-auto">{children}</div>
  <footer className="mt-12 text-center text-gray-600">All about services for {slug}</footer> */}
</div>

);
}

// components/Hero.tsx
function Hero() {
  const [destination, setDestination] = useState('')
  const [travelType, setTravelType] = useState(travelTypes[0])
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(2)

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-screen video / fallback image */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/hero-travel.mp4"
        autoPlay muted loop
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-3xl"
        >
          Explore the World, One Journey at a Time
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-xl w-full max-w-4xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Destination */}
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Where to?"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Travel Type */}
            <select
              value={travelType}
              onChange={e => setTravelType(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {travelTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Date Picker */}
            <div className="relative flex-1">
              <CalendarDaysIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-10 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Guests */}
            <div className="relative flex-1">
              <UserGroupIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500  w-5 h-5" />
              <input
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Guests"
              />
            </div>

            {/* Search Button */}
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold transition">
              Search Trips
            </button>
          </div>

          {/* Secondary CTAs */}
          <div className="mt-4 flex justify-center space-x-8 text-indigo-600">
            <button className="hover:underline">Become a Host</button>
            <button className="hover:underline">Contact Travel Expert</button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

{/* components/FilterBar.tsx */}
function FilterBar() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('')
  const [region, setRegion] = useState('')
  const [price, setPrice] = useState(1500)
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm px-4 py-3 border-b border-gray-200"
    >
      <div className="max-w-6xl mx-auto">
        {/* Mobile Toggle */}
        <div className="md:hidden flex justify-between items-center">
          <p className="font-semibold text-gray-700">Filters</p>
          <button
            onClick={() => setOpen(!open)}
            className="text-indigo-600 font-medium flex items-center gap-1"
          >
            {open ? 'Hide' : 'Show'} <ChevronDownIcon className={`transform w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className={`mt-4 md:mt-0 ${open ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            {/* Travel Type */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Type</option>
              {travelTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* Region */}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Region</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Guests */}
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder="Guests"
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Price */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Max Budget: ${price}</label>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Apply Button */}
            <button className="bg-indigo-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-indigo-700 transition">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// components/ListingCard.tsx
function ListingCard({ listing }: any) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0px 15px 25px rgba(0,0,0,0.15)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="relative h-48 w-full">
        <Image
          src={listing.thumbnail}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transform hover:scale-105 transition duration-300"
          placeholder="blur"
          blurDataURL="/assets/blur-placeholder.png"
          loader={loader} 
        />
        {listing.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded-full ${
              listing.badge === 'New'
                ? 'bg-green-500 text-white'
                : listing.badge === 'Hot'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-400 text-gray-900'
            }`}
          >
            {listing.badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{listing.title}</h3>
        <p className="text-indigo-600 font-semibold mb-4">${listing.price.toLocaleString()}</p>
        <div className="flex text-gray-600 text-sm space-x-4 mb-4">
          <span>{listing.beds} beds</span>
          <span>{listing.baths} baths</span>
          <span>{listing.area} sq ft</span>
        </div>
        <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
          View Details
        </button>
      </div>
    </motion.div>
  )
}

// components/Listings.tsx
function Listings() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Featured Trips & Tours
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}

{/* components/TrendingCard.tsx */}
function TrendingCard({ loc }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
    >
      <Image
        src={loc.image}
        alt={loc.name}
        layout="fill"
        objectFit="cover"
        className="transform transition-transform duration-300"
        placeholder="blur"
        blurDataURL="/assets/blur-placeholder.png"
        loader={loader} 
      />
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{loc.name}</h3>
        <p className="text-sm">{loc.listingsCount}+ listings</p>
        <p className="text-sm">Avg. $ {loc.avgPrice.toLocaleString()}</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-medium"
      >
        View All
      </motion.div>
    </motion.div>
  )
}

// components/TrendingLocations.tsx
function TrendingLocations() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
        Trending Destinations
      </h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: { opacity: 1, x: 0 },
          hidden: { opacity: 0, x: -50 },
        }}
        transition={{ duration: 0.8 }}
        className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar"
      >
        {trendingLocations.map(loc => (
          <TrendingCard key={loc.id} loc={loc} />
        ))}
      </motion.div>
    </section>
  )
}

/* components/VirtualTourCard.tsx */
function VirtualTourCard({ tour, onOpen }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
      onClick={() => onOpen(tour.videoUrl)}
    >
      <Image
        src={tour.thumbnail}
        alt={tour.title}
        layout="fill"
        objectFit="cover"
        className="transform hover:scale-105 transition duration-300"
        placeholder="blur"
        blurDataURL="/assets/blur-placeholder.png"
        loader={loader} 
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <motion.span
          whileHover={{ scale: 1.2 }}
          className="text-white text-4xl"
          aria-label={`Play ${tour.title}`}
        >
          ▶
        </motion.span>
      </div>
      <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
        {tour.title}
      </div>
    </motion.div>
  )
}

// components/VirtualTours.tsx
function VirtualTours() {
  const [openUrl, setOpenUrl] = useState<string | null>(null)

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
        Virtual Tours & Videos
      </h2>

      <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
        {virtualTours.map(t => (
          <VirtualTourCard key={t.id} tour={t} onOpen={setOpenUrl} />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {openUrl && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenUrl(null)}
          >
            <motion.div
              className="relative w-11/12 md:w-3/4 lg:w-1/2 h-[60vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="w-full h-full rounded-2xl"
                src={openUrl}
                title="Virtual Tour"
                allow="autoplay; fullscreen"
              />
              <button
                onClick={() => setOpenUrl(null)}
                className="absolute top-2 right-2 text-white text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

{/* components/AgentCard.tsx */}
function AgentCard({ agent }: any) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0px 10px 20px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 250 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col items-center text-center p-6"
    >
      <div className="relative w-24 h-24 mb-4">
        <Image
          src={agent.photo}
          alt={agent.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
          placeholder="blur"
          blurDataURL="/assets/blur-placeholder.png"
          loader={loader} 
        />
      </div>
      <h3 className="text-lg font-semibold">{agent.name}</h3>
      <p className="text-indigo-600 font-medium">{agent.specialty}</p>
      <p className="text-gray-500 text-sm mb-4">{agent.experience} yrs experience</p>
      <button className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition">
        Schedule a Meeting
      </button>
    </motion.div>
  )
}

// components/MeetAgents.tsx
function MeetAgents() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Meet Our Travel Experts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  )
}

// components/MarketInsights.tsx
function MarketInsights() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Market Insights & Travel Tips
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Cost Cards */}
        <motion.div
          className="grid grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {regionCosts.map(rc => (
            <motion.div
              key={rc.id}
              className="flex items-center bg-white rounded-2xl p-4 shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="w-12 h-12 mr-4 relative">
                <Image
                  src={rc.icon}
                  alt={rc.region}
                  layout="fill"
                  loader={loader} 
                  objectFit="contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{rc.region}</h3>
                <p className="text-indigo-600 font-medium">
                  Avg. ${rc.avgCost.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Blog Posts */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">Latest Travel Tips</h3>
          <ul className="space-y-3">
            {blogPosts.map(bp => (
              <li key={bp.id}>
                <a
                  href={bp.url}
                  className="text-gray-700 hover:text-indigo-600 transition"
                >
                  {bp.title}
                </a>
                <p className="text-gray-500 text-sm">{new Date(bp.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <a
              href="/blog"
              className="inline-block text-indigo-600 hover:underline font-medium"
            >
              View All Posts →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// components/TestimonialCard.tsx
function TestimonialCard({ testimonial }: any) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm max-w-md mx-auto">
      <div className="relative w-20 h-20 mb-4">
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          layout="fill"
          objectFit="cover"
          className="rounded-full"
          placeholder="blur"
          loader={loader} 
          blurDataURL="/assets/blur-placeholder.png"
        />
      </div>
      <p className="text-gray-800 italic mb-4">“{testimonial.quote}”</p>
      <h4 className="text-lg font-semibold">{testimonial.name}</h4>
      <p className="text-sm text-gray-500">{testimonial.role}</p>
    </div>
  )
}

// components/Testimonials.tsx
function Testimonials() {
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef<number | null>(null)
  const delay = 5000

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, delay)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [current])

  const prev = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }
  const next = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    setCurrent((c) => (c + 1) % testimonials.length)
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        What Our Travelers Say
      </h2>
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence initial={false}>
          <motion.div
            key={testimonials[current].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <TestimonialCard testimonial={testimonials[current]} />
          </motion.div>
        </AnimatePresence>

        {/* Prev/Next */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
          aria-label="Previous testimonial"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white rounded-full p-2 shadow hover:bg-gray-100"
          aria-label="Next testimonial"
        >
          ›
        </button>

        {/* Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
                setCurrent(idx)
              }}
              className={`w-3 h-3 rounded-full ${
                idx === current ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
              aria-label={`Show testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// components/MobileAppPromo.tsx
function MobileAppPromo() {
  return (
    <section className="py-16 px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12"
      >
        {/* Text & Buttons */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Take Your Adventures On the Go
          </h2>
          <p className="text-gray-600 mb-6">
            Download our app to book trips, explore virtual tours, and chat with experts wherever you are.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <a href="#" aria-label="Download on the App Store">
              <Image
                src="/assets/app-store-badge.png"
                alt="Download on the App Store"
                width={150}
                height={50}
                loader={loader} 
              />
            </a>
            <a href="#" aria-label="Get it on Google Play">
              <Image
                src="/assets/google-play-badge.png"
                alt="Get it on Google Play"
                loader={loader} 
                width={150}
                height={50}
              />
            </a>
          </div>
        </div>

        {/* Device Mockups */}
        <div className="flex-1 flex justify-center lg:justify-end relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative w-48 h-96 sm:w-56 sm:h-[36rem] lg:w-64 lg:h-[40rem]"
          >
            <Image
              src="/assets/device-mockup.png"
              alt="App on device"
              layout="fill"
              loader={loader} 
              objectFit="contain"
              placeholder="blur"
              blurDataURL="/assets/blur-placeholder.png"
            />
          </motion.div>
          {/* You can duplicate/offset for multiple devices */}
        </div>
      </motion.div>
    </section>
)
}

// components/NewsletterSignup.tsx
function NewsletterSignup() {
  const [email, setEmail] = useState('')

  return (
    <section className="py-16 px-4 bg-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Stay Updated on the Latest Trips & Deals
        </h2>
        <p className="text-gray-600 mb-6">
          Subscribe to our newsletter for travel inspiration, exclusive offers, and expert tips.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            // TODO: hook up subscription API
            alert(`Subscribed: ${email}`)
            setEmail('')
          }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Your email address"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition"
          >
            Subscribe
          </button>
        </form>
      </motion.div>
    </section>
  )
}
