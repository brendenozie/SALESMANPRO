import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sample data
const store = {
name: "SavoryBites Restaurant",
slug: "savorybites",
description: "Indulge in gourmet flavors crafted for your delight.",
bannerUrl: "/images/restaurant-hero.jpg",
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

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
`${src}?w=${width}&q=${quality || 75}`;

export default function RestaurantSite() {
const router = useRouter();
const [categories, setCategories] = useState<any[]>([]);
const [featuredDishes, setFeaturedDishes] = useState<any[]>([]);
const [testimonials, setTestimonials] = useState<any[]>([]);
const [faqs, setFaqs] = useState<any[]>([]);

useEffect(() => {
setCategories(store.StoreCategory);
setFeaturedDishes(store.products);
setTestimonials(store.testimonials);
setFaqs(store.faqs);
}, []);

const handleReserve = () => {
router.push(`/${store.slug}/reserve`);
};

return ( <div className="space-y-20 font-sans">
{/* Hero  */}
<section className="relative h-screen bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white flex items-center justify-center"> <Image src={store.bannerUrl} alt="Hero" fill className="object-cover opacity-30" loader={loader} /> <div className="relative z-10 text-center px-6 max-w-md">
<motion.h1
initial={{ y: -50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ duration: 0.8 }}
className="text-5xl md\:text-7xl font-bold mb-4"
>
{store.name}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="text-lg md\:text-xl mb-6"
>
{store.description}
</motion.p>
<motion.button
onClick={handleReserve}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ delay: 0.6 }}
className="bg-white text-red-600 font-semibold py-3 px-8 rounded-full shadow-lg hover\:shadow-xl transition"
>
Reserve Now
</motion.button> </div> </section>


  {/* Menu Categories */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Menu Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
            onClick={() => router.push(`/${store.slug}/menu/${cat.slug}`)}
          >
            <Image
              src={cat.imageUrl}
              alt={cat.name}
              fill
              className="object-cover"
              loader={loader}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="text-white text-xl font-semibold">{cat.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Featured Dishes */}
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Chef's Specials</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredDishes.map((dish, i) => (
          <motion.div
            key={dish.id}
            whileHover={{ y: -10 }}
            transition={{ type: 'tween' }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
            onClick={() => router.push(`/${store.slug}/dish/${dish.id}`)}
          >
            <div className="relative h-56">
              <Image src={dish.imageUrl} alt={dish.name} fill className="object-cover" loader={loader} />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{dish.name}</h3>
              <p className="text-red-600 font-bold">KES {dish.price.toLocaleString()}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl font-bold mb-12 text-gray-800">What Our Guests Say</h2>
      <div className="space-y-8 max-w-2xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, x: -30 }}
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
      <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((q, i) => (
          <motion.details
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer"
          >
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
