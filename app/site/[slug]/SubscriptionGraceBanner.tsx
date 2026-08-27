'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ExclamationTriangleIcon, 
  CreditCardIcon, 
  ArrowRightIcon, 
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface SubscriptionNoticeProps {
  storeName: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  gracePeriodDaysLeft?: number;
}

// Top Banner shown during Grace Period (Past Due)
export function SubscriptionGraceBanner({ storeName, daysLeft = 3 }: { storeName: string; daysLeft?: number }) {
  return (
    <div className="bg-amber-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-amber-200 animate-pulse" />
          <span>
            <strong className="font-semibold">{storeName} Admin Notice:</strong> Subscription payment is past due. 
            Store will pause in {daysLeft} day{daysLeft === 1 ? '' : 's'}.
          </span>
        </div>
        <a
          href="/stores"
          className="inline-flex items-center gap-1.5 bg-white text-amber-900 hover:bg-amber-50 px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0"
        >
          <CreditCardIcon className="w-4 h-4" />
          Renew Subscription
        </a>
      </div>
    </div>
  );
}

// Full-screen Maintenance / Inactive view for EXPIRED status
export function SubscriptionInactiveView({
  storeName,
  logoUrl,
  contactEmail,
  contactPhone,
}: SubscriptionNoticeProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Store Logo or Fallback Avatar */}
        <div className="flex justify-center">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={storeName} 
              className="h-16 w-16 object-contain rounded-2xl border border-slate-100 dark:border-zinc-800 p-2 bg-slate-50 dark:bg-zinc-950 shadow-inner" 
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BuildingStorefrontIcon className="w-8 h-8 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-xs font-bold tracking-wide uppercase">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            Store Temporarily Offline
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {storeName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            We are currently undergoing brief routine maintenance or account verification. Please check back shortly!
          </p>
        </div>

        {/* Customer Contact Support Links */}
        {(contactEmail || contactPhone) && (
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Need urgent assistance? Contact us
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 dark:text-zinc-300">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <EnvelopeIcon className="w-3.5 h-3.5" />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <PhoneIcon className="w-3.5 h-3.5" />
                  {contactPhone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Store Owner Gateway */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] text-slate-400 mb-2">Are you the store administrator?</p>
          <a
            href="/stores"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm group"
          >
            <span>Log in to Reactivate Store</span>
            <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

      </div>
    </div>
  );
}