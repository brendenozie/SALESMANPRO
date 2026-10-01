import React from "react";
import Link from "next/link";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentBookingsPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "bookings");

  const companyId = context.company.id;
  const currency = context.company.currency;

  // Query service bookings or service orders
  const bookings = await prisma.booking.findMany({
    where: { companyId },
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      serviceName: true,
      clientName: true,
      clientPhone: true,
      status: true,
      price: true,
      bookingDate: true,
      createdAt: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Service Bookings</h1>
          <p className="text-sm text-slate-500">
            Appointments, bookings and service delivery queue for <strong>{context.company.name}</strong>.
          </p>
        </div>
        <Link
          href={`/agents/${slug}/pos`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all"
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Launch Service POS</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CalendarDaysIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No appointments scheduled today.</p>
            <p className="text-xs text-slate-500">Create new bookings via the Service POS register.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Schedule Date</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {b.serviceName || "General Service"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{b.clientName || "Client"}</div>
                      {b.clientPhone && <div className="text-[11px] text-slate-400">{b.clientPhone}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {b.bookingDate ? new Date(b.bookingDate).toLocaleString() : new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-black">
                      {currency} {(b.price ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                        {b.status || "CONFIRMED"}
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
