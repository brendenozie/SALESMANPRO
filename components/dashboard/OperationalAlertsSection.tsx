"use client";

import React from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  CreditCardIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { OperationalAlert } from "@/lib/dashboard/portfolioService";

interface OperationalAlertsSectionProps {
  alerts: OperationalAlert[];
}

export default function OperationalAlertsSection({
  alerts,
}: OperationalAlertsSectionProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "HIGH_PENDING":
        return <ClockIcon className="w-5 h-5 text-amber-500 stroke-[2]" />;
      case "PAYMENT_FAILURE":
        return <CreditCardIcon className="w-5 h-5 text-rose-500 stroke-[2]" />;
      case "LOW_STOCK":
        return <ArchiveBoxIcon className="w-5 h-5 text-orange-500 stroke-[2]" />;
      case "STORE_SETUP":
      default:
        return <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500 stroke-[2]" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            Critical
          </span>
        );
      case "WARNING":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            Warning
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border border-blue-300 dark:border-blue-800">
            Notice
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Operational Awareness & Store Health
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active exceptions requiring administrative attention
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/40">
            <ShieldCheckIcon className="w-4 h-4 stroke-[2.5]" />
            <span>All Stores Nominal</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-slate-400">
            {alerts.length} action item(s) detected
          </span>
        )}
      </div>

      {/* Alerts Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.length === 0 ? (
          <div className="col-span-2 py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon className="w-7 h-7 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Zero Operational Blockers
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              All payment pipelines, stock thresholds, order queues, and store configurations are executing within parameters.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                alert.severity === "CRITICAL"
                  ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                  : alert.severity === "WARNING"
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
                  : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {alert.title}
                    </h4>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {alert.description}
                </p>
                {alert.affectedStores && alert.affectedStores.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold">Affected:</span>
                    {alert.affectedStores.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/50 dark:border-slate-800 flex justify-end">
                <Link
                  href={alert.actionUrl}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Resolve in Module</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
