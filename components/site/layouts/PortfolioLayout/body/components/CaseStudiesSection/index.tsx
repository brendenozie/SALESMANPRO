import React from 'react';

const CaseStudiesSection = () => {
  return (
    <section className="px-6 lg:px-20 py-12 bg-white">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-center mb-10">
        Coaching <span className="text-teal-700">Case Studies</span>
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/case1.jpg"
            alt="Planning"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Card 2 - Text with CTA */}
        <div className="bg-peach-100 bg-orange-50 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Find a Business <br /><span className="text-teal-700">Coach</span></h3>
            <p className="text-gray-600 text-sm">
              With our expertise and experience, we can offer valuable insights and strategies to help grow your business successfully.
            </p>
          </div>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition w-fit">
            Schedule a Call
          </button>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/case2.jpg"
            alt="Team Coaching"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Card 4 */}
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <img
            src="/case3.jpg"
            alt="Cleanio"
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-teal-700 text-white px-3 py-1 text-sm rounded-full shadow-lg">
            Cleanio Cleaning Case Study
          </div>
        </div>

        {/* Card 5 */}
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="/case4.jpg"
            alt="Cleaner"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Card 6 - Stat Card */}
        <div className="bg-teal-800 text-white p-6 rounded-xl flex flex-col justify-center items-center text-center">
          <p className="text-3xl font-bold mb-2">90%</p>
          <p className="text-sm">Client Success Rate</p>
          <div className="mt-4 w-full">
            <svg className="w-16 h-16 mx-auto opacity-30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6 4 4 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
