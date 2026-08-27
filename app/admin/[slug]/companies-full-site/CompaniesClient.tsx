'use client';

import React, { useState, useMemo } from 'react';
import { 
  BuildingOfficeIcon, UserGroupIcon, 
  CreditCardIcon, XMarkIcon, CalendarDaysIcon,
  ClockIcon, MagnifyingGlassIcon, DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

export default function CompaniesClient({ initialCompanies }: { initialCompanies: any[] }) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [selectedCompany, setSelectedCompany] = useState<any>(null); // For Subscriptions
  const [cloningCompany, setCloningCompany] = useState<any>(null);   // For Cloning
  const [isUpdating, setIsUpdating] = useState(false);
  
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // Subscription States
  const [durationMode, setDurationMode] = useState<'fixed' | 'custom'>('fixed');
  const [customDate, setCustomDate] = useState('');

  // Clone States
  const [cloneData, setCloneData] = useState({ newName: '', newSlug: '' });

  // --- Handlers ---

  const handleUpdateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      planId: formData.get('planId'),
      durationMonths: formData.get('duration'),
      customRenewalDate: durationMode === 'custom' ? customDate : null,
      adminUserId: selectedCompany.userId,
    };

    if (durationMode === 'custom' && !customDate) {
      return toast.error("Please select a custom expiration date.");
    }

    setIsUpdating(true);
    const toastId = toast.loading("Updating records...");

    try {
      const res = await fetch(`/api/admin/companies-full-list/${selectedCompany.id}/subscription`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Could not update subscription");
      const result = await res.json();
      
      setCompanies(prev => prev.map(c => 
        c.id === selectedCompany.id ? { ...c, Subscription: [result.data] } : c
      ));

      toast.success("Subscription updated successfully", { id: toastId });
      setSelectedCompany(null);
      setDurationMode('fixed');
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloneCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cloneData.newName || !cloneData.newSlug) {
      return toast.error("Name and Slug are required.");
    }

    setIsUpdating(true);
    const toastId = toast.loading("Cloning ecosystem. This might take a second...");

    try {
      const res = await fetch(`/api/admin/companies/${cloningCompany.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cloneData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Could not clone company");
      
      // Add the newly cloned company to the top of the list
      setCompanies(prev => [result.data, ...prev]);

      toast.success("Ecosystem cloned successfully!", { id: toastId });
      setCloningCompany(null);
      setCloneData({ newName: '', newSlug: '' }); // reset
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-generate slug from name
  const handleCloneNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setCloneData({
      newName,
      newSlug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <Toaster position="top-right" />
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Company Directory</h1>
          <p className="text-slate-500 font-medium">Platform-wide organization management.</p>
        </div>

        <div className="relative w-full md:w-96">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search companies..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <th className="px-8 py-6">Company</th>
              <th className="px-8 py-6">Ecosystem</th>
              <th className="px-8 py-6">Plan Status</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCompanies.map((company) => (
              <tr key={company.id} className="group hover:bg-white transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-100 shadow-sm">
                      {company.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{company.name}</p>
                      <p className="text-xs text-slate-400"> {company.domain || `${company.slug}.salesmanpro.site`} </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <UserGroupIcon className="w-4 h-4 text-indigo-400" />
                    {company._count?.User || 0} Users
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm ${
                    company.subscriptionCompanies?.[0]?.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {company.subscriptionCompanies?.[0]?.status || 'In-Active'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setCloningCompany(company)}
                      className="p-2 text-slate-400 bg-white border border-slate-200 rounded-xl hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition shadow-sm"
                      title="Clone Ecosystem"
                    >
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedCompany(company)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition shadow-lg inline-flex items-center gap-2"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      Manage Plan
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">
                  No companies found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Subscription Modal --- */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCompany(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Manage Access</h2>
                  <p className="text-sm font-bold text-indigo-500 uppercase tracking-wide">{selectedCompany.name}</p>
                </div>
                <button onClick={() => setSelectedCompany(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition">
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateSubscription} className="space-y-6">
                {/* Plan Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Service Tier</label>
                  <select name="planId" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer">
                    <option value="starter">Starter</option>
                    <option value="pro">Pro Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Duration</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '12'].map((val) => (
                      <label key={val} className="relative cursor-pointer">
                        <input 
                          type="radio" name="duration" value={val} 
                          disabled={durationMode === 'custom'}
                          className="peer sr-only" defaultChecked={val === '1'} 
                        />
                        <div className="p-3 rounded-2xl bg-slate-50 border-2 border-transparent peer-checked:border-indigo-500 peer-checked:bg-white peer-disabled:opacity-40 transition-all text-center">
                          <p className="text-xs font-black text-slate-700">{val === '1' ? '1 Mo' : '1 Yr'}</p>
                        </div>
                      </label>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setDurationMode(durationMode === 'custom' ? 'fixed' : 'custom')}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-1 ${
                        durationMode === 'custom' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-dashed border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-xs font-black">Custom</span>
                    </button>
                  </div>
                </div>

                {/* Custom Date Input */}
                {durationMode === 'custom' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Expiry Date</label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl font-bold text-indigo-900 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Activate Subscription"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Clone Modal --- */}
      {cloningCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setCloningCompany(null)} />
          
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">Clone Ecosystem</h2>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Duplicating <span className="font-bold text-slate-800">{cloningCompany.name}</span>
                  </p>
                </div>
                <button onClick={() => setCloningCompany(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition">
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCloneCompany} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={cloneData.newName}
                    onChange={handleCloneNameChange}
                    placeholder="e.g. Acme Corp EMEA"
                    className="w-full py-4 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">URL Slug</label>
                  <div className="flex items-center relative">
                    <span className="absolute left-5 text-slate-400 font-medium select-none">/</span>
                    <input 
                      type="text" 
                      required
                      value={cloneData.newSlug}
                      onChange={(e) => setCloneData({ ...cloneData, newSlug: e.target.value })}
                      placeholder="acme-corp-emea"
                      className="w-full py-4 pl-8 pr-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300 placeholder:font-medium"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-slate-400">
                    This will be used for the company's internal URL and default domain.
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    {isUpdating ? "Cloning Ecosystem..." : "Duplicate Company"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}