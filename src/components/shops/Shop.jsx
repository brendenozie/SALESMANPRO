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
    <section className="py-14 px-4 bg-gray-50 dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-500">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Section */}
        <aside className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 border border-gray-200 dark:border-gray-600 transition-colors">
          <h2 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400 mb-4">Brands & Shops</h2>
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 mb-3 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-yellow-400/50 transition-transform transform hover:scale-105 cursor-pointer"
            >
              <img
                src={category.img}
                alt={category.name}
                className="w-12 h-12 object-cover rounded-full border border-yellow-400"
              />
              <span className="text-md font-medium text-gray-800 dark:text-white">
                {category.name}
              </span>
            </div>
          ))}
          <div className="text-center mt-4">
            <button className="px-5 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition flex items-center justify-center gap-2">
              View All <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* Products Section */}
        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">Featured Phones</h2>
            <button className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-medium hover:text-yellow-600 dark:hover:text-yellow-300 transition">
              <span>View All</span>
              <ArrowRightCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <Slider {...sliderSettings} className="py-6">
            {shopItems.map((item, index) => (
              <div key={index} className="px-3">
                <div className="relative group overflow-hidden rounded-xl shadow-md transition-transform transform hover:scale-105 hover:shadow-yellow-400/50">
                  <img
                    src={item.cover}
                    alt={item.name}
                    className="w-full h-72 object-cover rounded-xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-90 group-hover:opacity-95 transition-opacity"></div>
                  <div className="absolute top-3 left-3 bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-md shadow-sm">
                    🔥 Limited Offer
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-white/40 dark:bg-black/60 backdrop-blur-sm p-4 rounded-md shadow-md transition-colors">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-yellow-500 dark:text-yellow-400 font-bold text-md mt-1 inline-block">
                      ${item.price}.00
                    </span>
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-yellow-500 text-gray-900 p-2 rounded-full shadow-md hover:bg-yellow-600 transition"
                      >
                        <PlusIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </main>
      </div>
    </section>
  );
};

export default Shop;
