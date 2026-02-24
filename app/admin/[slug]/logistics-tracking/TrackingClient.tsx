'use client';

import React, { useState } from 'react';
import { 
  SignalIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  NoSymbolIcon
} from '@heroicons/react/24/solid';
import LiveTrackingMap from './LiveTrackingMap'; // Reusing the component we built first
import { TrackedAsset } from './page';

export default function TrackingClient({ params }: { params: { companyId: string, assets: TrackedAsset[] } }) {
  const [selectedAsset, setSelectedAsset] = useState<TrackedAsset | null>(params.assets[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = params.assets.filter(a => 
    a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );
// h-[calc(100vh-64px)] bg-slate-50 overflow-hidden
  return (
    <div className="flex flex-col ">
      {/* 1. Global Metrics Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between z-10">
        <div className="flex gap-8">
          <Metric small label="Online Units" value="24" color="text-emerald-600" />
          <Metric small label="In Motion" value="18" color="text-blue-600" />
          <Metric small label="Alerts" value="2" color="text-rose-600" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase">Auto-Refresh: 5s</span>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowPathIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Side Asset List */}
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col shadow-xl z-10">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search fleet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full p-4 flex items-center gap-4 border-b border-slate-50 transition-all text-left ${
                  selectedAsset?.id === asset.id ? 'bg-indigo-50/50 border-r-4 border-r-indigo-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  asset.status === 'Moving' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <SignalIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{asset.assetName}</p>
                  <p className="text-xs text-slate-500 font-medium truncate">{asset.driver}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">{asset.speed} km/h</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{asset.status}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Primary Map View */}
        <div className="flex-1 relative bg-slate-200">
          <LiveTrackingMap /> 
          
          {/* Floating Asset Detail Overlay */}
          {selectedAsset && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-96 bg-slate-900/95 backdrop-blur-md p-6 rounded-3xl text-white shadow-2xl z-[1001] border border-white/10 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-black">{selectedAsset.assetName}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedAsset.driver}</p>
                </div>
                <span className="bg-emerald-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Live</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Heading</p>
                  <p className="text-sm font-bold tracking-tight">{selectedAsset.heading}° North West</p>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Destination</p>
                  <p className="text-sm font-bold truncate">{selectedAsset.destination}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors">
                  Contact Driver
                </button>
                <button className="px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                   <NoSymbolIcon className="h-5 w-5 text-rose-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color, small }: any) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}:</span>
      <span className={`text-sm font-black ${color}`}>{value}</span>
    </div>
  );
}