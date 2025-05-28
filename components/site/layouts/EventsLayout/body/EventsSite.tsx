import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "VibrantEvents",
slug: "vibrantevents",
description: "Join the most exciting events around you.",
bannerUrl: "/images/events-hero.jpg",
categories: [
{ id: 1, name: "Music", slug: "music", icon: "/icons/music.svg" },
{ id: 2, name: "Art", slug: "art", icon: "/icons/art.svg" },
{ id: 3, name: "Tech", slug: "tech", icon: "/icons/tech.svg" },
{ id: 4, name: "Wellness", slug: "wellness", icon: "/icons/wellness.svg" },
],
upcoming: [
{ id: "e1", name: "Summer Beats Festival", date: "2025-06-15", subtitle: "Live music under the stars.", imageUrl: "/events/beatfest.jpg", slug: "summer-beats" },
{ id: "e2", name: "Art & Wine Night", date: "2025-07-05", subtitle: "Sip and create masterpieces.", imageUrl: "/events/artwine.jpg", slug: "art-wine" },
{ id: "e3", name: "Tech Innovators Summit", date: "2025-08-20", subtitle: "Where ideas meet reality.", imageUrl: "/events/techsummit.jpg", slug: "tech-summit" },
],
testimonials: [
{ quote: "Best event experience ever!", author: "Alex P." },
{ quote: "Unforgettable memories.", author: "Jamie L." },
],
faqs: [
{ question: "Can I get a refund?", answer: "Full refunds available up to 48 hours before the event." },
{ question: "Are events kid-friendly?", answer: "Family-friendly sections available in select events." },
],
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function EventsSite() {
const router = useRouter();
const [categories, setCategories] = useState<any[]>([]);
const [upcoming, setUpcoming] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setCategories(store.categories);
setUpcoming(store.upcoming);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

return ( <div className="space-y-24 font-sans">
{/* Hero */}
<section className="relative h-[70vh] bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600 flex items-center justify-center text-white overflow-hidden"> <Image
       src={store.bannerUrl}
       alt="Events Hero"
       fill
       className="object-cover opacity-30"
       loader={loader}
     /> <div className="relative z-10 text-center px-6 max-w-xl">
<motion.h1
initial={{ y: -40, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4 leading-tight"
>
{store.name} Events
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="text-lg md\:text-xl mb-8"
>
{store.description}
</motion.p>
<motion.button
onClick={() => router.push(`/${store.slug}/events`)}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.6 }}
className="bg-white text-indigo-700 font-semibold py-3 px-8 rounded-full shadow-lg hover\:shadow-2xl transition"
>
Explore Events
</motion.button> </div> </section>


  {/* Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Event Categories
      </motion.h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => router.push(`/${store.slug}/category/${cat.slug}`)}
          >
            <div className="w-16 h-16 mb-3">
              <Image src={cat.icon} alt={cat.name} width={64} height={64} loader={loader} />
            </div>
            <p className="text-lg font-medium text-gray-800">{cat.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Upcoming Events */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-12 text-gray-800">
        Upcoming Events
      </motion.h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {upcoming.map((ev) => (
          <motion.div
            key={ev.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/event/${ev.slug}`)}
          >
            <div className="relative h-56">
              <Image src={ev.imageUrl} alt={ev.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-gray-900">{ev.name}</h3>
              <p className="text-indigo-600 font-medium">{new Date(ev.date).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-700">{ev.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Attendee Reviews */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold mb-12 text-gray-800">
        Attendee Reviews
      </motion.h2>
      <div className="max-w-2xl mx-auto space-y-8">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 * i }}
            className="italic text-gray-700 text-lg"
          >
            “{t.quote}”<br />
            <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
          </motion.blockquote>
        ))}
      </div>
    </div>
  </section>

  {/* FAQs */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6 max-w-3xl">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl font-bold text-center mb-10 text-gray-800">
        FAQs
      </motion.h2>
      <div className="space-y-4">
        {faqs.map((q, i) => (
          <motion.details key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + 0.1 * i }} className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer">
            <summary className="font-semibold text-gray-800">{q.question}</summary>
            <p className="mt-2 text-gray-600">{q.answer}</p>
          </motion.details>
        ))}
      </div>
    </div>
  </section>
</div>


);
}
