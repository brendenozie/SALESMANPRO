// ==========================================
// 1. LAYOUT: layout.tsx
// ==========================================
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import {
  ShieldCheckIcon,
  BanknotesIcon,
  CpuChipIcon,
  CommandLineIcon,
  DocumentCheckIcon,
  MegaphoneIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  BellAlertIcon,
  KeyIcon,
  SparklesIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "Super Admin Console | SalesmanPro",
  description: "Root administrative command center for SalesmanPro platform operations.",
};

const navigation = [
  { name: "Overview", href: "/super-admin", icon: ChartBarIcon },
  { name: "Store Showcase Approvals", href: "/super-admin/stores", icon: BuildingStorefrontIcon },
  { name: "Riders & Deliveries", href: "/super-admin/deliveries", icon: TruckIcon },
  { name: "Mascot & Agents", href: "/super-admin/mascot", icon: SparklesIcon },
  { name: "Integrations & APIs", href: "/super-admin/integrations", icon: KeyIcon },
  { name: "Notification Center", href: "/super-admin/notifications", icon: BellAlertIcon },
  { name: "Payments Intelligence", href: "/super-admin/payments", icon: BanknotesIcon },
  { name: "System Observability", href: "/super-admin/observability", icon: CommandLineIcon },
  { name: "AI Workforce", href: "/super-admin/ai-workforce", icon: CpuChipIcon },
  { name: "AI Studio & Models", href: "/super-admin/ai", icon: CpuChipIcon },
  { name: "eTIMS Compliance", href: "/super-admin/etims", icon: DocumentCheckIcon },
  { name: "Ads Network", href: "/super-admin/ads", icon: MegaphoneIcon },
  { name: "SEO Operations", href: "/super-admin/seo", icon: GlobeAltIcon },
  { name: "Email Relay", href: "/super-admin/email", icon: EnvelopeIcon },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/signin?callbackUrl=/super-admin");
  }

  const user = session.user as any;
  const role = (user.role || "").toUpperCase();

  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    redirect("/unauthorized?reason=super_admin_required");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white/80 dark:bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0 backdrop-blur-xl shadow-sm md:shadow-none">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-inner">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">
                Root Authority
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Super Admin
              </h2>
            </div>
          </div>

          <div className="mb-4">
            <Link
              href="/dashboards"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-all shadow-xs group"
            >
              <ArrowLeftIcon className="h-4 w-4 text-amber-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>My Stores & Dashboards</span>
            </Link>
          </div>

          {/* Navigation Items with custom scrollbar styling */}
          <nav className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <item.icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-5 border-t border-slate-200 dark:border-slate-800/80 mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="truncate mr-2">
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{user.name || user.email}</p>
              <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-500">{role}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
              title="Sign Out"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 lg:p-10 transition-colors">
        {children}
      </main>
    </div>
  );
}

