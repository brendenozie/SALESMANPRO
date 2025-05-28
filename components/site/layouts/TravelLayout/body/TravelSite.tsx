import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
<motion.section
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 1 }}
className="relative h-screen bg-gradient-to-br from-blue-700 to-indigo-500 flex items-center justify-center overflow-hidden"
> <Image
       src={store.bannerUrl}
       alt={store.name}
       fill
       loader={loader}
       className="object-cover opacity-40"
     /> <div className="relative z-10 text-center px-6 max-w-2xl">
<motion.h1
initial={{ y: -50 }}
animate={{ y: 0 }}
transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
className="text-5xl md\:text-7xl font-extrabold text-white mb-4 leading-tight"
>
{store.name}
</motion.h1>
<motion.p
initial={{ x: -50 }}
animate={{ x: 0 }}
transition={{ delay: 0.6 }}
className="text-lg md\:text-xl text-white mb-8"
>
{store.description}
</motion.p>
<motion.button
whileHover={{ scale: 1.05 }}
onClick={() => router.push(`/${store.slug}/contact`)}
className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover\:bg-gray-100 transition"
>
Get In Touch
</motion.button> </div>
</motion.section>


  {/* Expertise Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-center text-gray-800 mb-12">
        Our Expertise
      </motion.h2>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } }
        }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8"
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow cursor-pointer"
            onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}
          >
            <Image src={cat.icon} alt={cat.name} width={80} height={80} loader={loader} className="mb-4" />
            <span className="text-lg font-medium text-gray-700">{cat.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>

  {/* Featured Travel Destinations */}
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center text-gray-800 mb-12">
        Featured Destinations
      </motion.h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.2 } }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12"
      >
        {featured.map((dest) => (
          <motion.div
            key={dest.id}
            variants={{ hidden: { y: 50, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/destination/${dest.id}`)}
          >
            <div className="relative h-64">
              <Image src={dest.imageUrl} alt={dest.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{dest.name}</h3>
              <p className="text-gray-600 mb-6">{dest.subtitle || dest.name}</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 transition">
                Learn More
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>

  {/* Client Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Client Feedback
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
            className="bg-gray-50 p-6 rounded-2xl shadow-lg"
          >
            <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
            <p className="font-semibold text-gray-900">— {t.author}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* FAQs */}
  <section className="py-16 bg-gray-100">
    <div className="container mx-auto px-6 max-w-2xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        FAQs
      </motion.h2>
      <div className="space-y-6">
        {faqs.map((q, i) => (
          <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer">
            <summary className="font-semibold text-gray-800">{q.question}</summary>
            <p className="mt-4 text-gray-600">{q.answer}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>

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
