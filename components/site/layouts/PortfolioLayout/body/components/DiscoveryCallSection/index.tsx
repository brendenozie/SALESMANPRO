import React from 'react';

const DiscoveryCallSection = () => {
  return (
    <section className="bg-teal-800 py-12 px-6 lg:px-20 rounded-2xl text-center text-white mx-4 lg:mx-auto max-w-6xl my-12">
      <h2 className="text-2xl md:text-3xl font-bold leading-snug">
        Do You Want to Be an <span className="text-white/90">Exceptionally</span><br />
        Successful Business Owner?
      </h2>
      <p className="mt-4 text-white/80 max-w-2xl mx-auto text-sm md:text-base">
        Join our coaching program and learn valuable insights and strategies from experienced
        professionals who have achieved great success in their own businesses.
      </p>
      <button className="mt-6 bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition font-medium">
        Schedule a Free Discovery Call Today
      </button>
    </section>
  );
};

export default DiscoveryCallSection;
