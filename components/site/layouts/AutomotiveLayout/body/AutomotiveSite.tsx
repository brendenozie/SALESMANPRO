import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon  } from '@heroicons/react/24/solid'
import clsx from 'clsx'

// Sample data
const store = {
  name: "Elite Auto Hub",
  slug: "elite-auto",
  bannerUrl: "/images/auto-banner.jpg",
  promotions: [
    { title: "Summer Service Special", description: "20% off on all maintenance services.", bannerUrl: "/promos/summer.jpg" },
    { title: "New Arrivals", description: "Check out the latest 2025 models.", bannerUrl: "/promos/arrivals.jpg" },
    { title: "Trade-In Bonus", description: "Up to $2000 trade-in bonus.", bannerUrl: "/promos/tradein.jpg" },
  ],
  products: [
    { id: "v1", name: "2025 Mustang GT", price: 4500000, imageUrl: "/cars/mustang.jpg", slug: "mustang-gt" },
    { id: "v2", name: "2025 Camaro ZL1", price: 5000000, imageUrl: "/cars/camaro.jpg", slug: "camaro-zl1" },
    { id: "v3", name: "2025 Tesla Model S", price: 7000000, imageUrl: "/cars/tesla.jpg", slug: "tesla-model-s" },
  ],
  testimonials: [
    { quote: "Best car-buying experience ever!", author: "Alex P.", avatarUrl: "/avatars/alex.jpg" },
    { quote: "Amazing service and great deals.", author: "Jamie L.", avatarUrl: "/avatars/jamie.jpg" },
  ],
};

const homeTypes = ['House', 'Apartment', 'Condo']

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

const vehicles: VehicleCardProps[] = [
  {
    id: 'v1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 30000,
    image: '/cars/camry.jpg',
    type: 'Sedan',
    mileage: 5000,
    badge: 'New',
  },
  {
    id: 'v2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    price: 25000,
    image: '/cars/civic.jpg',
    type: 'Sedan',
    mileage: 12000,
    badge: 'Hot',
  },
  {
    id: 'v3',
    make: 'Ford',
    model: 'F-150',
    year: 2021,
    price: 40000,
    image: '/cars/f150.jpg',
    type: 'Truck',
    mileage: 20000,
  },
];

interface VehicleCardProps {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  type: string;
  mileage: number;
  badge?: 'New' | 'Hot' | 'Price Reduced';
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AutomotiveSite() {
  const router = useRouter();
  const [promos, setPromos] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setPromos(store.promotions);
    setFeatured(store.products);
    setTestimonials(store.testimonials);
  }, []);

  return (
    <div className="space-y-24 font-sans">
      {/* Hero */}
      <HeroSection />
      <FilterBar />
      <TrendingLocations />
      <VideoShowcase />
      <MarketInsights />
      <Testimonials />
      {/* Featured Vehicles */}
      <section className="px-4 md:px-8 lg:px-16 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Vehicles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} {...vehicle} badge={vehicle.badge} />
          ))}
        </div>
      </section>

      {/* Promotions */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Current Promotions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {promos.map((promo, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-gray-100 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="relative h-48">
                  <Image src={promo.bannerUrl} alt={promo.title} fill loader={loader} className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{promo.title}</h3>
                  <p className="text-gray-700">{promo.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      

      <AppPromo />
    
    </div>
  );
}


const HeroSection: React.FC = () => {
  const [isBuy, setIsBuy] = useState(true);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/assets/hero-video.mp4"
        autoPlay
        muted
        loop
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Find Your Dream Vehicle in Seconds
        </h1>
        <p className="text-lg text-gray-200 mb-10">
          Search thousands of listings across makes, models, and price ranges.
        </p>

        {/* Search Bar */}
        <motion.form
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
          className="bg-white bg-opacity-90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl max-w-4xl mx-auto"
        >
          {/* Buy/Rent Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBuy(true)}
              className={`px-4 py-2 rounded-full ${isBuy ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setIsBuy(false)}
              className={`px-4 py-2 rounded-full ${!isBuy ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Rent
            </button>
          </div>

          {/* Location Input */}
          <input
            type="text"
            placeholder="Enter location"
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            aria-label="Location"
          />

          {/* Price Range (placeholder slider) */}
          <input
            type="range"
            min="0"
            max="100000"
            className="w-full sm:w-1/4"
            aria-label="Price range"
          />

          {/* Vehicle Type Dropdown */}
          <select
            className="p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            aria-label="Vehicle type"
          >
            <option>All Types</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Truck</option>
            <option>Coupe</option>
          </select>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </motion.form>
      </motion.div>
    </section>
  );
};

function FilterBar() {
  const [buyRent, setBuyRent] = useState<'buy' | 'rent'>('buy')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [homeType, setHomeType] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-white shadow-md px-4 py-3 md:rounded-none rounded-b-2xl md:shadow-sm"
    >
      <div className="flex justify-between items-center md:flex-row flex-col md:space-y-0 space-y-3">
        {/* Toggle Buy / Rent */}
        <div className="flex items-center gap-2">
          <button
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold',
              buyRent === 'buy' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}
            onClick={() => setBuyRent('buy')}
          >
            Buy
          </button>
          <button
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-semibold',
              buyRent === 'rent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}
            onClick={() => setBuyRent('rent')}
          >
            Rent
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid md:grid-cols-6 grid-cols-2 gap-3 w-full">
          <input
            type="text"
            placeholder="Location"
            className="input-style"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            className="input-style"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            className="input-style"
          />
          <select
            value={homeType}
            onChange={e => setHomeType(e.target.value)}
            className="input-style"
          >
            <option value="">Home Type</option>
            {homeTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Bedrooms"
            value={bedrooms}
            onChange={e => setBedrooms(e.target.value)}
            className="input-style"
          />
          <input
            type="number"
            placeholder="Bathrooms"
            value={bathrooms}
            onChange={e => setBathrooms(e.target.value)}
            className="input-style"
          />
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center gap-1 text-sm font-medium text-blue-600 mt-2"
        >
          Filters <ChevronDownIcon className="w-4 h-4" />
        </button>

        {/* Apply Button */}
        <button className="mt-3 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition">
          Apply Filters
        </button>
      </div>

      {/* Collapsible Mobile Panel */}
      {showMobileFilters && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-4 space-y-2"
        >
          {/* You could repeat or customize filters for mobile here */}
        </motion.div>
      )}
    </motion.div>
  )
}

const VehicleCard: React.FC<VehicleCardProps> = ({ make, model, year, price, image, type, mileage, badge }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
    >
      {/* Badge */}
      {badge && (
        <span
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${badgeColorMap[badge]}`}
        >
          {badge}
        </span>
      )}

      {/* Image */}
      <div className="relative w-full h-48 sm:h-56 lg:h-64">
        <Image
          src={image}
          alt={`${make} ${model}`}
          layout="fill"
          objectFit="cover"
          className="transform hover:scale-105 transition duration-300"
          placeholder="blur"
          blurDataURL="/assets/placeholder.png"
          loader={loader}
        />
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold">
          {year} {make} {model}
        </h3>
        <p className="text-blue-600 font-semibold text-md">
          ${price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          {mileage.toLocaleString()} miles • {type}
        </p>
        <button
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};


function TrendingLocations() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <h2 className="text-2xl font-bold mb-6">Trending Locations</h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
        {locations.map(loc => (
          <motion.a
            key={loc.id}
            href={`/search?location=${loc.id}`}
            className="relative min-w-[260px] h-48 rounded-xl overflow-hidden flex-shrink-0"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <Image
              src={loc.img}
              alt={loc.name}
              layout="fill"
              objectFit="cover"
              loader={loader}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-semibold">{loc.name}</h3>
              <p className="text-sm">
                {loc.listings} listings • Avg ${loc.avgPrice.toLocaleString()}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}


// components/VideoShowcase.tsx

// import Lightbox from 'react-modal-video' // you’d install react-modal-video
// import 'react-modal-video/css/modal-video.css'
 function VideoShowcase() {
  const [isOpen, setIsOpen] = useState<string | null>(null)

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16">
      <h2 className="text-2xl font-bold mb-6">Virtual Tours & Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <motion.div
            key={tour.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg"
            onClick={() => setIsOpen(tour.id)}
          >
            <Image
              src={tour.thumbnail}
              alt={tour.title}
              width={400}
              height={250}
              className="object-cover w-full h-48"
              loader={loader}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 84 84"
                aria-hidden="true"
              >
                <circle cx="42" cy="42" r="42" opacity="0.6" />
                <polygon points="32,24 32,60 60,42" />
              </svg>
            </div>
            <p className="p-4 font-semibold">{tour.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modals */}
      {/* {tours.map((tour) => (
        <Lightbox
          key={tour.id}
          channel="youtube"
          isOpen={isOpen === tour.id}
          videoId={tour.videoId}
          onClose={() => setIsOpen(null)}
        />
      ))} */}
    </section>
  )
}

function MarketInsights() {
  const [loanAmount, setLoanAmount] = useState(25000)
  const [interestRate, setInterestRate] = useState(5)
  const [termYears, setTermYears] = useState(5)
  const monthlyPayment = 
    (loanAmount * (interestRate / 100) / 12) /
    (1 - Math.pow(1 + (interestRate / 100) / 12, -termYears * 12))

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Market Insights & Tools</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mortgage/Auto-Loan Calculator */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4">Auto Loan Calculator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Loan Amount</label>
              <input
                type="number"
                value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                className="input-style mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={e => setInterestRate(Number(e.target.value))}
                className="input-style mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Term (Years)</label>
              <input
                type="number"
                value={termYears}
                onChange={e => setTermYears(Number(e.target.value))}
                className="input-style mt-1 w-full"
              />
            </div>
            <div className="mt-6 text-lg font-semibold">
              Monthly Payment: ${isFinite(monthlyPayment) ? monthlyPayment.toFixed(2) : '–'}
            </div>
          </div>
        </motion.div>

        {/* Regional Average Price & Blog Links */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Average Vehicle Price by Region</h3>
            <ul className="space-y-3">
              {regions.map(region => (
                <li key={region.name} className="flex justify-between">
                  <span>{region.name}</span>
                  <span className="font-medium">${region.avgPrice.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Latest Buying Guides</h3>
            <ul className="space-y-3">
              {blogPosts.map(post => (
                <li key={post.id}>
                  <Link href={post.href} className="text-blue-600 hover:underline">
                      • {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Testimonials() {
  const [current, setCurrent] = useState(0)

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((current - 1 + reviews.length) % reviews.length)
  const next = () => setCurrent((current + 1) % reviews.length)

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
      
      <div className="relative max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {reviews.map((r, idx) =>
            idx === current ? (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-600">
                    <Image
                      src={r.avatar}
                      alt={r.name}
                      width={64}
                      height={64}
                      objectFit="cover"
                      loader={loader}
                    />
                  </div>
                </div>
                <p className="italic text-gray-700 mb-4">&ldquo;{r.quote}&rdquo;</p>
                <p className="font-semibold text-blue-600">{r.name}</p>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Nav Buttons */}
        <button
          onClick={prev}
          aria-label="Previous testimonial"
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none"
        >
          <ChevronLeftIcon className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={next}
          aria-label="Next testimonial"
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 focus:outline-none"
        >
          <ChevronRightIcon className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </section>
  )
}

// components/AppPromo.tsx
function AppPromo() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Text & Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Get the App & Never Miss a Deal
          </h2>
          <p className="text-lg">
            Browse listings, save favorites, and get instant notifications
            wherever you go.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Download on the App Store"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              App Store
            </a>
            <a
              href="#"
              aria-label="Get it on Google Play"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              Google Play
            </a>
          </div>
        </motion.div>

        {/* Device Mockup Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center"
        >
          {/* Stacked phone mockups */}
          {screenshots.map((src, idx) => (
            <div
              key={idx}
              className={`absolute w-40 h-80 rounded-3xl overflow-hidden shadow-2xl transform transition ${
                idx === 1
                  ? 'translate-x-12 -translate-y-4 scale-90 z-10'
                  : idx === 2
                  ? 'translate-x-24 -translate-y-8 scale-75 z-0'
                  : 'z-20'
              }`}
            >
              <Image
                src={src}
                alt={`App screenshot ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                loader={loader}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
)
}

