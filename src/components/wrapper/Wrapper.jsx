import React from "react";
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

const Wrapper = () => {
  const data = [
    {
      icon: <TruckIcon className="h-10 w-10 text-yellow-500" />,
      title: "Worldwide Delivery",
      desc: "We offer competitive prices on our 100 million plus product range.",
    },
    {
      icon: <CreditCardIcon className="h-10 w-10 text-yellow-500" />,
      title: "Safe Payment",
      desc: "Your payment information is processed securely for a seamless experience.",
    },
    {
      icon: <ShieldCheckIcon className="h-10 w-10 text-yellow-500" />,
      title: "Shop With Confidence",
      desc: "Enjoy worry-free shopping with our secure and reliable services.",
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-yellow-500" />,
      title: "24/7 Support",
      desc: "Our dedicated support team is available around the clock to assist you.",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black text-gray-900 dark:text-white">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-8 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-2xl rounded-3xl flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-yellow-500/50 relative overflow-hidden border border-gray-400 dark:border-gray-600"
          >
            <div className="w-20 h-20 flex items-center justify-center bg-yellow-500 text-white rounded-full mb-6 shadow-lg">
              {item.icon}
            </div>
            <h3 className="text-2xl font-extrabold text-yellow-500 mb-3 drop-shadow-lg">
              {item.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {item.desc}
            </p>
            <div className="absolute inset-0 bg-yellow-500 opacity-0 transition-opacity duration-500 hover:opacity-10 rounded-3xl"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Wrapper;
