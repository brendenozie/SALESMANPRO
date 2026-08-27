
'use client';

import React, { useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  VideoCameraIcon, 
  LinkIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  CloudArrowUpIcon,
  StarIcon as StarOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, GlobeAltIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function CourseResourcesPage({ context }: any) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Documents', 'Lectures', 'Labs', 'External'];

  useEffect(() => {
    // Mock fetch - Replace with: fetch(`/api/teacher/courses/${context.courseId}/resources`)
    const loadResources = async () => {
      setLoading(true);
      setTimeout(() => {
        setResources([
          { id: '1', title: 'Semester Syllabus 2026', type: 'PDF', category: 'Documents', size: '1.2MB', pinned: true, date: 'Jan 10' },
          { id: '2', title: 'Introduction to Quantum Mechanics', type: 'Video', category: 'Lectures', size: '450MB', pinned: true, date: 'Jan 12' },
          { id: '3', title: 'Lab Manual: Chemical Synthesis', type: 'PDF', category: 'Labs', size: '5.4MB', pinned: false, date: 'Jan 15' },
          { id: '4', title: 'Reference Library', type: 'Link', category: 'External', size: '-', pinned: false, date: 'Jan 16' },
        ]);
        setLoading(false);
      }, 800);
    };
    loadResources();
  }, [context.courseId]);

  const filteredResources = resources.filter(r => 
    (activeTab === 'All' || r.category === activeTab) &&
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    if (type === 'PDF') return <DocumentIcon className="h-6 w-6 text-rose-500" />;
    if (type === 'Video') return <VideoCameraIcon className="h-6 w-6 text-indigo-500" />;
    if (type === 'Link') return <GlobeAltIcon className="h-6 w-6 text-emerald-500" />;
    return <FolderIcon className="h-6 w-6 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Course Resources</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and share learning materials for {context.courseTitle}</p>
        </div>
        
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all">
          <CloudArrowUpIcon className="h-5 w-5" />
          Upload Material
        </button>
      </div>

      {/* PINNED / FEATURED SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.filter(r => r.pinned).map(resource => (
          <div key={resource.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                {getIcon(resource.type)}
              </div>
              <StarSolid className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{resource.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{resource.size} • Added {resource.date}</p>
            <div className="mt-6 flex gap-2">
                <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors">Download</button>
                <button className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200/50 shadow-sm">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* RESOURCE LIST */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredResources.length > 0 ? filteredResources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                  {getIcon(resource.type)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{resource.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{resource.category} • {resource.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                   <ArrowDownTrayIcon className="h-5 w-5" />
                 </button>
                 <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                   <EllipsisVerticalIcon className="h-5 w-5" />
                 </button>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center">
              <FolderIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No resources found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}