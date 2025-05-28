import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample store data (ideally fetched via API)
// Sample store data
const store = {
  name: "UrbanNest Realty",
  slug: "urbannest",
  description: "Find your perfect home with ease and style.",
  bannerUrl: "/images/realestate-hero.jpg",
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
  };
  

const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

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
  const handleNewsletter = (e) => { e.preventDefault(); setShowNewsletter(false); /* send email */ };


  return (
    <div className="space-y-32 font-sans text-gray-800">
      {/* Sticky Contact Agent Button */}
      <a
        href="https://wa.me/254712345678?text=Hi%20UrbanNest%20Realty,%20I%27d%20like%20to%20inquire%20about%20a%20listing"
        target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl z-50"
      >
        <img src="/icons/whatsapp.svg" alt="Chat" className="h-6 w-6" />
      </a>

      {/* Newsletter Signup Banner */}
      {/* {showNewsletter && (
        <div className="fixed bottom-0 inset-x-0 bg-white shadow-lg p-4 flex items-center justify-between z-40">
          <p className="text-gray-800">Get market updates straight to your inbox:</p>
          <form onSubmit={handleNewsletter} className="flex">
            <input
              type="email"
              required
              placeholder="Your email"
              className="px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
            />
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg">
              Subscribe
            </button>
          </form>
          <button onClick={() => setShowNewsletter(false)} className="ml-4 text-gray-500">✕</button>
        </div>
      )} */}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={store.bannerUrl}
            alt="Hero"
            layout="fill"
            objectFit="cover"
            loader={loader}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-extrabold leading-tight text-white drop-shadow-lg"
          >
            {store.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-white"
          >
            {store.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto bg-white bg-opacity-80 backdrop-blur-md rounded-xl p-6"
          >
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="sm:col-span-3 mt-2 bg-gradient-to-r from-green-500 to-teal-400 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transform transition"
            >
              Search Listings
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Property Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {store.StoreCategory.map((cat) => (
              <Link key={cat.id} href="#">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  className="relative block overflow-hidden rounded-2xl shadow-lg"
                >
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    layout="responsive"
                    width={300}
                    height={200}
                    objectFit="cover"
                    loader={loader}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <span className="text-white text-xl font-semibold">{cat.name}</span>
                  </div>
                </motion.a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Featured Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {store.products.map((prop) => (
              <motion.div
                key={prop.id}
                whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                onClick={() => router.push(`/${store.slug}/property/${prop.id}`)}
                className="bg-white rounded-3xl overflow-hidden cursor-pointer"
              >
                <div className="relative h-64">
                  <Image
                    src={prop.imageUrl}
                    alt={prop.name}
                    layout="fill"
                    objectFit="cover"
                    loader={loader}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{prop.name}</h3>
                  <p className="text-green-600 font-bold">KES {prop.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* Our Agents */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Meet Our Agents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {store.agents.map((agent) => (
                <motion.div key={agent.id} whileHover={{ scale: 1.03 }} className="bg-white p-6 rounded-2xl shadow-lg text-center">
                  <div className="mx-auto mb-4 w-32 h-32 rounded-full overflow-hidden">
                    <Image src={agent.photoUrl} alt={agent.name} width={128} height={128} loader={loader} className="object-cover" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-1">{agent.name}</h3>
                  <p className="text-green-600 mb-2">{agent.role}</p>
                  <p className="font-semibold">Rating: {agent.rating.toFixed(1)} ⭐</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Metrics & Awards */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {store.metrics.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: m.id * 0.3 }} className="p-6">
                  <p className="text-5xl font-extrabold text-green-600">{m.value.toLocaleString()}+</p>
                  <p className="mt-2 text-lg font-medium text-gray-700">{m.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center space-x-8">
              {store.awards.map((a) => (
                <div key={a.id} className="flex flex-col items-center">
                  <Image src={a.iconUrl} alt={a.name} width={64} height={64} loader={loader} />
                  <p className="mt-2 text-gray-600 text-sm">{a.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-12">Client Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {store.testimonials.map((t, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-2xl shadow-lg">
                  <video controls className="w-full h-auto">
                    <source src={`/testimonials/video${i+1}.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-4 bg-white">
                    <p className="italic text-gray-700">“{t.quote}”</p>
                    <p className="mt-2 font-semibold text-gray-900">— {t.author}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      {/* Testimonials Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">What Clients Say</h2>
          <div className="relative max-w-2xl mx-auto">
            <AnimatePresence>
              {/* Could implement looped carousel logic here */}
              {store.testimonials.map((t, i) => (
                <motion.blockquote
                  key={i}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="italic text-gray-700 bg-gray-100 p-8 rounded-2xl shadow-lg mb-6"
                >
                  “{t.quote}”
                  <span className="mt-4 block font-semibold text-gray-900">— {t.author}</span>
                </motion.blockquote>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-10">FAQs</h2>
          <div className="space-y-4">
            {store.faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-md"
              >
                <summary className="cursor-pointer text-xl font-semibold">
                  {q.question}
                </summary>
                <p className="mt-2 text-gray-600">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
