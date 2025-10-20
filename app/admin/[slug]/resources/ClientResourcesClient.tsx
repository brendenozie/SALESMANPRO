"use client";

import React, { useState, useMemo } from 'react';
import {
  SparklesIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  PuzzlePieceIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

interface ClientResource {
  id: string;
  title: string;
  category: 'Foundation' | 'Execution' | 'Scaling';
  type: 'Template' | 'Guide' | 'Checklist' | 'Tool';
  description: string;
}

const allResources: ClientResource[] = [
  // Foundation
  { id: 'cr1', title: 'Vision Statement Template', category: 'Foundation', type: 'Template', description: 'Define your long-term goals and mission quickly and clearly.' },
  { id: 'cr2', title: 'Niche Definition Guide', category: 'Foundation', type: 'Guide', description: 'A step-by-step workbook to find and own your profitable market segment.' },
  { id: 'cr3', title: 'Initial Audit Checklist', category: 'Foundation', type: 'Checklist', description: 'Ensure all foundational business elements are correctly set up.' },

  // Execution
  { id: 'cr4', title: 'Q3 Goal Setting Template', category: 'Execution', type: 'Template', description: 'Structured template for setting SMART quarterly goals.' },
  { id: 'cr5', title: 'Project Management Toolkit', category: 'Execution', type: 'Tool', description: 'A collection of links and tips for efficient project execution.' },
  { id: 'cr6', title: 'Communication Best Practices', category: 'Execution', type: 'Guide', description: 'Guide to improve internal and external communication efficiency.' },

  // Scaling
  { id: 'cr7', title: 'Hiring Process Checklist', category: 'Scaling', type: 'Checklist', description: 'Streamline your recruitment process for your first key hires.' },
  { id: 'cr8', title: 'Delegation Framework Template', category: 'Scaling', type: 'Template', description: 'A structured model for effectively handing off tasks and responsibilities.' },
  { id: 'cr9', title: 'Scaling Strategy E-Book', category: 'Scaling', type: 'Guide', description: 'Advanced strategies for revenue and team expansion.' },
];

type ResourceCategory = ClientResource['category'];

const categoryDetails: Record<ResourceCategory, { icon: React.ElementType, color: string, description: string }> = {
  Foundation: {
    icon: PuzzlePieceIcon,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description: 'Resources designed to help you build the solid base for your coaching program.',
  },
  Execution: {
    icon: WrenchScrewdriverIcon,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Tools and templates to implement strategies and manage day-to-day operations efficiently.',
  },
  Scaling: {
    icon: SparklesIcon,
    color: 'text-green-600 bg-green-50 border-green-200',
    description: 'Advanced guides for expanding your team, revenue, and impact.',
  },
};

// --- HELPER COMPONENTS ---

const getIconForType = (type: ClientResource['type']) => {
  switch (type) {
    case 'Template': return ClipboardDocumentCheckIcon;
    case 'Guide': return BookOpenIcon;
    case 'Checklist': return DocumentTextIcon;
    case 'Tool': return WrenchScrewdriverIcon;
    default: return DocumentTextIcon;
  }
};

const ResourceCard: React.FC<{ item: ClientResource }> = ({ item }) => {
  const TypeIcon = getIconForType(item.type);

  return (
    <div className="flex flex-col p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl hover:border-indigo-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
            <TypeIcon className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-gray-500">{item.type}</span>
        </div>
        <div className="text-xs font-medium text-gray-400">
            {item.category}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>

      <p className="text-sm text-gray-600 mb-4 flex-grow">{item.description}</p>

      <button
        onClick={() => console.log(`Downloading resource: ${item.title}`)}
        className="mt-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        Download Now
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function ClientResourcesClient() {
  const resourcesByCategory = useMemo(() => {
    return allResources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    }, {} as Record<ResourceCategory, ClientResource[]>);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Title --- */}
        <header className="mb-12 p-8 bg-white rounded-3xl shadow-2xl border-l-8 border-indigo-600">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Client <span className="text-amber-600">Resource Hub</span>
            <BookOpenIcon className="w-10 h-10 text-indigo-500" />
          </h1>
          <p className="text-xl text-gray-600 font-light mt-2">
            Everything you need to execute your strategy—templates, guides, and tools.
          </p>
        </header>

        {/* --- Resource Categories Sections --- */}
        <div className="space-y-16">
          {(Object.keys(categoryDetails) as ResourceCategory[]).map((category) => {
            const detail = categoryDetails[category];
            const CategoryIcon = detail.icon;
            const resources = resourcesByCategory[category] || [];

            return (
              <section key={category}>
                {/* Category Header */}
                <div className={`p-6 mb-8 rounded-xl border-l-4 ${detail.color} flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <CategoryIcon className={`w-8 h-8 ${detail.color.split(' ')[0]}`} />
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">{category} Phase</h2>
                            <p className="text-sm text-gray-600">{detail.description}</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-gray-500 hidden sm:block">
                        ({resources.length} Items)
                    </span>
                </div>

                {/* Resource Grid */}
                {resources.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resources.map((item) => (
                      <ResourceCard key={item.id} item={item} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-xl shadow-inner border border-dashed border-gray-300 text-gray-500 italic">
                    <p>No resources currently available for the **{category}** phase.</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* --- Footer Note --- */}
        <footer className="mt-16 pt-8 border-t border-gray-300 text-center text-gray-500 text-sm">
            <p>Can't find what you're looking for? Reach out directly to your coach for custom materials.</p>
            <p className="mt-1 flex justify-center items-center gap-1">
                <ChevronRightIcon className="w-4 h-4" /> All resources are proprietary and for client use only.
            </p>
        </footer>

      </div>
    </div>
  );
}
