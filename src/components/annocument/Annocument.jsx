import React from "react";

const Annocument = () => {
  return (
    <section className="py-16 px-8 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* First Image Section */}
        <div className="relative group overflow-hidden rounded-3xl shadow-2xl h-[360px] border border-yellow-500/30">
          <img
            src="./images/banner-1.png"
            alt="Exclusive Offer"
            className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-300/80 via-transparent to-transparent group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-6 left-6 z-10">
            <h3 className="text-3xl font-extrabold text-yellow-500 drop-shadow-lg">
              Special Deals
            </h3>
            <p className="text-gray-800 dark:text-gray-300 text-base mt-2">
              Don’t miss out on our exclusive offers!
            </p>
          </div>
        </div>

        {/* Second Image Section */}
        <div className="relative group overflow-hidden rounded-3xl shadow-2xl h-[360px] border border-yellow-500/30">
          <img
            src="./images/banner-2.png"
            alt="Limited Time"
            className="w-full h-full object-cover group-hover:scale-105 transform transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-300/80 via-transparent to-transparent group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-6 left-6 z-10">
            <h3 className="text-3xl font-extrabold text-yellow-500 drop-shadow-lg">
              Limited Time Offer
            </h3>
            <p className="text-gray-800 dark:text-gray-300 text-base mt-2">
              Hurry up! Grab your favorite items now!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Annocument;
