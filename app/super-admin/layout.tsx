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
} from "@heroicons/react/24/outline";

export const metadata = {
  title: "Super Admin Console | SalesmanPro",
  description: "Root administrative command center for SalesmanPro platform operations.",
};

const navigation = [
  { name: "Overview", href: "/super-admin", icon: ChartBarIcon },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-500">Root Authority</span>
              <h2 className="text-lg font-black text-white tracking-tight">Super Admin</h2>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/80 mt-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-300">{user.name || user.email}</p>
              <p className="text-[10px] uppercase font-black text-amber-500">{role}</p>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
