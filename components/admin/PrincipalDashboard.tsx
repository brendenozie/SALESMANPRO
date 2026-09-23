'use client';

import React from 'react';
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  UsersIcon, BriefcaseIcon, BookOpenIcon, CalendarDaysIcon, 
  StarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, RocketLaunchIcon, 
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  MegaphoneIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PrincipalDashboard({ data, adminSlug }: { data: any; adminSlug?: string }) {
  const safeData = data || {};
  const currentSlug = adminSlug || safeData.adminSlug || safeData.companyId || "";
  const trendCategories = safeData.trendData?.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trendSeries = safeData.trendData?.series || [
    { name: 'Academic Trend', data: [75, 80, 82, 85, 88, 90] },
    { name: 'Teacher Effectiveness', data: [80, 82, 85, 87, 86, 90] },
  ];
  const principalStats = safeData.principalStats || [
    { title: 'Total Students', value: '0', description: 'Enrolled across all grades', color: 'text-blue-600' },
    { title: 'Total Teachers', value: '0', description: 'Active faculty members', color: 'text-emerald-600' },
    { title: 'Total Classes', value: '0', description: 'Active classrooms', color: 'text-violet-600' },
    { title: 'Upcoming Events', value: '0', description: 'Events this week', color: 'text-amber-600' },
  ];
  const impactReport = safeData.impactReport || [];
  const spotlight = safeData.spotlight || { student: 'None recorded this week', teacher: 'None recorded this week' };
  const announcements = safeData.announcements || [];
  const recentStaffMessages = safeData.recentStaffMessages || [];

  const chartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    colors: ['#3C50E0', '#10B981'],
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } },
    xaxis: { categories: trendCategories },
    yaxis: { max: 100, labels: { formatter: (v: number) => `${v}%` } },
    dataLabels: { enabled: false },
    tooltip: { x: { show: false }, marker: { show: true } }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const statIcons: Record<string, JSX.Element> = {
    'Total Students': <UsersIcon className="h-6 w-6 text-blue-600" />,
    'Total Teachers': <BriefcaseIcon className="h-6 w-6 text-emerald-600" />,
    'Total Classes': <BookOpenIcon className="h-6 w-6 text-violet-600" />,
    'Fee Collection': <BanknotesIcon className="h-6 w-6 text-amber-600" />,
    'Upcoming Events': <CalendarDaysIcon className="h-6 w-6 text-amber-600" />,
    'Pending Approvals': <ClockIcon className="h-6 w-6 text-rose-600" />,
  };
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 lg:text-3xl">Principal's Command Center</h1>
          <p className="text-slate-500">Welcome back. Here is what's happening in your school today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
          <CalendarDaysIcon className="h-5 w-5" /> {today}
        </div>
      </div>

      {/* 1. Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {principalStats.map((stat: any, i: number) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-500">{stat.title}</p>
              {statIcons[stat.title] || <BookOpenIcon className="h-6 w-6 text-blue-600" />}
            </div>
            <h3 className={`text-2xl font-black ${stat.color || 'text-slate-900'}`}>{stat.value}</h3>
            <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold">{stat.description}</p>
          </div>
        ))}
      </div>
      

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Main Charts & Impact */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Operational Performance</h2>
              <p className="text-sm text-slate-500">Correlation between teaching quality and academic results.</p>
            </div>
            <ApexCharts options={chartOptions} series={trendSeries} type="area" height={350} />
          </div>

          {/* Impact Drill-down Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-blue-600" /> Academic Volatility
              </h3>
              <div className="space-y-4">
                {impactReport.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No volatility events recorded.</p>
                ) : (
                  impactReport.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold">{item.courseName}</p>
                        <p className="text-[10px] text-slate-400">Impacted by: {item.keyExam}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black ${item.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.change >= 0 ? '+' : ''}{item.change}%
                        </span>
                        <p className="text-[10px] text-slate-400">Avg: {item.currentAvg}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <RocketLaunchIcon className="h-5 w-5 text-blue-400" /> Admin Quick Links
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Financials", href: `/admin/${currentSlug}/fee` },
                  { label: "Staffing", href: `/admin/${currentSlug}/staff-members` },
                  { label: "Exam Board", href: `/admin/${currentSlug}/grading-report-card` },
                  { label: "Reports", href: `/admin/${currentSlug}/school-reports` },
                ].map(item => (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-left transition-all border border-white/5 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <span className="text-white/40 text-[10px]">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Spotlights & Feed */}
        <div className="lg:col-span-4 space-y-6">

          {/* Quick Management Shortcuts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <RocketLaunchIcon className="h-5 w-5 text-indigo-600" /> Command Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href={`/admin/${currentSlug}/fee-invoices`}
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-2xl transition-all group"
              >
                <div className="text-emerald-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  Fee Invoices →
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mass billing & items</div>
              </Link>
              <Link
                href={`/admin/${currentSlug}/fee`}
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 rounded-2xl transition-all group"
              >
                <div className="text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  Fee Ledger →
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Student balances</div>
              </Link>
              <Link
                href={`/admin/${currentSlug}/grading-report-card`}
                className="p-3 bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-slate-100 rounded-2xl transition-all group"
              >
                <div className="text-violet-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  Report Cards →
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Transcripts & grades</div>
              </Link>
              <Link
                href={`/admin/${currentSlug}/attendance`}
                className="p-3 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-100 rounded-2xl transition-all group"
              >
                <div className="text-amber-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                  Attendance →
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Daily roll call</div>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1 rounded-3xl shadow-lg shadow-orange-100">
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-[calc(1.5rem-1px)]">
              <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6">
                <StarIcon className="h-6 w-6 text-orange-500" /> Weekly Hall of Fame
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-xl">🎓</div>
                  <div>
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Student of the Week</p>
                    <p className="font-bold text-slate-800">
                      {spotlight.student && spotlight.student !== "TBD" ? spotlight.student : "Honor Roll Scholar"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-xl">👨‍🏫</div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Teacher of the Week</p>
                    <p className="font-bold text-slate-800">
                      {spotlight.teacher && spotlight.teacher !== "TBD" ? spotlight.teacher : "Senior Faculty"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Announcements */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MegaphoneIcon className="h-5 w-5 text-blue-600" /> Announcements
            </h3>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No active announcements.</p>
              ) : (
                announcements.map((note: any) => (
                  <div key={note.id || Math.random()} className={`p-3 rounded-xl text-sm border-l-4 ${note.type === 'warning' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                    {note.text || note.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-emerald-600" /> Staff Activity
            </h3>
            <div className="space-y-4">
              {recentStaffMessages.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No recent staff activity.</p>
              ) : (
                recentStaffMessages.map((msg: any) => (
                  <div key={msg.id || Math.random()} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                      {msg.name?.[0] || 'S'}
                    </div>
                    <div>
                      <div className="flex justify-between items-center w-full">
                        <p className="text-sm font-bold">{msg.name || 'Staff Member'}</p>
                        <span className="text-[10px] text-slate-400">{msg.time || ''}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{msg.message || ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}