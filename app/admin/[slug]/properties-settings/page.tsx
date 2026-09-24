import React from 'react';
import { notFound } from 'next/navigation';
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";
import { Cog6ToothIcon, ShieldCheckIcon, BellIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PropertiesSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const session = await getAuthSession();
  const identifier = slug || session?.user?.id || '';
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-slate-500">Company not found</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Cog6ToothIcon className="w-8 h-8 text-indigo-600" /> Real Estate & Property Operations Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure default lease terms, showing durations, security deposit defaults, and short-term stay hospitality policies.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Hospitality & Short-Term Stays */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <ClockIcon className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Short-Term Stay Times & Policies</h3>
              <p className="text-xs text-slate-400">Manage check-in and checkout rules enforcing adjacent date protection.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Standard Check-in Time</label>
              <input 
                type="time" 
                defaultValue="15:00" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Standard Checkout Time</label>
              <input 
                type="time" 
                defaultValue="11:00" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Default Cleaning Fee Ratio (%)</label>
              <input 
                type="number" 
                defaultValue="15" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Hold Expiration Timeout (Minutes)</label>
              <input 
                type="number" 
                defaultValue="30" 
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        {/* Leases & Long-Term Tenancies */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Lease Agreements & Deposits</h3>
              <p className="text-xs text-slate-400">Security deposit and rent invoicing cadence.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Operating Currency</label>
              <select defaultValue="KES" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm">
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Security Deposit Rule</label>
              <select defaultValue="1month" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-sm">
                <option value="1month">1 Month Rent</option>
                <option value="2months">2 Months Rent</option>
                <option value="fixed">Fixed Deposit Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tour Scheduling & Agents */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <BellIcon className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Showing & Inquiries Workflow</h3>
              <p className="text-xs text-slate-400">Tour time slots and agent assignment automation.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Enforce Zero-Double-Booking Protection for Agent Showing Calendars
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Automatically notify assigned agent via WhatsApp and email on new showing request
              </span>
            </label>
          </div>
        </div>

      </div>

    </div>
  );
}
