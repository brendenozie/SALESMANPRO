import React from "react";
import Cart from "./Cart";
import Ndata from "./Ndata";

const NewArrivals = () => {
  return (
    <section className="bg-gray-100 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <img src="https://img.icons8.com/glyph-neue/64/26e07f/new.png" alt="New" className="w-10 h-10" />
            <h2 className="text-2xl font-bold">New Arrivals</h2>
          </div>
          <div className="flex items-center space-x-2 text-blue-500 cursor-pointer hover:underline">
            <span>View all</span>
            <i className="fa-solid fa-caret-right"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Ndata.map((val, index) => (
            <div key={index} className="bg-white p-4 shadow-lg rounded-lg text-center">
              <div className="mb-4">
                <img src={val.cover} alt={val.name} className="w-full h-48 object-cover rounded" />
              </div>
              <h4 className="text-lg font-medium">{val.name}</h4>
              <span className="text-red-500 font-semibold text-sm">${val.price}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
