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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// --- TYPE DEFINITIONS ---
// It's good practice to make types more specific where possible.
export interface Client {
  name: string;
  email: string;
  phone: string;
}

export interface AppointmentItem {
  id: string;
  type: "Appointment"; // Added for explicit type checking
  service: string;
  date: string;
  timeSlot: string;
  client: Client;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface OrderItem {
  id: string;
  type: "Order"; // Added for explicit type checking
  price: number;
  quantity: number;
  status: string;
  date: string;
  timeSlot: string;
  consumer: Partial<Client>; // Use Partial if some fields can be missing
  marketplaceListing?: { id?: string; title?: string };
  order?: {
    id?: string;
    status?: string;
    rider?: string;
    createdAt?: string;
  };
}

export type UnifiedItem = AppointmentItem | OrderItem;

// --- TYPE GUARDS ---
// Utility functions to check item type safely.
const isAppointment = (item: UnifiedItem): item is AppointmentItem => item.type === 'Appointment';

// --- CONSTANTS & UTILS ---
const KANBAN_COLUMNS = {
  TO_DO: ["SCHEDULED", "PENDING"],
  IN_PROGRESS: ["PROCESSING"],
  COMPLETED: ["COMPLETED", "DELIVERED"],
  CANCELED: ["CANCELLED", "REJECTED", "FAILED"],
};

type KanbanColumnKey = keyof typeof KANBAN_COLUMNS;

const ALL_STATUSES = Object.values(KANBAN_COLUMNS).flat();

const getStatusProps = (status: string) => {
  const upperStatus = status.toUpperCase();
  if (KANBAN_COLUMNS.TO_DO.includes(upperStatus)) {
    return {
      colorClass: "bg-yellow-50 dark:bg-yellow-900/50 border-yellow-400 text-yellow-800 dark:text-yellow-300",
      headerClass: "border-yellow-500 bg-yellow-400/20 dark:bg-yellow-900/50",
      icon: ClockIcon,
    };
  }
  if (KANBAN_COLUMNS.IN_PROGRESS.includes(upperStatus)) {
    return {
      colorClass: "bg-blue-50 dark:bg-blue-900/50 border-blue-400 text-blue-800 dark:text-blue-300",
      headerClass: "border-blue-500 bg-blue-400/20 dark:bg-blue-900/50",
      icon: ArrowPathIcon,
    };
  }
  if (KANBAN_COLUMNS.COMPLETED.includes(upperStatus)) {
    return {
      colorClass: "bg-green-50 dark:bg-green-900/50 border-green-400 text-green-800 dark:text-green-300",
      headerClass: "border-green-500 bg-green-400/20 dark:bg-green-900/50",
      icon: CheckCircleIcon,
    };
  }
  if (KANBAN_COLUMNS.CANCELED.includes(upperStatus)) {
    return {
      colorClass: "bg-red-50 dark:bg-red-900/50 border-red-400 text-red-800 dark:text-red-300",
      headerClass: "border-red-500 bg-red-400/20 dark:bg-red-900/50",
      icon: XMarkIcon,
    };
  }
  return {
    colorClass: "bg-gray-50 dark:bg-gray-700 border-gray-400 text-gray-700 dark:text-gray-300",
    headerClass: "border-gray-500 bg-gray-400/20 dark:bg-gray-700/50",
    icon: InformationCircleIcon,
  };
};

const formatDateTime = (dateString?: string, timeString?: string): string => {
    if (!dateString || !timeString) return "No date";
    try {
        const dateTime = new Date(`${dateString}T${timeString.replace(/\s/g, '')}`);
        if (isNaN(dateTime.getTime())) return `${dateString} @ ${timeString}`;
        return dateTime.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    } catch (e) {
        return `${dateString} @ ${timeString}`;
    }
};

// --- CHILD COMPONENTS ---

const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const { colorClass, icon: Icon } = getStatusProps(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClass} min-w-[100px] justify-center shadow-sm`}>
      <Icon className="w-4 h-4" />
      <span className="truncate">{status.toUpperCase()}</span>
    </span>
  );
});

const ItemCard: React.FC<{ item: UnifiedItem; onSelect: (item: UnifiedItem) => void }> = React.memo(({ item, onSelect }) => {
    const isAppointmentItem = isAppointment(item);
    const { name, client, status, date, timeSlot } = useMemo(() => {
        if (isAppointmentItem) {
            return {
                name: item.service,
                client: item.client.name,
                status: item.status,
                date: item.date,
                timeSlot: item.timeSlot
            };
        }
        return {
            name: item.marketplaceListing?.title || "Order",
            client: item.consumer.name || "N/A",
            status: item.status,
            date: item.date,
            timeSlot: item.timeSlot
        };
    }, [item, isAppointmentItem]);

    const IconComponent = isAppointmentItem ? CalendarDaysIcon : ShoppingCartIcon;
    const borderColor = isAppointmentItem ? "border-indigo-500" : "border-teal-500";
    const textColor = isAppointmentItem ? "text-indigo-600 dark:text-indigo-400" : "text-teal-600 dark:text-teal-400";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.03, zIndex: 10, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border-l-4 ${borderColor} cursor-pointer transition-all duration-200`}
            onClick={() => onSelect(item)}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${textColor}`}>
                    <IconComponent className="w-4 h-4" /> {item.type}
                </span>
                <StatusBadge status={status} />
            </div>
            <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 truncate mb-1" title={name}>{name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                <UserCircleIcon className="w-4 h-4 text-gray-400" />
                {client}
            </p>
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
                <span>ID: {item.id.substring(0, 8)}...</span>
                <span>{formatDateTime(date, timeSlot)}</span>
            </div>
        </motion.div>
    );
});

const KanbanColumn: React.FC<{ title: string; items: UnifiedItem[]; onSelectItem: (item: UnifiedItem) => void; }> = ({ title, items, onSelectItem }) => {
  const { headerClass } = getStatusProps(title);
  
  return (
    <div className="flex-shrink-0 w-80 md:w-96">
      <div className={`flex justify-between items-center p-3 mb-4 rounded-xl shadow-md ${headerClass} sticky top-0 z-10`}>
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{title.replace('_', ' ')}</h3>
        <span className="text-sm font-semibold p-1 px-3 rounded-full bg-white/50 dark:bg-gray-800/50">{items.length}</span>
      </div>
      <motion.div layout className="space-y-4 min-h-[500px] p-1">
        <AnimatePresence>
          {items.map((item) => <ItemCard key={item.id} item={item} onSelect={onSelectItem} />)}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl h-24 flex items-center justify-center">
            No items here.
          </div>
        )}
      </motion.div>
    </div>
  );
};

const KanbanBoard: React.FC<{ groupedItems: Record<KanbanColumnKey, UnifiedItem[]>; onSelectItem: (item: UnifiedItem) => void; }> = ({ groupedItems, onSelectItem }) => (
  <div className="flex overflow-x-auto gap-6 pb-4 pt-1">
    {Object.entries(groupedItems).map(([columnName, items]) => (
      <KanbanColumn
        key={columnName}
        title={columnName}
        items={items}
        onSelectItem={onSelectItem}
      />
    ))}
  </div>
);

const DetailRow: React.FC<{ icon: React.ElementType; label: string; value?: string | number; color?: string; }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-start p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${color || 'text-gray-500 dark:text-gray-400'}`} />
        <div className="flex-grow flex justify-between items-center text-sm w-full">
            <span className="font-medium text-gray-900 dark:text-gray-100">{label}:</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium text-right truncate ml-4">{value || 'N/A'}</span>
        </div>
    </div>
);

const DetailPanel: React.FC<{ item: UnifiedItem; onClose: () => void; onUpdate: (id: string, newStatus: string, rider?: string) => Promise<void>; primaryColor: string; }> = ({ item, onClose, onUpdate, primaryColor }) => {
    const [newStatus, setNewStatus] = useState(isAppointment(item) ? item.status : item.status);
    const [rider, setRider] = useState(!isAppointment(item) ? item.order?.rider || "" : "");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        setIsLoading(true);
        await onUpdate(item.id, newStatus, rider);
        setIsLoading(false);
    };
    
    const { name, client, date, timeSlot } = useMemo(() => {
        if (isAppointment(item)) {
            return {
                name: item.service,
                client: item.client,
                date: item.date,
                timeSlot: item.timeSlot,
            };
        }
        return {
            name: item.marketplaceListing?.title || "Order",
            client: item.consumer,
            date: item.date,
            timeSlot: item.timeSlot,
        };
    }, [item]);

    return (
        <motion.div
            className="fixed inset-0 z-50 overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Panel */}
            <motion.div
                className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Header */}
                <header className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5"><TagIcon className="w-4 h-4" /> ID: {item.id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6 flex-grow overflow-y-auto space-y-6">
                    <section>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2"><UserCircleIcon className="w-6 h-6 text-indigo-500" />Client Info</h4>
                      <div className="space-y-2">
                        <DetailRow icon={UserCircleIcon} label="Name" value={client.name} />
                        <DetailRow icon={EnvelopeIcon} label="Email" value={client.email} />
                        <DetailRow icon={PhoneIcon} label="Phone" value={client.phone} />
                      </div>
                    </section>
                    <section>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2"><CalendarDaysIcon className="w-6 h-6 text-green-500" />Details</h4>
                       <div className="space-y-2">
                         <DetailRow icon={ClockIcon} label="Scheduled For" value={formatDateTime(date, timeSlot)} />
                         {!isAppointment(item) && <DetailRow icon={CurrencyDollarIcon} label="Price" value={`$${item.price?.toFixed(2)}`} color="text-green-500" />}
                         {!isAppointment(item) && <DetailRow icon={ShoppingCartIcon} label="Quantity" value={item.quantity} />}
                         {isAppointment(item) && item.notes && <DetailRow icon={ClipboardDocumentCheckIcon} label="Notes" value={item.notes} />}
                       </div>
                    </section>
                    {!isAppointment(item) && (
                        <section>
                          <h4 className="text-lg font-bold mb-3 flex items-center gap-2"><TruckIcon className="w-6 h-6 text-yellow-500" />Logistics</h4>
                          <div className="space-y-2">
                             <DetailRow icon={TruckIcon} label="Assigned Rider" value={item.order?.rider || 'Unassigned'} />
                          </div>
                        </section>
                    )}
                </main>

                {/* Footer Actions */}
                <footer className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                    <label className="block text-md font-bold text-gray-900 dark:text-gray-100 mb-3">Change Status</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {ALL_STATUSES.map((s) => (
                            <motion.button
                                key={s}
                                onClick={() => setNewStatus(s)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm min-w-[100px] border ${newStatus.toUpperCase() === s.toUpperCase() ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'}`}
                                style={{ backgroundColor: newStatus.toUpperCase() === s.toUpperCase() ? primaryColor : undefined, borderColor: newStatus.toUpperCase() === s.toUpperCase() ? primaryColor : undefined }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {s}
                            </motion.button>
                        ))}
                    </div>
                     {!isAppointment(item) && (
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2"><TruckIcon className="w-4 h-4" />Assign Rider</label>
                            <input type="text" value={rider} onChange={(e) => setRider(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2.5 shadow-inner focus:ring-2" style={{'--tw-ring-color': primaryColor} as React.CSSProperties} placeholder="Rider Name or ID" />
                        </div>
                    )}
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                        <motion.button
                            onClick={handleUpdate}
                            disabled={isLoading}
                            className="px-5 py-2.5 rounded-lg text-white font-semibold transition-all shadow-md flex items-center justify-center min-w-[150px]"
                            style={{ backgroundColor: primaryColor }}
                            whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
                        >
                            {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Update Status"}
                        </motion.button>
                    </div>
                </footer>
            </motion.div>
        </motion.div>
    );
};

// --- CUSTOM HOOKS ---

function useCommandCenterState(initialItems: UnifiedItem[]) {
    const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState<{ message: string; isSuccess: boolean } | null>(null);

    useEffect(() => {
        const sortedItems = initialItems?.length > 0 && [...initialItems].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.timeSlot?.replace(/\s/g, '') || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.timeSlot?.replace(/\s/g, '') || '00:00'}`);
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            return dateB.getTime() - dateA.getTime();
        });
        setUnifiedItems(sortedItems || []);
    }, [initialItems]);

    const groupedItems = useMemo(() => {
        const columns: Record<KanbanColumnKey, UnifiedItem[]> = {
            TO_DO: [],
            IN_PROGRESS: [],
            COMPLETED: [],
            CANCELED: [],
        };

        const filtered = unifiedItems.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            const clientName = isAppointment(item) ? item.client.name : item.consumer.name || '';
            const itemName = isAppointment(item) ? item.service : item.marketplaceListing?.title || '';
            return clientName.toLowerCase().includes(searchLower) || itemName.toLowerCase().includes(searchLower) || item.id.includes(searchLower);
        });

        filtered.forEach(item => {
            const status = (isAppointment(item) ? item.status : item.status).toUpperCase();
            for (const [col, statuses] of Object.entries(KANBAN_COLUMNS)) {
                if (statuses.includes(status)) {
                    columns[col as KanbanColumnKey].push(item);
                    return;
                }
            }
        });
        return columns;
    }, [unifiedItems, searchTerm]);

    const handleUpdateItem = useCallback(async (id: string, newStatus: string, rider?: string) => {
        // --- API call would go here ---
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        setUnifiedItems(prev => prev.map(item => {
            if (item.id === id) {
                if (isAppointment(item)) {
                    return { ...item, status: newStatus as AppointmentItem["status"] };
                }
                return { ...item, status: newStatus, order: { ...item.order, status: newStatus, rider } };
            }
            return item;
        }));
        setSelectedItem(null);
        setNotification({ message: `Item ${id.substring(0, 8)} updated to "${newStatus}"`, isSuccess: true });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const handleSelectItem = useCallback((item: UnifiedItem) => setSelectedItem(item), []);
    const handleClosePanel = useCallback(() => setSelectedItem(null), []);

    return {
        groupedItems,
        searchTerm,
        setSearchTerm,
        selectedItem,
        handleSelectItem,
        handleClosePanel,
        handleUpdateItem,
        notification,
    };
}


// --- MAIN COMPONENT ---
interface Props {
  initialData: UnifiedItem[]; // Simplified prop
}

export default function AdminAppointmentsClient({ initialData }: Props) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316';

  const {
    groupedItems,
    searchTerm,
    setSearchTerm,
    selectedItem,
    handleSelectItem,
    handleClosePanel,
    handleUpdateItem,
    notification,
  } = useCommandCenterState(initialData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-full mx-auto">
        <header className="mb-6 max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
              Unified Command Center
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your workflow: Appointments (Indigo) & Orders (Teal).</p>
        </header>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl shadow-lg text-center font-medium max-w-7xl mx-auto flex items-center justify-center gap-3 ${
                notification.isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200'
              }`}
            >
              {notification.isSuccess ? <CheckCircleIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="max-w-7xl mx-auto mb-6 sticky top-0 z-20 bg-gray-50 dark:bg-gray-950/80 backdrop-blur-sm pt-2 pb-4">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by client, service, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2"
                    style={{'--tw-ring-color': primaryColor} as React.CSSProperties}
                />
            </div>
        </div>

        <KanbanBoard groupedItems={groupedItems} onSelectItem={handleSelectItem} />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            onClose={handleClosePanel}
            onUpdate={handleUpdateItem}
            primaryColor={primaryColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}