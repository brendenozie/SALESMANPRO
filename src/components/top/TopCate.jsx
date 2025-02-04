import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Tdata from "./Tdata";
import { ArrowRightCircleIcon, ArrowLeftCircleIcon } from "@heroicons/react/24/outline";

// Custom Arrow Buttons
const CustomPrevArrow = (props) => (
  <button
    {...props}
    className="absolute top-1/2 left-[-50px] transform -translate-y-1/2 bg-neutral-200 dark:bg-neutral-700 p-3 rounded-full shadow-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all backdrop-blur-md"
  >
    <ArrowLeftCircleIcon className="text-black dark:text-white text-xl" />
  </button>
);

const CustomNextArrow = (props) => (
  <button
    {...props}
    className="absolute top-1/2 right-[-50px] transform -translate-y-1/2 bg-neutral-200 dark:bg-neutral-700 p-3 rounded-full shadow-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all backdrop-blur-md"
  >
    <ArrowRightCircleIcon className="text-black dark:text-white text-xl" />
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
          <h2 className="text-5xl font-extrabold text-black dark:text-white tracking-wide">
            Explore <span className="text-yellow-400">Top Categories</span>
          </h2>
          <button className="text-yellow-400 text-lg font-medium hover:text-yellow-300 transition flex items-center space-x-2">
            <span>View All</span>
            <ArrowRightCircleIcon className="text-lg" />
          </button>
        </div>

        <Slider {...settings}>
          {categories.map((value, index) => (
            <div key={index} className="px-6">
              <div className="relative group overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl">
                <img
                  src={value.cover}
                  alt="Category"
                  className="w-full h-[420px] object-cover rounded-xl transform transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30 dark:from-white/90 dark:to-white/30 opacity-85 group-hover:opacity-100 transition-opacity"></div>

                <div className="absolute inset-0 group-hover:bg-white/10 dark:group-hover:bg-black/10 group-hover:blur-xl transition-all duration-500"></div>

                <div className="absolute bottom-6 left-6 right-6 bg-neutral-200 dark:bg-neutral-700 backdrop-blur-md p-6 rounded-lg shadow-lg transition-all duration-500 group-hover:bg-neutral-300 dark:group-hover:bg-neutral-600">
                  {value.tags.map((tag, idx) => (
                    <span key={idx} className="text-sm font-semibold text-black dark:text-white bg-yellow-400 px-4 py-1 mx-2 rounded-md shadow-md">
                      {tag}
                    </span>
                  ))}
                  <h3 className="text-2xl font-bold mt-3 text-black dark:text-white drop-shadow-lg">
                    {value.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TopCate;
