"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  TruckIcon, 
  BuildingOffice2Icon, 
  PhoneIcon, 
  GlobeAltIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowUpRightIcon,
  PlusIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

interface Supplier {
  id: string;
  name: string;
  categoryId: string;
  leadTime: string;
  status: string;
  reliability: number;
  contact: string;
  phone?: string;
}

interface Category {
  id: string;
  name: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const normalizeSupplier = (s: any): Supplier => ({
  id: s.id,
  name: s.name,
  categoryId: s.categoryId,
  contact: s.contactEmail || s.contact,
  phone: s.phone || "",
  leadTime: s.leadTime || "7 Days",
  status: s.status || "Active",
  reliability: s.reliability ?? 100,
});

interface Props {
  initialSuppliers: Supplier[];
  initialCategories: Category[];
  schoolId: string;
}

const LibrarySuppliersClient: React.FC<Props> = ({ initialSuppliers, initialCategories, schoolId }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers.map(normalizeSupplier));
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // Search & Filtering State
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  // Onboarding dropdown inside Modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', categoryId: '', contact: '', phone: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingInline, setIsCreatingInline] = useState(false);

  // Theme Syncing State
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize System / LocalStorage Theme Preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Onboard Supplier Action
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.categoryId) {
      toast.error("Please assign a supplier category.");
      return;
    }
    setIsUploading(true);
    
    try {
      const res = await fetch(`${apiBaseUrl}/admin/library/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newVendor,
          categoryId: newVendor.categoryId,
          contactEmail: newVendor.contact,
          phone: newVendor.phone,
          companyId: schoolId
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setSuppliers(prev => [normalizeSupplier(data.supplier), ...prev]);
        toast.success(`${data.supplier.name} onboarded with portal access`);
        setIsModalOpen(false);
        setNewVendor({ name: '', categoryId: '', contact: '', phone: '' });
      } else {
        toast.error("Invalid onboarding attributes.");
      }
    } catch (error) {
      toast.error("Onboarding failed. Please check network and vendor details.");
    } finally {
      setIsUploading(false);
    }
  };

  // Inline Category Creator
  const handleCreateCategoryInline = async () => {
    if (!searchTerm.trim()) return;
    setIsCreatingInline(true);

    try {
      const res = await fetch(`${apiBaseUrl}/admin/library/suppliers-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: searchTerm, companyId: schoolId })
      });

      if (res.ok) {
        const { data } = await res.json();
        setCategories(prev => [...prev, data]); 
        setNewVendor(prev => ({ ...prev, categoryId: data.id })); 
        setIsDropdownOpen(false);
        setSearchTerm("");
        toast.success(`Category "${data.name}" created`);
      }
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setIsCreatingInline(false);
    }
  };

  // Searchable inline categories filter inside modal
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close custom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm("");
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Main Dashboard filtering algorithm
  const visibleSuppliers = suppliers.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          vendor.contact.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "ALL" || vendor.categoryId === selectedCategoryFilter;
    const matchesStatus = selectedStatusFilter === "ALL" || vendor.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-800 dark:text-slate-200 p-6 md:p-8 font-sans transition-colors duration-300 relative overflow-hidden">
        <Toaster position="top-right" />
        
        {/* Decorative Ambient Blue/Teal Glow */}
        <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px] rounded-full -z-10 pointer-events-none transition-colors duration-300" />

        <div className="max-w-7xl mx-auto">
          {/* Header Area */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-8 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Procurement & Logistics</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Supply <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">Chain.</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Responsive Theme Toggler */}
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 rounded-2xl transition-all shadow-sm"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <>
                    <SunIcon className="h-5 w-5 text-orange-400" />
                    <span className="hidden md:inline text-xs font-semibold text-slate-300">Light Mode</span>
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 text-slate-600" />
                    <span className="hidden md:inline text-xs font-semibold text-slate-700">Dark Mode</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-white dark:hover:bg-cyan-50 text-white dark:text-black rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-cyan-900/10 dark:shadow-none"
              >
                <PlusIcon className="h-5 w-5 stroke-[2.5px]" />
                Onboard Supplier
              </button>
            </div>
          </header>

          {/* Interactive Filter Bar */}
          <section className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm dark:shadow-none">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-600" />
              </span>
              <input
                type="text"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-cyan-500/50 transition-all font-medium"
                placeholder="Search suppliers by name or email..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <FunnelIcon className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer focus:border-cyan-500/50"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer focus:border-cyan-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </section>

          {/* Suppliers Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleSuppliers.map((vendor) => (
              <div 
                key={vendor.id} 
                className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:bg-slate-100/50 dark:hover:bg-slate-900/60 transition-all duration-300 border-l-4 border-l-cyan-500/70 hover:border-l-cyan-500 dark:hover:border-l-cyan-400 shadow-sm dark:shadow-none"
              >
                {/* Upper Section */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                      <BuildingOffice2Icon className="h-8 w-8 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {vendor.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        <TagIcon className="h-3.5 w-3.5 text-slate-400" />
                        {categories.find(cat => cat.id === vendor.categoryId)?.name || "Uncategorized"}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                    vendor.status.toLowerCase() === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {vendor.status}
                  </span>
                </div>

                {/* Logistics Performance Analytics Block */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1 tracking-wider">Lead Time</p>
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      <TruckIcon className="h-3.5 w-3.5 text-cyan-500" />
                      {vendor.leadTime}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1 tracking-wider">Reliability</p>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShoppingBagIcon className="h-3.5 w-3.5" />
                      {vendor.reliability}%
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase mb-1 tracking-wider">Reach</p>
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      <GlobeAltIcon className="h-3.5 w-3.5 text-blue-500" />
                      Global
                    </div>
                  </div>
                </div>

                {/* Footer Communication Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800/50 gap-4">
                  <div className="flex flex-col gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                      <span>{vendor.contact}</span>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      toast.loading("Initiating purchase payload standard integration...", { duration: 1500 });
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black rounded-xl text-cyan-600 dark:text-cyan-400 transition-all self-end sm:self-auto shadow-sm"
                  >
                    Place Order
                    <ArrowUpRightIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}

            {/* Expand Network CTA Button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:border-cyan-500/40 dark:hover:border-cyan-500/30 hover:bg-white dark:hover:bg-slate-900/10 transition-all duration-300 min-h-[220px]"
            >
               <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                  <GlobeAltIcon className="h-8 w-8 text-slate-400 dark:text-slate-700" />
               </div>
               <h4 className="font-bold text-slate-700 dark:text-slate-400">Expand Network</h4>
               <p className="text-xs text-slate-500 dark:text-slate-600 mt-1 max-w-[220px]">
                 Add a new distributor to your library procurement database.
               </p>
            </button>
          </div>

          {/* Empty State Result Block */}
          {visibleSuppliers.length === 0 && (
            <div className="w-full text-center py-24 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl bg-white dark:bg-transparent shadow-sm dark:shadow-none">
              <BuildingOffice2Icon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-400">No matching suppliers found</h3>
              <p className="text-sm text-slate-500 mt-1">Try tweaking your search parameters or categorization filters.</p>
            </div>
          )}
        </div>

        {/* Onboarding Dialog Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-md transition-opacity">
            <div className="bg-white dark:bg-[#0A0C10] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">New Supplier</h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors p-1"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleOnboard} className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Company Name</label>
                  <input 
                    required 
                    value={newVendor.name} 
                    onChange={e => setNewVendor({...newVendor, name: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-600" 
                    placeholder="e.g. Oxford Press" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Contact Phone</label>
                  <input
                    value={newVendor.phone}
                    onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>

                {/* Custom Searchable Select Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                    Category Allocation
                  </label>
                  
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-all shadow-sm"
                  >
                    <span className={newVendor.categoryId ? "text-slate-900 dark:text-white font-medium" : "text-slate-400 dark:text-slate-600"}>
                      {categories.find(cat => cat.id === newVendor.categoryId)?.name || "Assign a category..."}
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
                      <div className="p-2 border-b border-slate-200 dark:border-slate-800">
                        <input 
                          autoFocus
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500/30 placeholder-slate-400 dark:placeholder-slate-600"
                          placeholder="Search / Create Category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => {
                                setNewVendor({ ...newVendor, categoryId: cat.id });
                                setIsDropdownOpen(false);
                                setSearchTerm("");
                              }}
                              className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer flex items-center justify-between group transition-colors"
                            >
                              {cat.name}
                              {newVendor.categoryId === cat.id && (
                                <CheckIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 mb-3">"{searchTerm}" not matched</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateCategoryInline();
                              }}
                              className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-black transition-all"
                            >
                              {isCreatingInline ? "Creating..." : `Create "${searchTerm}"`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Primary Email</label>
                  <input 
                    required 
                    type="email" 
                    value={newVendor.contact} 
                    onChange={e => setNewVendor({...newVendor, contact: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all placeholder-slate-400 dark:placeholder-slate-600" 
                    placeholder="orders@vendor.com" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 dark:bg-white dark:hover:bg-cyan-50 text-white dark:text-black font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md"
                >
                  {isUploading ? "Onboarding..." : "Complete Onboarding"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LibrarySuppliersClient;