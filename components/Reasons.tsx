import React from "react";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.png";
import image4 from "../assets/image4.png";
import nb from "../assets/nb.png";
import adidas from "../assets/adidas.png";
import nike from "../assets/nike.png";
import tick from "../assets/tick.png";

const Reasons = () => {
  return (
    <section className=" text-gray-900 py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Gallery Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <img
                src={image1.src}
                alt="A salesperson closing a deal"
                className="w-full h-80 lg:h-[28rem] object-cover rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
              />
            </div>
            <img
              src={image2.src}
              alt="Efficient management of sales"
              className="w-full h-40 lg:h-52 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <img
              src={image3.src}
              alt="A dashboard showcasing sales analytics"
              className="w-full h-40 lg:h-52 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            />
            {/* <img
              src={image4.src}
              alt="Customer interactions using the app"
              className="w-full h-40 lg:h-52 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            /> */}
          </div>

          {/* Text Section */}
          <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="uppercase text-base lg:text-lg font-semibold text-[#fa5042] tracking-widest">
              Key Benefits
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span className="text-[#fa5042]">Why</span> Choose{" "}
              <span className="text-[#ffa739]">Salesman App?</span>
            </h2>

            {/* Reasons List */}
            <ul className="flex flex-col gap-6 text-lg lg:text-xl font-medium">
              {[
                "Streamline your sales process effortlessly",
                "Track real-time performance and analytics",
                "Boost productivity with AI-powered tools",
                "Foster stronger customer relationships",
              ].map((reason, index) => (
                <li key={index} className="flex items-center gap-4">
                  <img
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    src={tick.src}
                    alt="Checkmark"
                  />
                  <span className="text-gray-600 hover:text-gray-900 transition-colors">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>

            {/* Partners Section */}
            <div className="mt-6">
              <p className="text-gray-500 text-sm font-semibold mb-4">
                Trusted by Industry Leaders
              </p>
              <div className="flex gap-8 items-center">
                {[nb, adidas, nike].map((company, idx) => (
                  <img
                    key={idx}
                    src={company.src}
                    alt={`Partner ${idx + 1}`}
                    className="w-14 h-auto filter grayscale hover:grayscale-0 transition-all"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reasons;
