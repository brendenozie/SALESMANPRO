"use client";

import React, { useState, useEffect } from "react";
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
  EnvelopeIcon,
  SunIcon,
  MoonIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";

export interface Driver {
  id: string;
  name: string;
  email?: string;
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
  schoolId: string;
}

export default function DriversPageClient({ initialDrivers, schoolId }: DriversPageClientProps) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Edit State
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    loginCode: "",
    licenseNumber: "",
    licenseClass: "Class A",
    licenseExpiry: "",
    experienceYears: "0",
  });

  const isExpired = (date: string) => new Date(date) < new Date();

  // Sync / set light and dark theme classes
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleCreateOpen = () => {
    setEditingDriverId(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      loginCode: "",
      licenseNumber: "",
      licenseClass: "Class A",
      licenseExpiry: "",
      experienceYears: "0",
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const handleEditOpen = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setFormData({
      name: driver.name,
      email: driver.email || "",
      phoneNumber: driver.phoneNumber,
      loginCode: driver.loginCode,
      licenseNumber: driver.licenseNumber,
      licenseClass: driver.licenseClass,
      licenseExpiry: driver.licenseExpiry,
      experienceYears: String(driver.experienceYears),
    });
    setFile(null); // Optional: reset file if they only want to edit textual metadata
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    const isEditing = !!editingDriverId;
    const endpoint = isEditing 
      ? `/api/admin/transport/drivers/${editingDriverId}`
      : `/api/admin/transport/drivers`;
    const method = isEditing ? "PUT" : "POST";

    try {
      // Simulate/mock S3 upload behavior
      const mockLicenseUrl = file ? "https://storage.provider.com/licenses/drv_123.pdf" : undefined;
  
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          companyId: schoolId,
          licenseUrl: mockLicenseUrl
        }),
      });
  
      const result = await res.json();
      if (result.success) {
        if (isEditing) {
          setDrivers(prev => prev.map(d => d.id === editingDriverId ? result.data : d));
          toast.success("Driver credentials updated.");
        } else {
          setDrivers(prev => [result.data, ...prev]);
          toast.success("Driver successfully onboarded.");
        }
        setIsModalOpen(false);
        setEditingDriverId(null);
      } else {
        toast.error(result.error || "Failed to process driver action.");
      }
    } catch (error) {
      toast.error("Critical error during pilot registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this pilot from the registry?")) return;

    try {
      const res = await fetch(`/api/admin/transport/drivers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDrivers(prev => prev.filter(d => d.id !== id));
        toast.success("Driver successfully archived.");
      } else {
        toast.error("Failed to archive driver.");
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-8 font-sans transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Visual Accent Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 dark:bg-yellow-500/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 dark:bg-blue-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-yellow-500 rounded-full" />
              <span className="text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Personnel Registry</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-400 dark:to-orange-400">Pilots.</span>
            </h1>
          </div>

          <div className="flex gap-3 items-center w-full lg:w-auto justify-end">
            {/* Theme Toggle */}
            {/* <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl transition-all shadow-sm active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-600" />
              )}
            </button> */}

            <button 
              onClick={handleCreateOpen} 
              className="flex items-center gap-2 px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 dark:bg-yellow-500 dark:hover:bg-yellow-400 text-black rounded-2xl font-black text-xs transition-all shadow-xl shadow-yellow-500/10 active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" />
              Register Pilot
            </button>
          </div>
        </header>

        {/* Driver Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div 
              key={driver.id} 
              className="group bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 hover:shadow-lg dark:hover:shadow-none transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-400 transition-colors">
                      <UserCircleIcon className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-200 transition-colors">{driver.name}</h3>
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">{driver.id.slice(-8)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    driver.status === 'ON_ROUTE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                    driver.status === 'AVAILABLE' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}>
                    {driver.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Info Stack */}
                <div className="space-y-3 mb-6">
                  {/* Login Code & email */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Security Pin</span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <IdentificationIcon className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                      <span className="font-mono text-slate-700 dark:text-slate-300">{driver.loginCode}</span>
                    </div>
                  </div>

                  {driver.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                      <EnvelopeIcon className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                      {driver.email}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                    <PhoneIcon className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                    {driver.phoneNumber}
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Safety Rating</p>
                    <div className="flex items-center gap-1.5 text-sm font-black text-yellow-600 dark:text-yellow-500">
                      <StarIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {driver.rating || '5.0'}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Experience</p>
                    <div className="flex items-center gap-1.5 text-sm font-black text-blue-600 dark:text-blue-400">
                      <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
                      {driver.experienceYears} Years
                    </div>
                  </div>
                </div>

                {/* Certification Info */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 pb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <DocumentCheckIcon className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                      Class: {driver.licenseClass}
                    </span>
                    <span className={`font-mono text-[10px] ${isExpired(driver.licenseExpiry) ? 'text-rose-500 animate-pulse font-black' : 'text-slate-400'}`}>
                      {isExpired(driver.licenseExpiry) ? 'EXPIRED' : `Exp: ${driver.licenseExpiry}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button 
                  onClick={() => handleEditOpen(driver)}
                  className="flex-grow py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <PencilIcon className="h-3.5 w-3.5" /> Configure
                </button>
                <button 
                  onClick={() => handleDelete(driver.id)}
                  className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-500/10 text-slate-400 dark:text-slate-500 dark:hover:text-rose-400 rounded-xl transition-all"
                  title="Archive Driver Profile"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Driver Quick Invite */}
          <div 
            onClick={handleCreateOpen} 
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:border-yellow-500/50 dark:hover:border-yellow-500/30 transition-all cursor-pointer bg-white/30 dark:bg-transparent"
          >
            <div className="h-14 w-14 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ClockIcon className="h-8 w-8 text-slate-400 dark:text-slate-600" />
            </div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300">Add Pilot Profile</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Register New Crew Member</p>
          </div>
        </div>
      </div>
      
      {/* Modal View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">
                  {editingDriverId ? "Pilot Calibration" : "Pilot Onboarding"}
                </h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Credentials & Identity Verification</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="Robert Fox" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="robert@school.edu" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Contact Number</label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="+1 555-000" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Security / Pin Code</label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input required value={formData.loginCode} onChange={e => setFormData({...formData, loginCode: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="4-Digit PIN" maxLength={8} />
                </div>
              </div>

              {/* License Details */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">License No.</label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none uppercase transition-all" placeholder="DL-88291" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">License Class</label>
                <div className="relative">
                  <AcademicCapIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <select value={formData.licenseClass} onChange={e => setFormData({...formData, licenseClass: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none appearance-none cursor-pointer">
                    <option value="Class A">Class A (Heavy Duty)</option>
                    <option value="Class B">Class B (Standard Bus)</option>
                    <option value="Class C">Class C (Van/Light transport)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">License Expiry Date</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input type="date" required value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all dark:color-scheme-dark" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1">Years of Driving Experience</label>
                <div className="relative">
                  <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input type="number" min="0" required value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all" placeholder="5" />
                </div>
              </div>

              {/* File Upload Area */}
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-1 mb-2 block">Upload Digital License (PDF/JPG)</label>
                <div 
                  className={`border-2 border-dashed rounded-3xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/40 hover:border-yellow-500/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
                  }}
                >
                  <input type="file" id="license-upload" className="hidden" onChange={(e) => e.target.files && setFile(e.target.files[0])} />
                  <label htmlFor="license-upload" className="cursor-pointer flex flex-col items-center">
                    <CloudArrowUpIcon className={`h-10 w-10 mb-2 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{file ? file.name : "Drop file here or click to browse"}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase">Max Size: 5MB</p>
                  </label>
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                className="col-span-2 py-5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-yellow-500/10 active:scale-[0.98]"
              >
                {isSubmitting ? "Processing Credentials..." : editingDriverId ? "Apply Configuration Adjustments" : "Complete Pilot Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}