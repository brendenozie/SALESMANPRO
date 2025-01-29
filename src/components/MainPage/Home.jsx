import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";

const CategoryCard = ({ icon, name }) => (
  <motion.div
    className="flex flex-col items-center bg-white/30 backdrop-blur-lg p-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 border border-white/40"
    whileHover={{ scale: 1.1 }}
  >
    <i className={`${icon} text-4xl text-indigo-500 mb-3`}></i>
    <span className="text-gray-800 font-medium text-center text-lg">{name}</span>
  </motion.div>
);

const Home = () => {
  const categories = [
    { icon: "fas fa-tshirt", name: "Fashion" },
    { icon: "fas fa-tv", name: "Electronics" },
    { icon: "fas fa-car", name: "Cars" },
    { icon: "fas fa-home", name: "Home & Garden" },
    { icon: "fas fa-gift", name: "Gifts" },
    { icon: "fas fa-music", name: "Music" },
    { icon: "fas fa-heart", name: "Health & Beauty" },
    { icon: "fas fa-paw", name: "Pets" },
    { icon: "fas fa-baby", name: "Baby Toys" },
    { icon: "fas fa-shopping-basket", name: "Groceries" },
    { icon: "fas fa-book", name: "Books" },
  ];

  const carouselData = [
    {
      title: "Discover New Styles",
      desc: "Find the latest trends in fashion.",
      cover: "/images/SlideCard/slide-1.png",
    },
    {
      title: "Upgrade Your Tech",
      desc: "Explore cutting-edge electronics.",
      cover: "/images/SlideCard/slide-2.png",
    },
    {
      title: "Ride in Style",
      desc: "Shop for the latest car accessories.",
      cover: "/images/SlideCard/slide-3.png",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    appendDots: (dots) => (
      <ul className="space-x-2 flex justify-center mt-4">{dots}</ul>
    ),
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900">
      <div className="container mx-auto grid gap-12 lg:grid-cols-4">
        {/* Categories Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={index} icon={category.icon} name={category.name} />
          ))}
        </div>

        {/* Carousel Section */}
        <div className="lg:col-span-3 w-full">
          <Slider {...sliderSettings}>
            {carouselData.map((item, index) => (
              <div
                key={index}
                className="relative w-full h-80 sm:h-[500px] bg-gray-800 rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                  <motion.h1
                    className="text-3xl sm:text-5xl font-extrabold text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.title}
                  </motion.h1>
                  <motion.p
                    className="text-lg sm:text-xl text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {item.desc}
                  </motion.p>
                  <motion.button
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
                    whileHover={{ scale: 1.1 }}
                  >
                    Explore Now
                  </motion.button>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Home;
