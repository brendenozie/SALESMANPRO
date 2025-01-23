import React, { useState, PropsWithChildren } from "react";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

const UserLayout = ({ children }: PropsWithChildren) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems = [
    { label: "Dashboard", href: "/clients", icon: HomeIcon },    
    {
      label: "Products",
      icon: UsersIcon,
      subItems: [
        { label: "Browse Catalog", href: "/clients/catalog" },        
        { label: "My Products", href: "/clients/inventory" },
      ],      
    },
    {
      label: "My Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Customer Order History", href: "/clients/orders" },
        { label: "My Product Requests", href: "/clients/productrequests" },
      ],
    },
    { label: "Reports",
      icon: CalendarIcon ,
      subItems: [
        { label: "Revenue Reports", href: "/clients/revenuereport" },
        { label: "Target Progress", href: "/clients/targetprogress" },
      ],
    },
    { label: "Messages", href: "/clients/messages", icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: "/clients/settings", icon: Cog6ToothIcon },
    { label: "Help & Support", href: "/clients/helpsupport", icon: QuestionMarkCircleIcon },
    { label: "Log Out", href: "/logout", icon: ArrowRightOnRectangleIcon },
  ];

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-500 to-yellow-500 font-sans">
        <aside className="hidden lg:block w-64 bg-white shadow-lg text-gray-900">
          <div className="flex flex-col items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-extrabold text-orange-600">CLIENT</h1>
          </div>
          <nav className="m-4">
            <ul className="space-y-2">
              {menuItems.map(({ label, href, icon: Icon, subItems }) => (
                <li key={label} className="group">
                  <div>
                      {href ? (
                      <a
                        href={href}
                        className="flex items-center justify-between w-full px-4 py-3 text-base font-medium hover:bg-orange-100 hover:text-orange-500 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      >
                        <div className="flex items-center">
                        <Icon className="h-6 w-6 text-orange-500" />
                        <span className="ml-4">{label}</span>
                        </div>
                      </a>
                      ) : (
                      <button
                        onClick={() => subItems && toggleSubmenu(label)}
                        className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium hover:bg-orange-100 hover:text-orange-500 transition rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        subItems ? "cursor-pointer" : ""
                        }`}
                      >
                        <div className="flex items-center">
                        <Icon className="h-6 w-6 text-orange-500" />
                        <span className="ml-4">{label}</span>
                        </div>
                        {subItems && (
                        <ChevronDownIcon
                          className={`h-5 w-5 transform transition-transform duration-300 ${
                          openSubmenu === label ? "rotate-180" : ""
                          }`}
                        />
                        )}
                      </button>
                      )}
                    {subItems && openSubmenu === label && (
                      <ul className="mt-2 ml-8 space-y-2 border-l-2 border-orange-200">
                        {subItems.map(({ label: subLabel, href: subHref }) => (
                          <li key={subLabel}>
                            <a
                              href={subHref}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-500 rounded-lg transition"
                            >
                              {subLabel}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    );
  };
  
  export default UserLayout;
  