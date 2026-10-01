"use client";

import React, { useState } from "react";
import { Bars3Icon, UserCircleIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import NotificationBell from "@/components/notifications/NotificationBell";

const UserNavbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="z-40 py-4 bg-gray-800">
      <div className="flex items-center justify-between h-8 px-6 mx-auto">
        {/* Mobile Hamburger */}
        <button
          className="p-1 rounded-md md:hidden text-white focus:outline-none"
          aria-label="Menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm ml-4 mr-auto">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 text-sm bg-white rounded-lg shadow focus:outline-none"
          />
          <DocumentMagnifyingGlassIcon className="absolute top-2 right-3 h-5 w-5 text-gray-500" />
        </div>

        {/* Menu Items */}
        <ul className="flex items-center space-x-4">
          <li className="relative">
            <NotificationBell
              buttonClassName="bg-gray-700 text-white hover:bg-yellow-500"
              iconClassName="h-6 w-6"
            />
          </li>
          <li className="relative">
            <button
              className="p-2 text-white bg-gray-700 rounded-full hover:bg-yellow-500 focus:outline-none"
              aria-label="Profile"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>
          </li>
        </ul>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>
          {/* Add sidebar content here */}
        </aside>
      )}
    </header>
  );
};

export default UserNavbar;
