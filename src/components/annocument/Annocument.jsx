import React from "react";

const Annocument = () => {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
      <div className="container mx-auto flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/3 h-[340px] relative">
          <img
            src="./images/banner-1.png"
            alt="Exclusive Offer"
            className="w-full h-full object-cover rounded-2xl shadow-lg hover:scale-105 transform transition duration-300"
          />
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-4 py-2 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Special Deals</h3>
            <p className="text-gray-600 text-sm">Don’t miss out on our exclusive offers!</p>
          </div>
        </div>

        <div className="w-full md:w-2/3 h-[340px] relative">
          <img
            src="./images/banner-2.png"
            alt="Limited Time"
            className="w-full h-full object-cover rounded-2xl shadow-lg hover:scale-105 transform transition duration-300"
          />
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 px-4 py-2 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800">Limited Time Offer</h3>
            <p className="text-gray-600 text-sm">Hurry up! Grab your favorite items now!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Annocument;
