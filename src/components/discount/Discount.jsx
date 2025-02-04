import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Ddata from "./Ddata";
import { GifIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const Dcard = ({productItems, addToCart}) => {
  
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider {...settings} >
      {productItems.map((value, index) => (
        <div key={index} className="px-4">
          <div className="relative group overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            {/* Product Image */}
            <img
              src={value.image}
              alt={value.newName}
              className="w-full h-[380px] object-cover rounded-xl transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30 dark:from-black/90 dark:to-black/40 opacity-90 group-hover:opacity-100 transition-opacity"></div>

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 group-hover:bg-red-500/10 group-hover:blur-xl transition-all duration-500"></div>

            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm px-3 py-1 rounded-md shadow-lg">
              🔥 Limited Offer
            </div>

            {/* Text Box */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/20 dark:bg-gray-800/40 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-500 group-hover:bg-white/30 dark:group-hover:bg-gray-700/40">
              <h4 className="text-xl font-semibold text-white dark:text-gray-100 truncate">
                {value.newName}
              </h4>
              
              <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-red-700">{value.sellingPrice}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addToCart(product)}
                    className="bg-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition"
                    aria-label="Add to Cart"
                  >
                    Add to Cart
                  </motion.button>
                </div>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

const Discount = ({productItems, addToCart}) => {  
  return (
    <section className="relative py-20 bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500">
      <div className="container mx-auto px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-red-700 flex items-center justify-center rounded-full shadow-lg animate-pulse">
              <GifIcon className="text-white w-8 h-8" />
            </div>
            <h2 className="text-5xl font-extrabold text-black dark:text-white tracking-wide">
              <span className="text-red-700 dark:text-red-400">Big</span>{" "}
              Discounts
            </h2>
          </div>
          <button className="text-red-700 dark:text-red-300 text-lg font-medium hover:text-red-400 dark:hover:text-red-200 transition flex items-center space-x-2">
            <span>View All</span>
            <ArrowRightCircleIcon className="w-7 h-7" />
          </button>
        </div>
        <Dcard productItems={productItems} addToCart={addToCart} />
      </div>
    </section>
  );
};

export default Discount;
