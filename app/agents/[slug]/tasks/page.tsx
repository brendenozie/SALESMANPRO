import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentTasksPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "tasks");

  const companyId = context.company.id;

  const tasks = await prisma.task.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      dueDate: true,
      createdAt: true,
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Operational Tasks</h1>
          <p className="text-sm text-slate-500">
            Daily task checklist and duties for <strong>{context.company.name}</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ClipboardDocumentCheckIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No operational tasks assigned.</p>
            <p className="text-xs text-slate-500">You are all caught up on your duties.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map((t) => {
              const isDone = t.status === "COMPLETED";
              return (
                <div key={t.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon
                      className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
                        isDone ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                    <div>
                      <h4
                        className={`text-sm font-bold ${
                          isDone
                            ? "text-slate-400 line-through"
                            : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {t.title}
                      </h4>
                      {t.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                      )}
                      {t.dueDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-2">
                          <ClockIcon className="w-3.5 h-3.5" />
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
