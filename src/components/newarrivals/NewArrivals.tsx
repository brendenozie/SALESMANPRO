import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { ArrowRightCircleIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, ShoppingCartIcon, StarIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const NewArrivals = ({ productItems, addToCart }:any) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<any>({});
  
    const toggleLike = (id : any) => {
      setLikedItems((prev : any) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <motion.section
      className="relative py-10 bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-12 h-12 bg-yellow-500 flex items-center justify-center rounded-full shadow-lg backdrop-blur-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <img src="https://img.icons8.com/glyph-neue/64/ffffff/new.png" alt="New Arrivals Icon" className="w-8 h-8" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Latest <span className="text-yellow-400">Arrivals</span>
            </h2>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="w-full h-80 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {productItems.map((product : any, index : any) => (
              <motion.div onClick={()=>{ router.push(`/shop/product/${product.id}`)}} key={product.id} whileHover={{ scale: 1.05 }} className="p-4">
          <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl overflow-hidden hover:shadow-3xl ">
            <div className="relative group">
              {/* <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-3 py-1 rounded-full shadow-md">
                {product.discount}% Off
              </span> */}
              <img
                src={product.cover}
                alt={`Product image of ${product.title}`}
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
              <h3 className="text-lg font-semibold truncate">{product.title}</h3>
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
                  ${product.finalPrice}
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
              // <motion.div
              //   key={index}
              //   className="p-2 relative"
              //   initial={{ opacity: 0 }}
              //   animate={{ opacity: 1 }}
              //   transition={{ delay: index * 0.2 }}
              // >
              //   <motion.div
              //     className="relative bg-white dark:bg-gray-800 shadow-xl rounded-xl p-4 flex flex-col items-center transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 border border-transparent overflow-hidden backdrop-blur-lg bg-opacity-70"
              //     whileHover={{ scale: 1.05 }}
              //   >
              //     {val.isNew && (
              //       <motion.span
              //         className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse"
              //         animate={{ scale: [1, 1.2, 1] }}
              //         transition={{ repeat: Infinity, duration: 1 }}
              //       >
              //         New
              //       </motion.span>
              //     )}

              //     <div className="relative w-full h-40 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              //       <motion.img
              //         src={val.image}
              //         alt={val.title}
              //         className="w-full h-full object-contain transition-transform duration-300"
              //         whileHover={{ scale: 1.1, rotate: 2 }}
              //       />
              //     </div>

              //     <div className="w-full mt-3 text-center">
              //       <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              //         {val.title}
              //       </h4>
              //       <motion.span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg" whileHover={{ scale: 1.1 }}>
              //         ${val.finalPrice}
              //       </motion.span>
              //       <motion.button
              //         whileHover={{ scale: 1.07 }}
              //         whileTap={{ scale: 0.95 }}
              //         onClick={(e) => {
              //           e.stopPropagation();
              //           addToCart(val);
              //         }}
              //         className="flex items-center bg-yellow-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-yellow-600 transition text-sm mt-2"
              //       >
              //         <ShoppingCartIcon className="w-4 h-4 mr-1" /> Add
              //       </motion.button>
              //     </div>
              //   </motion.div>
              // </motion.div>
            ))}
          </Slider>
        )}
      </div>
    </motion.section>
  );
};

export default NewArrivals;

const CustomNextArrow = (props : any) => {
  const { onClick } = props;
  return (
    <button
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 p-2 rounded-full shadow-md hover:scale-110 transition-all"
      onClick={onClick}
    >
      <ChevronRightIcon className="text-white w-6 h-6" />
    </button>
  );
};

const CustomPrevArrow = (props : any) => {
  const { onClick } = props;
  return (
    <button
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 p-2 rounded-full shadow-md hover:scale-110 transition-all"
      onClick={onClick}
    >
      <ChevronLeftIcon className="text-white w-6 h-6" />
    </button>
  );
};
