import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

const CategoriesGrid = ({ categories }) => (
  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-6 lg:gap-6 px-2 py-2 sm:px-6 sm:py-8 lg:px-6 lg:py-2">
    {categories.map(({ name, icon }, index) => (
      <motion.div
        key={index}
        whileHover={{ scale: 1.1, rotate: 1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-transform hover-glow relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl opacity-20"></div>
        <motion.div className="text-5xl mb-3 z-10 drop-shadow-md" whileHover={{ rotate: 10 }}>{icon}</motion.div>
        <p className="font-bold text-center text-lg z-10 drop-shadow-sm">{name}</p>
      </motion.div>
    ))}
  </div>
);

const SliderComponent = ({ promoSlides }) => (
  <Slider
    dots={true}
    infinite={true}
    slidesToShow={1}
    slidesToScroll={1}
    autoplay={true}
    autoplaySpeed={4000}
    arrows={true}
  >
    {promoSlides.map((slide) => (
      <SlideCard slide={slide} key={slide.id} />
    ))}
  </Slider>
);

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const categories = [
    { name: "Fashion", icon: "👗" },
    { name: "Electronics", icon: "📱" },
    { name: "Cars", icon: "🚗" },
    { name: "Home & Garden", icon: "🏡" },
    { name: "Gifts", icon: "🎁" },
    { name: "Music", icon: "🎵" },
    { name: "Health & Beauty", icon: "💄" },
    { name: "Pets", icon: "🐾" },
    { name: "Baby Toys", icon: "🧸" },
    { name: "Groceries", icon: "🛒" },
    { name: "Books", icon: "📚" },
    { name: "View All", icon: "📚" }
  ];

  const promoSlides = [
    { id: 1, title: "50% Off On Your First Purchase", description: "Exclusive discounts just for you.", img: "/images/SlideCard/slide-1.png" },
    { id: 2, title: "Limited Time Offer", description: "Shop now to enjoy amazing deals.", img: "/images/SlideCard/slide-2.png" },
    { id: 3, title: "New Arrivals", description: "Discover the latest trends and products.", img: "/images/SlideCard/slide-3.png" },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black text-black dark:text-white px-6 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-14 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-transparent to-yellow-500 dark:from-gray-800 dark:to-gray-700 opacity-20 blur-3xl"></div>
        <h1 className="text-6xl font-extrabold tracking-wide mb-4 drop-shadow-2xl">
          Uncover <span className="text-yellow-400">Exclusive</span> Deals
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Your gateway to the best offers and latest products.
        </p>
      </motion.div>

      <CategoriesGrid categories={categories} />

      <div className="mt-12 sm:px-2 md:px-8 lg:px-8">
        <SliderComponent promoSlides={promoSlides} />
      </div>
    </section>
  );
};

export default Home;

const SlideCard = ({ slide }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative flex flex-col md:flex-row items-center justify-center w-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-white p-8 md:p-12 rounded-3xl border border-white/10 overflow-hidden h-[650px]"
  >
    <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-3xl"></div>
    <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center text-center md:text-left md:items-start space-y-6">
      <motion.h2 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>{slide.title}</motion.h2>
      <motion.p className="text-lg md:text-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{slide.description}</motion.p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 dark:bg-gray-800 dark:hover:bg-gray-700 focus:ring-2 focus:ring-yellow-400 text-white font-semibold rounded-xl shadow-lg transition"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Learn More
      </motion.button>
    </div>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
      className="relative z-10 w-full md:w-1/2 flex justify-center items-center"
    >
      <Image
        src={slide.img}
        alt={slide.title}
        loader={loader}
        width={350}
        height={350}
        loading="lazy"
        className="w-[350px] h-[350px] object-contain filter brightness-110 contrast-125 transition-transform hover:scale-105 hover:rotate-1"
      />
    </motion.div>
  </motion.div>
);
