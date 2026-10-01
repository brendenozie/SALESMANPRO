import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  UsersIcon,
  CreditCardIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentMembersPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "members");

  const companyId = context.company.id;

  const members = await prisma.gymMember.findMany({
    where: { companyId },
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      membershipType: true,
      status: true,
      expiryDate: true,
      createdAt: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Gym Members & Attendance</h1>
          <p className="text-sm text-slate-500">
            Check-ins, membership pass verification, and class registration for <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Launch Fitness POS</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {members.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UsersIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No registered gym members found.</p>
            <p className="text-xs text-slate-500">Issue membership passes via the Fitness POS register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Membership Plan</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {m.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{m.phone || "No phone"}</div>
                      {m.email && <div className="text-[11px] text-slate-400">{m.email}</div>}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {m.membershipType || "Standard Pass"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "Active"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        {m.status || "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
