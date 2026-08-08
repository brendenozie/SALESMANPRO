"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ArrowRightCircleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface StoreData {
  id: string;
  slug: string;
  name: string;
  domain?: string;
  companyId: string;
  subscriptionStatus?: string;
  category?: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface StoreCardProps extends StoreData {
  isActive: boolean;
  onEdit?: (id: string) => void;
  onDelete?: () => void;
  onManageSubscription?: () => void;
}

export default function StoreCard({
  id,
  slug,
  name,
  domain,
  category,
  description,
  bannerUrl,
  contactEmail,
  contactPhone,
  subscriptionStatus,
  isActive,
  onEdit,
  onDelete,
  onManageSubscription,
}: StoreCardProps) {
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const openDomain = () => {
    if (!domain) {
      window.open(`https://${slug}.salesmanpro.site`, "_blank");
      return;
    }

    const normalized = domain.startsWith("http")
      ? domain
      : `https://${domain}`;

    window.open(normalized, "_blank");
  };

  const status =
    subscriptionStatus?.toUpperCase() ||
    (isActive ? "ACTIVE" : "INACTIVE");

  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-lg shadow-emerald-500/20">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            Active
          </div>
        );

      case "AWAITING_CONFIRMATION":
        return (
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md animate-pulse shadow-lg shadow-amber-500/20">
            <ClockIcon className="h-3.5 w-3.5" />
            Verifying
          </div>
        );

      default:
        return (
          <div className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-lg shadow-rose-500/20">
            <LockClosedIcon className="h-3.5 w-3.5" />
            Inactive
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-xl transition-all duration-500 dark:bg-slate-950 dark:border-slate-800/80 ${
        !isActive ? "opacity-95" : ""
      }`}
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.04] via-transparent to-indigo-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = `https://placehold.co/1200x500/0f172a/ffffff?text=${encodeURIComponent(
                name
              )}`;
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 h-56 w-56 rounded-full bg-orange-500 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-indigo-500 blur-3xl" />
            </div>

            <div className="relative flex h-full items-center justify-center">
              <BuildingStorefrontIcon className="h-24 w-24 text-white/20" />
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Actions */}
        <div className="absolute top-4 left-4">
          {getStatusBadge()}
        </div>

        {/* Edit and Delete Icons (Now available regardless of Active state) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onEdit?.(id)}
            className="rounded-full bg-white/95 p-2 text-slate-700 shadow-lg backdrop-blur-md hover:bg-orange-50 hover:text-orange-600 transition"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          <button
            onClick={onDelete}
            className="rounded-full bg-white/95 p-2 text-rose-600 shadow-lg backdrop-blur-md hover:bg-rose-50 transition"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              {category && (
                <div className="mb-3 inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  {category}
                </div>
              )}

              <h2 className="truncate text-2xl font-black tracking-tight text-white">
                {name}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                <GlobeAltIcon className="h-4 w-4" />
                <span className="truncate">
                  {domain || `${slug}.salesmanpro.site`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Description */}
        <div className="mb-6">
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 h-16">
            {description ||
              "This digital storefront is ready to showcase products, manage customers, process sales, and scale online operations beautifully."}
          </p>
        </div>

        {/* Contact Section */}
        {(contactEmail || contactPhone) && (
          <div className="mb-6 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="space-y-3">
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-sm text-slate-700 transition hover:text-orange-600 dark:text-slate-300"
                >
                  <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-slate-800">
                    <EnvelopeIcon className="h-4 w-4" />
                  </div>

                  <span className="truncate">{contactEmail}</span>
                </a>
              )}

              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-3 text-sm text-slate-700 transition hover:text-orange-600 dark:text-slate-300"
                >
                  <div className="rounded-lg bg-white p-2 shadow-sm dark:bg-slate-800">
                    <PhoneIcon className="h-4 w-4" />
                  </div>

                  <span>{contactPhone}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions (Unified Structure) */}
        <div className="space-y-3">
          
          {/* Subscription CTA - Injected at the top if Inactive */}
          {!isActive && (
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={onManageSubscription}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:shadow-orange-500/40"
            >
              <CreditCardIcon className="h-5 w-5" />
              Activate Website
            </motion.button>
          )}

          {/* Manage Store (Always available, styling dims slightly if inactive) */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate(`/admin/${id}`)}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold text-white transition-all ${
              isActive 
                ? "bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40" 
                : "bg-slate-800 hover:bg-slate-700 shadow-md dark:bg-slate-800 dark:hover:bg-slate-700"
            }`}
          >
            Manage Store
            <ArrowRightCircleIcon className="h-5 w-5" />
          </motion.button>

          {/* Secondary Actions: View & Edit (Always available) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={openDomain}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <GlobeAltIcon className="h-4 w-4" />
              {isActive ? "Live Site" : "Preview Store"}
            </button>

            <button
              onClick={() => onEdit?.(id)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Site
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}