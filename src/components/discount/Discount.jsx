import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Ddata from "./Ddata";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  GifIcon,
  QuestionMarkCircleIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const Dcard = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider {...settings} className="py-8">
      {Ddata.map((value, index) => (
        <div key={index} className="p-4">
          <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-t-xl">
              <img
                src={value.cover}
                alt={value.name}
                className="max-h-full object-contain"
              />
            </div>
            <h4 className="text-lg font-bold text-gray-800 mt-4 truncate">
              {value.name}
            </h4>
            <span className="text-red-500 text-xl font-extrabold mt-2 block">
              ${value.price}
            </span>
          </div>
        </div>
      ))}
    </Slider>
  );
};

const Discount = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-200 py-14">
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <GifIcon className="text-red-500 w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800">Big Discounts</h2>
          </div>
          <div className="flex items-center space-x-3 text-red-600 font-medium cursor-pointer hover:text-red-800 transition">
            <span className="text-lg">View All</span>
            <ArrowRightCircleIcon className="w-6 h-6" />
          </div>
        </div>
        <Dcard />
      </div>
    </section>
  );
};

export default Discount;
