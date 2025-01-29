import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

const SidebarCategories = ({ showCategories, categories }) => {
  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate={showCategories ? "visible" : "hidden"}
      variants={categoryVariants}
      className="relative flex flex-col w-full md:w-1/4 bg-gradient-to-br from-[${slide.bgFrom || '#1e1e2e'}] to-[${slide.bgTo || '#151526'}] 
                 text-white p-6 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
    >
      {/* Floating Glassmorphism Effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl"></div>

      {/* Title Section */}
      <h2 className="relative z-10 text-2xl font-extrabold mb-6 flex items-center space-x-3">
        <span className="text-indigo-400">🔳</span> 
        <span>Categories</span>
      </h2>

      {/* Categories List */}
      <ul className="relative z-10 space-y-4" role="list">
        {categories.map(({ name }) => (
          <motion.li
            key={name}
            role="listitem"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-4 text-white hover:text-white cursor-pointer 
                       transition-transform duration-300"
          >
            <CheckCircleIcon className="h-5 w-5 text-indigo-400" />
            <span className=" text-2xl font-medium">{name}</span>
          </motion.li>
        ))}
      </ul>

      {/* Floating Decorations */}
      <div className="absolute w-24 h-24 bg-indigo-500 opacity-30 blur-3xl rounded-full top-6 left-6"></div>
      <div className="absolute w-32 h-32 bg-purple-700 opacity-30 blur-3xl rounded-full bottom-6 right-6"></div>
    </motion.div>
  );
};

const slideVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const    SliderComponent = ({ promoSlides, sliderSettings }) => (
  <Slider {...sliderSettings}>
    {promoSlides.map((slide) => (
      // <SlideCard key={slide.id} slide={slide} />
      <SlideCard key={slide.id} slide={slide} />
    ))}
  </Slider>
);

const Home = () => {
  const [showCategories, setShowCategories] = useState(true);

  const categories = [
    "Fashion", "Electronics", "Cars", "Home & Garden", "Gifts", "Music", "Health & Beauty", "Pets", "Baby Toys", "Groceries", "Books"
  ].map(name => ({ name }));

  const promoSlides = [
    { id: 1, title: "50% Off On Your First Purchase", description: "Exclusive discounts!", img: "/images/SlideCard/slide-1.png" },
    { id: 2, title: "Limited Time Offer", description: "Shop now for amazing discounts!", img: "/images/SlideCard/slide-2.png" },
    { id: 3, title: "New Arrivals", description: "Explore the latest trends!", img: "/images/SlideCard/slide-3.png" },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <section className="py-16 px-6 mt-20 bg-gradient-to-br from-blue-100 to-indigo-300 text-gray-900">
      <div className="flex flex-col md:flex-row gap-6">
        <button
          className="md:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg mb-4"
          onClick={() => setShowCategories(!showCategories)}
        >
          {showCategories ? "Hide Categories" : "Show Categories"}
        </button>
        <SidebarCategories showCategories={showCategories} categories={categories} />
        <div className="w-full md:w-3/4">
          <SliderComponent promoSlides={promoSlides} sliderSettings={sliderSettings} />
        </div>
      </div>
    </section>
  );
};

export default Home;


const SlideCard = ({ slide }) => {
  const motionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      variants={motionVariants}
      initial="hidden"
      animate="visible"
      className="relative flex flex-col md:flex-row items-center justify-center w-full 
                 bg-gradient-to-br from-[${slide.bgFrom || '#1e1e2e'}] to-[${slide.bgTo || '#151526'}] 
                 text-white p-8 md:p-12 rounded-3xl shadow-2xl border border-white/10 overflow-hidden h-[650px]"
    >
      {/* Floating Glassmorphism Effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-lg rounded-3xl"></div>

      {/* Left Content Section */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center text-center md:text-left md:items-start space-y-6">
        <motion.h2 variants={motionVariants} className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
          {slide.title}
        </motion.h2>
        <motion.p variants={motionVariants} className="text-lg md:text-xl text-gray-100">
          {slide.description}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 
                     text-white font-semibold rounded-xl shadow-lg transition"
        >
          Learn More
        </motion.button>
      </div>

      {/* Right Image Section */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        className="relative z-10 w-full md:w-1/2 flex justify-center items-center"
      >
        <Image
          src={slide.img}
          alt={slide.alt || slide.title}
          loader={loader}
          width={350}
          height={350}
          loading="lazy"
          className="w-[350px] h-[350px] object-contain filter brightness-110 contrast-125 
                     transition-transform hover:scale-105 hover:rotate-1"
        />
      </motion.div>

      {/* Floating Decorations */}
      <div className="absolute w-40 h-40 bg-indigo-500 opacity-30 blur-3xl rounded-full top-8 left-8"></div>
      <div className="absolute w-52 h-52 bg-purple-700 opacity-30 blur-3xl rounded-full bottom-8 right-8"></div>
    </motion.div>
  );
};

