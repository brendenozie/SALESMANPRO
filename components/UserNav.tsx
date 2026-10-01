"use client"

import React, { useState } from "react";
import { 
  Bars3Icon, 
  UserCircleIcon, 
  HomeIcon, 
  UsersIcon, 
  CalendarIcon, 
  ChatBubbleBottomCenterTextIcon, 
  Cog6ToothIcon, 
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";
import NotificationBell from "@/components/notifications/NotificationBell";

const MenuItem = ({ href, icon: Icon, label } : any) => (
  <li className="relative px-4 py-3">
    <a
      href={href}
      className="inline-flex items-center w-full text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-500 rounded-lg transition"
    >
      <Icon className="w-6 h-6 text-orange-500" />
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
      <header className="z-40 py-3 bg-white shadow">
        <div className="flex items-center justify-between h-14 px-6 mx-auto">
          {/* Hamburger Menu */}
          <button
            className="p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Menu"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="w-6 h-6 text-orange-500" />
          </button>

          {/* Action Buttons */}
          <ul className="flex justify-end items-center space-x-6">
            <li>
              <NotificationBell
                buttonClassName="bg-orange-500 text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                iconClassName="w-6 h-6 text-white"
              />
            </li>
            <li>
              <button
                className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        className={`fixed inset-y-0 z-20 flex-shrink-0 w-64 bg-white shadow-lg text-gray-900 transition-transform transform md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <p className="text-2xl font-extrabold text-orange-500">SalesMan</p>
        </div>
        <ul className="mt-6 space-y-4">
          {menuItems.map((item) => (
            <MenuItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </ul>
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
