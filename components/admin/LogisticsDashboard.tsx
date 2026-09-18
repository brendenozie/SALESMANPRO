'use client';

import React from 'react';
import dynamic from "next/dynamic";
import { 
  TruckIcon, 
  MapIcon, 
  CubeIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon, 
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const mockData = {
  logisticsStats: [
    {
      title: 'Active Shipments',
      value: '1,284',
      color: 'text-blue-600',
      growth: '12.5',
      description: 'Currently in transit'
    },
    {
      title: 'On-Time Rate',
      value: '94.2%',
      color: 'text-emerald-600',
      growth: '2.1',
      description: 'Last 24 hours'
    },
    {
      title: 'Fleet Status',
      value: '88%',
      color: 'text-violet-600',
      growth: '0.4',
      description: 'Vehicles operational'
    },
    {
      title: 'Critical Alerts',
      value: '3',
      color: 'text-rose-600',
      growth: '15.0',
      description: 'Require immediate action'
    }
  ],
  performanceData: {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [
      {
        name: 'Delivery Volume',
        data: [450, 520, 480, 610, 590, 400, 350]
      },
      {
        name: 'Success Rate (%)',
        data: [92, 95, 91, 98, 94, 90, 96]
      }
    ]
  },
  routePerformance: [
    {
      routeName: 'Chicago (CHI) → New York (NYC)',
      hubLocation: 'Eastern Seaboard Hub',
      efficiency: 98,
      volume: '342'
    },
    {
      routeName: 'Los Angeles (LAX) → Phoenix (PHX)',
      hubLocation: 'Southwest Terminal',
      efficiency: 91,
      volume: '215'
    },
    {
      routeName: 'Houston (HOU) → Dallas (DAL)',
      hubLocation: 'Texas Distribution',
      efficiency: 87,
      volume: '189'
    }
  ],
  spotlight: {
    driver: 'Marcus Thorne',
    hub: 'Atlanta Southeast (ATL-4)'
  },
  alerts: [
    {
      id: 1,
      type: 'critical',
      text: 'Severe weather delay on I-95 North. 12 shipments affected.'
    },
    {
      id: 2,
      type: 'info',
      text: 'New fuel optimization protocols active for the Western fleet.'
    },
    {
      id: 3,
      type: 'info',
      text: 'Maintenance scheduled for 5 Prime-class vehicles tonight.'
    }
  ],
  driverMessages: [
    {
      id: 1,
      id_tag: 'TX-44',
      driverName: 'Sarah Jenkins',
      time: '2m ago',
      message: 'Loading at Dock 4 is backed up. Expect a 20-minute delay for dispatch.'
    },
    {
      id: 2,
      id_tag: 'NY-12',
      driverName: 'David Chen',
      time: '15m ago',
      message: 'Delivery completed successfully at Manhattan Plaza. Route clear.'
    },
    {
      id: 3,
      id_tag: 'CA-09',
      driverName: 'Robert Vance',
      time: '1h ago',
      message: 'Traffic heavy on Highway 101, re-routing via secondary for on-time arrival.'
    }
  ]
};

export default function LogisticsDashboard({ data: propData, ...rest }: { data?: any; [key: string]: any }) {
  const data = propData || (rest.logisticsStats ? rest : mockData);

  // Chart mapping: Delivery Volume vs Success Rate
  const chartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#3C50E0', '#10B981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
    xaxis: { categories: data?.performanceData?.days || mockData.performanceData.days },
    yaxis: { labels: { formatter: (v: number) => `${v}` } },
    dataLabels: { enabled: false },
    tooltip: { x: { show: true }, marker: { show: true } }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const statIcons: Record<string, JSX.Element> = {
    'Active Shipments': <TruckIcon className="h-6 w-6 text-blue-600" />,
    'On-Time Rate': <ClockIcon className="h-6 w-6 text-emerald-600" />,
    'Fleet Status': <GlobeAltIcon className="h-6 w-6 text-violet-600" />,
    'Pending Dispatches': <CubeIcon className="h-6 w-6 text-amber-600" />,
    'Critical Alerts': <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" />,
  };
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl uppercase">Logistics Control Tower</h1>
          <p className="text-slate-500 text-sm italic">Real-time fleet monitoring and supply chain analytics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
          <MapIcon className="h-5 w-5" /> All Regions Active • {today}
        </div>
      </div>

      {/* 1. High-Level Operations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {data.logisticsStats.map((stat: any, i: number) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 transition-colors cursor-default">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">{stat.title}</p>
              {statIcons[stat.title]}
            </div>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
            <div className="flex items-center gap-1 mt-2">
               <span className="text-[10px] text-emerald-600 font-bold">↑ {stat.growth}%</span>
               <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">vs last week</p>
            </div>
          </div>
        ))}
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Charts & Impact */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Fleet Efficiency Index</h2>
                <p className="text-sm text-slate-500">Comparing shipment volume vs. average delivery time (hours).</p>
              </div>
              <select className="text-xs border-slate-200 rounded-lg bg-slate-50 font-bold p-1">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <ApexCharts options={chartOptions} series={data.performanceData.series} type="area" height={350} />
          </div>

          {/* Regional Performance Drill-down */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" /> Top Performing Routes
              </h3>
              <div className="space-y-4">
                {data.routePerformance.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{item.routeName}</p>
                      <p className="text-[10px] text-slate-400">Hub: {item.hubLocation}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600">
                        {item.efficiency}% Eff.
                      </span>
                      <p className="text-[10px] text-slate-400">{item.volume} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-blue-400" /> Logistics Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Dispatch Fleet', 'Route Planner', 'Inventory', 'Fuel Reports', 'Driver Logs', 'Invoicing'].map(link => (
                  <button key={link} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold text-left transition-all border border-white/5 uppercase">
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Spotlights & Feed */}
        <div className="lg:col-span-4 space-y-6">

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-1 rounded-3xl shadow-lg shadow-blue-100">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[calc(1.5rem-1px)]">
              <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-tight">
                <StarIcon className="h-6 w-6 text-blue-600" /> Service Excellence
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">🚚</div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Driver of the Month</p>
                    <p className="font-bold text-slate-800">{data.spotlight.driver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">🏭</div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Top Warehouse Hub</p>
                    <p className="font-bold text-slate-800">{data.spotlight.hub}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dispatch Alerts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-blue-600" /> Live Dispatch Alerts
            </h3>
            <div className="space-y-3">
              {data.alerts.map((note:any) => (
                <div key={note.id} className={`p-3 rounded-xl text-xs border-l-4 font-medium ${note.type === 'critical' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                  {note.text}
                </div>
              ))}
            </div>
          </div>

          {/* Driver Comms */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-sm uppercase">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-emerald-600" /> Driver Comms
            </h3>
            <div className="space-y-4">
              {data.driverMessages.map((msg:any) => (
                <div key={msg.id} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">{msg.id_tag}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-xs font-bold">{msg.driverName}</p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{msg.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-1 leading-relaxed">"{msg.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}