import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  BoltIcon,
  HeartIcon,
  StarIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const SampleNextArrow = ({ onClick }) => (
  <button
    className="absolute z-10 top-1/2 right-4 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition"
    onClick={onClick}
    aria-label="Next Slide"
  >
    <ArrowRightIcon className="h-5 w-5" />
  </button>
);

const SamplePrevArrow = ({ onClick }) => (
  <button
    className="absolute z-10 top-1/2 left-4 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-500 transition"
    onClick={onClick}
    aria-label="Previous Slide"
  >
    <ArrowLeftIcon className="h-5 w-5" />
  </button>
);

const FlashCard = ({ productItems, addToCart }) => {
  const [likedItems, setLikedItems] = useState({});

  const toggleLike = (id) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Slider {...settings} className="py-8">
      {productItems.map((product) => (
        <div key={product.id} className="p-4">
          <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative group">
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.discount}% Off
              </span>
              <img
                src={product.cover}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={() => toggleLike(product.id)}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition ${
                  likedItems[product.id] ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
                }`}
                aria-label="Like Product"
              >
                <HeartIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {product.name}
              </h3>
              <div className="flex justify-center mt-2 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < product.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}.00
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition"
                  aria-label="Add to Cart"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </Slider>
  );
};

const FlashDeals = ({ productItems, addToCart }) => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-3 mb-6">
          <BoltIcon className="text-yellow-500 h-8 w-8" />
          <h1 className="text-3xl font-bold text-gray-800">Flash Deals</h1>
        </div>
        <FlashCard productItems={productItems} addToCart={addToCart} />
      </div>
    </section>
  );
};

export default FlashDeals;
