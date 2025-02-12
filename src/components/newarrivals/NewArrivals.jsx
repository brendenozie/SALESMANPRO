import React from "react";
import { ArrowRightCircleIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useRouter } from "next/router";


const NewArrivals = ({ productItems, addToCart, decreaseQuantity, removeFromCart }) => {
  const router = useRouter();
  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-14 h-14 bg-yellow-500 flex items-center justify-center rounded-full shadow-lg"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <img
                src="https://img.icons8.com/glyph-neue/64/ffffff/new.png"
                alt="New Arrivals Icon"
                className="w-10 h-10"
              />
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
              Latest <span className="text-yellow-400">Arrivals</span>
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="px-5 py-2 bg-yellow-400 text-black rounded-full shadow-md hover:bg-yellow-300 transition flex items-center space-x-2"
          >
            <span>View All</span>
            <ArrowRightCircleIcon className="w-6 h-6" />
          </motion.button>
        </div>

        <ProductGrid productItems={productItems} addToCart={addToCart} />

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {productItems.map((val, index) => (
            <motion.div onClick={()=>{ router.push(`/shop/product/${val.id}`)}}
              key={index}
              className="relative group overflow-hidden rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img
                src={val.cover}
                alt={`Product image of ${val.newName}`}
                className="w-full h-64 sm:h-72 md:h-80 lg:h-[420px] object-cover transform transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:opacity-100 transition-opacity"></div>

              <div className="absolute bottom-6 left-6 right-6 bg-white/30 dark:bg-black/40 backdrop-blur-md p-5 rounded-xl shadow-xl">
                <h4 className="text-xl font-semibold text-white truncate">
                  {val.newName}
                </h4>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-xl font-bold text-yellow-300">
                    ${val.sellingPrice}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addToCart(val)}
                    className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded-full shadow-md hover:bg-yellow-500 transition"
                    aria-label="Add to Cart"
                  >
                    <ShoppingCartIcon className="w-5 h-5 mr-1" /> Add
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div> */}
      </div>
    </section>
  );
};

export default NewArrivals;

const ProductGrid = ({ productItems, addToCart }) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
      {productItems.map((val, index) => (
        <motion.div
          key={index}
          className="relative bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 flex flex-col items-center transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400"
          whileHover={{ scale: 1.03 }}
          onClick={() => router.push(`/shop/product/${val.id}`)}
        >
          {/* Product Image */}
          <div className="relative w-full h-44 md:h-52 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
            <motion.img
              src={val.image}
              alt={val.newName}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
              whileHover={{ rotate: 2 }}
            />
          </div>

          {/* Product Info */}
          <div className="w-full mt-3 flex flex-col items-center">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-center truncate w-full">
              {val.newName}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
              {val.description || "No description available"}
            </p>

            {/* Price & Add to Cart Button */}
            <div className="flex justify-between items-center w-full mt-2">
              <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg md:text-xl">
                ${val.sellingPrice}
              </span>

              <motion.button
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accidental navigation
                  addToCart(val);
                }}
                className="flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition text-sm md:text-base"
                aria-label="Add to Cart"
              >
                <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Add
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};






