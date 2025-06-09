import React from 'react';

const AboutSection = () => {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-12 bg-white">
      {/* Left Side - Image */}
      <div className="relative mb-10 lg:mb-0">
        <div className="rounded-xl overflow-hidden bg-teal-800 w-[320px] h-[420px] flex items-center justify-center">
          <img
            src="/coach.jpg" // Replace with your actual image path
            alt="Business Coach"
            className="object-cover h-full"
          />
        </div>
        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-orange-500 p-2 rounded-full shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zm0 2c-2.667 0-8 1.333-8 4v2h16v-2c0-2.667-5.333-4-8-4z"
            />
          </svg>
        </div>
      </div>

      {/* Right Side - Text */}
      <div className="max-w-xl text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Meet the Business Coach
        </h2>
        <h3 className="text-2xl text-teal-700 font-semibold mb-4">
          Brittany Jones
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          As a former business owner, entrepreneur, and corporate executive, I have gained valuable insights into the pressures, dilemmas, and challenges faced in the business world. Through coaching and mentoring, I aim to share my wealth of knowledge and provide the necessary support for their development.
        </p>

        {/* Stats */}
        <div className="flex justify-center lg:justify-start gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">12+</p>
            <p className="text-sm text-gray-600">Expert Coaches</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">16+</p>
            <p className="text-sm text-gray-600">Years of Experience</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">10+</p>
            <p className="text-sm text-gray-600">Award Won</p>
          </div>
        </div>

        {/* Button */}
        <button className="bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition">
          Learn More About Me
        </button>
      </div>
    </section>
  );
};

export default AboutSection;
