import React from "react";

const Annocument = () => {
  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 h-[340px]">
          <img
            src="./images/banner-1.png"
            alt="Banner 1"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full md:w-2/3 h-[340px]">
          <img
            src="./images/banner-2.png"
            alt="Banner 2"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Annocument;
