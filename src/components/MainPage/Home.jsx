import React from "react";
import SlideCard from "./SlideCard";

const Home = () => {
  const data = [
    { cateImg: "./images/category/cat1.png", cateName: "Fashion" },
    { cateImg: "./images/category/cat2.png", cateName: "Electronic" },
    { cateImg: "./images/category/cat3.png", cateName: "Cars" },
    { cateImg: "./images/category/cat4.png", cateName: "Home & Garden" },
    { cateImg: "./images/category/cat5.png", cateName: "Gifts" },
    { cateImg: "./images/category/cat6.png", cateName: "Music" },
    { cateImg: "./images/category/cat7.png", cateName: "Health & Beauty" },
    { cateImg: "./images/category/cat8.png", cateName: "Pets" },
    { cateImg: "./images/category/cat9.png", cateName: "Baby Toys" },
    { cateImg: "./images/category/cat10.png", cateName: "Groceries" },
    { cateImg: "./images/category/cat11.png", cateName: "Books" },
  ];

  return (
    <section className="py-10">
      <div className="container mx-auto flex flex-col md:flex-row gap-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-1/4">
          {data.map((value, index) => (
            <div key={index} className="flex items-center bg-gray-100 p-3 rounded-lg shadow-md hover:bg-gray-200 transition">
              <img src={value.cateImg} alt={value.cateName} className="w-10 h-10 mr-3" />
              <span className="text-sm font-medium">{value.cateName}</span>
            </div>
          ))}
        </div>
        <div className="w-full md:w-3/4">
          <SlideCard />
        </div>
      </div>
    </section>
  );
};

export default Home;
