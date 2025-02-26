import React, { useState, useEffect, memo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import asset1 from "../../assets/asset1.png";
import asset2 from "../../assets/asset2.png";
import asset3 from "../../assets/asset3.png";

const loader = ({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`;

const CategoriesGrid = ({ categories }) => {
  const router = useRouter();
  return (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] sm:gap-6 px-4 py-4 sm:px-6 sm:py-8">
  {categories.map(({ name, icon }, index) => (
    <motion.div
      onClick={() => {router.push(`/shop/productlist?category=${name}`)}}
      key={index}
      whileHover={{ scale: 1.05 }}
      className="relative bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-2xl transition-transform overflow-hidden"
    >
      {/* Overlay - ensure it's behind the text */}
      {/* <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl z-0"></div> */}
      
      <span className="text-5xl mb-3 relative z-10 drop-shadow-md">{icon}</span>
      <p className="font-bold text-center text-sm sm:text-lg relative z-10 drop-shadow-sm whitespace-normal break-words w-full">
        {name}
      </p>
    </motion.div>
  ))}
</div>
)};

const SliderComponent = ({ promoSlides }) => (
  <Slider dots infinite slidesToShow={1} slidesToScroll={1} autoplay autoplaySpeed={4000} arrows>
    {/* {promoSlides.map((slide) => (
      <SlideCard slide={slide} key={slide.id} />
    ))} */}
    {promoSlides.map((slide, index) => (
      <SlideCard slide={slide} key={slide.id} index={index} />
    ))}
  </Slider>
);

const Home = ({categories}) => {
  
  const promoSlides = [
    { id: 1, title: "50% Off On Your First Purchase", description: "Exclusive discounts just for you.", img: "/images/SlideCard/slide-1.png" },
    { id: 2, title: "Limited Time Offer", description: "Shop now to enjoy amazing deals.", img: "/images/SlideCard/slide-2.png" },
    { id: 3, title: "New Arrivals", description: "Discover the latest trends and products.", img: "/images/SlideCard/slide-3.png" },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black text-gray-800 dark:text-gray-100 px-4 py-8 sm:px-6 sm:py-12 container mx-auto">
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    className="text-center mb-8 sm:mb-14 relative"
  >
    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wide mb-4">
      Uncover <span className="text-yellow-400">Exclusive</span> Deals
    </h1>
    <p className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
      Your gateway to the best offers and latest products.
    </p>
  </motion.div>

  <CategoriesGrid categories={categories} />

  <div className="mt-8 sm:mt-12 sm:px-2 md:px-8 lg:px-8">
    <SliderComponent promoSlides={promoSlides} />
  </div>
</section>

  );
};

export default Home;

const SlideCard = ({ slide, index }) => {
  // Background images array
  const backgroundImages = [asset1, asset2, asset3];

  // Ensure index is valid and fallback to the first image if undefined
  const backgroundImage = backgroundImages[index % backgroundImages.length] || asset1;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.8 }}
      variants={fadeInUp}
      className="relative flex flex-col md:flex-row items-center justify-center w-full text-white p-6 md:p-12 rounded-3xl border border-white/10 overflow-hidden h-auto md:h-[650px] gap-8"
      style={{
        backgroundImage: `url(${backgroundImage.src})`, // ✅ Fix applied
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay to improve text visibility */}
      <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>

      {/* Text Section */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center text-center md:text-left md:items-start space-y-6 min-h-[200px] md:min-h-[450px] overflow-y-auto">
        <motion.h2
          variants={fadeInLeft}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-5xl font-extrabold leading-tight"
        >
          {slide.title}
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          transition={{ delay: 0.4 }}
          className="text-base md:text-xl"
        >
          {slide.description}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 dark:bg-gray-800 dark:hover:bg-gray-700 focus:ring-2 focus:ring-yellow-400 text-white font-semibold rounded-xl shadow-lg transition"
        >
          Learn More
        </motion.button>
      </div>

      {/* Image Section */}
      <motion.div
        variants={scaleUp}
        transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        className="relative z-10 w-full md:w-1/2 flex justify-center items-center"
      >
        <div className="relative w-[350px] h-[350px] md:h-[550px] md:w-[550px] overflow-hidden">
          <Image
            src={slide.img}
            loader={loader}
            alt={slide.title}
            layout="fill"
            objectFit="contain"
            className="transition-transform hover:scale-105 hover:rotate-1 filter brightness-110 contrast-125"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { delay: 0.2, ease: [0.42, 0, 0.58, 1] } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.3, ease: [0.42, 0, 0.58, 1] } },
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

