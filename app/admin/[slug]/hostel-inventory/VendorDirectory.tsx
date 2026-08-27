"use client";

import React, { useState } from "react";
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ArrowTopRightOnSquareIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

const VendorDirectory = ({ vendors }: { vendors: any[] }) => {
  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
          <UserGroupIcon className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-black text-white italic">Supply <span className="text-blue-500">Network.</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors">
                <BuildingOfficeIcon className="h-6 w-6" />
              </div>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded-full">
                {vendor._count.items} Items Supplied
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{vendor.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">{vendor.category} Specialist</p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-slate-400">
                <PhoneIcon className="h-4 w-4" />
                <span className="text-xs font-mono">{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <EnvelopeIcon className="h-4 w-4" />
                <span className="text-xs">{vendor.email}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href={`mailto:${vendor.email}`}
                className="flex-grow py-3 bg-slate-800 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase text-center transition-all"
              >
                Send RFQ
              </a>
              <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};