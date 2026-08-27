"use client";

import React, { useState } from "react";
import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon, 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  ChatBubbleBottomCenterTextIcon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";

const MenuItem = ({ href, icon: Icon, label } : any) => (
  <li className="relative px-2 py-1">
    <a
      href={href}
      className="inline-flex items-center w-full text-sm font-semibold text-white hover:text-yellow-400"
    >
      <Icon className="w-6 h-6" />
      <span className="ml-4">{label}</span>
    </a>
  </li>
);

const UserNav = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { href: "/dashboard2", label: "Overview", icon: HomeIcon },
    { href: "/exercisedash", label: "Clients", icon: UsersIcon },
    { href: "/meals", label: "Calendar", icon: CalendarIcon },
    { href: "/messages", label: "Messages", icon: ChatBubbleBottomCenterTextIcon },
    { href: "/settings", label: "Settings", icon: Cog6ToothIcon },
    { href: "/helpsupport", label: "Help & Support", icon: QuestionMarkCircleIcon },
  ];

  return (
    <>
      {/* Header */}
      <header className="z-40 py-4 bg-gray-800">
        <div className="flex items-center justify-between h-8 px-6 mx-auto">
          {/* Hamburger Menu */}
          <button
            className="p-1 rounded-md md:hidden focus:outline-none"
            aria-label="Menu"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>

          {/* Action Buttons */}
          <ul className="flex items-center space-x-6">
            <li>
              <button
                className="p-2 bg-white text-red-400 rounded-full hover:bg-yellow-400"
                aria-label="Notifications"
              >
                <BellIcon className="w-6 h-6" />
              </button>
            </li>
            <li>
              <button
                className="p-2 bg-white text-blue-400 rounded-full hover:bg-yellow-400"
                aria-label="Account"
              >
                <UserCircleIcon className="w-6 h-6" />
              </button>
            </li>
          </ul>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-20 flex-shrink-0 w-64 bg-orange-500 transition-transform transform md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="text-white">
          <div className="flex items-center p-4 bg-orange-500">
            <p className="text-2xl font-semibold">SalesMan</p>
          </div>
          <ul className="mt-6 space-y-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </ul>
        </div>
      </aside>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default UserNav;
