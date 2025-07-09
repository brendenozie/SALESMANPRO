// components/AdminLayout.tsx

"use client";

import React, { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getCategoryMenus } from "@/constant/CATEGORY_MENUS";
import { useStoreContext } from "@/contexts/StoreContext";
import Link from "next/link";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  subItems?: MenuItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { storeFormData, userRole, userId } = useStoreContext();
  const pathname = usePathname();

  const companyId =
    userRole === "STUDENT" || userRole === "EDUCATOR"
      ? `${userId}`
      : storeFormData?.id || "default-company-id";

  const rawCat = storeFormData?.category
    ? storeFormData.category.charAt(0).toUpperCase() + storeFormData.category.slice(1)
    : userRole || "Other";

  const menus = getCategoryMenus(companyId);
  const menuItems: MenuItem[] =
    menus[rawCat as keyof typeof menus] || menus["Other"];

  // Compute initial open label based on current path (runs once)
  const initialOpen = useMemo<string | null>(() => {
    for (const item of menuItems) {
      if (item.subItems?.some((s) => pathname.startsWith(s.href || ""))) {
        return item.label;
      }
    }
    return null;
  }, []);

  const [openLabel, setOpenLabel] = useState<string | null>(initialOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile header */}
      <div className="lg:hidden fixed w-full bg-white flex items-center justify-between p-4 shadow z-20">
        <button onClick={() => setMobileOpen((o) => !o)}>
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <span className="font-bold uppercase">{userRole}</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-br from-blue-900 to-purple-900 text-white p-4 transition-transform
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="mb-8 text-center font-extrabold text-xl">{userRole}</div>
        <nav>
          {menuItems.map((item) => {
            const isActiveParent =
              (item.href && pathname.startsWith(item.href)) ||
              item.subItems?.some((s) => pathname.startsWith(s.href || ""));
            const isOpen = openLabel === item.label;

            return (
              <div key={item.label} className="mb-2">
                <div className="flex items-center justify-between">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex-1 p-2 rounded ${isActiveParent ? "bg-teal-500" : "hover:bg-blue-800/50"}`}
                      onClick={() => setOpenLabel(null)}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      className={`flex-1 text-left p-2 rounded ${isOpen || isActiveParent ? "bg-teal-500" : "hover:bg-blue-800/50"}`}
                      onClick={() => setOpenLabel((prev) => (prev === item.label ? null : item.label))}
                    >
                      <span>{item.label}</span>
                    </button>
                  )}
                  {!item.href && (
                    <ChevronDownIcon
                      className={`h-5 w-5 ml-2 transform transition ${isOpen ? "rotate-180" : ""}`}
                      onClick={() => setOpenLabel((prev) => (prev === item.label ? null : item.label))}
                    />
                  )}
                </div>
                {item.subItems && isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems.map((s) => {
                      const activeSub = pathname.startsWith(s.href || "");
                      return (
                        <Link
                          key={s.label}
                          href={s.href || "#"}
                          className={`block p-2 rounded ${activeSub ? "bg-blue-700" : "hover:bg-blue-700/50"}`}
                        >
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64 pt-16 lg:pt-4 overflow-auto bg-gray-50 p-4">
        {children}
      </main>
    </div>
  );
}
