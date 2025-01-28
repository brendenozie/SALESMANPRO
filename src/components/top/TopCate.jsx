import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Tdata from "./Tdata";

const TopCate = () => {
  const settings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
  };

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-border-all text-xl"></i>
            <h2 className="text-2xl font-bold">Top Categories</h2>
          </div>
          <div className="flex items-center space-x-2 text-blue-500 cursor-pointer hover:underline">
            <span>View all</span>
            <i className="fa-solid fa-caret-right"></i>
          </div>
        </div>
        <Slider {...settings}>
          {Tdata.map((value, index) => (
            <div className="p-4" key={index}>
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 bg-blue-800 text-white text-xs px-3 py-1 rounded-full">
                  {value.para}
                </div>
                <div className="absolute top-2 right-2 bg-gray-200 text-black text-xs px-3 py-1 rounded-full">
                  {value.desc}
                </div>
                <img src={value.cover} alt="" className="w-full h-48 object-cover" />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TopCate;
