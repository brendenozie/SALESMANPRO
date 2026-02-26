'use client';

import React from 'react';
import { 
  IdentificationIcon, 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  StarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon as CheckBadgeSolid } from '@heroicons/react/24/solid';

export default function ProfileClient({ initialData }: any) {
  const driver = initialData || {
    name: "Marcus Thorne",
    id: "DRV-992",
    rating: 4.9,
    yearsExp: 12,
    licenseExp: "2027-11-12",
    medicalExp: "2026-08-15",
    totalTrips: 1240,
    photo: "https://i.pravatar.cc/150?u=marcus"
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white p-6 pb-24">
      
      {/* TOP PROFILE HEADER */}
      <section className="relative mb-12 flex flex-col items-center">
        <div className="absolute right-0 top-0">
            <button className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <Cog6ToothIcon className="h-6 w-6 text-slate-400" />
            </button>
        </div>
        
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-[2.5rem] border-4 border-blue-600 p-1">
            <img src={driver.photo} className="w-full h-full rounded-[2.2rem] object-cover" alt="Profile" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-2xl p-2 border-4 border-[#0A0C10]">
            <CheckBadgeSolid className="h-6 w-6 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black italic uppercase tracking-tighter">{driver.name}</h1>
        <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">ID: {driver.id}</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <div className="flex items-center gap-1">
                <StarIcon className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-white">{driver.rating} Safety Score</span>
            </div>
        </div>
      </section>

      {/* LIFETIME STATS */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <StatItem label="Years" value={driver.yearsExp} />
        <StatItem label="Trips" value={driver.totalTrips} />
        <StatItem label="Miles" value="42k" />
      </div>

      {/* COMPLIANCE & CERTIFICATIONS */}
      <section className="space-y-4 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 px-2">Compliance & Permits</h3>
        
        <ComplianceCard 
            icon={IdentificationIcon} 
            label="CDL License (Class B)" 
            expiry={driver.licenseExp} 
            status="Active" 
        />
        <ComplianceCard 
            icon={ShieldCheckIcon} 
            label="Medical Clearance" 
            expiry={driver.medicalExp} 
            status="Expiring Soon" 
            urgent
        />
        <ComplianceCard 
            icon={AcademicCapIcon} 
            label="Safety Training" 
            expiry="2026-12-01" 
            status="Current" 
        />
      </section>

      {/* QUICK LINKS */}
      <div className="space-y-3">
        <button className="w-full flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-4">
                <DocumentTextIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                <span className="font-bold text-sm">View Digital Documents</span>
            </div>
            <CalendarIcon className="h-5 w-5 text-slate-600" />
        </button>

        <button className="w-full flex items-center justify-center gap-3 py-6 text-rose-500 font-black italic uppercase text-xs tracking-widest mt-4">
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Sign Out of Terminal
        </button>
      </div>

    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{label}</p>
        <p className="text-xl font-black italic">{value}</p>
    </div>
  );
}

function ComplianceCard({ icon: Icon, label, expiry, status, urgent }: any) {
  return (
    <div className="p-5 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${urgent ? 'bg-rose-500/10' : 'bg-blue-600/10'}`}>
          <Icon className={`h-6 w-6 ${urgent ? 'text-rose-500' : 'text-blue-500'}`} />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none mb-1">{label}</p>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expires: {expiry}</p>
        </div>
      </div>
      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
        urgent ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      }`}>
        {status}
      </span>
    </div>
  );
}