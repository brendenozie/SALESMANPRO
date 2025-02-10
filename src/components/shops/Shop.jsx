import React from "react";
import { PlusIcon, ArrowRightIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

const Shop = ({ addToCart,category, shopItems }) => {

  const router = useRouter();
  
  return (
    <section className="py-14 px-4 bg-gray-50 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-500">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Section  */}
        {category && <aside className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 border border-gray-200 dark:border-gray-600">
          <h2 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-4">Brands</h2>
          {category.allBrands && category.allBrands.slice(0, 6).map((brand, index) => (
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
            {shopItems?.products?.map((item, index) => (
              <div key={index} onClick={()=>{ router.push(`/shop/product/${item.id}`)}} className="relative group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition">
                <img src={item.cover} alt={item.newName} className="w-full h-64 object-cover rounded-xl" />
                <div className="mt-3">
                  <h4 className="text-lg font-semibold truncate">{item.newName}</h4>
                  <span className="text-yellow-500 font-bold text-md">${item.sellingPrice}.00</span>
                </div>
                <button onClick={() => addToCart(item)} className="absolute top-3 right-3 bg-yellow-500 text-gray-900 p-2 rounded-full shadow-md hover:bg-yellow-600 transition">
                  <PlusIcon className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
};

export default Shop;