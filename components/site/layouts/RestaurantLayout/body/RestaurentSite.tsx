import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import banner from "../../../../../assets/homebanner.png";
import Link from "next/link";
// Sample data (replace with API data)

const store = {
  name: "SavoryBites Restaurant",
  slug: "savorybites",
  description: "Indulge in gourmet flavors crafted for your delight.",
  bannerUrl: `${banner.src}`,
  StoreCategory: [
  { id: 1, name: "Appetizers", slug: "appetizers", imageUrl: "/categories/appetizers.jpg" },
  { id: 2, name: "Main Courses", slug: "main-courses", imageUrl: "/categories/main.jpg" },
  { id: 3, name: "Desserts", slug: "desserts", imageUrl: "/categories/desserts.jpg" },
  { id: 4, name: "Beverages", slug: "beverages", imageUrl: "/categories/beverages.jpg" },
  ],
  products: [
  { id: "d1", name: "Truffle Pasta", price: 1800, imageUrl: "/dishes/pasta.jpg" },
  { id: "d2", name: "Grilled Salmon", price: 2200, imageUrl: "/dishes/salmon.jpg" },
  { id: "d3", name: "Chocolate Lava Cake", price: 900, imageUrl: "/dishes/cake.jpg" },
  { id: "d4", name: "Signature Cocktails", price: 1200, imageUrl: "/dishes/cocktail.jpg" },
  { id: "d5", name: "Caesar Salad", price: 800, imageUrl: "/dishes/salad.jpg" },
  { id: "d6", name: "Beef Steak", price: 2500, imageUrl: "/dishes/steak.jpg" },
  ],
  testimonials: [
  { quote: "An unforgettable dining experience!", author: "Emily T." },
  { quote: "The flavors were out of this world.", author: "John D." },
  { quote: "Ambiance and service were top-notch.", author: "Sara K." },
  ],
  faqs: [
  { question: "Do you offer vegan options?", answer: "Yes, we have a dedicated vegan menu section." },
  { question: "Can I book a private event?", answer: "Absolutely—contact us for custom bookings." },
  { question: "Is outdoor seating available?", answer: "Yes, we have a beautiful patio for al fresco dining." },
  ],
  };
  

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function RestaurantSite() {
  const router = useRouter();
  const [cat, setCat] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCat(store.StoreCategory ?? []);
    setDishes(store.products ?? []);
    setTestimonials(store.testimonials);
    setFaqs(store.faqs);
  }, []);

  return (
    <div className="relative font-sans text-gray-800">

      {/* Hero */}
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center" style={{ backgroundImage: `url(${store.bannerUrl})` }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1 className="text-5xl md:text-7xl font-extrabold mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            La Tavola Italiana
          </motion.h1>
          <motion.p className="text-xl md:text-2xl mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            A Taste of Tradition, Perfected
          </motion.p>
          <Link href="#menu" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
            View Menu
          </Link>
        </div>
      </section>

      <section className="py-20 bg-white text-gray-800">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <Image src="/images/about.jpg" alt="Chef" width={600} height={400} className="rounded-2xl" loader={loader}/>
          <div>
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-lg mb-6">
              At La Tavola Italiana, we blend timeless family recipes with modern flair. From hand-tossed pizzas to house-made pastas, every dish tells a story.
            </p>
            <p className="text-sm italic">— Chef Antonio Russo</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      {/* Menu Highlights */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Chef's Specials</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-md rounded-2xl overflow-hidden">
                <Image src={`/images/dish${i}.jpg`} alt={`Dish ${i}`} width={400} height={300} className="w-full object-cover" loader={loader}/>
                <div className="p-6 text-left">
                  <h3 className="text-2xl font-semibold mb-2">Signature Dish {i}</h3>
                  <p className="text-sm text-gray-600">A delightful mix of ingredients and tradition.</p>
                  <p className="text-indigo-600 font-bold mt-2">$18.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Menu Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {cat.map((c:any) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => router.push(`/${store.slug}/menu/${c.slug}`)}
                className="relative overflow-hidden rounded-3xl shadow-xl cursor-pointer"
              >
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  layout="responsive"
                  width={300}
                  height={200}
                  objectFit="cover"
                  loader={loader}
                  className="group-hover:scale-110 transform transition"
                />
                <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
                  <span className="text-white text-xl md:text-2xl font-semibold drop-shadow-md">
                    {c.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chef's Specials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Chef's Specials</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish:any) => (
              <motion.div
                key={dish.id}
                whileHover={{ y: -10, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                transition={{ type: 'tween' }}
                onClick={() => router.push(`/${store.slug}/dish/${dish.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="relative h-56">
                  <Image src={dish.imageUrl} alt={dish.name} layout="fill" objectFit="cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{dish.name}</h3>
                  <p className="text-red-600 font-bold">KES {dish.price.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       {/* Testimonials */}
       <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12">What Our Guests Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <blockquote key={i} className="p-6 border-l-4 border-indigo-600 bg-gray-50 rounded-md">
                <p className="italic mb-2">“Amazing food and cozy atmosphere. Will return soon!”</p>
                <footer className="text-sm font-semibold">— Guest {i}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">Reserve Your Table Today</h3>
        <p className="text-lg mb-6">Join us for an unforgettable dining experience.</p>
        <Link href="/reserve" className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition">
          Book Now
        </Link>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">What Our Guests Say</h2>
          <div className="relative max-w-xl mx-auto">
            <AnimatePresence>
              {testimonials.map((t:any, i:any) => (
                <motion.blockquote
                  key={i}
                  initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="italic text-gray-700 text-lg bg-gray-100 p-8 rounded-2xl shadow-lg mb-6"
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((q:any, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-lg cursor-pointer"
              >
                <summary className="text-xl font-semibold text-gray-800">{q.question}</summary>
                <p className="mt-2 text-gray-600">{q.answer}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
