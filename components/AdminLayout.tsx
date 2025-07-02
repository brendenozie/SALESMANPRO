"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { AdminContext } from "../contexts/AdminContextProvider";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import Link from "next/link";

import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CalendarDaysIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PresentationChartBarIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  FilmIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: MenuItem[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storeFormData } = useStoreContext();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const companyId = storeFormData.id || "default-company-id";
  const categoryType =
    storeFormData.category?.charAt(0).toUpperCase() +
      storeFormData.category?.slice(1) || "Other";

  const allCategoryMenus: { [key: string]: MenuItem[] } =
    getCategoryMenus(companyId);
  const menuItems: MenuItem[] =
    allCategoryMenus[categoryType as keyof typeof allCategoryMenus] ||
    allCategoryMenus["Other"];

  const handleToggleSubmenu = useCallback((label: string) => {
    setIsManuallyToggled(true);
    setOpenSubmenu((prev) => (prev === label ? null : label));
  }, []);

  useEffect(() => {
    if (isManuallyToggled) return;

    let submenuToOpen: string | null = null;
    for (const item of menuItems) {
      if (
        item.subItems?.some((sub) => pathname.startsWith(sub.href || ""))
      ) {
        submenuToOpen = item.label;
        break;
      } else if (item.href && pathname.startsWith(item.href)) {
        submenuToOpen = null;
        break;
      }
    }

    if (submenuToOpen !== openSubmenu) {
      setOpenSubmenu(submenuToOpen);
    }
  }, [pathname, menuItems]);

  useEffect(() => {
    setIsManuallyToggled(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 antialiased">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-lg p-4 flex items-center justify-between z-30 border-b border-gray-100">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-indigo-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileSidebarOpen}
        >
          {mobileSidebarOpen ? (
            <XMarkIcon className="h-7 w-7" />
          ) : (
            <Bars3Icon className="h-7 w-7" />
          )}
        </button>
        <h1 className="text-xl font-bold text-indigo-800">
          {storeFormData.name?.toUpperCase() || "ADMIN PANEL"}
        </h1>
        <div className="w-7 h-7"></div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-gradient-to-br from-blue-900 to-purple-900 text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:block lg:shadow-none lg:overflow-y-auto`}
      >
        <div className="flex flex-col items-center p-6 pt-8 border-b border-blue-800/50">
          <h1 className="text-3xl font-extrabold text-white tracking-wide drop-shadow-md">
            {storeFormData.name?.toUpperCase() || "LMS ADMIN"}
          </h1>
          <p className="text-sm text-blue-200 mt-1">Dashboard</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActiveParentByPath =
                (item.href && pathname.startsWith(item.href)) ||
                item.subItems?.some((sub) =>
                  pathname.startsWith(sub.href || "")
                );
              const isSubmenuOpen = openSubmenu === item.label;

              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out
                        ${
                          isActiveParentByPath
                            ? "bg-teal-500 text-white shadow-lg transform translate-x-1"
                            : "hover:bg-blue-800/50 hover:text-teal-200 text-blue-100"
                        }`}
                      onClick={() => setOpenSubmenu(null)}
                    >
                      {item.icon &&
                        React.createElement(item.icon, {
                          className: `h-6 w-6 mr-4 ${
                            isActiveParentByPath
                              ? "text-white"
                              : "text-blue-300"
                          }`,
                        })}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleToggleSubmenu(item.label)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ease-in-out
                        ${
                          isSubmenuOpen || isActiveParentByPath
                            ? "bg-teal-500 text-white shadow-lg transform translate-x-1"
                            : "hover:bg-blue-800/50 hover:text-teal-200 text-blue-100"
                        }`}
                      aria-expanded={isSubmenuOpen}
                      aria-controls={`submenu-${item.label}`}
                    >
                      <div className="flex items-center">
                        {item.icon &&
                          React.createElement(item.icon, {
                            className: `h-6 w-6 mr-4 ${
                              isSubmenuOpen
                                ? "text-white"
                                : "text-blue-300"
                            }`,
                          })}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDownIcon
                        className={`h-5 w-5 transform transition-transform duration-300 ${
                          isSubmenuOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>
                  )}

                  {item.subItems && (
                    <ul
                      id={`submenu-${item.label}`}
                      className={`overflow-hidden transition-all duration-300 ease-in-out
                        ${
                          isSubmenuOpen
                            ? "max-h-[500px] mt-2 ml-8 pl-4 border-l-2 border-blue-600/50 space-y-2"
                            : "max-h-0"
                        }`}
                    >
                      {item.subItems.map((subItem) => {
                        const isActiveSub = pathname.startsWith(
                          subItem.href || ""
                        );
                        return (
                          <li key={subItem.label}>
                            <Link
                              href={subItem.href || "#"}
                              className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 ease-in-out
                                ${
                                  isActiveSub
                                    ? "bg-blue-700 text-white font-semibold shadow-md"
                                    : "hover:bg-blue-700/50 text-blue-200"
                                }`}
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-20 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
