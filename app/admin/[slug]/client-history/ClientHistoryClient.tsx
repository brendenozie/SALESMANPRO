"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  UsersIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

interface ClientArchiveItem {
  id: string;
  name: string;
  company: string;
  sector: string;
  engagementOutcome: Outcome;
  summary: string;
  durationMonths: number;
  testimonialCount: number;
}

type Outcome = 'High Growth' | 'Strategic Shift' | 'Efficiency Gain' | 'Turnaround' | 'Restructure';

const initialArchive: ClientArchiveItem[] = [
  { id: 'c1', name: 'Jake Peralta', company: 'Zenith Corp', sector: 'Software', engagementOutcome: 'High Growth', summary: 'Implemented new sales structure, achieving 40% Q-o-Q revenue increase.', durationMonths: 12, testimonialCount: 3 },
  { id: 'c2', name: 'Rosa Diaz', company: 'Global Logistics Inc.', sector: 'Logistics', engagementOutcome: 'Efficiency Gain', summary: 'Streamlined operational workflows, reducing fulfillment time by 18%.', durationMonths: 6, testimonialCount: 1 },
  { id: 'c3', name: 'Charles Boyle', company: 'Local Artisan Foods', sector: 'Food & Beverage', engagementOutcome: 'Strategic Shift', summary: 'Repositioned brand identity leading to a 20% increase in market share.', durationMonths: 9, testimonialCount: 2 },
  { id: 'c4', name: 'Amy Santiago', company: 'EduStream Platform', sector: 'Education', engagementOutcome: 'Restructure', summary: 'Oversaw leadership transition and organizational realignment for stability.', durationMonths: 4, testimonialCount: 0 },
  { id: 'c5', name: 'Raymond Holt', company: 'Financial Alpha', sector: 'Finance', engagementOutcome: 'High Growth', summary: 'Optimized capital allocation strategies for maximum ROI.', durationMonths: 18, testimonialCount: 5 },
];

const allOutcomes: Outcome[] = ['High Growth', 'Strategic Shift', 'Efficiency Gain', 'Turnaround', 'Restructure'];

// Utility to get visual props for each outcome
const getOutcomeProps = (outcome: Outcome) => {
  switch (outcome) {
    case 'High Growth':
      return { color: 'bg-green-100 text-green-700 border-green-500', icon: TrophyIcon };
    case 'Strategic Shift':
      return { color: 'bg-indigo-100 text-indigo-700 border-indigo-500', icon: BuildingOffice2Icon };
    case 'Efficiency Gain':
      return { color: 'bg-cyan-100 text-cyan-700 border-cyan-500', icon: TagIcon };
    case 'Turnaround':
      return { color: 'bg-red-100 text-red-700 border-red-500', icon: ArrowPathIcon };
    case 'Restructure':
      return { color: 'bg-purple-100 text-purple-700 border-purple-500', icon: BuildingOffice2Icon };
    default:
      return { color: 'bg-gray-100 text-gray-700 border-gray-500', icon: TagIcon };
  }
};

// --- MAIN COMPONENT ---
export default function ClientHistoryClient() {
  const [archive, setArchive] = useState<ClientArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOutcome, setActiveOutcome] = useState<'All' | Outcome>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data Loading Effect (MOCK) ---
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setArchive(initialArchive);
      setIsLoading(false);
    }, 1000);
  }, []);

  // --- Filtered and Searched Archive ---
  const filteredArchive = useMemo(() => {
    let currentArchive = archive;

    // 1. Filter by Outcome
    if (activeOutcome !== 'All') {
      currentArchive = currentArchive.filter(item => item.engagementOutcome === activeOutcome);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentArchive = currentArchive.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.company.toLowerCase().includes(searchLower) ||
          item.summary.toLowerCase().includes(searchLower)
      );
    }

    return currentArchive;
  }, [archive, activeOutcome, searchTerm]);

  // --- Archive Metrics Calculation ---
  const archiveMetrics = useMemo(() => {
    const totalClients = archive.length;
    const totalTestimonials = archive.reduce((sum, item) => sum + item.testimonialCount, 0);
    const growthClients = archive.filter(item => item.engagementOutcome === 'High Growth' || item.engagementOutcome === 'Turnaround').length;
    const successRate = totalClients > 0 ? ((growthClients / totalClients) * 100).toFixed(1) : '0.0';

    return {
      totalClients,
      totalTestimonials,
      successRate,
    };
  }, [archive]);

  // --- Helper Components ---

  const ArchiveMetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  const OutcomeTag: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
    const { color, icon: Icon } = getOutcomeProps(outcome);
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
        <Icon className="w-3 h-3" />
        {outcome}
      </span>
    );
  };
  
  const ArchiveCard: React.FC<{ item: ClientArchiveItem }> = ({ item }) => {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition duration-300 transform hover:scale-[1.01] flex flex-col justify-between">
        <div>
          <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-indigo-500" /> {item.company}
            </h3>
            <OutcomeTag outcome={item.engagementOutcome} />
          </header>
          
          <p className="text-base text-gray-600 mb-4 italic leading-relaxed">"{item.summary}"</p>
        </div>

        <footer className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <CalendarDaysIcon className="w-4 h-4 text-amber-500" />
              {item.durationMonths} months
            </span>
            <span className="flex items-center gap-1 font-medium">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-500" />
              {item.testimonialCount} Testimonials
            </span>
          </div>
          <button className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
            View Full Report
          </button>
        </footer>
      </div>
    );
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-indigo-600 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Client Archive...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 text-red-600 flex flex-col items-center justify-center text-center p-4">
        <ExclamationCircleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Archive Unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Header and Title --- */}
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-l-8 border-indigo-600">
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Client History <span className="text-indigo-600">Archive</span>
              <ArchiveBoxIcon className="w-10 h-10 text-indigo-500" />
            </h1>
            <p className="text-base text-gray-500 font-medium mt-1">Your repository of past successes and learning outcomes.</p>
          </div>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ArchiveMetricCard
            title="Total Clients Served"
            value={archiveMetrics.totalClients}
            icon={UsersIcon}
            accent="text-indigo-600"
          />
          <ArchiveMetricCard
            title="Success/Growth Rate"
            value={`${archiveMetrics.successRate}%`}
            icon={TrophyIcon}
            accent="text-amber-600"
          />
          <ArchiveMetricCard
            title="Total Testimonials"
            value={archiveMetrics.totalTestimonials}
            icon={ChatBubbleLeftRightIcon}
            accent="text-green-600"
          />
        </section>

        {/* --- Search and Filters --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/2">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name, company, or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Outcome Filters */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {['All', ...allOutcomes].map(outcome => (
              <button
                key={outcome}
                onClick={() => setActiveOutcome(outcome as 'All' | Outcome)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                  activeOutcome === outcome
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {outcome} ({outcome === 'All' ? archive.length : archive.filter(a => a.engagementOutcome === outcome).length})
              </button>
            ))}
          </div>
        </section>

        {/* --- Client History Cards Grid --- */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            Archived Engagements ({filteredArchive.length})
          </h2>
          {filteredArchive.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredArchive.map((item) => (
                <ArchiveCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
              <ArchiveBoxIcon className="w-10 h-10 mx-auto mb-3" />
              <p>No client history records match the current filters.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
