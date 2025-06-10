import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const SchoolSection = () => {
  return (
    <section className="bg-green-700 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left Image */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          <img
            src="/your-student-image.jpg"
            alt="Student"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Smarter Way to go Through Your School
          </h2>
          <p className="mb-4 text-gray-100 leading-relaxed">
            It the of about everything was at anyone out report first at hired sublime ability what infinity,
            or he your more long rational andmagazine it.
          </p>

          {/* Bullet Points */}
          <ul className="space-y-3 mb-6">
            {[
              'Which goals was produce business latter the allowed of uneasiness.',
              'Will to such provide she he nature, came the.',
              'Which goals was produce business latter the allowed of uneasiness.',
            ].map((text, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircleIcon className="text-yellow-300 mt-1 w-5 h-5"/>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-100">
            There are for have can beginning copy to best which those is a dry a truth, first, poured survey the he
            hung experience represent mathematically its hard off respect not train lay arduous more, early of in office.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SchoolSection;
