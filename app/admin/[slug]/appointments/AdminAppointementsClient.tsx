// app/[slug]/appointments/AdminAppointmentsClient.tsx
"use client";

import React, { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// --- Type Definitions (Centralized & Unified) ---
// Ensure these match your backend and the data passed from the server component
export interface AppointmentItem {
  id: string;
  service: string; // For direct appointments
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  client: {
    name: string;
    email: string;
    phone: string;
  };
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface OrderItem {
  id: string;
  price: number; // Total price of the order item
  name?: string; // Name of the product/service in the order item
  email?: string; // Client email from order
  phone?: string; // Client phone from order
  quantity: number;
  status?: string; // Order item status (e.g., "PENDING", "PROCESSING", "DELIVERED")
  date?: string; // Date of service/delivery if applicable
  timeSlot?: string; // Time slot of service/delivery if applicable
  marketplaceListing?: {
    id?: string;
    title?: string;
    name?: string; // Often 'name' is used as well as 'title'
  };
  order?: { // Parent order details
    id?: string;
    status?: string; // Overall order status
    rider?: string; // Rider ID/Name
    createdAt?: string;
    name?: string; // Order client name
    title?: string; // Order title
    email?: string; // Order client email
    phone?: string; // Order client phone
    consumer?: { // Consumer details within the order
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}

// Unified type for display in the grid
type UnifiedItem = AppointmentItem | OrderItem;

interface Props {
  initialAppointments: AppointmentItem[];
  initialOrderItems: OrderItem[];
}

export default function AdminAppointmentsClient({ initialAppointments, initialOrderItems }: Props) {
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>(""); // Can be AppointmentItem status or OrderItem status
  const [rider, setRider] = useState<string>(""); // For order items
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // null: no action, true: success, false: error

  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal fallback
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // Orange fallback

  // Combine and sort initial data
  useEffect(() => {
    // Combine and sort by date/time (most recent first)
    const combined = [...initialAppointments, ...initialOrderItems].sort((a, b) => {
      // Ensure date and timeSlot exist before creating Date objects
      const dateA = a.date && a.timeSlot ? new Date(`${a.date}T${a.timeSlot.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0); // Use epoch for missing
      const dateB = b.date && b.timeSlot ? new Date(`${b.date}T${b.timeSlot.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0);

      // Handle invalid dates by placing them at the end or beginning
      if (isNaN(dateA.getTime())) return 1; // a is invalid, put it after b
      if (isNaN(dateB.getTime())) return -1; // b is invalid, put it before a

      return dateB.getTime() - dateA.getTime(); // Descending order (most recent first)
    });
    setUnifiedItems(combined);
  }, [initialAppointments, initialOrderItems]);

  // Helper to format date and time for display
  const formatDateTime = (dateString: string, timeString: string) => {
    try {
      const dateTime = new Date(`${dateString}T${timeString.replace(' AM', 'AM').replace(' PM', 'PM')}`);
      return `${dateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at ${dateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } catch (e) {
      return `${dateString} at ${timeString}`; // Fallback
    }
  };

  // Handle opening the modal
  const openModal = (item: UnifiedItem) => {
    setSelectedItem(item);
    // Set initial status for the modal based on item type
    if ('service' in item) { // It's an AppointmentItem
      setNewStatus(item.status);
    } else { // It's an OrderItem
      setNewStatus(item.status || item.order?.status || "PENDING"); // Default to PENDING
      setRider(item.order?.rider || "");
    }
    setIsModalOpen(true);
    setMessage(""); // Clear previous messages
    setIsSuccess(null);
  };

  // Handle closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setNewStatus("");
    setRider("");
  };

  // Handle updating status for both appointments and orders
  const handleUpdateStatus = async () => {
    if (!selectedItem) return;

    setIsLoading(true);
    setMessage("");
    setIsSuccess(null);

    try {
      if ('service' in selectedItem) { // It's an AppointmentItem
        // Mock API call for appointment status update
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        setUnifiedItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id ? { ...item, status: newStatus as AppointmentItem["status"] } : item
          )
        );
        setMessage(`Appointment "${selectedItem.service}" status updated to "${newStatus}"!`);
      } else { // It's an OrderItem
        // Real API call for order item status update
        // You would typically send a PUT/PATCH request to update the specific order item
        // The API endpoint below is a placeholder and should be adapted to your actual backend.
        // For demonstration, we'll just simulate a successful update.
        console.log(`Simulating API call to update OrderItem ${selectedItem.id} to status: ${newStatus}, Rider: ${rider}`);

        const mockApiResponse = {
          success: true,
          message: "Order item updated successfully",
          updatedItem: {
            ...selectedItem,
            status: newStatus,
            order: {
              ...selectedItem.order,
              status: newStatus,
              rider: rider
            }
          }
        };

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

        if (mockApiResponse.success) {
          // setUnifiedItems(prev =>
          //   prev.map(item =>
          //     item.id === selectedItem.id ? {
          //       ...item,
          //       status: (mockApiResponse.updatedItem as OrderItem).status,
          //       order: { ...item.order, status: (mockApiResponse.updatedItem as OrderItem).status, rider: (mockApiResponse.updatedItem as OrderItem).order?.rider }
          //     } : item
          //   )
          // );
          setMessage(`Order for "${selectedItem.marketplaceListing?.name || selectedItem.name}" updated to "${newStatus}"!`);
        } else {
          throw new Error(mockApiResponse.message || "Failed to update order item.");
        }
      }
      setIsSuccess(true);
      closeModal(); // Close modal on success
    } catch (error: any) {
      console.error("Failed to update status:", error);
      setIsSuccess(false);
      setMessage(`Error: ${error.message || "Failed to update status. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge component (enhanced for visual appeal)
  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "";
    let icon = null;
    let text = status; // Default text is the status itself

    switch (status) {
      case "Scheduled":
      case "PENDING":
      case "PROCESSING":
        colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
        icon = <ClockIcon className="w-4 h-4" />;
        break;
      case "Completed":
      case "DELIVERED":
        colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200"; // Changed to emerald for completed
        icon = <CheckCircleIcon className="w-4 h-4" />;
        break;
      case "Cancelled":
      case "REJECTED":
      case "FAILED":
        colorClass = "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200";
        icon = <XMarkIcon className="w-4 h-4" />;
        break;
      default:
        colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        icon = <InformationCircleIcon className="w-4 h-4" />;
        break;
    }

    return (
      <motion.span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${colorClass}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        {icon} {text}
      </motion.span>
    );
  };

  // Animation variants for the main container and individual cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
    hover: { scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center sm:text-left">
            Manage <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Schedule & Deliveries</span>
          </h1>
          {/* Add any global actions here if needed, e.g., "Add New Appointment" */}
        </div>

        {/* Global Message/Notification */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-8 p-4 rounded-lg shadow-md text-center font-medium ${
                isSuccess ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Items Grid */}
        {unifiedItems.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-lg text-center h-64 border border-gray-200 dark:border-gray-700"
          >
            <CalendarDaysIcon className="w-20 h-20 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300 mb-4">No appointments or orders found!</p>
            <p className="text-lg text-gray-500 dark:text-gray-400">Your schedule looks clear for now. Enjoy the peace! 😌</p>
          </motion.div>
        ) : isLoading && unifiedItems.length === 0 ? (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-lg text-center h-64 border border-gray-200 dark:border-gray-700"
            >
                <ArrowPathIcon className="w-12 h-12 text-gray-500 dark:text-gray-400 animate-spin mb-4" />
                <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">Loading schedule...</p>
            </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {unifiedItems.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden group"
                variants={cardVariants}
                whileHover="hover"
                onClick={() => openModal(item)}
              >
                {/* Icon to distinguish type */}
                <div className="flex justify-between items-center mb-3">
                  {'service' in item ? (
                    <CalendarDaysIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                  ) : (
                    <ShoppingCartIcon className="w-8 h-8 text-green-500 dark:text-green-400" />
                  )}
                  <StatusBadge status={'service' in item ? item.status : (item.status || item.order?.status || "UNKNOWN")} />
                </div>

                {/* Main Title */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2 truncate group-hover:text-emerald-600 transition-colors">
                  {'service' in item ? item.service : (item.marketplaceListing?.name || item.marketplaceListing?.title || item.name || "Order Item")}
                </h2>

                {/* Client Info */}
                <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2 mb-2">
                  <UserCircleIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-semibold">Client:</span> {'service' in item ? item.client.name : (item.name || item.order?.consumer?.name || item.order?.name || "N/A")}
                </p>

                {/* Date & Time */}
                <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> {/* Changed icon to Clock for time */}
                  <span className="font-semibold">When:</span> {formatDateTime(item.date || '', item.timeSlot || '')}
                </p>

                {/* Additional Order/Appointment Specifics */}
                {'price' in item && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{ color: primaryColor }}>Price:</span> ${item.price?.toFixed(2) || '0.00'}
                  </p>
                )}
                {'notes' in item && item.notes && (
                  <p className="text-gray-500 dark:text-gray-400 italic text-xs mt-auto pt-2 line-clamp-2">
                    <InformationCircleIcon className="w-3 h-3 inline-block mr-1" />
                    {item.notes}
                  </p>
                )}
                {'order' in item && item.order?.rider && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-auto pt-2">
                    <span className="font-semibold">Rider:</span> {item.order.rider}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Appointment/Order Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-8 relative max-h-[95vh] flex flex-col transform-gpu"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>

              {/* Modal Header */}
              <h3 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-gray-100 leading-tight">
                {'service' in selectedItem ? selectedItem.service : (selectedItem.marketplaceListing?.name || selectedItem.marketplaceListing?.title || selectedItem.name || "Order Details")}
              </h3>
              <div className="mb-6">
                   <StatusBadge status={newStatus} />
              </div>


              {/* Modal Details */}
              <div className="space-y-3 text-gray-700 dark:text-gray-300 mb-6 flex-grow overflow-y-auto custom-scrollbar">
                <p>
                  <span className="font-semibold">Type:</span> {'service' in selectedItem ? 'Appointment' : 'Order'}
                </p>
                <p>
                  <span className="font-semibold">Scheduled:</span> {formatDateTime(selectedItem.date || '', selectedItem.timeSlot || '')}
                </p>
                <p>
                  <span className="font-semibold">Client Name:</span> {'service' in selectedItem ? selectedItem.client.name : (selectedItem.name || selectedItem.order?.consumer?.name || selectedItem.order?.name || "N/A")}
                </p>
                <p>
                  <span className="font-semibold">Client Email:</span> {'service' in selectedItem ? selectedItem.client.email : (selectedItem.email || selectedItem.order?.consumer?.email || selectedItem.order?.email || "N/A")}
                </p>
                <p>
                  <span className="font-semibold">Client Phone:</span> {'service' in selectedItem ? selectedItem.client.phone : (selectedItem.phone || selectedItem.order?.consumer?.phone || selectedItem.order?.phone || "N/A")}
                </p>

                {'price' in selectedItem && (
                  <p>
                    <span className="font-semibold">Price:</span> ${selectedItem.price?.toFixed(2) || '0.00'}
                  </p>
                )}
                {'quantity' in selectedItem && (
                  <p>
                    <span className="font-semibold">Quantity:</span> {selectedItem.quantity}
                  </p>
                )}
                {'notes' in selectedItem && selectedItem.notes && (
                  <p>
                    <span className="font-semibold">Notes:</span> {selectedItem.notes}
                  </p>
                )}
                {'order' in selectedItem && selectedItem.order && (
                  <>
                    <p>
                      <span className="font-semibold">Order ID:</span> {selectedItem.order.id || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Order Status:</span> {selectedItem.order.status || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Order Date:</span> {selectedItem.order.createdAt ? new Date(selectedItem.order.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Rider:</span> {selectedItem.order.rider || 'N/A'}
                    </p>
                  </>
                )}
              </div>

              {/* Status Update Section */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Status
                </label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {/* Options for Appointment Status */}
                  {'service' in selectedItem && ["Scheduled", "Completed", "Cancelled"].map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        newStatus === s
                          ? `text-white`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      style={{ backgroundColor: newStatus === s ? primaryColor : '' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      <PencilSquareIcon className="w-5 h-5 inline-block mr-2" />
                      {s}
                    </motion.button>
                  ))}

                  {/* Options for Order Status (more general) */}
                  {'price' in selectedItem && ["PENDING", "PROCESSING", "DELIVERED", "REJECTED", "CANCELLED"].map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        newStatus === s
                          ? `text-white`
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      style={{ backgroundColor: newStatus === s ? primaryColor : '' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading}
                    >
                      <PencilSquareIcon className="w-5 h-5 inline-block mr-2" />
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
                      className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      placeholder="e.g., Rider ID or Name"
                      disabled={isLoading}
                    />
                  </label>
                )}

                {/* Modal Action Buttons */}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-6 py-3 rounded-lg text-white font-semibold transition-colors shadow-md flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <ArrowPathIcon className="w-5 h-5 text-white mr-3 animate-spin" />
                    )}
                    Save Changes
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