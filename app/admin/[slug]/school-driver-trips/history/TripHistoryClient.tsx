'use client';

import React, { useState, useMemo } from 'react';
import { 
  CalendarIcon, 
  FunnelIcon, 
  ArrowUpRightIcon,
  BeakerIcon, // For Fuel
  MapIcon,
  UsersIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function TripHistoryClient({ initialHistory }: any) {
  const [filter, setFilter] = useState('7D');

  // Summary Metrics
  const stats = useMemo(() => ({
    onTimeRate: "98.4%",
    avgFuel: "12.5 L/100km",
    totalDistance: "1,240 km",
    studentsServed: "452"
  }), []);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* HEADER & PERFORMANCE HUD */}
      <header className="mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Service History</h1>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="On-Time Performance" value={stats.onTimeRate} icon={ClockIcon} trend="+2%" />
          <MetricCard title="Avg Fuel Economy" value={stats.avgFuel} icon={BeakerIcon} trend="-0.4L" />
          <MetricCard title="Distance Covered" value={stats.totalDistance} icon={MapIcon} />
          <MetricCard title="Safe Boardings" value={stats.studentsServed} icon={ShieldCheckIcon} />
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {['7D', '30D', 'ALL'].map(t => (
            <button 
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${filter === t ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase border border-white/10 px-4 py-2 rounded-xl">
          <FunnelIcon className="h-4 w-4" /> Filter By Date
        </button>
      </div>

      {/* HISTORY TABLE / LIST */}
      <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date / Route</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Boarding Log</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Efficiency</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialHistory.map((trip: any) => (
              <tr key={trip.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-8">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600/10 p-3 rounded-2xl">
                      <CalendarIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight">{trip.routeName}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase mt-1">{trip.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-slate-400" />
                    <span className="font-black italic">{trip.boardedCount} / {trip.totalExpected}</span>
                    <span className="text-[10px] font-bold text-emerald-500 ml-2">Clean Manifest</span>
                  </div>
                </td>
                <td className="px-8 py-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <BeakerIcon className="h-3.5 w-3.5 text-slate-500" />
                      {trip.fuelUsed} L
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <MapIcon className="h-3.5 w-3.5 text-slate-500" />
                      {trip.mileage} km
                    </div>
                  </div>
                </td>
                <td className="px-8 py-8 text-right">
                  <button className="bg-white/5 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 text-blue-500">
                    <ArrowUpRightIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] relative overflow-hidden group hover:border-blue-500/50 transition-all">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-24 w-24" />
      </div>
      <p className="text-[10px] font-black uppercase text-slate-500 mb-2">{title}</p>
      <div className="flex items-end gap-3">
        <p className="text-3xl font-black italic">{value}</p>
        {trend && (
          <span className={`text-[10px] font-black mb-1.5 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}