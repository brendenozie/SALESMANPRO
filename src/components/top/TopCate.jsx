import React, {useState} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Tdata from "./Tdata";
import { ArrowRightCircleIcon, ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import load from "../../assets/load.png";
import Image from "next/image";

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};

// Custom Arrow Buttons
const CustomPrevArrow = (props) => (
  <button
    {...props}
    className="absolute top-1/2 left-[-15px] z-10 transform -translate-y-1/2 bg-yellow-400 dark:bg-yellow-400 p-3 rounded-full shadow-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all backdrop-blur-md"
  >
    <ArrowLeftCircleIcon className="text-black dark:text-white text-lg h-14 w-14" />
  </button>
);

const CustomNextArrow = (props) => (
  <button
    {...props}
    className="absolute top-1/2 right-[-15px] z-10 transform -translate-y-1/2 bg-yellow-400 dark:bg-yellow-400 p-3 rounded-full shadow-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all backdrop-blur-md"
  >
    <ArrowRightCircleIcon className="text-black dark:text-white text-lg h-14 w-14" />
  </button>
);

const TopCate = ({ categories }) => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    cssEase: "cubic-bezier(0.4, 0, 0.2, 1)",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center space-x-2 mt-6">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-neutral-400 dark:bg-neutral-600 rounded-full transition-all duration-300 hover:bg-neutral-600 dark:hover:bg-neutral-400"></div>
    ),
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-white via-neutral-100 to-white dark:from-black dark:via-gray-900 dark:to-black transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-xl md:text-5xl lg:text-5xl font-extrabold text-black dark:text-white tracking-wide">
            Explore <span className="text-yellow-400">Top Categories</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="px-5 py-2 bg-yellow-400 text-black rounded-full shadow-md hover:bg-yellow-300 transition flex items-center space-x-2"
          >
            <span>View All</span>
            <ArrowRightCircleIcon className="w-6 h-6" />
          </motion.button>
        </div>

        <Slider {...settings}>
          {categories.map((value, index) => (
            <CategoryCard value={value} index={index}/>
          ))}
        </Slider>
      </div>
    </section>
  );
};

function CategoryCard({ value, index }) {

  const [imageError, setImageError] = useState(false);

  return (
    <div key={index} className="px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="relative group overflow-hidden rounded-2xl shadow-lg transition-transform duration-500 hover:scale-105 hover:shadow-2xl">
        <Image
            width={300}
            height={300}
            loader = {loaderProp}
            src={imageError ? load.src : value.cover}
            alt={`Product image of ${value.name}`}
            className="w-full h-96 object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
            onError={() => setImageError(true)}
          />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent dark:from-white/80 dark:to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>

        <div className="absolute inset-0 group-hover:bg-white/10 dark:group-hover:bg-black/10 backdrop-blur-md transition duration-500"></div>

        <div className="absolute bottom-4 left-4 right-4 bg-white/70 dark:bg-black/70 backdrop-blur-lg p-4 rounded-xl shadow-md transition-colors duration-500 group-hover:bg-white/80 dark:group-hover:bg-black/80">
          <div className="flex flex-wrap gap-2">
            {value.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-yellow-400 px-3 py-1 rounded-full shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {value.name}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default TopCate;
