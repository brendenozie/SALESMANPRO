import React from "react";

const Wrapper = () => {
  const data = [
    {
      cover: "fa-solid fa-truck-fast",
      title: "Worldwide Delivery",
      decs: "We offer competitive prices on our 100 million plus product any range.",
    },
    {
      cover: "fa-solid fa-id-card",
      title: "Safe Payment",
      decs: "We offer competitive prices on our 100 million plus product any range.",
    },
    {
      cover: "fa-solid fa-shield",
      title: "Shop With Confidence ",
      decs: "We offer competitive prices on our 100 million plus product any range.",
    },
    {
      cover: "fa-solid fa-headset",
      title: "24/7 Support ",
      decs: "We offer competitive prices on our 100 million plus product any range.",
    },
  ];

  return (
    <section className="bg-gray-100 py-8 text-center">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {data.map((val, index) => (
          <div key={index} className="p-6 bg-white shadow-lg rounded-lg flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center bg-blue-500 text-white text-2xl rounded-full mb-4">
              <i className={val.cover}></i>
            </div>
            <h3 className="text-lg font-semibold">{val.title}</h3>
            <p className="text-gray-600 mt-2 text-sm">{val.decs}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Wrapper;
