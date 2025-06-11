import React from 'react';

export default function SleepTapeAd() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-100 to-blue-50 py-16">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Text Section */}
        <div className="w-full md:w-1/2">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Ultimate Sleep Tapes
          </h1>
          <h2 className="mt-4 text-3xl font-semibold text-gray-700">
            Relax, Rest, Revive
          </h2>
          <p className="mt-6 text-lg text-gray-700">
            Improve your nightly rest with Blume Sleep Tape. Experience the perfect blend of natural ingredients that promotes deep relaxation and rejuvenation.
          </p>
          <button className="mt-8 bg-black text-white font-medium py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">
            Shop Now
          </button>
        </div>
        {/* Image Section */}
        <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center relative">
          <img
            src="/images/sleep-tape.jpg"  // Replace with your actual image path
            alt="Blume Sleep Tape"
            className="w-72 md:w-80 lg:w-96 rounded-xl shadow-2xl transform md:translate-x-10"
          />
        </div>
      </div>
    </section>
  );
}
