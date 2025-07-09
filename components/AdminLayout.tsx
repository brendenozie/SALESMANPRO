"use client";

import React, { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import Link from "next/link";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// Types and helpers
interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: MenuItem[];
}

type Role = 'STUDENT' | 'EDUCATOR' | string;
type CategoryType = string;
type MenuMap = Record<string, MenuItem[]>;

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const principalCategories = ['Educational & Online Courses', 'Head Teacher', 'School Head'];
const isPrincipalCategory = (cat?: CategoryType) => cat ? principalCategories.includes(cat) : false;

const fallback = "Other";

function getMenuItemsFor(userRole: Role, categoryType: CategoryType, allCategoryMenus: MenuMap): MenuItem[] {
  switch (userRole) {
    case 'STUDENT':
      // student menu, or fallback
      return allCategoryMenus.Student ?? fallback;

    case 'EDUCATOR':
      if (isPrincipalCategory(categoryType)) {
        // principal → educator → fallback
        return allCategoryMenus.Principal 
            ?? allCategoryMenus.Educator 
            ?? fallback;
      }
      // educator → tutor → fallback
      return allCategoryMenus.Educator 
          ?? allCategoryMenus.Tutor 
          ?? allCategoryMenus.Other;

    default:
      // try category-specific key, else fallback
      return allCategoryMenus[categoryType] ?? fallback;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { storeFormData, userRole, userId } = useStoreContext();
  const pathname = usePathname();
  const router = useRouter();

  // const categoryType = storeFormData?.category ? capitalize(storeFormData.category)    : undefined;
  
  const categoryType = storeFormData?.category ? capitalize(storeFormData.category) : "Other";

  const companyId =
    userRole === 'STUDENT' || userRole === 'EDUCATOR'
      ? userId
      : storeFormData?.id || 'default-company-id';

  const menus = getCategoryMenus(companyId);
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

  return (
    <div className="flex h-screen overflow-hidden">
      <header className="lg:hidden fixed top-0 w-full bg-white flex items-center justify-between p-4 shadow-md z-30">
        <button onClick={() => setMobileOpen(o => !o)} className="p-2 rounded-md text-indigo-600 hover:bg-gray-100">
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <span className="font-bold text-lg uppercase text-indigo-800 truncate">
          {userRole.toLowerCase() === 'consumer' ? 'ADMIN' : userRole || 'ADMIN'}
        </span>
      </header>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-900 to-purple-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-20`}>
        <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg m-4">
          <div className="h-10 w-10 bg-white/30 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">{(userRole || 'A').charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold capitalize">{userRole.toLowerCase() === 'consumer' ? 'Admin' : userRole}</p>
            <p className="text-xs text-white/70">{storeFormData?.name || 'Company'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            {menuItems.map(item => {
              const isActiveParent = item.href ? pathname.startsWith(item.href) : false;
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

        <div className="p-4 border-t border-white/20">
          <button
            onClick={() => {/* logout logic */}}
            className="w-full flex items-center justify-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <span className="text-sm text-white">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:pl-64 pt-20 lg:pt-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
