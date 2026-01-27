"use client";

import React, { useState, useEffect, useRef } from "react"; // Added useRef
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
  CheckIcon
} from "@heroicons/react/24/outline";

interface Supplier {
  id: string;
  name: string;
  categoryId: string;
  leadTime: string;
  status: string;
  reliability: number;
  contact: string;
}

interface Category {
  id: string;
  name: string;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const normalizeSupplier = (s: any): Supplier => ({
  id: s.id,
  name: s.name,
  categoryId: s.categoryId,
  contact: s.contactEmail || s.contact,
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', categoryId: '', contact: '', phone: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingInline, setIsCreatingInline] = useState(false);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setIsUploading(false);
      }

    } catch (error) {
      toast.error("Onboarding failed. Please check vendor details.");
      setIsUploading(false);
    }
  };

  // Fetch categories on mount
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     const res = await fetch(`${apiBaseUrl}/admin/library/categories?companyId=${schoolId}`);
  //     if (res.ok) {
  //       const result = await res.json();
  //       setCategories(result.data);
  //     }
  //   };
  //   fetchCategories();
  // }, [schoolId]);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        setCategories(prev => [...prev, data]); // Update local list
        setNewVendor({ ...newVendor, categoryId: data.id }); // Select it
        setIsDropdownOpen(false);
        setSearchTerm("");
        setIsCreatingInline(false);
        toast.success(`Category "${data.name}" created`);
      }
    } catch (error) {
      toast.error("Failed to create category");
      setIsCreatingInline(false);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is NOT inside the dropdown container, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm(""); // Optional: clear search on close
      }
    };

    // Add listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-cyan-500 rounded-full" />
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Procurement & Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Supply <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Chain.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            Onboard Supplier
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suppliers.map((vendor) => (
            <div key={vendor.id} className="group bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:bg-slate-900/60 transition-all border-l-4 border-l-cyan-500/50">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <BuildingOffice2Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{vendor.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <TagIcon className="h-3.5 w-3.5" />
                      {categories.find(cat => cat.id === vendor.categoryId)?.name || "Uncategorized"}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">
                  {vendor.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Lead Time</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <TruckIcon className="h-3.5 w-3.5" />
                    {vendor.leadTime}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Reliability</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <ShoppingBagIcon className="h-3.5 w-3.5" />
                    {vendor.reliability}%
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Reach</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <GlobeAltIcon className="h-3.5 w-3.5" />
                    Global
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <p className="text-sm font-mono text-slate-500">{vendor.contact}</p>
                </div>
                <button 
                  onClick={() => {
                    
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Place Order
                  <ArrowUpRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:border-cyan-500/30 transition-all"
          >
             <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="h-8 w-8 text-slate-700" />
             </div>
             <h4 className="font-bold text-slate-400">Expand Network</h4>
             <p className="text-xs text-slate-600 mt-1 max-w-[200px]">Add a new distributor to your library procurement system.</p>
          </button>
        </div>

        {/* Onboarding Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Supplier</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleOnboard} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Company Name</label>
                  <input required value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all" placeholder="e.g. Oxford Press" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Contact Phone</label>
                  <input
                      value={newVendor.phone}
                      onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
                      placeholder="Phone"
                       className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all"
                    />
                </div>
                {/* Searchable Category Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Category
                  </label>
                  
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-all"
                  >
                    <span className={newVendor.categoryId ? "text-white" : "text-slate-500"}>
                      {categories.find(cat => cat.id === newVendor.categoryId)?.name || "Select a category..."}
                    </span>
                    <ChevronUpDownIcon className="h-5 w-5 text-slate-500" />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[#0D1117] border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 border-b border-slate-800">
                        <input 
                          autoFocus
                          className="w-full bg-black/20 border border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500/30"
                          placeholder="Search categories..."
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
                              className="px-4 py-3 text-sm hover:bg-cyan-500/10 hover:text-cyan-400 cursor-pointer flex items-center justify-between group"
                            >
                              {cat.name}
                              {newVendor.categoryId === cat.id && (
                                <CheckIcon className="h-4 w-4 text-cyan-500" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 mb-3">"{searchTerm}" not found</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateCategoryInline();
                              }}
                              className="w-full py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-cyan-500 hover:text-white transition-all"
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
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Email</label>
                  <input required type="email" value={newVendor.contact} onChange={e => setNewVendor({...newVendor, contact: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all" placeholder="orders@vendor.com" />
                </div>
                <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-50 transition-all">
                  {isUploading ? "Onboarding..." : "Complete Onboarding"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default LibrarySuppliersClient;