import React from "react";
import { TruckIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";
import { EditableElement } from "@/contexts/EditableContentContext";

const Wrapper = ({ pageData }: { pageData: any }) => {
  const data = [
    {
      icon: <TruckIcon className="h-10 w-10 text-yellow-500" />,
      title: "Fast Local Delivery",
      desc: "Fast, tracked delivery via verified couriers across Nairobi and nationwide Kenya.",
    },
    {
      icon: <CreditCardIcon className="h-10 w-10 text-yellow-500" />,
      title: "M-Pesa & Card Escrow",
      desc: "Protected payments. Sellers receive funds only after verified delivery.",
    },
    {
      icon: <ShieldCheckIcon className="h-10 w-10 text-yellow-500" />,
      title: "Verified Kenyan Stores",
      desc: "Every shop and craftsman on Ghuba is physically vetted for genuine quality.",
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-yellow-500" />,
      title: "Direct Store Support",
      desc: "Dedicated WhatsApp & call assistance directly connecting you with local vendors.",
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
      <EditableElement
        targetId={`ghuba.home.features.items.${index}.title`}
        label={`Feature ${index + 1} Title`}
        type="text"
        defaultValue={item.title}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-500 mb-2 sm:mb-3 drop-shadow-md">
          {item.title}
        </h3>
      </EditableElement>
      <EditableElement
        targetId={`ghuba.home.features.items.${index}.description`}
        label={`Feature ${index + 1} Description`}
        type="textarea"
        defaultValue={item.desc}
      >
        <p className="text-gray-800 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs">
          {item.desc}
        </p>
      </EditableElement>
      <div className="absolute inset-0 bg-yellow-400 opacity-0 transition-opacity duration-300 hover:opacity-20 rounded-3xl pointer-events-none"></div>
    </div>
  );
}


export default Wrapper;
