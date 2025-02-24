import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GifIcon, ArrowRightCircleIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const Dcard = ({ productItems, addToCart }) => {
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

  const router = useRouter();

  return (
    <Slider {...settings}>
      {productItems.map((value, index) => (
        <motion.div onClick={()=>{ router.push(`/shop/product/${value.id}`)}}
          key={index}
          className="px-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
            <img
              src={value.image}
              alt={value.title}
              className="w-full h-[380px] object-cover transform transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>

            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-bounce">
              🔥 Limited Offer
            </div>

            <div className="absolute bottom-6 left-6 right-6 bg-white/30 backdrop-blur-lg p-4 rounded-xl shadow-xl">
              <h4 className="text-xl font-semibold text-white truncate">
                {value.title}
              </h4>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xl font-bold text-yellow-300">
                  ${value.finalPrice}
                </span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(value)}
                  className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full shadow-md hover:bg-yellow-500 transition"
                  aria-label="Add to Cart"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-1" /> Add
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </Slider>
  );
};

const Discount = ({ productItems, addToCart, decreaseQuantity, removeFromCart }) => {
  return (
    <section className="relative py-20 bg-gradient-to-b from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-14 h-14 bg-red-700 flex items-center justify-center rounded-full shadow-lg"
              animate={{ rotate: [0, 20, -20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <GifIcon className="text-white w-8 h-8" />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-black dark:text-white">
              <span className="text-red-700 dark:text-red-400">Big</span> Discounts
            </h2>
          </div>

          <button className="flex items-center text-red-700 dark:text-red-300 text-lg font-medium hover:text-red-500 transition space-x-2">
            <span>View All</span>
            <ArrowRightCircleIcon className="w-6 h-6" />
          </button>
        </div>

        <Dcard productItems={productItems} addToCart={addToCart} />
      </div>
    </section>
  );
};

export default Discount;