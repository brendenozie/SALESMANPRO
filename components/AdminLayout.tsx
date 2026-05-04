"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import Link from "next/link";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { signOut } from 'next-auth/react';

// --- Helper types and functions (no changes needed here) ---
interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: MenuItem[];
}

type Role = 'STUDENT' | 'EDUCATOR' | 'PARENT' | 'SCHOOL_DRIVER' | string;
type CategoryType = string;
type MenuMap = Record<string, MenuItem[]>;

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const principalCategories = ['Educational & Online Courses', 'Head Teacher', 'School Head'];
const isPrincipalCategory = (cat?: CategoryType) => cat ? principalCategories.includes(cat) : false;

const fallback = "Other";

function getMenuItemsFor(userRole: Role, categoryType: CategoryType, allCategoryMenus: MenuMap): MenuItem[] {
  const defaultFallbackMenu = allCategoryMenus.Other || [];
  // console.log("Determining menu for role:", userRole, "and category:", categoryType);
  switch (userRole) {
    case 'JUNIOR':
    case 'SENIOR':
    case 'STUDENT':
      return allCategoryMenus.Student ?? defaultFallbackMenu;
    case 'PARENT':
      return allCategoryMenus.Parent ?? defaultFallbackMenu;
    case 'SCHOOL_DRIVER':
      return allCategoryMenus.SCHOOL_DRIVER ?? defaultFallbackMenu;
    case 'STORE_DRIVER':
      return allCategoryMenus.STORE_DRIVER ?? defaultFallbackMenu;
    case 'EDUCATOR':
      if (isPrincipalCategory(categoryType)) {
        return allCategoryMenus.Principal ?? allCategoryMenus.Educator ?? defaultFallbackMenu;
      }
      return allCategoryMenus.Educator ?? allCategoryMenus.Tutor ?? defaultFallbackMenu;
    case 'TUTOR':
      return allCategoryMenus.Tutor ?? defaultFallbackMenu;
    default:
      return allCategoryMenus[categoryType] ?? defaultFallbackMenu;
  }
}

// --- Main AdminLayout Component ---
export default function AdminLayout({ children, params }: {
  children: React.ReactNode,
  params:Promise<{ slug: string }>
}) {
  const { storeFormData, userRole, userId } = useStoreContext();
  const pathname = usePathname();

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` });
  
  // 1. This is the core logic.
  // It checks if the current URL path ends with '/pos'.
  const shouldHideNav = pathname.endsWith('/pos') || pathname.endsWith('/storepos') || pathname.endsWith('/service-pos') || pathname.endsWith('/fitness-pos') || pathname.endsWith('/health-pos') ||  pathname.endsWith('/company-pos');

  // 2. If the navigation should be hidden, return a simplified layout.
  // This renders only the main content area, making it take up the full screen.
  if (shouldHideNav) {
    return (
      <main className="w-screen h-screen overflow-auto">
        {children}
      </main>
    );
  }

  // This early return for specific roles might still be needed if they have a
  // unique layout that is NOT the standard admin layout but also NOT the POS layout.
  // If these roles should see the standard admin layout on non-POS pages, you can remove this block.
  if (userRole === 'JUNIOR' || userRole === 'SCHOOL_DRIVER' || userRole === 'STORE_DRIVER') {
    return (
      <main className="flex-1 pt-20 lg:pt-0 overflow-auto">
        {children}
      </main>
    );
  }

  // --- All variables and state for the full layout (with navigation) ---
  const companyId: string = storeFormData?.id || '6964daeff4ad17d959b72413';// 'default-company-id';
  const categoryType = storeFormData?.category ? capitalize(storeFormData.category) : "Other";
  const menus = getCategoryMenus(companyId,userRole);
  const menuItems = getMenuItemsFor(userRole, categoryType, menus);

  const initialOpen = useMemo<string | null>(() => {
    for (const item of menuItems) {
      if (item.subItems?.some(sub => pathname.startsWith(sub.href || ''))) {
        return item.label;
      }
    }
    return null;
  }, [pathname, menuItems]);

  const [openLabel, setOpenLabel] = useState<string | null>(initialOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 3. If we've reached this point, it's not a POS page.
  // Return the full layout with the sidebar and header.
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header (visible on small screens) */}
      <header className="lg:hidden fixed top-0 w-full bg-white flex items-center justify-between p-4 shadow-md z-30">
        <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-md text-sky-600 hover:bg-gray-100">
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <span className="font-bold text-lg uppercase text-sky-800 truncate">
          {userRole.toLowerCase() === 'consumer' ? 'ADMIN' : userRole || 'ADMIN'}
        </span>
      </header>

      {/* Sidebar (fixed on desktop, slides in on mobile) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-sky-950 to-sky-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-50`}>
        {/* User/Company Info */}
        <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg m-4 justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/30 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">{(userRole || 'A').charAt(0)}</span>
            </div>
            <div>
              <p className="font-semibold capitalize">{userRole.toLowerCase() === 'consumer' ? 'Admin' : (userRole.toLowerCase() == 'senior'|| userRole.toLowerCase() === 'junior') ? 'Student' : userRole}</p>
              <p className="text-xs text-white/70">{storeFormData?.name == 'Teacher' || storeFormData?.name == "Students" ? '' : storeFormData?.name || 'Company'}</p>
            </div>   
          </div>       
          {/* show close button on mobile */}
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="p-1 rounded-md text-sky-600 hover:bg-gray-100 ml-auto">
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const isActiveParent = item.subItems
                ? item.subItems.some(sub => sub.href && pathname.startsWith(sub.href))
                : (item.href && pathname.startsWith(item.href));
              const isOpen = openLabel === item.label;

              if (!item.subItems?.length) {
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href || '#'}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActiveParent ? 'bg-white/20' : 'hover:bg-white/10'
                      }`}
                    >
                      {item.icon && React.createElement(item.icon, { className: 'h-5 w-5 text-white/80' })}
                      <span className="text-white truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              }
              return (
                <li key={item.label} className="rounded-lg">
                  <button
                    onClick={() => setOpenLabel(prev => (prev === item.label ? null : item.label))}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActiveParent || isOpen ? 'bg-white/20' : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && React.createElement(item.icon, { className: 'h-5 w-5 text-white/80' })}
                      <span className="text-white truncate">{item.label}</span>
                    </div>
                    <ChevronDownIcon className={`h-4 w-4 text-white/80 transform transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <ul className="mt-1 space-y-1 pl-12">
                      {item.subItems.map(sub => {
                        const isActiveSub = sub.href ? pathname.startsWith(sub.href) : false;
                        return (
                          <li key={sub.label}>
                            <Link
                              href={sub.href || '#'}
                              onClick={() => setMobileOpen(false)}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                                isActiveSub ? 'bg-white/30 text-white font-semibold' : 'hover:bg-white/10 text-white/80'
                              }`}
                            >
                              {sub.label}
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

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => handleSignOut()}
            className="w-full flex items-center justify-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <span className="text-sm text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-20 lg:pt-0 overflow-auto">
        {children}
      </main>

      {/* Scrollbar Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
      `}</style>
    </div>
  );
}