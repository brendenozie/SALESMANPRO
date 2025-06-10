import React from 'react';

export default function HeroSection() {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-[80vh]" style={{ backgroundImage: 'url("/your-hero-image.jpg")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-xl md:text-2xl mb-2">Welcome to</h2>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Dorik School</h1>
          <div className="flex space-x-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded">Get Started</button>
            <button className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded border border-gray-300">Watch Video</button>
          </div>
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto -mt-20 p-6">
        {/* Card 1 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img src="/scholarship.jpg" alt="Scholarship Facility" className="w-full h-60 object-cover" />
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Scholarship Facility</h3>
            <span className="text-orange-500 text-xl">→</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img src="/academics.jpg" alt="Academics" className="w-full h-60 object-cover" />
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Academics</h3>
            <span className="text-orange-500 text-xl">→</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img src="/school-life.jpg" alt="School Life" className="w-full h-60 object-cover" />
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">School Life</h3>
            <span className="text-orange-500 text-xl">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
