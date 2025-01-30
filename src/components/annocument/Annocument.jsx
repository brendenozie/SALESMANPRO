import React from "react";

const Annocument = () => {
  return (
    <section className=" py-16 px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* First Image Section */}
        <div className="relative group overflow-hidden rounded-2xl shadow-lg h-[340px]">
          <img
            src="./images/banner-1.png"
            alt="Exclusive Offer"
            className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="absolute bottom-4 left-4 z-10">
            <h3 className="text-white text-2xl font-bold">Special Deals</h3>
            <p className="text-gray-200 text-sm mt-1">
              Don’t miss out on our exclusive offers!
            </p>
          </div>
        </div>

        {/* Second Image Section */}
        <div className="relative group overflow-hidden rounded-2xl shadow-lg h-[340px]">
          <img
            src="./images/banner-2.png"
            alt="Limited Time"
            className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="absolute bottom-4 left-4 z-10">
            <h3 className="text-white text-2xl font-bold">Limited Time Offer</h3>
            <p className="text-gray-200 text-sm mt-1">
              Hurry up! Grab your favorite items now!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Annocument;
