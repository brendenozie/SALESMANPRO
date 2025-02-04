import React from "react";
import { PlusIcon, ArrowRightIcon, ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Shop = ({ addToCart, shopItems }) => {
  const categories = [
    { img: "./images/category/cat-1.png", name: "Apple" },
    { img: "./images/category/cat-2.png", name: "Samsung" },
    { img: "./images/category/cat-1.png", name: "Oppo" },
    { img: "./images/category/cat-2.png", name: "Vivo" },
    { img: "./images/category/cat-1.png", name: "Redmi" },
    { img: "./images/category/cat-2.png", name: "Sony" },
  ];

  const sliderSettings = {
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
    <section className="py-16 px-6 bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-500 text-gray-900 dark:text-white">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Category Section */}
        <div className="bg-gray-100 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-700 shadow-xl rounded-3xl p-6 border border-gray-300 dark:border-gray-600 transition-colors duration-500">
          <h2 className="text-3xl font-bold text-yellow-500 dark:text-yellow-400 mb-6">Brands & Shops</h2>
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 mb-4 bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-yellow-500/50 transition-transform transform hover:scale-105 cursor-pointer"
            >
              <img
                src={category.img}
                alt={category.name}
                className="w-14 h-14 object-cover rounded-full border-2 border-yellow-400"
              />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</span>
            </div>
          ))}
          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-xl shadow-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2">
              View All Brands <ArrowRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-extrabold text-yellow-500 dark:text-yellow-400">Featured Phones</h2>
            <button className="flex items-center space-x-2 text-yellow-500 dark:text-yellow-400 font-semibold hover:text-yellow-600 dark:hover:text-yellow-300 transition">
              <span className="text-lg">View All</span>
              <ArrowRightCircleIcon className="w-7 h-7" />
            </button>
          </div>

          <Slider {...sliderSettings} className="py-8">
            {shopItems.map((item, index) => (
              <div key={index} className="px-4">
                <div className="relative group overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-yellow-500/50">
                  <img
                    src={item.cover}
                    alt={item.name}
                    className="w-full h-[380px] object-cover rounded-xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30 dark:from-black/90 dark:to-black/40 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4 bg-yellow-500 text-gray-900 text-sm px-3 py-1 rounded-md shadow-lg">
                    🔥 Limited Offer
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 bg-white/30 dark:bg-black/50 backdrop-blur-md p-6 rounded-lg shadow-lg transition-colors duration-500">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-yellow-500 dark:text-yellow-400 font-bold text-lg mt-2 inline-block">
                      ${item.price}.00
                    </span>
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-yellow-500 text-gray-900 p-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
                      >
                        <PlusIcon className="h-8 w-8" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Shop;
