import React from "react";

const Announcement = () => {
  const banners = [
    {
      src: "./images/banner-1.png",
      title: "Special Deals",
      description: "Don’t miss out on our exclusive offers!",
    },
    {
      src: "./images/banner-2.png",
      title: "Limited Time Offer",
      description: "Hurry up! Grab your favorite items now!",
    },
  ];

  return (
    <section className="py-14 px-6 bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
        {banners.map((banner, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-2xl shadow-xl h-80 border border-yellow-400/30 transition-transform duration-500 hover:scale-105"
          >
            <img
              src={banner.src}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 drop-shadow-md">
                {banner.title}
              </h3>
              <p className="text-gray-200 dark:text-gray-300 text-sm md:text-base mt-1">
                {banner.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Announcement;
