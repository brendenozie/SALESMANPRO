"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowLongRightIcon,
  InformationCircleIcon, // New: For subtle movement cue
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// --- Type Definitions (Reused) ---
// ... (Your original type definitions for AppointmentItem and OrderItem)
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
  consumer?: { name?: string; email?: string; phone?: string }; 
  marketplaceListing?: { id?: string; title?: string; name?: string };
  order?: { id?: string; status?: string; rider?: string; createdAt?: string; name?: string; title?: string; email?: string; phone?: string; consumer?: { name?: string; email?: string; phone?: string } };
}

type UnifiedItem = AppointmentItem | OrderItem;

interface Props {
  initialAppointments: AppointmentItem[];
  initialOrderItems: OrderItem[];
}

// --- CONSTANTS & UTILS ---
const ALL_STATUSES = [
  "SCHEDULED", "COMPLETED", "CANCELLED", 
  "PENDING", "PROCESSING", "DELIVERED", "REJECTED", 
];

const getStatusProps = (status: string) => {
  switch (status.toUpperCase()) {
    case "SCHEDULED":
    case "PENDING":
    case "PROCESSING":
      return { 
        colorClass: "bg-yellow-50 dark:bg-yellow-900 border-yellow-400 text-yellow-800 dark:text-yellow-300", 
        headerClass: "border-yellow-500 bg-yellow-400/20 dark:bg-yellow-900/50",
        icon: ClockIcon 
      };
    case "COMPLETED":
    case "DELIVERED":
      return { 
        colorClass: "bg-green-50 dark:bg-green-900 border-green-400 text-green-800 dark:text-green-300", 
        headerClass: "border-green-500 bg-green-400/20 dark:bg-green-900/50",
        icon: CheckCircleIcon 
      };
    case "CANCELLED":
    case "REJECTED":
    case "FAILED":
      return { 
        colorClass: "bg-red-50 dark:bg-red-900 border-red-400 text-red-800 dark:text-red-300", 
        headerClass: "border-red-500 bg-red-400/20 dark:bg-red-900/50",
        icon: XMarkIcon 
      };
    default:
      return { 
        colorClass: "bg-gray-50 dark:bg-gray-700 border-gray-400 text-gray-700 dark:text-gray-300", 
        headerClass: "border-gray-500 bg-gray-400/20 dark:bg-gray-700/50",
        icon: InformationCircleIcon 
      };
  }
};

// --- Status Badge Component ---
const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const { colorClass, icon: Icon } = getStatusProps(status);
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${colorClass} min-w-[100px] justify-center shadow-sm`}>
      <Icon className="w-3.5 h-3.5" /> <span className="truncate">{status.toUpperCase()}</span>
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// --- Detail Row Component for Panel ---
interface DetailRowProps {
    icon: React.ElementType;
    label: string;
    value: string | number | undefined;
    color?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 border border-gray-100 dark:border-gray-700">
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${color || 'text-gray-500 dark:text-gray-400'}`} />
        <div className="flex-grow flex justify-between items-center text-sm">
            <span className="font-medium text-gray-900 dark:text-gray-100">{label}:</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-right truncate ml-4">{value || 'N/A'}</span>
        </div>
    </div>
);


// --- Item Card Component (The core visual element) ---
const ItemCard: React.FC<{ item: UnifiedItem, openModal: (item: UnifiedItem) => void }> = React.memo(({ item, openModal }) => {
    const itemType = 'service' in item ? 'Appointment' : 'Order';
    const IconComponent = 'service' in item ? CalendarDaysIcon : ShoppingCartIcon;
    const itemName = 'service' in item ? item.service : (item.marketplaceListing?.name ||item.marketplaceListing?.title || item.name || "Order Item");
    const clientName = 'service' in item ? item.client.name : (item.name || item.order?.consumer?.name || item.order?.name || "N/A");
    const status = 'service' in item ? item.status : (item.status || item.order?.status || "UNKNOWN");
    const colorClass = itemType === 'Appointment' ? 'border-indigo-500' : 'border-green-500';

    const dateDisplay = item.date && item.timeSlot ? 
        new Date(`${item.date}T${item.timeSlot.replace(' AM', 'AM').replace(' PM', 'PM')}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) 
        : 'N/A';

    return (
        <motion.div
            layout // Enable layout animation for smooth sorting/filtering
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 ${colorClass} cursor-pointer transition-all duration-200`}
            onClick={() => openModal(item)}
        >
            <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold flex items-center gap-1 ${itemType === 'Appointment' ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'}`}>
                    <IconComponent className="w-4 h-4" /> {itemType}
                </span>
                <StatusBadge status={status} />
            </div>
            
            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 truncate mb-1" title={itemName}>
                {itemName}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                <UserCircleIcon className="w-4 h-4 text-gray-400" />
                {clientName}
            </p>

            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.date}
                </span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {dateDisplay}
                </span>
            </div>
        </motion.div>
    );
});


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
  
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; 
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; 

  // --- Data Initialization & Sorting ---
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

  // --- Filtered & Grouped Data (Key for Kanban View) ---
  const groupedItems = useMemo(() => {
    const filtered = unifiedItems.filter(item => {
      const searchMatch = searchTerm.toLowerCase();
      const clientName = 'service' in item ? item.client.name : (item.name || item.order?.consumer?.name || item.order?.name || "");
      const itemName = 'service' in item ? item.service : (item.marketplaceListing?.title || item.name || "");
      
      return clientName.toLowerCase().includes(searchMatch) || itemName.toLowerCase().includes(searchMatch) || item.id.includes(searchMatch);
    });

    // Determine the columns based on a unified workflow
    const columns = {
        TO_DO: filtered.filter(item => {
            const status = 'service' in item ? item.status : (item.status || "PENDING");
            return status.toUpperCase() === "SCHEDULED" || status.toUpperCase() === "PENDING";
        }),
        IN_PROGRESS: filtered.filter(item => {
            const status = 'service' in item ? item.status : (item.status || "PENDING");
            return status.toUpperCase() === "PROCESSING";
        }),
        COMPLETED: filtered.filter(item => {
            const status = 'service' in item ? item.status : (item.status || "PENDING");
            return status.toUpperCase() === "COMPLETED" || status.toUpperCase() === "DELIVERED";
        }),
        CANCELED: filtered.filter(item => {
            const status = 'service' in item ? item.status : (item.status || "PENDING");
            return status.toUpperCase() === "CANCELLED" || status.toUpperCase() === "REJECTED";
        }),
    };
    return columns;
  }, [unifiedItems, searchTerm]);

  // --- Helper Functions (Simplified) ---
  const formatDateTime = useCallback((dateString: string, timeString: string) => {
    try {
        const dateTime = new Date(`${dateString}T${timeString.replace(' AM', 'AM').replace(' PM', 'PM')}`);
        return dateTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', ' + 
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
    setTimeout(() => setSelectedItem(null), 400); 
    setNewStatus("");
    setRider("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setMessage("");
    setIsSuccess(null);
    const prevStatus = newStatus;

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

        const successMessage = `Item ID ${selectedItem.id.substring(0, 8)} status updated to "${newStatus}"!`;
        setMessage(successMessage);
        setIsSuccess(true);
        setTimeout(closeModal, 1500); 
    } catch (error: any) {
        console.error("Failed to update status:", error);
        setIsSuccess(false);
        setMessage(`Error: Failed to update status. Rolled back to "${prevStatus}".`);
        setIsLoading(false);
    } 
  };

  // Modal variants
  const detailPanelVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
  };

  // Status map for modal status buttons
  const statusUpdateMap = {
    TO_DO: ["SCHEDULED", "PENDING", "PROCESSING"],
    IN_PROGRESS: ["PROCESSING", "COMPLETED", "DELIVERED", "CANCELLED"],
    COMPLETED: ["COMPLETED", "DELIVERED"],
    CANCELED: ["CANCELLED", "REJECTED"],
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <header className="mb-8 max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
              Unified Command Center
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Visually manage your workflow: Appointments (Indigo) & Orders (Green).</p>
        </header>

        {/* Global Message/Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 p-4 rounded-xl shadow-lg text-center font-medium max-w-7xl mx-auto flex items-center justify-center gap-3 ${
                isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
              }`}
            >
              {isSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls: Search */}
        <div className="max-w-7xl mx-auto mb-6 sticky top-0 z-20 bg-gray-100 dark:bg-gray-950 pt-2 pb-4">
          <div className="flex-grow relative shadow-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search all items by client, service, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-opacity-50 transition-shadow"
              style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
            />
          </div>
        </div>


        {/* Kanban Board Layout */}
        <div className="flex overflow-x-auto gap-6 pb-4 pt-1 max-w-full">
          {Object.entries(groupedItems).map(([columnName, items]) => (
            <div key={columnName} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <motion.div 
                className={`flex justify-between items-center p-3 mb-4 rounded-xl shadow-lg border-l-4 font-bold text-lg dark:text-gray-100 border-b-2`}
                style={{
                    borderColor: getStatusProps(columnName).headerClass.includes('yellow') ? '#fbbf24' : 
                                 getStatusProps(columnName).headerClass.includes('green') ? '#10b981' :
                                 getStatusProps(columnName).headerClass.includes('red') ? '#f87171' : 
                                 '#9ca3af' ,
                    backgroundColor: getStatusProps(columnName).headerClass.split(' ')[1] 
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span>{columnName.replace('_', ' ')}</span>
                <span className="text-sm font-semibold p-1 rounded-full bg-white dark:bg-gray-700 min-w-[30px] text-center">{items.length}</span>
              </motion.div>
              
              {/* Card List */}
              <motion.div layout className="space-y-4 min-h-[500px]">
                <AnimatePresence>
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} openModal={openModal} />
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        No items in this column.
                    </div>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment/Order Detail Panel (Slide-out drawer) */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-70" onClick={closeModal} />

            {/* Panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto flex flex-col"
              variants={detailPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                            {'service' in selectedItem ? selectedItem.service : (selectedItem.marketplaceListing?.title || selectedItem.name || "Order Details")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <TagIcon className="w-4 h-4" /> ID: {selectedItem.id}
                        </p>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        aria-label="Close detail panel"
                    >
                        <ArrowRightOnRectangleIcon className="w-7 h-7 transform rotate-180" />
                    </button>
                </div>
              </div>

              {/* Modal Details (Scrollable Content) */}
              <div className="p-6 flex-grow overflow-y-auto space-y-8">
                
                {/* Status Card */}
                <motion.div 
                    className={`p-5 rounded-xl shadow-lg border-l-4 ${getStatusProps(newStatus).colorClass.split(' ')[2]}`} 
                    style={{ backgroundColor: getStatusProps(newStatus).colorClass.split(' ')[0] }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Current Status:</h4>
                        <motion.div key={newStatus} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                            <StatusBadge status={newStatus} />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Client Details */}
                <div className="space-y-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                        <UserCircleIcon className="w-6 h-6 text-indigo-400" /> Client Info
                    </h4>
                    <DetailRow icon={UserCircleIcon} label="Name" value={'service' in selectedItem ? selectedItem.client.name : (selectedItem.name || selectedItem.order?.consumer?.name || selectedItem.order?.name)} />
                    <DetailRow icon={EnvelopeIcon} label="Email" value={'service' in selectedItem ? selectedItem.client.email : (selectedItem.email || selectedItem.order?.consumer?.email || selectedItem.order?.email)} />
                    <DetailRow icon={PhoneIcon} label="Phone" value={'service' in selectedItem ? selectedItem.client.phone : (selectedItem.phone || selectedItem.order?.consumer?.phone || selectedItem.order?.phone)} />
                </div>

                {/* Schedule/Order Details */}
                <div className="space-y-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                        <CalendarDaysIcon className="w-6 h-6 text-green-400" /> Schedule & Items
                    </h4>
                    <DetailRow icon={ClockIcon} label="Time" value={formatDateTime(selectedItem.date || '', selectedItem.timeSlot || '')} />
                    {'price' in selectedItem && (<DetailRow icon={CurrencyDollarIcon} label="Price" value={`$${selectedItem.price?.toFixed(2) || '0.00'}`} color="text-green-500" />)}
                    {'quantity' in selectedItem && (<DetailRow icon={InformationCircleIcon} label="Quantity" value={selectedItem.quantity} />)}
                </div>

                {/* Delivery/Notes */}
                {('order' in selectedItem || 'notes' in selectedItem) && (
                    <div className="space-y-3">
                        <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                            <TruckIcon className="w-6 h-6 text-yellow-400" /> Logistics
                        </h4>
                        {'price' in selectedItem && selectedItem.order && (<DetailRow icon={TruckIcon} label="Assigned Rider" value={selectedItem.order.rider} />)}
                        {'notes' in selectedItem && selectedItem.notes && (
                            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 italic text-sm border border-gray-200 dark:border-gray-700">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 block mb-1 flex items-center gap-1">
                                    <ClipboardDocumentCheckIcon className="w-4 h-4" /> Notes:
                                </span> 
                                <p>{selectedItem.notes}</p>
                            </div>
                        )}
                    </div>
                )}
              </div>

              {/* Status Update Section (Sticky Footer) */}
              <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900 z-10 shadow-t-xl">
                <label className="block text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    Change Status <ArrowLongRightIcon className="w-5 h-5 ml-2" />
                </label>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {/* Status Buttons */}
                    {ALL_STATUSES.map((s) => (
                        <motion.button
                            key={s}
                            onClick={() => setNewStatus(s)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md min-w-[100px] ${
                                newStatus.toUpperCase() === s.toUpperCase()
                                    ? `text-white shadow-xl`
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
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
                {('price' in selectedItem) && (
                    <label className="block mb-4">
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center gap-2 mb-1">
                            <TruckIcon className="w-4 h-4" /> Assign Rider (Optional)
                        </span>
                        <input
                            type="text"
                            value={rider}
                            onChange={(e) => setRider(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-opacity-50 transition-shadow shadow-inner"
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                            placeholder="Rider ID or Name"
                            disabled={isLoading}
                        />
                    </label>
                )}

                {/* Modal Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={closeModal}
                        className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-md"
                        disabled={isLoading}
                    >
                        Close
                    </button>
                    <motion.button
                        onClick={handleUpdateStatus}
                        className="px-6 py-3 rounded-lg text-white font-semibold transition-all shadow-xl flex items-center justify-center min-w-[150px]"
                        style={{ backgroundColor: primaryColor }}
                        whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <>
                              <ArrowPathIcon className="w-5 h-5 mr-2" />
                              Update Status
                            </>
                        )}
                    </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}