"use client";

import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  ClockIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

interface AnalyticsData {
  metrics: {
    mrr: number; // Monthly Recurring Revenue
    conversionRate: number; // Lead to Client
    activePrograms: number;
    sessionsCompleted: number;
    averageSessionRating: number;
  };
}

const mockData: AnalyticsData = {
  metrics: {
    mrr: 12500,
    conversionRate: 18.5,
    activePrograms: 6,
    sessionsCompleted: 45,
    averageSessionRating: 4.8,
  },
};

// --- HELPER COMPONENTS ---

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType; accent: string; description: string }> = ({ title, value, icon: Icon, accent, description }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-7 h-7 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
);

// Placeholder Chart Components
const ChartContainer: React.FC<{ title: string; accent: string; children: React.ReactNode }> = ({ title, accent, children }) => (
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-lg h-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
            <ChartBarIcon className={`w-5 h-5 ${accent}`} />
            {title}
        </h2>
        {children}
    </div>
);

const LineChartPlaceholder = ({ color }: { color: string }) => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
        <span className={`font-semibold text-sm text-${color}-600`}>
            [Placeholder: Revenue Trend Line Graph]
        </span>
    </div>
);

const FunnelChartPlaceholder = ({ color }: { color: string }) => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
        <span className={`font-semibold text-sm text-${color}-600`}>
            [Placeholder: Client Pipeline Conversion Funnel]
        </span>
    </div>
);

const BarChartPlaceholder = ({ color }: { color: string }) => (
    <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
        <span className={`font-semibold text-sm text-${color}-600`}>
            [Placeholder: Program Engagement Comparison]
        </span>
    </div>
);

// --- MAIN COMPONENT ---
export default function AnalyticsClient() {
  const data: AnalyticsData = mockData; // Use mock data for now

  const { mrr, conversionRate, activePrograms, sessionsCompleted, averageSessionRating } = data.metrics;

  const formattedMRR = `$${mrr.toLocaleString()} / mo`;
  const formattedConversionRate = `${conversionRate.toFixed(1)}%`;
  const formattedRating = `${averageSessionRating.toFixed(1)} / 5.0`;

  const cards = [
    { title: 'Monthly Recurring Revenue', value: formattedMRR, icon: CurrencyDollarIcon, accent: 'text-indigo-600', description: 'Total current recurring subscriptions.' },
    { title: 'Lead Conversion Rate', value: formattedConversionRate, icon: ArrowTrendingUpIcon, accent: 'text-amber-600', description: 'Leads converted to paying clients.' },
    { title: 'Active Programs', value: activePrograms.toString(), icon: BookOpenIcon, accent: 'text-indigo-400', description: 'Programs currently being accessed.' },
    { title: 'Total Sessions (MTD)', value: sessionsCompleted.toString(), icon: ClockIcon, accent: 'text-green-600', description: 'Appointments completed this month.' },
    { title: 'Average Session Rating', value: formattedRating, icon: PuzzlePieceIcon, accent: 'text-amber-500', description: 'Client feedback on coaching quality.' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-8xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Filters --- */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    Performance <span className="text-amber-600">Analytics Hub</span>
                    <ChartBarIcon className="w-10 h-10 text-indigo-500" />
                </h1>
                <p className="text-xl text-gray-600 font-light mt-2">
                    Data-driven insights for strategic growth and decision-making.
                </p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Filter by month/year..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition w-full sm:w-48" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-lg hover:bg-indigo-700 transition">
                    <UsersIcon className="w-5 h-5" /> Export Report
                </button>
            </div>
        </header>

        {/* --- Key Metrics Grid --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {cards.map((card) => <MetricCard key={card.title} {...card} />)}
        </section>

        {/* --- Chart Section 1: Financial Performance --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartContainer title="Monthly Revenue Trend" accent="text-indigo-600">
                <LineChartPlaceholder color="indigo" />
            </ChartContainer>
            <ChartContainer title="Client Acquisition Funnel" accent="text-amber-600">
                <FunnelChartPlaceholder color="amber" />
            </ChartContainer>
        </section>

        {/* --- Chart Section 2: Engagement & Operations --- */}
        <section className="grid grid-cols-1 gap-6">
            <ChartContainer title="Program Engagement and Utilization" accent="text-green-600">
                <BarChartPlaceholder color="green" />
            </ChartContainer>
        </section>

        {/* --- Summary Note --- */}
        <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>Data is calculated from successful payments and completed sessions for the selected period.</p>
        </footer>

      </div>
    </div>
  );
}
