import React from "react";
import { PlusIcon, ArrowRightIcon, ArrowRightCircleIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const Shop = ({ addToCart,category, shopItems }:any) => {

  const router = useRouter();
  
  return (
    <section className="py-14 px-4 bg-gray-50 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-500">
      <div className="container hidden md:grid mx-auto  grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Section  */}
        {category && <aside className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-4">Brands</h2>
          {category.allBrands && category.allBrands.slice(0, 6).map((brand : any, index : any) => (
            <div key={index} className="flex items-center gap-3 p-3 mb-3 bg-gray-100 dark:bg-gray-900 rounded-lg hover:shadow-lg transition">
              <span className="text-2xl p-2 rounded-full border border-yellow-400 z-10 drop-shadow-md">{category.icon}</span>
              {/* <img src={category.icon} alt={category.name} className="w-12 h-12 object-cover " /> */}
              <span className="text-md font-medium">{brand}</span>
            </div>
          ))}
          <div className="text-center mt-4">
            <button className="px-5 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition flex items-center justify-center gap-2">
              View All <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </aside>}

        {/* Products Section */}
        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">Featured {category.name}</h2>
            <button className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-medium hover:text-yellow-600 transition">
              <span>View All</span>
              <ArrowRightCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {shopItems?.products?.map((item : any, index : any) => (
              <div key={index} onClick={()=>{ router.push(`/shop/product/${item.id}`)}} className="relative group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                <img src={item.cover} alt={item.title} className="w-full h-64 object-cover rounded-xl" />
                <div className="mt-3">
                  <h4 className="text-lg font-semibold truncate">{item.title}</h4>
                  {/* <span className="text-yellow-500 font-bold text-md">${item.sellingPrice}.00</span> */}
                </div>
                {/* <button onClick={() => addToCart(item)} className="absolute top-3 right-3 bg-yellow-500 text-gray-900 p-2 rounded-full shadow-md hover:bg-yellow-600 transition">
                  <PlusIcon className="h-6 w-6" />
                </button> */}
                 {/* Price & Add to Cart Button */}
                  <div className="flex justify-between items-center w-full mt-2">
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg md:text-xl">
                      ${item.finalPrice}
                    </span>
      
                    <motion.button
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accidental navigation
                        addToCart(item);
                      }}
                      className="flex items-center bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition text-sm md:text-base"
                      aria-label="Add to Cart"
                    >
                      <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" /> Add
                    </motion.button>
                  </div>
              </div>
              
            ))}
          </div>
        </main>
      </div>
      <div className="container md:hidden mx-auto">
        {/* Category Section as Scrollable Tabs */}
        {category && (
          <aside className="flex overflow-x-auto space-x-4 pb-4 mb-6">
            {category.allBrands?.slice(0, 6).map((brand : any, index : any) => (
              <div key={index} className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <span className="text-2xl p-2 rounded-full border border-yellow-400">{category.icon}</span>
                <span className="text-xs font-medium">{brand}</span>
              </div>
            ))}
          </aside>
        )}

        {/* Products Section */}
        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">Featured {category.name}</h2>
            <button className="text-yellow-500 dark:text-yellow-400 flex items-center">
              <span>View All</span>
              <ArrowRightCircleIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Responsive Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProductGrid shopItems={shopItems} />
          </div>
        </main>
      </div>

    </section>
  );
};

export default Shop;

const ProductGrid = ({ shopItems } : any) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
      {shopItems?.products?.map((item : any, index : any) => (
        <motion.div
          key={index}
          className="relative bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-4 flex flex-col items-center transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400"
          whileHover={{ scale: 1.03 }}
        >
          {/* Product Image */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 shadow-md">
            <motion.img
              src={item.cover}
              alt={item.title}
              className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
              whileHover={{ rotate: 2 }}
            />
          </div>

          {/* Product Info */}
          <div className="w-full mt-3 flex flex-col items-center">
            <h4 className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white text-center truncate w-full">
              {item.title}
            </h4>

            <span className="text-yellow-600 dark:text-yellow-400 font-bold text-lg md:text-xl mt-1">
              ${item.finalPrice}.00
            </span>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-2 rounded-full shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition"
            aria-label="Add to Cart"
          >
            <PlusIcon className="h-5 w-5" />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
};


