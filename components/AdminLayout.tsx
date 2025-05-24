// components/AdminLayout.tsx
"use client"
import React, { useState, PropsWithChildren } from "react";
import { useRouter, usePathname } from "next/navigation";
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
import { AdminContext } from "../contexts/AdminContextProvider";


const AdminLayout = ({ children }: PropsWithChildren) => {

  const router = useRouter();
  const pathname = usePathname();
  // Extract adminSlug from the current path (e.g., /admin/[slug]/...)
    const pathMatch = pathname.match(/^\/admin\/([^\/]+)/);
    const adminSlug = pathMatch ? pathMatch[1] : "";

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems = [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "Products",
      icon: UsersIcon,
      subItems: [
        { label: "Browse Catalog", href: `/admin/${adminSlug}/inventory` },
        { label: "Market List", href: `/admin/${adminSlug}/mymarketplace` },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Agent Requests", href: `/admin/${adminSlug}/agentorders` },
        { label: "Client Requests", href: `/admin/${adminSlug}/clientorders` },
        { label: "Market Place Requests", href: `/admin/${adminSlug}/customerorders` },
      ],
    },
    {
      label: "Sales Agents",
      icon: ChartBarIcon,
      subItems: [{ label: "Agents", href: `/admin/${adminSlug}/agents` }],
    },
    {
      label: "Clients",
      icon: ChartBarIcon,
      subItems: [{ label: "Clients", href: `/admin/${adminSlug}/customers` }],
    },
    {
      label: "Reports",
      icon: CalendarIcon,
      subItems: [
        { label: "Revenue Reports", href: `/admin/${adminSlug}/revenuereport` },
        { label: "Target Progress", href: `/admin/${adminSlug}/targetprogress` },
      ],
    },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
    { label: "Help & Support", href: `/admin/${adminSlug}/helpsupport`, icon: QuestionMarkCircleIcon },
    { label: "Log Out", href: "/logout", icon: ArrowRightOnRectangleIcon },
  ];

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };
  const currentPath = pathname;

  return (
    <AdminContext.Provider value={{ id: adminSlug }}>
    <div className="flex h-screen bg-gradient-to-br from-orange-500 to-yellow-500 font-sans">
      <aside className="hidden lg:block w-64 bg-white shadow-lg text-gray-900">
        <div className="flex flex-col items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-orange-600">ADMIN</h1>
        </div>
        <nav className="m-4">
          <ul className="space-y-2">
            {menuItems.map(({ label, href, icon: Icon, subItems }) => {
              const isActive = href ? currentPath === href : subItems?.some(sub => currentPath === sub.href);

                  return (
                    <li key={label} className="group">
                      <div>
                        {href ? (
                          <a
                            href={href}
                            className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition
                              ${isActive ? "bg-orange-100 text-orange-600 font-semibold" : "hover:bg-orange-100 hover:text-orange-500"}`}
                          >
                            <div className="flex items-center">
                              <Icon className={`h-6 w-6 ${isActive ? "text-orange-600" : "text-orange-500"}`} />
                              <span className="ml-4">{label}</span>
                            </div>
                          </a>
                        ) : (
                          <button
                            onClick={() => toggleSubmenu(label)}
                            className={`flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition
                              ${openSubmenu === label ? "bg-orange-100 text-orange-600 font-semibold" : "hover:bg-orange-100 hover:text-orange-500"}`}
                          >
                            <div className="flex items-center">
                              <Icon className={`h-6 w-6 ${openSubmenu === label ? "text-orange-600" : "text-orange-500"}`} />
                              <span className="ml-4">{label}</span>
                            </div>
                            <ChevronDownIcon
                              className={`h-5 w-5 transform transition-transform duration-300 ${
                                openSubmenu === label ? "rotate-180 text-orange-600" : ""
                              }`}
                            />
                          </button>
                        )}

                        {subItems && openSubmenu === label && (
                          <ul className="mt-2 ml-8 space-y-2 border-l-2 border-orange-200">
                            {subItems.map(({ label: subLabel, href: subHref }) => {
                              const isSubActive = currentPath === subHref;
                              return (
                                <li key={subLabel}>
                                  <a
                                    href={subHref}
                                    className={`block px-4 py-2 text-sm rounded-lg transition
                                      ${isSubActive ? "bg-orange-200 text-orange-800 font-semibold" : "hover:bg-orange-100 hover:text-orange-500"}`}
                                  >
                                    {subLabel}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
    </AdminContext.Provider>
  );
};

export default AdminLayout;
