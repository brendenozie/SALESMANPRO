"use client";

import React from "react";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/outline";

export type MarketplaceSyncStatus =
  | "LIVE"
  | "PENDING"
  | "OUT_OF_STOCK"
  | "INTERNAL"
  | "INACTIVE";

interface SyncStatusBadgeProps {
  product: any;
  className?: string;
  showTooltip?: boolean;
}

export function deriveSyncStatus(product: any): {
  status: MarketplaceSyncStatus;
  label: string;
  description: string;
  badgeClass: string;
  dotClass: string;
  icon: React.ReactNode;
} {
  const productItem = product?.productItem || product;
  const listings: any[] =
    productItem?.marketplaceListings || product?.marketplaceListings || [];
  const primaryListing = listings[0] || null;

  const showOnGhuba = Boolean(
    productItem?.showOnGhuba ?? primaryListing?.showOnGhuba
  );
  const listingStatus = primaryListing?.status || (showOnGhuba ? "ACTIVE" : null);
  const ghubaStatus = primaryListing?.ghubaStatus || "APPROVED";
  const stock =
    product?.companyStock ??
    productItem?.companyStock ??
    productItem?.quantity ??
    primaryListing?.quantity ??
    0;

  // 1. Not published to marketplace
  if (!listingStatus && !showOnGhuba) {
    return {
      status: "INTERNAL",
      label: "Internal Catalog",
      description: "Only visible in internal inventory. Not published to Ghuba or store tenant.",
      badgeClass:
        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
      dotClass: "bg-gray-400",
      icon: <EyeSlashIcon className="w-3.5 h-3.5 text-gray-400" />,
    };
  }

  // 2. Listing is explicitly INACTIVE / Delisted
  if (listingStatus === "INACTIVE") {
    return {
      status: "INACTIVE",
      label: "Delisted / Inactive",
      description: "Marketplace listing has been unpublished or paused by merchant.",
      badgeClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40",
      dotClass: "bg-rose-500",
      icon: <ArchiveBoxXMarkIcon className="w-3.5 h-3.5 text-rose-500" />,
    };
  }

  // 3. Pending Ghuba sync or approval
  if (ghubaStatus === "PENDING") {
    return {
      status: "PENDING",
      label: "Sync Pending",
      description: "Changes received. Queued for Ghuba marketplace index and cache propagation.",
      badgeClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40",
      dotClass: "bg-amber-500 animate-spin",
      icon: <ArrowPathIcon className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
    };
  }

  // 4. Out of Stock (0 units holding)
  if (stock <= 0) {
    return {
      status: "OUT_OF_STOCK",
      label: "Out of Stock (Delisted)",
      description: "0 units available. Automatically hidden from consumer storefronts until restocked.",
      badgeClass:
        "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40",
      dotClass: "bg-orange-500",
      icon: <ExclamationTriangleIcon className="w-3.5 h-3.5 text-orange-500" />,
    };
  }

  // 5. Active & Live on Ghuba & Storefront
  return {
    status: "LIVE",
    label: "Live on Ghuba & Store",
    description: `Published & synced with inventory (${stock} units live on Ghuba & Storefront).`,
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
    dotClass: "bg-emerald-500 animate-pulse",
    icon: <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" />,
  };
}

export default function SyncStatusBadge({
  product,
  className = "",
  showTooltip = true,
}: SyncStatusBadgeProps) {
  const sync = deriveSyncStatus(product);

  return (
    <div className={`relative group inline-flex items-center ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-default select-none shadow-xs ${sync.badgeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${sync.dotClass}`} />
        <span>{sync.label}</span>
      </span>

      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-col z-50 w-64 p-3 bg-gray-900 text-white rounded-xl shadow-xl text-left border border-gray-800 pointer-events-none animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
            {sync.icon}
            <span>{sync.label}</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-snug">
            {sync.description}
          </p>
        </div>
      )}
    </div>
  );
}
