import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Tdata from "./Tdata";

const TopCate = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="py-12 ">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-full">
              <i className="fa-solid fa-border-all text-white text-lg"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Top Categories</h2>
          </div>
          <button className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-800 transition">
            <span>View All</span>
            <i className="fa-solid fa-caret-right text-lg"></i>
          </button>
        </div>
        <Slider {...settings}>
          {Tdata.map((value, index) => (
            <div className="p-4" key={index}>
              <div className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  {value.para}
                </span>
                <span className="absolute top-2 right-2 bg-gray-300 text-gray-800 text-xs px-3 py-1 rounded-full">
                  {value.desc}
                </span>
                <img
                  src={value.cover}
                  alt="Category"
                  className="w-full h-48 object-cover transition-transform hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700 truncate">
                    {value.title}
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
