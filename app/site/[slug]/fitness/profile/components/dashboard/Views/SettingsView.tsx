'use client';

import React from 'react';
import { UserIcon, BellIcon, CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function SettingsView() {
  return (
    <div className="pb-10">
      <div className="pt-10 px-8 mb-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-2 font-medium">Manage your account preferences and integrations.</p>
      </div>

      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Settings Navigation */}
        <div className="md:col-span-3 space-y-2">
          <SettingsNavButton icon={<UserIcon className="w-5 h-5"/>} label="Profile" active={true} />
          <SettingsNavButton icon={<BellIcon className="w-5 h-5"/>} label="Notifications" active={false} />
          <SettingsNavButton icon={<CreditCardIcon className="w-5 h-5"/>} label="Billing & Plan" active={false} />
          <SettingsNavButton icon={<ShieldCheckIcon className="w-5 h-5"/>} label="Security" active={false} />
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-9 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h3>
            
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover"/>
              </div>
              <div>
                <button className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">Change Avatar</button>
                <p className="text-xs text-gray-400 mt-2 font-medium">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">First Name</label>
                <input type="text" defaultValue="James" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Last Name</label>
                <input type="text" defaultValue="Doe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input type="email" defaultValue="james@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SettingsNavButton({ icon, label, active }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active ? 'bg-white shadow-sm border border-gray-100 text-emerald-600' : 'text-gray-500 hover:bg-gray-100'}`}>
      {icon}
      {label}
    </button>
  );
}