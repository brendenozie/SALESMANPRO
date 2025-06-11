"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { ArrowRightIcon } from "@heroicons/react/24/outline";


const dishes = [
  {
    title: "Cheese Burger",
    price: "$11.66",
    img: "/images/burger.jpg",
    desc: "Crispy chicken fillet with cheese, thousand island sauce...",
    accent: "bg-orange-500",
  },
  {
    title: "Wrap Pizza",
    price: "$12.6",
    img: "/images/pizza.jpg",
    desc: "Crispy chicken with garlic sauce, tomato, lettuce...",
    accent: "bg-purple-500",
  },
  {
    title: "Naga Subway",
    price: "$9.4",
    img: "/images/subway.jpg",
    desc: "Spicy & tangy flat chicken wrapped in whole wheat...",
    accent: "bg-teal-400",
  },
];

const features = [
  {
    title: "Fresh, Locally Sourced Ingredients.",
    img: "/images/feature1.jpg",
    bg: "bg-purple-50",
    icon: "♥️",
  },
  {
    title: "Authentic Recipes with a Modern Twist.",
    img: "/images/feature2.jpg",
    bg: "bg-amber-50",
    icon: "🍴",
  },
  {
    title: "Quick and Reliable Home Delivery.",
    img: "/images/feature3.jpg",
    bg: "bg-teal-50",
    icon: "🚚",
  },
];

const testimonials = [
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-yellow-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-pink-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-purple-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-emerald-100",
  },
];


//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// RestaurantSite component, now using StoreContext
//----------------------------------------------
export default function RestaurantSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories,
    marketplaceListings,
    // testimonials,
    faqs,
  } = storeFormData;

  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative font-sans text-gray-800">
      <div className="relative bg-cream min-h-screen text-gray-900">
      {/* Patterned Frame */}
      <div className="fixed inset-y-0 left-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div>
      <div className="fixed inset-y-0 right-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div>

      {/* Header */}
      <motion.header
        className={`sticky top-0 z-30 backdrop-blur-md transition-colors ${
          scrolled ? "bg-cream/90" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo-unbite.svg" width={32} height={32} alt="Logo" loader={loader}/>
              <span className="font-bold text-xl">Unbite</span>
          </Link>
          <nav className="space-x-6 uppercase text-sm font-medium">
            {["Home", "Menu", "About", "Contact"].map((label) => (
              <Link key={label} href={`/${label.toLowerCase()}`}  className="hover:underline">{label}
              </Link>
            ))}
          </nav>
          <Link href="/locations" className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm">
              See Locations
          </Link>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Savor the Taste of <br className="hidden md:block" />
          <span className="text-orange-500">Perfection.</span>
        </h1>
        <p className="max-w-2xl mx-auto mb-6 text-gray-700">
          Fresh ingredients, mouth-watering recipes, and a passion for good
          food delivered to your door or ready for pick-up.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-medium shadow"
        >
          Order Now
        </motion.button>

        <div className="mt-12 mx-auto max-w-3xl relative">
          <Image
            src="/images/hero-springrolls.jpg"
            width={1200}
            height={600}
            className="rounded-xl"
            alt="Spring Rolls"
            loader={loader}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-4 bg-white/70 rounded-full">
              <Image
                src="/icons/play.svg"
                width={48}
                height={48}
                alt="Play"
                loader={loader}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="pt-20 px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Signature Dishes</h2>
          <div className="inline-flex space-x-2">
            {["All Menu", "Burger", "Pizza", "Subway"].map((tab) => (
              <button
                key={tab}
                className="px-4 py-1 text-sm border rounded-full hover:bg-gray-100"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dishes.map((d) => (
            <motion.div
              key={d.title}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow flex flex-col overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={d.img}
                  layout="fill"
                  objectFit="cover"
                  alt={d.title}
                  loader={loader}
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{d.title}</h3>
                  <span className="text-gray-600">{d.price}</span>
                </div>
                <p className="text-sm text-gray-500 flex-1">{d.desc}</p>
                <button
                  className={`mt-4 py-2 rounded-full text-white ${d.accent}`}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Dine With Us */}
      <section className="pt-20 px-6 space-y-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Why Dine with Us?
        </h2>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -5 }}
            className={`${f.bg} rounded-xl p-6 flex flex-col md:flex-row items-center md:space-x-6`}
            style={{ transform: `rotate(${i % 2 === 0 ? "-2deg" : "2deg"})` }}
          >
            <div className="w-32 h-32 relative mb-4 md:mb-0">
              <Image
                src={f.img}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
                alt={f.title}
                loader={loader}
              />
              <div className="absolute top-0 right-0 text-2xl">{f.icon}</div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <Link href="/menu"  className="inline-flex items-center text-orange-500 hover:underline">
                  View Menu <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="pt-20 px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">They Love’s Us</h2>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {testimonials.map((t:any, i) => (
            <div
              key={i}
              className={`${t.bg} min-w-[250px] p-6 rounded-xl flex-shrink-0`}
            >
              <div className="flex mb-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
              </div>
              <h4 className="font-semibold mb-2">Best Salad Man!</h4>
              <p className="text-sm text-gray-600 mb-4">{t.review}</p>
              <p className="text-xs font-medium">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="pt-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-6">
          A Feast for Your Eyes
        </h2>
        <div className="flex gap-4">
          <div className="flex-1 relative h-64 rounded-xl overflow-hidden">
            <Image src="/images/feast1.jpg" layout="fill" objectFit="cover" alt="" loader={loader} />
          </div>
          <div className="w-32 relative h-64 rounded-xl overflow-hidden">
            <Image src="/images/feast2.jpg" layout="fill" objectFit="cover" alt="" loader={loader}/>
          </div>
          <div className="flex-1 relative h-64 rounded-xl overflow-hidden">
            <Image src="/images/feast3.jpg" layout="fill" objectFit="cover" alt="" loader={loader}/>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pt-20 text-center px-6">
        <h2 className="text-4xl font-bold mb-4">Don’t Wait — Order Now!</h2>
        <p className="text-gray-700 mb-6">
          Fresh ingredients, mouth-watering recipes, and a passion for good food
          delivered to your door or ready for pick-up.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium shadow"
        >
          Order Now
        </motion.button>
      </section>

      {/* Footer */}
      <footer className="mt-20 bg-cream py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-semibold mb-4">Navigate</h5>
            <ul className="space-y-2 text-sm">
              {["Home", "Menu", "About", "Contact", "Book Now"].map((l) => (
                <li key={l}>
                  <Link href={`/${l.toLowerCase().replace(" ", "")}`} className="hover:underline">{l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Menu</h5>
            <ul className="space-y-2 text-sm">
              {["Breakfast", "Lunch", "Dinner"].map((l) => (
                <li key={l}>
                  <Link href="/menu"  className="hover:underline">{l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Follow Us</h5>
            <ul className="space-y-2 text-sm">
              {["Facebook", "Instagram", "LinkedIn", "Twitter"].map((s) => (
                <li key={s}>
                  <a href="#" className="hover:underline">{s}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <p className="text-sm">602-776-4735</p>
            <p className="text-sm">1022 South 51st Street, Suite 105</p>
            <p className="text-sm">Phoenix, AZ 85044</p>
            <p className="text-sm">hi@unbite.co</p>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500">
          ©2025 Unbite. All rights reserved. &nbsp;|&nbsp; License &nbsp;|&nbsp;
          ChangeLog &nbsp;|&nbsp; StyleGuide
        </div>
      </footer>
    </div>





































      {/* ── Hero Section ── */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-4">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {name}
          </motion.h1>
          {description && (
            <motion.p
              className="text-xl md:text-2xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {description}
            </motion.p>
          )}
          <Link
            href="#menu"
            className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="py-20 bg-white text-gray-800">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <Image
            src="/images/about.jpg"
            alt="Chef"
            width={600}
            height={400}
            className="rounded-2xl"
            loader={loader}
          />
          <div>
            <h2 className="text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-lg mb-6">
              At {name}, we blend timeless recipes with modern flair. Each
              dish reflects our passion for quality ingredients and authentic
              flavors.
            </p>
            <p className="text-sm italic">— Chef de Cuisine</p>
          </div>
        </div>
      </section>

      {/* ── Menu Categories ── */}
      <section id="menu" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Menu Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {storeCategories.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() =>
                  router.push(`/${slug}/category/${c.id}`)
                }
                className="relative overflow-hidden rounded-3xl shadow-xl cursor-pointer"
              >
                <Image
                  src={c.icon || "/images/placeholder-category.jpg"}
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
                    {c.displayName ?? c.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chef's Specials ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Chef’s Specials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {marketplaceListings.map((dish) => (
              <motion.div
                key={dish.id}
                whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                transition={{ type: "tween" }}
                onClick={() => router.push(`/${slug}/dish/${dish.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer"
              >
                <div className="relative h-56">
                  <Image
                    src={dish.images[0] || "/images/placeholder-dish.jpg"}
                    alt={dish.product?.name ?? dish.title}
                    layout="fill"
                    objectFit="cover"
                    loader={loader}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">
                    {dish.product?.name ?? dish.title}
                  </h3>
                  <p className="text-red-600 font-bold">
                    KES {dish.finalPrice.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reservation CTA ── */}
      <section className="bg-indigo-600 text-white py-16 text-center relative">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Reserve Your Table Today
        </h3>
        <p className="text-lg mb-6">
          Join us for an unforgettable dining experience.
        </p>
        <Link
          href={`/${slug}/reserve`}
          className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-100 transition"
        >
          Book Now
        </Link>
      </section>

      {/* ── Testimonials ── */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            What Our Guests Say
          </h2>
          <div className="relative max-w-xl mx-auto">
            <AnimatePresence>
              {testimonials.map((t, i) => (
                <motion.blockquote
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="italic text-gray-700 text-lg bg-gray-100 p-8 rounded-2xl shadow-lg mb-6"
                >
                  “{t.quote}”
                  <span className="mt-4 block font-semibold text-gray-900">
                    — {t.author}
                  </span>
                </motion.blockquote>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section> */}

      {/* ── FAQs ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-gray-50 p-6 rounded-3xl shadow-lg cursor-pointer"
              >
                <summary className="text-xl font-semibold text-gray-800">
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
