"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  PencilSquareIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  NoSymbolIcon,
  InboxIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm } from "@/types/typings";
import  ServiceListingForm  from "./components/ServiceListingForm"; // Legacy import replaced
import { set } from "lodash";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Types & Interfaces ---

interface Props {
  initialServices: MarketListingForm[];
  productCategories: { id: string; name: string }[];
  paymentOptions: string[];
  deliveryMethods: string[];
  sellers?: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  companyId?: string;
  categoriesData: any[];
}

// --- Helper Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles = useMemo(() => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default: return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  }, [status]);

  const Icon = useMemo(() => {
    switch (status) {
      case "ACTIVE": return CheckCircleIcon;
      case "PENDING": return ClockIcon;
      case "REJECTED": return XCircleIcon;
      default: return NoSymbolIcon;
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
};

// --- Main Component ---

export default function AdminServicesClient({
  initialServices,
  categoriesData,
  companyId = "",
  // Pass these through to the modal
  paymentOptions,
  deliveryMethods,
  productCategories
}: Props) {
  
  // State
  const [services, setServices] = useState<MarketListingForm[]>(initialServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MarketListingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof MarketListingForm; direction: 'asc' | 'desc' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<MarketListingForm & { [key: string]: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    if (companyId && initialServices.length === 0 && page === 1) {
      fetchServices(page);
    }else if(companyId && page > 1){
      fetchServices(page);
    }
  }, [page, companyId]);


  // Context & Theme
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#4F46E5'; // Default Indigo



  // --- Filtering & Sorting ---

  const processedServices = useMemo(() => {
    let result = [...services];

    // Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.name?.toLowerCase().includes(lowerTerm) || 
        s.status?.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        // @ts-ignore - dynamic key access
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [services, searchTerm, sortConfig]);

  const handleSort = (key: keyof MarketListingForm) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Actions ---

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
    setIsSuccess(null);
    setMessage("");
  };

  const handleOpenEdit = (service: MarketListingForm) => {
    setEditingService(service);
    setIsFormModalOpen(true);
    setIsSuccess(null);
    setMessage("");
  };

  const fetchServices = async (page: number) => {
    try {
      const res = await fetch(
        `/api/admin/my-market-place?companyId=${encodeURIComponent(companyId)}&page=${page}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const json = await res.json();
        const rawList =
          Array.isArray(json)
            ? json
            : Array.isArray((json as any).data.results)
            ? (json as any).data.results
            : Array.isArray((json as any).data.listing)
            ? (json as any).data.listing
            : [];
        const updatedServices = rawList.map((item: any) => ({
          ...item,
          startDealDate: item.startDealDate ? new Date(item.startDealDate) : undefined, 
          endDealDate: item.endDealDate ? new Date(item.endDealDate) : undefined,
          availabilityStart: item.availabilityStart ? new Date(item.availabilityStart) : undefined,
          availabilityEnd: item.availabilityEnd ? new Date(item.availabilityEnd) : undefined,
          createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        }));
        setServices(updatedServices);
      } else {
        console.error(`Failed to fetch services: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleSubmit = async (data: MarketListingForm) => {
    setIsSubmitting(true);
    
    setIsLoading(true);
    setIsSuccess(null);
    setMessage("");

    try {

      
        // const payload = buildListingPayload({...data,companyId});
        
        // Mock API call simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful response data structure
        const responseData = { ...data, id: data.id || `svc-${Date.now()}` }; 
        const savedService: MarketListingForm = responseData; 

        if (data.id) {
          setServices(prevServices =>
            prevServices.map(svc => (svc.id === savedService.id ? savedService : svc))
          );
          setMessage(`Service "${savedService.name}" updated successfully!`);
        } else {
          setServices(prevServices => [...prevServices, savedService]);
          setMessage(`New service "${savedService.name}" created successfully!`);
        }
        setIsSuccess(true);
        setIsFormModalOpen(false);

    } catch (error: any) {
        setIsSuccess(false);
        setMessage(`Error: ${error.message || "Something went wrong. Please try again."}`);
    } finally {
        setIsLoading(false);
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-10 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* 1. Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Service Management
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Manage your service listings, pricing, and availability.
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenCreate}
            className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl shadow-md transition-all overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <PlusIcon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create New Service</span>
          </motion.button>
        </div>
      </div>

      {/* 2. Controls Toolbar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-2 flex flex-col md:flex-row gap-2">
            
            {/* Search */}
            <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" aria-hidden="true" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2.5 border-transparent bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                    placeholder="Search services, categories, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Separator (Desktop) */}
            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 my-2" />

            {/* Filter Button (Mock) */}
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <FunnelIcon className="w-4 h-4" />
                <span>Filter</span>
            </button>
        </div>
      </div>

      {/* 3. Data Table */}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="overflow-x-auto">
                <table className="min-w-full whitespace-nowrap text-left">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            {/* Header Cell Helper */}
                            {[
                                { label: 'Service Name', key: 'name', width: 'w-1/3' },
                                { label: 'Category', key: 'productCategoryId', width: 'w-1/6' },
                                { label: 'Price', key: 'sellingPrice', width: 'w-1/6' },
                                { label: 'Status', key: 'status', width: 'w-1/6' },
                                { label: 'Actions', key: 'actions', width: 'w-1/12' }
                            ].map((header) => (
                                <th 
                                    key={header.key} 
                                    className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${header.width} ${header.key !== 'actions' ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''}`}
                                    onClick={() => header.key !== 'actions' && handleSort(header.key as keyof MarketListingForm)}
                                >
                                    <div className="flex items-center gap-2">
                                        {header.label}
                                        {header.key !== 'actions' && (
                                            <ArrowsUpDownIcon className={`w-3 h-3 transition-opacity ${sortConfig?.key === header.key ? 'opacity-100 text-indigo-500' : 'opacity-30'}`} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        <AnimatePresence mode="popLayout">
                            {processedServices.length > 0 ? (
                                processedServices.map((service, index) => (
                                    <motion.tr
                                        key={service.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        {/* Name & Image */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                    {service.images && service.images[0] ? (
                                                        <Image 
                                                            src={service.images[0].url || service.images[0]} 
                                                            alt={service.name} 
                                                            loader={loader}
                                                            fill 
                                                            className="object-cover" 
                                                        />
                                                    ) : (
                                                        <PhotoIcon className="w-6 h-6 m-auto text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {service.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                        {service.description || "No description provided"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                {categoriesData.find(c => c.id === service.productCategoryId)?.name || 'General'}
                                            </span>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                                                {/* {service.currency || 'USD'} */}
                                                 {service.sellingPrice?.toFixed(2)}
                                            </div>
                                            {service.hourlyRate && (
                                                <div className="text-xs text-gray-400">
                                                    {/* {service.currency}  */}
                                                    {service.hourlyRate}/hr
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={service.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button 
                                                    onClick={() => handleOpenEdit(service)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr className="h-64">
                                    <td colSpan={5} className="text-center">
                                        <div className="flex flex-col items-center justify-center p-8">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <InboxIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No services found</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Try adjusting your search or create a new service.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Footer (Static for Demo) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    Showing <span className="font-medium text-gray-900 dark:text-white">
                      {page}
                      {/* </span> to <span className="font-medium text-gray-900 dark:text-white">{processedServices.length}</span> of <span className="font-medium text-gray-900 dark:text-white">{processedServices.length} */}
                      </span> results
                </span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50" 
                        onClick={
                            () => setPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={page === 1}>
                        Previous
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 disabled:opacity-50" 
                        onClick={
                            () => setPage(prev => prev + 1)
                        }
                        // disabled={page === Math.ceil(processedServices.length / 10)}
                        >
                        Next
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 4. Multi-Step Wizard Modal Integration */}
      {/* <ServiceListingForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingService}
        tabs={formTabs} // Pass the tabs configuration
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        activeTabId={formTabs[activeTabIndex].id}
        handleSubmit={handleSubmit}
        errors={{}} // Pass form errors here
        isSubmitting={isSubmitting}
        primaryColor={primaryColor}
      > */}
      <ServiceListingForm
              isOpen={isModalOpen} // Note: This prop might be redundant if the parent controls the display
              onClose={() => setIsModalOpen(false)}
              onSave={handleSubmit}
              initialData={editingService}
              productCategories={categoriesData}
              paymentOptions={paymentOptions}
              deliveryMethods={deliveryMethods}
              // errors={formErrors} // Pass form errors here
              // setErrors={setFormErrors}
              // isSubmitting={isSubmitting}
              // primaryColor={primaryColor}
            />

    </div>
  );
}