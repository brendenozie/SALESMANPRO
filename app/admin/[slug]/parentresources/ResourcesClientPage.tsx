'use client';
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  DocumentIcon, 
  PlayCircleIcon, 
  LinkIcon,
  ArrowDownTrayIcon,
  BookOpenIcon
} from '@heroicons/react/24/solid';

export default function ResourcesClientPage({ initialResources }: any) {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', 'Academic', 'Policy', 'Tutorial'];

  const filtered = initialResources.filter((r: any) => 
    activeTab === 'All' || r.category === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === cat 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item: any) => (
          <div key={item.id} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                item.type === 'pdf' ? 'bg-rose-50 text-rose-500' : 
                item.type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'
              }`}>
                {item.type === 'pdf' && <DocumentIcon className="h-6 w-6" />}
                {item.type === 'video' && <PlayCircleIcon className="h-6 w-6" />}
                {item.type === 'link' && <LinkIcon className="h-6 w-6" />}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {item.type === 'pdf' ? item.fileSize : item.duration || 'External Link'}
              </span>
              
              <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
                {item.type === 'video' ? 'Watch Now' : 'Download'}
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 md:w-2/3">
          <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
          <p className="text-indigo-200 mb-6">Our administration team is happy to provide any specific documents or information you may need.</p>
          <button className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition">
            Contact Support
          </button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <BookOpenIcon className="h-64 w-64 text-white" />
        </div>
      </div>
    </div>
  );
}