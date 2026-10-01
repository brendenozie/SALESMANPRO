import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
  BuildingStorefrontIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentProfilePage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "profile");

  const companyId = context.company.id;

  // Fetch recent POS sessions for this staff member
  const recentSessions = await prisma.posSession.findMany({
    where: {
      companyId,
      ...(context.staffProfileId ? { staffProfileId: context.staffProfileId } : {}),
    },
    take: 5,
    orderBy: { openedAt: "desc" },
    select: {
      id: true,
      terminalId: true,
      status: true,
      openedAt: true,
      closedAt: true,
      openingBalance: true,
      closingBalance: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Staff Profile & Shift Context</h1>
        <p className="text-sm text-slate-500">
          Operator identity, security credentials, and active terminal sessions for <strong>{context.company.name}</strong>.
        </p>
      </div>

      {/* Operator Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-orange-500/25">
            {context.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{context.user.name}</h2>
            <p className="text-xs text-slate-500">{context.user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                {context.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {context.jobTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 block font-medium">Assigned Company</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
              {context.company.name}
            </span>
            <span className="text-[11px] text-slate-500 capitalize block">
              Category: {context.category}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 block font-medium">Login Code Status</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <KeyIcon className="w-4 h-4" />
              <span>{context.loginCode ? "PIN Configured & Active" : "Standard Account Login"}</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Used for POS operator switching & terminal entry
            </span>
          </div>
        </div>
      </div>

      {/* Recent POS Shift Sessions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Recent Terminal Shifts</h3>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <ClockIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs">No active terminal sessions logged for this profile.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentSessions.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Terminal {s.terminalId}</span>
                  <div className="text-[11px] text-slate-400">
                    Opened: {new Date(s.openedAt).toLocaleString()}
                  </div>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === "ACTIVE"
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
