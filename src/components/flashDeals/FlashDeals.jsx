import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Bolt, Heart, Star, Plus, ArrowLeft, ArrowRight } from "lucide-react";

const SampleNextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="absolute top-1/2 right-0 transform -translate-y-1/2" onClick={onClick}>
      <button className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700">
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="absolute top-1/2 left-0 transform -translate-y-1/2" onClick={onClick}>
      <button className="bg-gray-800 text-white p-2 rounded-full shadow-md hover:bg-gray-700">
        <ArrowLeft size={20} />
      </button>
    </div>
  );
};

const FlashCard = ({ productItems, addToCart }) => {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <Slider {...settings} className="py-6">
      {productItems.map((product, index) => (
        <div key={index} className="p-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="relative">
              <span className="absolute top-2 left-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                {product.discount}% Off
              </span>
              <img src={product.cover} alt={product.name} className="w-full h-40 object-cover" />
              <div className="absolute top-2 right-2 flex flex-col items-center">
                <span className="text-gray-600 text-sm">{count}</span>
                <Heart className="text-red-500 cursor-pointer" onClick={increment} />
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
              <div className="flex justify-center mt-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} />
                ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <h4 className="text-xl font-bold text-gray-900">${product.price}.00</h4>
                <button onClick={() => addToCart(product)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                  <Plus size={20} />
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
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center space-x-3">
          <Bolt className="text-yellow-500" size={30} />
          <h1 className="text-2xl font-bold text-gray-800">Flash Deals</h1>
        </div>
        <FlashCard productItems={productItems} addToCart={addToCart} />
      </div>
    </section>
  );
};

export default FlashDeals;
