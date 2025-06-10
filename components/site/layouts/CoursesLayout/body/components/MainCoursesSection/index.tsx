import { StarIcon, TvIcon, UsersIcon } from '@heroicons/react/24/outline';
import React from 'react';

const courses = [
  {
    title: 'Electrical Engineering',
    image: '/electrical.jpg',
  },
  {
    title: 'General English',
    image: '/english.jpg',
  },
  {
    title: 'Civil Engineering',
    image: '/civil.jpg',
  },
  {
    title: 'Textile Engineering',
    image: '/textile.jpg',
  },
  {
    title: 'Mathematics',
    image: '/math.jpg',
  },
  {
    title: 'Information Technology',
    image: '/it.jpg',
  },
];

const MainCoursesSection = () => {
  return (
    <section className="py-20 px-4 bg-white text-center">
      {/* Heading */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Main Courses</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          It the of about everything was at anyone out report first at hired sublime ability what infinity, or your rational andmagazine it
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {courses.map((course, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden border">
            <img src={course.image} alt={course.title} className="w-full h-52 object-cover" />
            <div className="p-5 text-left">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-4">
                His able orthographic entered not look had the alone to their could and
              </p>
              {/* Info row */}
              <div className="flex items-center text-sm text-gray-600 gap-4 mb-4">
                <span className="flex items-center gap-1"><TvIcon className='w-5 h-5' /> 3rd Grade</span>
                <span className="flex items-center gap-1"><StarIcon className='w-5 h-5' /> 3.00</span>
                <span className="flex items-center gap-1"><UsersIcon className='w-5 h-5' /> 50</span>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-sm font-semibold">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="mt-10 flex justify-center items-center gap-4">
        <button className="p-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100">
          <span className="text-xl">&larr;</span>
        </button>
        <button className="p-2 border border-gray-300 rounded-full bg-orange-500 text-white hover:bg-orange-600">
          <span className="text-xl">&rarr;</span>
        </button>
      </div>
    </section>
  );
};

export default MainCoursesSection;
