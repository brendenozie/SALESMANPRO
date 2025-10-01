"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon, // New icon for the drawer close button
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// --- Type Definitions (Reused from your original code) ---
export interface AppointmentItem {
  id: string;
  service: string;
  date: string;
  timeSlot: string;
  client: { name: string; email: string; phone: string };
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface OrderItem {
  id: string;
  price: number;
  name?: string;
  email?: string;
  phone?: string;
  quantity: number;
  status?: string; 
  date?: string;
  timeSlot?: string;
  marketplaceListing?: { id?: string; title?: string; name?: string };
  order?: { id?: string; status?: string; rider?: string; createdAt?: string; name?: string; title?: string; email?: string; phone?: string; consumer?: { name?: string; email?: string; phone?: string } };
}

type UnifiedItem = AppointmentItem | OrderItem;

interface Props {
  initialAppointments: AppointmentItem[];
  initialOrderItems: OrderItem[];
}

// --- Status Badge Component (More visually polished) ---

// Utility for status color/icon
const getStatusProps = (status: string) => {
  switch (status.toUpperCase()) {
    case "SCHEDULED":
    case "PENDING":
    case "PROCESSING":
      return { 
        colorClass: "bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 text-yellow-700 dark:text-yellow-300", 
        icon: ClockIcon 
      };
    case "COMPLETED":
    case "DELIVERED":
      return { 
        colorClass: "bg-green-50 dark:bg-green-900 border border-green-200 text-green-700 dark:text-green-300", 
        icon: CheckCircleIcon 
      };
    case "CANCELLED":
    case "REJECTED":
    case "FAILED":
      return { 
        colorClass: "bg-red-50 dark:bg-red-900 border border-red-200 text-red-700 dark:text-red-300", 
        icon: XMarkIcon 
      };
    default:
      return { 
        colorClass: "bg-gray-50 dark:bg-gray-700 border border-gray-200 text-gray-700 dark:text-gray-300", 
        icon: InformationCircleIcon 
      };
  }
};

const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const { colorClass, icon: Icon } = getStatusProps(status);
  
  // Use a slight shadow and reduced opacity for a more sophisticated look
  return (
    <motion.span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${colorClass} min-w-[100px] justify-center`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
    >
      <Icon className="w-4 h-4" /> {status}
    </motion.span>
  );
});

StatusBadge.displayName = 'StatusBadge';


export default function AdminAppointmentsClient({ initialAppointments, initialOrderItems }: Props) {
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [rider, setRider] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | "ALL">("ALL");

  const { storeFormData } = useStoreContext();
  // Using theme colors for a captivating, branded look
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; 
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; 

  // --- Data Initialization & Sorting (retained) ---
  useEffect(() => {
    const combined = [...initialAppointments, ...initialOrderItems].sort((a, b) => {
        const dateA = a.date && a.timeSlot ? new Date(`${a.date}T${a.timeSlot.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0);
        const dateB = b.date && b.timeSlot ? new Date(`${b.date}T${b.timeSlot.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime();
    });
    setUnifiedItems(combined);
  }, [initialAppointments, initialOrderItems]);

  // --- Memoized Filtered Data (retained) ---
  const filteredItems = useMemo(() => {
    return unifiedItems.filter(item => {
      const searchMatch = searchTerm.toLowerCase();
      const clientName = 'service' in item ? item.client.name : (item.name || item.order?.consumer?.name || item.order?.name || "");
      const itemName = 'service' in item ? item.service : (item.marketplaceListing?.name || item.name || "");
      
      const isSearchMatch = clientName.toLowerCase().includes(searchMatch) || itemName.toLowerCase().includes(searchMatch) || item.id.includes(searchMatch);

      if (!isSearchMatch) return false;

      if (filterStatus === "ALL") return true;

      const currentStatus = 'service' in item ? item.status : (item.status || item.order?.status || "UNKNOWN");
      return currentStatus.toUpperCase() === filterStatus;
    });
  }, [unifiedItems, searchTerm, filterStatus]);

  // --- Helper Functions (retained) ---
  const formatDateTime = useCallback((dateString: string, timeString: string) => {
    try {
        const dateTime = new Date(`${dateString}T${timeString.replace(' AM', 'AM').replace(' PM', 'PM')}`);
        // Concise and clear date format
        return dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' @ ' + 
               dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
        return `${dateString} @ ${timeString}`;
    }
  }, []);

  const openModal = (item: UnifiedItem) => {
    setSelectedItem(item);
    if ('service' in item) {
      setNewStatus(item.status);
    } else {
      setNewStatus(item.status || item.order?.status || "PENDING");
      setRider(item.order?.rider || "");
    }
    setIsModalOpen(true);
    setMessage("");
    setIsSuccess(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300); 
    setNewStatus("");
    setRider("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setMessage("");
    setIsSuccess(null);

    try {
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        setUnifiedItems(prev => prev.map(item => {
            if (item.id === selectedItem.id) {
                if ('service' in item) {
                    return { ...item, status: newStatus as AppointmentItem["status"] };
                } else {
                    return {
                        ...item,
                        status: newStatus,
                        order: { ...item.order, status: newStatus, rider: rider }
                    };
                }
            }
            return item;
        }));

        const successMessage = 'service' in selectedItem
            ? `Appointment "${'service' in selectedItem ? selectedItem.service : ''}" status updated to "${newStatus}"!`
            : `Order for "${'price' in selectedItem ? (selectedItem.marketplaceListing?.name || selectedItem.name) : ''}" updated to "${newStatus}"!`;
            
        setMessage(successMessage);
        setIsSuccess(true);
        // Note: Do not close the modal here. Let the user see the confirmation, then manually close or add a timer.
        // For this demo, we'll keep the previous close on success:
        closeModal(); 
    } catch (error: any) {
        console.error("Failed to update status:", error);
        setIsSuccess(false);
        setMessage(`Error: ${error.message || "Failed to update status. Please try again."}`);
    } finally {
        setIsLoading(false);
    }
  };

  // Modal variants for a sophisticated slide-out drawer
  const detailPanelVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30, ease: "easeOut" } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Status Filter Options (Unified)
  const statusOptions = [
    "ALL",
    "SCHEDULED", "COMPLETED", "CANCELLED", 
    "PENDING", "PROCESSING", "DELIVERED", "REJECTED", 
  ];
  
  // Custom scrollbar class for a cleaner look
  const customScrollbarClass = "scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent" style={{ backgroundColor: `${primaryColor}` }}>
              Schedule & Delivery Dashboard
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Effortlessly manage all client appointments and marketplace orders in a single view.</p>
        </header>

        {/* Global Message/Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl shadow-lg text-center font-medium ${
                isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls: Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 pt-2 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-grow relative shadow-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, item, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 transition-shadow"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
          </div>
          
          <div className="relative inline-block text-left min-w-[150px] shadow-sm">
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
                onChange={(e) => setFilterStatus(e.target.value)}
                value={filterStatus}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-950 cursor-pointer transition-shadow"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            >
                <option value="ALL">All Statuses ({unifiedItems.length})</option>
                {statusOptions.filter(s => s !== "ALL").map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          
          {/* Empty State / Loading State (retained but simplified) */}
          {filteredItems.length === 0 && !isLoading ? (
             <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <CalendarDaysIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">No results found.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-[68px] z-[5] shadow-sm"> 
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[200px]">Service/Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[180px]">Date/Time</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[150px]">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">Details</th>
                  </tr>
                </thead>
                <motion.tbody
                  className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                  }}
                >
                  <AnimatePresence>
                  {filteredItems.map((item) => {
                    const itemType = 'service' in item ? 'Appointment' : 'Order';
                    const IconComponent = 'service' in item ? CalendarDaysIcon : ShoppingCartIcon;
                    const itemName = 'service' in item ? item.service : (item.marketplaceListing?.name || item.marketplaceListing?.title || item.name || "Order Item");
                    const clientName = 'service' in item ? item.client.name : (item.name || item.order?.consumer?.name || item.order?.name || "N/A");
                    const status = 'service' in item ? item.status : (item.status || item.order?.status || "UNKNOWN");

                    return (
                        <motion.tr
                            key={item.id}
                            className="group hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 ease-in-out cursor-pointer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            onClick={() => openModal(item)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                <span className="flex items-center gap-2">
                                    <IconComponent className={`w-5 h-5 ${itemType === 'Appointment' ? 'text-indigo-500' : 'text-green-500'}`} />
                                    {itemType}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-semibold truncate max-w-xs">{itemName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{clientName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                {formatDateTime(item.date || '', item.timeSlot || '')}
                            </td>
                            <td className="px-6 py-4 text-sm text-center">
                                <StatusBadge status={status} />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <motion.button
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); openModal(item); }}
                                    className="p-2 rounded-full text-white shadow-md transition-colors"
                                    style={{ backgroundColor: primaryColor }}
                                    whileHover={{ scale: 1.1, backgroundColor: secondaryColor }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="View Details"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </motion.button>
                            </td>
                        </motion.tr>
                    );
                  })}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Appointment/Order Detail Panel (The engaging part) */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={closeModal} />

            {/* Panel (Slide-out) */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto flex flex-col"
              variants={detailPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                {/* Panel Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                            {'service' in selectedItem ? selectedItem.service : (selectedItem.marketplaceListing?.name || selectedItem.name || "Order Details")}
                        </h3>
                        <div className="mt-2"><StatusBadge status={newStatus} /></div>
                    </div>
                    {/* Close Button (Icon change for better contrast) */}
                    <button
                        onClick={closeModal}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Close detail panel"
                    >
                        <ArrowRightOnRectangleIcon className="w-7 h-7" />
                    </button>
                </div>
              </div>

              {/* Modal Details (Scrollable Content) */}
              <div className={`p-6 flex-grow overflow-y-auto ${customScrollbarClass}`}>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">Client & Schedule Details</h4>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
                        <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Type:</span> <span>{'service' in selectedItem ? 'Appointment' : 'Order'}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Scheduled:</span> <span>{formatDateTime(selectedItem.date || '', selectedItem.timeSlot || '')}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Client:</span> <span>{'service' in selectedItem ? selectedItem.client.name : (selectedItem.name || selectedItem.order?.consumer?.name || selectedItem.order?.name || "N/A")}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Email:</span> <span>{'service' in selectedItem ? selectedItem.client.email : (selectedItem.email || selectedItem.order?.consumer?.email || selectedItem.order?.email || "N/A")}</span></div>
                        <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Phone:</span> <span>{'service' in selectedItem ? selectedItem.client.phone : (selectedItem.phone || selectedItem.order?.consumer?.phone || selectedItem.order?.phone || "N/A")}</span></div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">Order/Item Specifics</h4>
                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-6">
                        {'price' in selectedItem && (<div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Price:</span> <span>${selectedItem.price?.toFixed(2) || '0.00'}</span></div>)}
                        {'quantity' in selectedItem && (<div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Quantity:</span> <span>{selectedItem.quantity}</span></div>)}
                        {'order' in selectedItem && selectedItem.order && (
                            <>
                                <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Order ID:</span> <span>{selectedItem.order.id || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-900 dark:text-gray-100">Rider:</span> <span>{selectedItem.order.rider || 'N/A'}</span></div>
                            </>
                        )}
                        {'notes' in selectedItem && selectedItem.notes && (
                            <div>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1">Notes:</span> 
                                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg italic">{selectedItem.notes}</p>
                            </div>
                        )}
                    </div>
              </div>

              {/* Status Update Section (Sticky Footer) */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 z-10">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Update Status
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Status Buttons with Primary Color Accent */}
                        {('service' in selectedItem ? ["Scheduled", "Completed", "Cancelled"] : ["PENDING", "PROCESSING", "DELIVERED", "REJECTED", "CANCELLED"]).map((s) => (
                            <motion.button
                                key={s}
                                onClick={() => setNewStatus(s)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                                    newStatus.toUpperCase() === s.toUpperCase()
                                        ? `text-white shadow-lg`
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                                style={{ backgroundColor: newStatus.toUpperCase() === s.toUpperCase() ? primaryColor : '' }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isLoading}
                            >
                                {s}
                            </motion.button>
                        ))}
                    </div>

                    {/* Rider Input for Orders */}
                    {'price' in selectedItem && (
                        <label className="block mb-4">
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Assign Rider (ID/Name)</span>
                            <input
                                type="text"
                                value={rider}
                                onChange={(e) => setRider(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-shadow"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                placeholder="e.g., Rider ID or Name"
                                disabled={isLoading}
                            />
                        </label>
                    )}

                    {/* Modal Action Buttons */}
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={closeModal}
                            className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateStatus}
                            className="px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-lg flex items-center justify-center min-w-[150px]"
                            style={{ backgroundColor: primaryColor }}
                            // whileHover={{ scale: 1.02 }}
                            // whileTap={{ scale: 0.98 }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}