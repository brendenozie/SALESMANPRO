// components/AdminLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminContext } from "../contexts/AdminContextProvider";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import { ChevronDownIcon } from "@heroicons/react/24/outline";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storeFormData } = useStoreContext();

  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const categoryMenus = getCategoryMenus(storeFormData.id);
  const categoryKey = storeFormData.category.charAt(0).toUpperCase() + storeFormData.category.slice(1) as keyof typeof categoryMenus;
  const menuItems = categoryMenus[categoryKey] ?? categoryMenus["Other"];

  const toggleSubmenu = (label: string) =>
    setOpenSubmenu(openSubmenu === label ? null : label);

  // auto‑expand
  useEffect(() => {
    const match = menuItems.find(i =>
      Array.isArray((i as any).subItems) && (i as any).subItems.some((s: any) => s.href === pathname)
    );
    if (match) setOpenSubmenu(match.label);
  }, [pathname, menuItems]);

  return (
    <>
      <div className="flex h‑screen bg-gradient-to-br from-orange-500 to-yellow-500 font‑sans">
        <aside className="hidden lg:block w-64 bg-white shadow-lg text-gray-900">
          <div className="flex flex-col items-center p-6 border-b border-gray-200">
            <h1 className="text-2xl font-extrabold text-orange-600">
              {storeFormData.name.toUpperCase()}
            </h1>
          </div>
          <nav className="m-4">
            <ul className="space-y-2">
              {menuItems.map(({ label, href, icon: Icon, subItems = [] }:any) => {
                const isActiveParent =
                  (href === pathname) ||
                  subItems.some((s: any) => s.href === pathname);

                return (
                  <li key={label} className="group">
                    {href ? (
                      <a
                        href={href}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition ${
                          isActiveParent
                            ? "bg-orange-100 text-orange-600 font-semibold"
                            : "hover:bg-orange-100 hover:text-orange-500"
                        }`}
                      >
                        <div className="flex items-center">
                          {Icon && (
                            <Icon
                              className={`h-6 w-6 ${
                                isActiveParent ? "text-orange-600" : "text-orange-500"
                              }`}
                            />
                          )}
                          <span className="ml-4">{label}</span>
                        </div>
                      </a>
                    ) : (
                      <button
                        onClick={() => toggleSubmenu(label)}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition ${
                          openSubmenu === label || isActiveParent
                            ? "bg-orange-100 text-orange-600 font-semibold"
                            : "hover:bg-orange-100 hover:text-orange-500"
                        }`}
                      >
                        <div className="flex items-center">
                          {Icon && (
                            <Icon
                              className={`h-6 w-6 ${
                                openSubmenu === label || isActiveParent
                                  ? "text-orange-600"
                                  : "text-orange-500"
                              }`}
                            />
                          )}
                          <span className="ml-4">{label}</span>
                        </div>
                        <ChevronDownIcon
                          className={`h-5 w-5 transform transition-transform duration-300 ${
                            openSubmenu === label ? "rotate-180 text-orange-600" : ""
                          }`}
                        />
                      </button>
                    )}

                    {subItems && (openSubmenu === label || isActiveParent) && (
                      <ul className="mt-2 ml-8 space-y-2 border-l-2 border-orange-200">
                        {subItems.map((sub : any) => {
                          const isActiveSub = pathname === sub.href;
                          return (
                            <li key={sub.label}>
                              <a
                                href={sub.href}
                                className={`block px-4 py-2 text-sm rounded-lg transition ${
                                  isActiveSub
                                    ? "bg-orange-200 text-orange-800 font-semibold"
                                    : "hover:bg-orange-100 hover:text-orange-500"
                                }`}
                              >
                                {sub.label}
                              </a>
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
        <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
