"use client";

import React, { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  MinusCircleIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

type SubscriptionStatus = 'Active' | 'Paused' | 'Expired';

interface Subscription {
  id: string;
  clientName: string;
  planName: string;
  mrr: number; // Monthly Recurring Revenue
  startDate: string; // YYYY-MM-DD
  nextRenewalDate: string; // YYYY-MM-DD
  status: SubscriptionStatus;
}

const initialSubscriptions: Subscription[] = [
  { id: 'S001', clientName: 'Sarah Connor', planName: 'Executive 1:1 Coaching', mrr: 1500, startDate: '2025-08-01', nextRenewalDate: '2025-11-01', status: 'Active' },
  { id: 'S002', clientName: 'John Doe', planName: 'Growth Strategy Group', mrr: 450, startDate: '2025-09-15', nextRenewalDate: '2025-10-15', status: 'Expired' },
  { id: 'S003', clientName: 'Alice Smith', planName: 'Executive 1:1 Coaching', mrr: 1500, startDate: '2025-10-20', nextRenewalDate: '2025-11-20', status: 'Active' },
  { id: 'S004', clientName: 'Robert Green', planName: 'Weekly Accountability Plan', mrr: 199, startDate: '2025-09-01', nextRenewalDate: '2025-11-01', status: 'Active' },
  { id: 'S005', clientName: 'Jane Foster', planName: 'Scaling Workshop Series', mrr: 299, startDate: '2025-07-01', nextRenewalDate: '2025-12-01', status: 'Paused' },
];

const statusMap: Record<SubscriptionStatus, { color: string; icon: React.ElementType }> = {
  Active: { color: 'bg-indigo-100 text-indigo-700 border-indigo-500', icon: CheckCircleIcon },
  Paused: { color: 'bg-amber-100 text-amber-700 border-amber-500', icon: ClockIcon },
  Expired: { color: 'bg-red-100 text-red-700 border-red-500', icon: MinusCircleIcon },
};

// --- HELPER COMPONENTS ---

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const SubscriptionRow: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
  const { color, icon: StatusIcon } = statusMap[subscription.status];
  const formattedMrr = `$${subscription.mrr.toLocaleString()}`;

  const isRenewingSoon = subscription.status === 'Active' && new Date(subscription.nextRenewalDate).getTime() < (Date.now() + (30 * 24 * 60 * 60 * 1000)); // Within 30 days

  return (
    <div className={`grid grid-cols-6 items-center py-4 px-6 rounded-xl transition duration-200 border-2 ${isRenewingSoon ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-gray-100 hover:shadow-md'}`}>
      
      {/* Client & Plan */}
      <div className="col-span-2 flex flex-col sm:flex-row sm:gap-4 items-start sm:items-center">
        <span className="text-sm font-semibold text-gray-500 hidden sm:inline">{subscription.id}</span>
        <span className="text-base font-bold text-indigo-600 truncate">{subscription.clientName}</span>
      </div>

      {/* MRR */}
      <div className="text-right sm:text-left">
        <span className="text-lg font-extrabold text-gray-900">{formattedMrr}</span>
      </div>

      {/* Renewal Date */}
      <div className="col-span-2 text-sm text-gray-600 flex flex-col">
        <span className="flex items-center gap-1">
            <CalendarDaysIcon className="w-4 h-4 text-gray-500"/>
            <span className="font-semibold text-gray-800">Renewal:</span> {subscription.nextRenewalDate}
        </span>
        <span className="text-xs text-gray-500"><span className="font-semibold">Plan:</span> {subscription.planName}</span>
      </div>
      
      {/* Status & Actions */}
      <div className="col-span-1 flex flex-col items-end sm:items-center">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
          <StatusIcon className="w-3 h-3 inline mr-1" />{subscription.status}
        </span>
        <button className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
            Manage
        </button>
      </div>

    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SubscriptionsClient() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [activeFilter, setActiveFilter] = useState<'All' | SubscriptionStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const allStatuses: ('All' | SubscriptionStatus)[] = ['All', 'Active', 'Paused', 'Expired'];

  // --- Filtering and Metrics Logic ---
  const filteredSubscriptions = useMemo(() => {
    let currentSubscriptions = subscriptions;

    // 1. Filter by Status
    if (activeFilter !== 'All') {
      currentSubscriptions = currentSubscriptions.filter(sub => sub.status === activeFilter);
    }

    // 2. Filter by Search Term (Client Name or Plan)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentSubscriptions = currentSubscriptions.filter(
        sub =>
          sub.clientName.toLowerCase().includes(searchLower) ||
          sub.planName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by Renewal Date (closest renewal first for active/paused)
    return currentSubscriptions.sort((a, b) => {
        return new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime();
    });
  }, [subscriptions, activeFilter, searchTerm]);


  const metrics = useMemo(() => {
    const totalMRR = subscriptions
      .filter(sub => sub.status === 'Active')
      .reduce((sum, sub) => sum + sub.mrr, 0);

    const activeCount = subscriptions
      .filter(sub => sub.status === 'Active')
      .length;

    const expiringSoonCount = subscriptions
        .filter(sub => sub.status === 'Active' && new Date(sub.nextRenewalDate).getTime() < (Date.now() + (30 * 24 * 60 * 60 * 1000))) // Within 30 days
        .length;
      
    return {
      totalMRR: `$${totalMRR.toLocaleString()}`,
      activeCount: activeCount.toString(),
      expiringSoonCount: expiringSoonCount.toString(),
    };
  }, [subscriptions]);


  // --- Render Logic ---

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Title --- */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    Subscription <span className="text-amber-600">Management</span>
                    <ArrowPathIcon className="w-10 h-10 text-indigo-500" />
                </h1>
                <p className="text-xl text-gray-600 font-light mt-2">
                    Monitor recurring revenue, track renewals, and manage client plans.
                </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition">
                <PlusIcon className="w-5 h-5" /> Enroll New Client
            </button>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard
            title="Total Monthly Recurring Revenue (MRR)"
            value={metrics.totalMRR}
            icon={CurrencyDollarIcon}
            accent="text-indigo-600"
          />
          <MetricCard
            title="Active Subscriptions"
            value={metrics.activeCount}
            icon={UsersIcon}
            accent="text-green-600"
          />
          <MetricCard
            title="Renewals This Month"
            value={metrics.expiringSoonCount}
            icon={CalendarDaysIcon}
            accent="text-amber-600"
          />
        </section>

        {/* --- List View Container --- */}
        <div className="bg-white p-6 rounded-3xl shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                
                {/* Search Bar */}
                <div className="relative w-full md:w-1/3">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search client or plan name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                    {allStatuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status as 'All' | SubscriptionStatus)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                                activeFilter === status
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subscription List Header (Desktop Only) */}
            <div className="hidden sm:grid grid-cols-6 items-center py-3 px-6 text-xs font-bold uppercase text-gray-500 border-b border-gray-200 mb-2">
                <span className="col-span-2">Client / Plan</span>
                <span className="text-left">MRR</span>
                <span className="col-span-2">Renewal Date / Start Date</span>
                <span className="text-center">Status / Actions</span>
            </div>

            {/* Subscription List */}
            <div className="space-y-3">
                {filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map(subscription => (
                        <SubscriptionRow key={subscription.id} subscription={subscription} />
                    ))
                ) : (
                    <div className="p-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
                        <ArrowPathIcon className="w-10 h-10 mx-auto mb-3" />
                        <p>No **{activeFilter}** subscriptions found matching your criteria.</p>
                    </div>
                )}
            </div>

        </div>
        
        {/* --- Footer Note --- */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>MRR calculation is based on currently active plans and excludes one-time payments.</p>
        </footer>

      </div>
    </div>
  );
}
