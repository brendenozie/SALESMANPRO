"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CubeIcon,
  CalendarDaysIcon,
  TableCellsIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { ResolvedAgentContext } from "@/lib/auth/agentGuard";

interface AgentNavProps {
  context: ResolvedAgentContext;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const FEATURE_ICON_MAP: Record<string, React.ElementType> = {
  "commerce.dashboard": HomeIcon,
  "commerce.orders": ShoppingCartIcon,
  "commerce.customers": UsersIcon,
  "commerce.sales": ChartBarIcon,
  "commerce.inventory": CubeIcon,
  "commerce.catalog": BuildingStorefrontIcon,
  "commerce.targets": ChartBarIcon,
  "commerce.productRequests": ClipboardDocumentCheckIcon,
  "operations.pos": CreditCardIcon,
  "services.bookings": CalendarDaysIcon,
  "fitness.members": UsersIcon,
  "restaurant.tables": TableCellsIcon,
  "operations.tasks": ClipboardDocumentCheckIcon,
  "communication.messages": ChatBubbleLeftRightIcon,
  "staff.profile": UserCircleIcon,
};

export default function AgentNav({ context, isDarkMode, toggleDarkMode }: AgentNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const slug = context.company.slug;

  const navItems = context.features
    .filter((f) => Boolean(f.agentRoute))
    .map((f) => {
      const href = f.agentRoute!.replace("{slug}", slug);
      const IconComponent = FEATURE_ICON_MAP[f.id] || SparklesIcon;
      const isActive = pathname === href || pathname.startsWith(`${href}/`);
      return {
        id: f.id,
        title: f.title,
        href,
        icon: IconComponent,
        isActive,
        isPOS: f.id === "operations.pos",
      };
    });

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <Link href={`/agents/${slug}/dashboard`} className="flex items-center gap-2.5 group">
            {context.company.logoUrl ? (
              <img
                src={context.company.logoUrl}
                alt={context.company.name}
                className="w-8 h-8 rounded-lg object-contain bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20">
                {context.company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors leading-tight">
                {context.company.name}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">
                {context.category} • Agent Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Category-Aware POS Quick Action */}
          <Link
            href={`/agents/${slug}/pos`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/25 transition-all transform active:scale-95"
            title="Open Register / Point of Sale"
          >
            <CreditCardIcon className="w-4 h-4" />
            <span>Launch POS</span>
          </Link>

          {/* Role Pill */}
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {context.jobTitle}
          </span>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "https://auth.salesmanpro.site/signin" })}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none"
            title="Sign out of Agent Workspace"
            aria-label="Sign out"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed top-16 bottom-0 z-20 overflow-y-auto p-4 transition-colors">
        <div className="mb-4 px-2 py-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-100 dark:border-orange-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-orange-900 dark:text-orange-200">
              Operator: {context.user.name?.split(" ")[0]}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-200/60 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
              {context.role}
            </span>
          </div>
          {context.loginCode && (
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              PIN Code: ••••
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Approved Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${item.isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          SalesmanPro Agent Workspace v2.0
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                    {context.company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{context.company.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{context.category} • {context.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        item.isActive
                          ? "bg-orange-500 text-white"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <Link
                  href={`/agents/${slug}/pos`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-md shadow-orange-500/20"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span>Launch POS Register</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
