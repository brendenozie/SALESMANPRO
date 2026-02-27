'use client';

import React from 'react';

const NewsletterSection =() => {
  return (
    <section className="py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="text-gray-600 mb-6">Get the latest offers and updates straight to your inbox.</p>
        <form className="max-w-md mx-auto flex">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
          />
          <button className="px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-r-lg">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
