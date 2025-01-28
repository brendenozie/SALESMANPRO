import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Ddata from "./Ddata";
import { Gift, ChevronRight } from "lucide-react";

const Dcard = () => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider {...settings} className="py-6">
      {Ddata.map((value, index) => (
        <div key={index} className="p-4">
          <div className="bg-white shadow-lg rounded-lg p-4 text-center">
            <div className="w-full h-40 flex items-center justify-center">
              <img src={value.cover} alt={value.name} className="max-h-full object-contain" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mt-3">{value.name}</h4>
            <span className="text-red-500 text-lg font-bold">${value.price}</span>
          </div>
        </div>
      ))}
    </Slider>
  );
};

const Discount = () => {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Gift className="text-red-500" size={30} />
            <h2 className="text-2xl font-bold text-gray-800">Big Discounts</h2>
          </div>
          <div className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 cursor-pointer">
            <span className="text-lg font-medium">View all</span>
            <ChevronRight size={20} />
          </div>
        </div>
        <Dcard />
      </div>
    </section>
  );
};

export default Discount;
