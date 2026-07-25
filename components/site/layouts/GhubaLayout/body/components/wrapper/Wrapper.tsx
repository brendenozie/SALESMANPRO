import React from "react";
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

const Wrapper = ({ pageData }: { pageData: any }) => {
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
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 px-8">
        {data.map((item, index) => (
          <div key={index}>
            <FeatureCard item={item} index={index}/>
          </div>
        ))}
      </div>
    </section>
  );
};

function FeatureCard({ item, index }) {
  return (
    <div
      key={index}
      className="p-6 sm:p-8 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-xl rounded-3xl flex flex-col items-center text-center transition-transform duration-300 transform hover:scale-105 hover:shadow-yellow-400/60 relative overflow-hidden border border-gray-300 dark:border-gray-600"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-yellow-300 text-white rounded-full mb-4 sm:mb-6 shadow-md">
        {item.icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-2 sm:mb-3 drop-shadow-md">
        {item.title}
      </h3>
      <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs">
        {item.desc}
      </p>
      <div className="absolute inset-0 bg-yellow-400 opacity-0 transition-opacity duration-300 hover:opacity-20 rounded-3xl pointer-events-none"></div>
    </div>
  );
}


export default Wrapper;
