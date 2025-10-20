"use client";

import React, { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  TagIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

interface ResourceItem {
  id: string;
  title: string;
  type: 'Template' | 'Guide' | 'Ebook' | 'Checklist' | 'Script' | 'Tool';
  description: string;
  downloads: number;
  tags: string[];
}

type ResourceType = ResourceItem['type'];

const initialResources: ResourceItem[] = [
  { id: 'r1', title: 'Q3 Financial Forecasting Template', type: 'Template', description: 'A detailed spreadsheet for quarterly budget and forecast planning.', downloads: 120, tags: ['finance', 'excel', 'planning'] },
  { id: 'r2', title: 'The 7-Step Client Onboarding Guide', type: 'Guide', description: 'Step-by-step process to ensure smooth and professional client initiation.', downloads: 450, tags: ['client management', 'process', 'onboarding'] },
  { id: 'r3', title: 'Scaling Your Solo Practice (Ebook)', type: 'Ebook', description: 'A comprehensive guide on transitioning from a solo consultant to a small agency.', downloads: 98, tags: ['business growth', 'strategy', 'ebook'] },
  { id: 'r4', title: 'Weekly Productivity Checklist', type: 'Checklist', description: 'A simple checklist to maximize focus and track key weekly deliverables.', downloads: 880, tags: ['productivity', 'time management'] },
  { id: 'r5', title: 'Cold Outreach Email Script V2', type: 'Script', description: 'Proven email scripts optimized for high response rates on cold outreach.', downloads: 310, tags: ['sales', 'marketing', 'copywriting'] },
  { id: 'r6', title: 'The KPI Dashboard Creator Tool', type: 'Tool', description: 'An interactive tool to define and track custom Key Performance Indicators.', downloads: 65, tags: ['analytics', 'metrics', 'tool'] },
  { id: 'r7', title: 'Annual Strategic Review Template', type: 'Template', description: 'A framework for conducting comprehensive year-end strategic reviews.', downloads: 205, tags: ['strategy', 'planning'] },
];

const allResourceTypes: ResourceType[] = ['Template', 'Guide', 'Ebook', 'Checklist', 'Script', 'Tool'];

// Utility to get visual props for each resource type
const getTypeProps = (type: ResourceType) => {
  switch (type) {
    case 'Template':
      return { color: 'text-indigo-600 bg-indigo-100 border-indigo-300', icon: CodeBracketIcon };
    case 'Guide':
      return { color: 'text-green-600 bg-green-100 border-green-300', icon: BookOpenIcon };
    case 'Ebook':
      return { color: 'text-amber-600 bg-amber-100 border-amber-300', icon: DocumentTextIcon };
    case 'Checklist':
      return { color: 'text-cyan-600 bg-cyan-100 border-cyan-300', icon: CheckBadgeIcon };
    case 'Script':
      return { color: 'text-purple-600 bg-purple-100 border-purple-300', icon: DocumentTextIcon };
    case 'Tool':
      return { color: 'text-red-600 bg-red-100 border-red-300', icon: WrenchScrewdriverIcon };
    default:
      return { color: 'text-gray-600 bg-gray-100 border-gray-300', icon: TagIcon };
  }
};

// --- HELPER COMPONENTS ---

const ResourceMetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const ResourceTag: React.FC<{ tag: string }> = ({ tag }) => (
    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition cursor-default">
        {tag}
    </span>
);

const ResourceCard: React.FC<{ item: ResourceItem }> = ({ item }) => {
    const { color, icon: Icon } = getTypeProps(item.type);

    return (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition duration-300 transform hover:scale-[1.01] flex flex-col justify-between">
            <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <Icon className={`w-8 h-8 ${color.split(' ')[0]}`} />
                <span className={`px-4 py-1 text-sm font-semibold rounded-full border ${color}`}>{item.type}</span>
            </header>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            
            <p className="text-base text-gray-600 mb-4 leading-relaxed line-clamp-3">{item.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map(tag => <ResourceTag key={tag} tag={tag} />)}
            </div>

            <footer className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 font-medium text-gray-500">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    {item.downloads} Downloads
                </div>
                <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold transition">
                    <DocumentTextIcon className="w-4 h-4" /> Access Resource
                </button>
            </footer>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function ContentLibraryClient() {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [isLoading, setIsLoading] = useState(false); // Mock loading state
  const [activeType, setActiveType] = useState<'All' | ResourceType>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtered and Searched Resources ---
  const filteredResources = useMemo(() => {
    let currentResources = resources;

    // 1. Filter by Type
    if (activeType !== 'All') {
      currentResources = currentResources.filter(item => item.type === activeType);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentResources = currentResources.filter(
        item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return currentResources;
  }, [resources, activeType, searchTerm]);

  // --- Library Metrics Calculation ---
  const libraryMetrics = useMemo(() => {
    const totalResources = resources.length;
    const totalDownloads = resources.reduce((sum, item) => sum + item.downloads, 0);
    const mostDownloaded = resources.reduce((max, item) => (item.downloads > max.downloads ? item : max), initialResources[0]);

    return {
      totalResources,
      totalDownloads,
      mostDownloaded: mostDownloaded?.title || 'N/A',
    };
  }, [resources]);

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-indigo-600 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Loading Resource Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Header and Title --- */}
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-l-8 border-amber-600">
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Digital Resource <span className="text-amber-600">Vault</span>
              <ArchiveBoxIcon className="w-10 h-10 text-amber-500" />
            </h1>
            <p className="text-base text-gray-500 font-medium mt-1">Your central library for all templates, guides, and tools for clients.</p>
          </div>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ResourceMetricCard
            title="Total Resources"
            value={libraryMetrics.totalResources}
            icon={ArchiveBoxIcon}
            accent="text-indigo-600"
          />
          <ResourceMetricCard
            title="Total Downloads"
            value={libraryMetrics.totalDownloads.toLocaleString()}
            icon={ArrowDownTrayIcon}
            accent="text-green-600"
          />
          <ResourceMetricCard
            title="Most Popular Item"
            value={libraryMetrics.mostDownloaded.split(' ').slice(0, 3).join(' ') + '...'}
            icon={CheckBadgeIcon}
            accent="text-amber-600"
          />
        </section>

        {/* --- Search and Filters --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, description, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
            {['All', ...allResourceTypes].map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type as 'All' | ResourceType)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                  activeType === type
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type} ({type === 'All' ? resources.length : resources.filter(r => r.type === type).length})
              </button>
            ))}
          </div>
        </section>

        {/* --- Resource Cards Grid --- */}
        <section>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            Available Resources ({filteredResources.length})
          </h2>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((item) => (
                <ResourceCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-10 text-center bg-white rounded-3xl shadow-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
              <ExclamationCircleIcon className="w-10 h-10 mx-auto mb-3" />
              <p>No resources match the current search or filters.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
