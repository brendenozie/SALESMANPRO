import React, { useState } from "react";

import { HeartIcon,StarIcon,PlusIcon,ArrowRightIcon,ArrowRightCircleIcon } from "@heroicons/react/24/outline";


const Shop = ({ addToCart, shopItems }) => {
  const data = [
    { cateImg: "./images/category/cat-1.png", cateName: "Apple" },
    { cateImg: "./images/category/cat-2.png", cateName: "Samsung" },
    { cateImg: "./images/category/cat-1.png", cateName: "Oppo" },
    { cateImg: "./images/category/cat-2.png", cateName: "Vivo" },
    { cateImg: "./images/category/cat-1.png", cateName: "Redmi" },
    { cateImg: "./images/category/cat-2.png", cateName: "Sony" },
  ];

  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  return (
    <section className="py-16 px-6 ">
      <div className="container mx-auto flex flex-wrap lg:flex-nowrap gap-12">
        {/* Category Section */}
        <div className="w-full lg:w-1/4 bg-white/30 backdrop-blur-lg shadow-lg rounded-2xl p-6 border border-white/40">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Brands & Shops</h2>
          {data.map((value, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 mb-4 bg-white/40 backdrop-blur-lg rounded-xl shadow-md hover:shadow-xl transition-transform transform hover:scale-105 cursor-pointer"
            >
              <img
                src={value.cateImg}
                alt={value.cateName}
                className="w-12 h-12 object-cover rounded-full border border-gray-300"
              />
              <span className="text-lg font-medium text-gray-700">{value.cateName}</span>
            </div>
          ))}
          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2">
              View All Brands <ArrowRightIcon className="h-8 w-4"/>
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="w-full lg:w-3/4 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">Featured Phones</h2>
           
            <button className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-800 transition">
              <span className="text-lg">View All</span>
              <ArrowRightCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {shopItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/30 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105 p-6 border border-white/40"
              >
                <div className="relative">
                  <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 text-sm font-semibold rounded-lg">
                    {item.discount}% Off
                  </span>
                  <img
                    src={item.cover}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-3 right-3 flex flex-col items-center space-y-2">
                    <label className="bg-white px-3 py-1 rounded-lg shadow-md text-sm font-medium">{count}</label>
                    <HeartIcon
                      className="h-8 w-8 text-red-500 text-lg cursor-pointer hover:scale-110 transform transition"
                      onClick={increment}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                  <div className="text-yellow-500 flex space-x-1 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i}  className="h-14 w-14"/>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <h4 className="text-xl font-bold text-gray-800">${item.price}.00</h4>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                    >
                      <PlusIcon  className=" h-8 w-8"/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;
