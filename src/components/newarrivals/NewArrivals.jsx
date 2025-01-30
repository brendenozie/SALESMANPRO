import React from "react";
import Ndata from "./Ndata";

const NewArrivals = () => {
  return (
    <section className=" py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-3">
            <img
              src="https://img.icons8.com/glyph-neue/64/26e07f/new.png"
              alt="New"
              className="w-12 h-12 animate-bounce"
            />
            <h2 className="text-3xl font-extrabold text-gray-800">New Arrivals</h2>
          </div>
          <button className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-800 transition">
            <span className="text-lg">View All</span>
            <i className="fa-solid fa-caret-right text-lg"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Ndata.map((val, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-md rounded-xl hover:shadow-lg transition-shadow text-center transform hover:scale-105"
            >
              <div className="mb-6">
                <img
                  src={val.cover}
                  alt={val.name}
                  className="w-full h-56 object-cover rounded-lg transition-transform hover:scale-110"
                />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 truncate">
                {val.name}
              </h4>
              <span className="text-red-500 font-bold text-lg mt-2 inline-block">
                ${val.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
