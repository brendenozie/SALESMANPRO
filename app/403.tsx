import { NextPage } from "next";
import Link from "next/link";
import React from "react";

const Custom403: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-lg mx-auto">
        {/* Illustration or icon to visually represent the concept */}
        <div className="mb-8">
          {/* A simple lock icon or a more detailed illustration works great here */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 md:h-32 md:w-32 mx-auto text-purple-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18 8H17V6C17 3.243 14.757 1 12 1S7 3.243 7 6V8H6C4.897 8 4 8.897 4 10V22C4 23.103 4.897 24 6 24H18C19.103 24 20 23.103 20 22V10C20 8.897 19.103 8 18 8ZM9 6C9 4.346 10.346 3 12 3S15 4.346 15 6V8H9V6ZM18 22H6V10H18V22Z" />
            <path d="M12 17C10.895 17 10 16.105 10 15S10.895 13 12 13 14 13.895 14 15 13.105 17 12 17Z" />
          </svg>
        </div>

        {/* Clear and bold heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Access Denied
        </h1>

        {/* Informative and calm subheading */}
        <p className="text-lg md:text-xl text-gray-400 mb-8">
          You don't have the necessary permissions to view this page.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Main call-to-action button, styled for prominence */}
          <Link
            href="/signin"
            className="inline-block px-8 py-4 text-lg font-medium rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300 shadow-lg transform hover:scale-105"
          >
            Login
          </Link>
          
          {/* Secondary, less prominent button for an alternative path */}
          <Link
            href="/"
            className="inline-block px-8 py-4 text-lg font-medium rounded-full text-white bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 transition-colors duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Custom403;