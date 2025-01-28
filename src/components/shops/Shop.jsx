import React, { useState } from "react";

const Shop = ({ addToCart, shopItems }) => {
  const data = [
    { cateImg: "./images/category/cat-1.png", cateName: "Apple" },
    { cateImg: "./images/category/cat-2.png", cateName: "Samsung" },
    { cateImg: "./images/category/cat-1.png", cateName: "Oppo" },
    { cateImg: "./images/category/cat-2.png", cateName: "Vivo" },
    { cateImg: "./images/category/cat-1.png", cateName: "Redmi" },
    { cateImg: "./images/category/cat-2.png", cateName: "Sony" },
  ];

  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  return (
    <section className="bg-gray-100 py-8">
      <div className="container mx-auto flex flex-wrap">
        {/* Category Section */}
        <div className="w-full md:w-1/4 p-4 bg-white shadow-lg rounded-lg">
          <div className="text-xl font-semibold border-b pb-2 mb-4">Brands & Shops</div>
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-200 hover:bg-white rounded-lg transition">
              <img src={value.cateImg} alt={value.cateName} className="w-10 h-10" />
              <span className="text-lg font-medium">{value.cateName}</span>
            </div>
          ))}
          <div className="text-center mt-6">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">View All Brands</button>
          </div>
        </div>

        {/* Products Section */}
        <div className="w-full md:w-3/4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mobile Phones</h2>
            <div className="text-blue-500 cursor-pointer hover:underline flex items-center">
              View all <i className="ml-2 fa-solid fa-caret-right"></i>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.map((item, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-4">
                <div className="relative">
                  <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-lg">
                    {item.discount}% Off
                  </span>
                  <img src={item.cover} alt={item.name} className="w-full h-48 object-cover rounded-lg" />
                  <div className="absolute top-2 right-2 flex flex-col items-center">
                    <label className="text-sm bg-white px-2 py-1 rounded-lg shadow">{count}</label>
                    <i className="fa-regular fa-heart text-red-500 cursor-pointer" onClick={increment}></i>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <div className="text-yellow-500 text-sm space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa fa-star"></i>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <h4 className="text-lg font-bold">${item.price}.00</h4>
                    <button onClick={() => addToCart(item)} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;
