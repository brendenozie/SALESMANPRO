import React from "react";

const Wrapper = () => {
  const data = [
    {
      cover: "fa-solid fa-truck-fast",
      title: "Worldwide Delivery",
      decs: "We offer competitive prices on our 100 million plus product range.",
    },
    {
      cover: "fa-solid fa-id-card",
      title: "Safe Payment",
      decs: "Your payment information is processed securely for a seamless experience.",
    },
    {
      cover: "fa-solid fa-shield",
      title: "Shop With Confidence",
      decs: "Enjoy worry-free shopping with our secure and reliable services.",
    },
    {
      cover: "fa-solid fa-headset",
      title: "24/7 Support",
      decs: "Our dedicated support team is available around the clock to assist you.",
    },
  ];

  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {data.map((val, index) => (
          <div
            key={index}
            className="p-8 bg-white shadow-lg rounded-2xl flex flex-col items-center transition transform hover:scale-105 hover:shadow-xl"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-blue-600 text-white text-3xl rounded-full mb-6">
              <i className={val.cover}></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{val.title}</h3>
            <p className="text-gray-600 text-center text-sm">{val.decs}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Wrapper;
