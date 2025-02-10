import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  BoltIcon,
  HeartIcon,
  StarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ShoppingCartIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

const SampleNextArrow = ({ onClick }) => (
  <button
    className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 bg-yellow-500 text-black p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
    onClick={onClick}
    aria-label="Next Slide"
  >
    <ArrowRightIcon className="h-6 w-6" />
  </button>
);

const SamplePrevArrow = ({ onClick }) => (
  <button
    className="absolute z-10 top-1/2 left-4 transform -translate-y-1/2 bg-yellow-500 text-black p-3 rounded-full shadow-xl hover:scale-110 transition-transform"
    onClick={onClick}
    aria-label="Previous Slide"
  >
    <ArrowLeftIcon className="h-6 w-6" />
  </button>
);

const FlashCard = ({ productItems, addToCart }) => {
  const [likedItems, setLikedItems] = useState({});

  const toggleLike = (id) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const router = useRouter();

  return (
    <Slider {...settings} className="py-8">
      {productItems.map((product) => (
        <motion.div onClick={()=>{ router.push(`/shop/product/${product.id}`)}} key={product.id} whileHover={{ scale: 1.05 }} className="p-4">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl overflow-hidden hover:shadow-3xl ">
            <div className="relative group">
              <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full shadow-md">
                {product.discount}% Off
              </span>
              <img
                src={product.cover}
                alt={`Product image of ${product.name}`}
                className="w-full h-56 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => toggleLike(product.id)}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-transform hover:scale-110 ${
                  likedItems[product.id]
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 dark:bg-gray-700 text-white"
                }`}
                aria-label="Like Product"
              >
                <HeartIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold truncate">{product.name}</h3>
              <div className="flex justify-center mt-2 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < product.rating
                        ? "text-yellow-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-yellow-500">
                  ${product.sellingPrice}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                  className="flex items-center bg-yellow-500 text-black p-3 rounded-full shadow-lg hover:shadow-xl transition"
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

const FlashDeals = ({ productItems, addToCart, decreaseQuantity, removeFromCart }) => {
  return (
    <section className="py-12 bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black text-black dark:text-white transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BoltIcon className="text-yellow-500 h-8 w-8 animate-pulse" />
            <h1 className="text-4xl font-extrabold tracking-wide text-yellow-500">
              Flash Deals
            </h1>
          </div>
        </div>
        <FlashCard productItems={productItems} addToCart={addToCart} />
      </div>
    </section>
  );
};

export default FlashDeals;

