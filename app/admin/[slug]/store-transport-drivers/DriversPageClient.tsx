"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  UserCircleIcon, IdentificationIcon, StarIcon, PhoneIcon,
  ShieldCheckIcon, DocumentCheckIcon, EllipsisVerticalIcon,
  ClockIcon, PlusIcon,
  CalendarIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  XMarkIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

export interface Driver {
  id: string;
  name: string;
  loginCode: string;
  licenseNumber: string;
  licenseClass: string;
  rating: number;
  status: 'ON_ROUTE' | 'AVAILABLE' | 'OFF_DUTY';
  experienceYears: number;
  licenseExpiry: string;
  phoneNumber: string;
}

interface DriversPageClientProps {
  initialDrivers: Driver[];
  schoolId: string; // companyId
}

export default function DriversPageClient({ initialDrivers, schoolId }: DriversPageClientProps) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "", 
    phoneNumber: "",
    loginCode: "",
    licenseNumber: "",
    licenseClass: "Heavy Rigid (Class C)",
    licenseExpiry: "",
    experienceYears: "0",
  });

  const isExpired = (date: string) => new Date(date) < new Date();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const mockLicenseUrl = "https://storage.provider.com/licenses/drv_logistics.pdf";
  
      const res = await fetch(`/api/admin/transport/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: schoolId,
          licenseUrl: mockLicenseUrl 
        }),
      });
  
      const result = await res.json();
      if (result.success) {
        setDrivers(prev => [result.data, ...prev]);
        toast.success("Logistics driver successfully onboarded.");
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phoneNumber: "", loginCode: "", licenseNumber: "", licenseClass: "Heavy Rigid (Class C)", licenseExpiry: "", experienceYears: "0" });
        setFile(null);
      }
    } catch (error) {
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      {/* Decorative Glow - Adjusted for light mode */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-yellow-500/10 dark:bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-yellow-500 rounded-full" />
              <span className="text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Personnel & Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Delivery <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Personnel.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold text-xs transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
          >
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            Onboard New Driver
          </button>
        </header>

        {/* Driver Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 hover:shadow-xl dark:hover:bg-slate-900/60 transition-all relative overflow-hidden">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-yellow-500 transition-colors">
                    <UserCircleIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-200 transition-colors">{driver.name}</h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{driver.id.slice(-8)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                  driver.status === 'ON_ROUTE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                  driver.status === 'AVAILABLE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                  'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}>
                  {driver.status.replace('_', ' ')}
                </div>
              </div>

              {/* Login/ID Section */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-black/20 rounded-2xl px-4 py-3 mb-6 border border-slate-100 dark:border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Handheld ID</p>
                <div className="flex items-center gap-1.5">
                    <IdentificationIcon className="h-4 w-4 text-yellow-600" />
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{driver.loginCode}</span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Efficiency</p>
                  <div className="flex items-center gap-1.5 text-sm font-black text-yellow-600 dark:text-yellow-500">
                    <StarIcon className="h-4 w-4 fill-current" />
                    {driver.rating || '5.0'}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Experience</p>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-700 dark:text-slate-200">
                    <TruckIcon className="h-4 w-4 text-blue-500" />
                    {driver.experienceYears}yr Heavy
                  </div>
                </div>
              </div>

              {/* Contact & License */}
              <div className="space-y-3 mb-8 px-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DocumentCheckIcon className="h-4 w-4 text-slate-400" />
                    {driver.licenseClass}
                  </span>
                  <span className={`font-mono text-[10px] ${isExpired(driver.licenseExpiry) ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                    Exp: {driver.licenseExpiry}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <PhoneIcon className="h-4 w-4 text-slate-400" />
                  {driver.phoneNumber}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-grow py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
                  Performance Logs
                </button>
                <button className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-500 rounded-xl transition-all">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Manage Roster Card */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:border-yellow-500/30 transition-all cursor-pointer bg-white/50 dark:bg-transparent">
              <div className="h-14 w-14 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClockIcon className="h-8 w-8 text-slate-400 dark:text-slate-700" />
              </div>
              <h4 className="font-bold text-slate-500 dark:text-slate-400">Duty Roster</h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Active Shift Management</p>
          </div>
        </div>
      </div>
      
      {/* --- ADD DRIVER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Onboarding</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Supermarket Logistics Credentials</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="Enter full name" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Mobile Number</label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="+1 000 000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Heavy Vehicle License</label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none uppercase" placeholder="LIC-XXXXX" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">License Expiry</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="date" required value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none dark:color-scheme-dark" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-2 block">Upload Commercial License (Verification Required)</label>
                <div 
                  className={`border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${file ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/40 hover:border-yellow-500/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                  }}
                >
                  <input type="file" id="license-upload" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                  <label htmlFor="license-upload" className="cursor-pointer flex flex-col items-center">
                    <CloudArrowUpIcon className={`h-10 w-10 mb-2 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{file ? file.name : "Drop digital copy here or click to browse"}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">PDF, PNG, OR JPG (MAX 5MB)</p>
                  </label>
                </div>
              </div>

              <button 
                disabled={isSubmitting || !file}
                className="col-span-2 py-5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg"
              >
                {isSubmitting ? "Verifying Credentials..." : "Finalize Driver Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}