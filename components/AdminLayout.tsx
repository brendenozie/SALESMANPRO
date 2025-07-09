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
    <div className="flex h-screen overflow-hidden">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 w-full bg-white flex items-center justify-between p-4 shadow-md z-30">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md text-indigo-600 hover:bg-gray-100 transition"
        >
          {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
        <span className="font-bold text-lg uppercase text-indigo-800 truncate">
          {userRole.toLowerCase() === "consumer"
            ? "ADMIN"
            : userRole || storeFormData?.name?.substring(0, 10).toUpperCase() || "ADMIN"}
        </span>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-900 to-purple-800 text-white flex flex-col transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 z-20`}
      >
        <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg m-4">
          <div className="h-10 w-10 bg-white/30 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-white">{(userRole || "A").charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold capitalize">{userRole.toLowerCase() === "consumer" ? "Admin" : userRole}</p>
            <p className="text-xs text-white/70">{storeFormData?.name || "Company"}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActiveParent =
                (item.href && pathname.startsWith(item.href)) ||
                item.subItems?.some((s) => pathname.startsWith(s.href || ""));
              const isOpen = openLabel === item.label;

              return (
                <li key={item.label} className="rounded-lg">
                  <button
                    onClick={() => setOpenLabel((prev) => (prev === item.label ? null : item.label))}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActiveParent || isOpen ? "bg-white/20" : "hover:bg-white/10"}`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && React.createElement(item.icon, { className: "h-5 w-5 text-white/80" })}
                      <span className="text-white truncate">{item.label}</span>
                    </div>
                    {item.subItems && (
                      <ChevronDownIcon
                        className={`h-4 w-4 text-white/80 transform transition-transform duration-200
                          ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                  {item.subItems && isOpen && (
                    <ul className="mt-1 space-y-1 pl-12">
                      {item.subItems.map((s) => {
                        const isActiveSub = pathname.startsWith(s.href || "");
                        return (
                          <li key={s.label}>
                            <Link
                              href={s.href || "#"}
                              className={`block px-4 py-2 text-sm rounded-lg transition-colors duration-200
                                ${isActiveSub ? "bg-white/30 text-white font-semibold" : "hover:bg-white/10 text-white/80"}`}
                            >
                              {s.label}
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
          <button className="w-full flex items-center justify-center px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
            <span className="text-sm text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:pl-64 pt-20 lg:pt-8 overflow-auto">
        <div>{children}</div>
      </main>
    </div>
  );
}
