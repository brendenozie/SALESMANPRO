// app/[slug]/appointments/AdminAppointmentsClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core'; // Import EventInput type
import toast from 'react-hot-toast'; // Import react-hot-toast


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

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

// Helper to map unified items to FullCalendar events
const mapToFullCalendarEvents = (unifiedItems: UnifiedItem[], primaryColor: string, secondaryColor: string, textColor: string): EventInput[] => {
  return unifiedItems.map(item => {
    const title = 'service' in item
      ? `${item.service} (${item.client.name})`
      : `${item.marketplaceListing?.name || item.name || 'Order'} (${item.order?.consumer?.name || item.order?.name || 'N/A'})`;
    const start = `${item.date}T${item.timeSlot}`;
    const className = 'service' in item ? 'event-appointment' : 'event-order';

    let backgroundColor = '';
    let borderColor = '';
    let eventTextColor = textColor; // Default event text color

    // Dynamic colors based on status
    if ('service' in item) { // Appointment
      if (item.status === 'Scheduled') {
        backgroundColor = '#FEF3C7'; // yellow-100
        borderColor = '#D97706'; // yellow-700
      } else if (item.status === 'Completed') {
        backgroundColor = '#D1FAE5'; // emerald-100
        borderColor = '#059669'; // emerald-700
      } else if (item.status === 'Cancelled') {
        backgroundColor = '#FEE2E2'; // red-100
        borderColor = '#DC2626'; // red-700
      }
    } else { // Order
        if (item.status === 'PENDING' || item.status === 'PROCESSING') {
            backgroundColor = '#FEF3C7'; // yellow-100
            borderColor = '#D97706'; // yellow-700
        } else if (item.status === 'DELIVERED') {
            backgroundColor = '#D1FAE5'; // emerald-100
            borderColor = '#059669'; // emerald-700
        } else if (item.status === 'REJECTED' || item.status === 'CANCELLED') {
            backgroundColor = '#FEE2E2'; // red-100
            borderColor = '#DC2626'; // red-700
        }
    }

    // You might want to adjust text color for better contrast on light backgrounds
    if (['#FEF3C7', '#D1FAE5', '#FEE2E2'].includes(backgroundColor)) {
      eventTextColor = '#1f2937'; // Dark text for light backgrounds
    }


    return {
      id: item.id,
      title,
      start,
      end: start, // Assuming a fixed time slot, can be extended if duration is known
      classNames: [className],
      backgroundColor: backgroundColor,
      borderColor: borderColor,
      textColor: eventTextColor,
      extendedProps: {
        originalItem: item, // Store the full item for modal display
      },
    };
  });
};


export default function AdminAppointmentsClient({ initialAppointments, initialOrderItems }: Props) {
  const [unifiedItems, setUnifiedItems] = useState<UnifiedItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnifiedItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [rider, setRider] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // Teal fallback
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // Orange fallback
  const textColor = storeFormData?.themeSettings?.textColor || '#1f2937'; // Default text color

  const calendarRef = useRef<FullCalendar>(null); // Ref for FullCalendar component

  // Combine and sort initial data
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

  // Memoize events for FullCalendar to prevent unnecessary re-renders
  const fullCalendarEvents = useMemo(() => {
    return mapToFullCalendarEvents(unifiedItems, primaryColor, secondaryColor, textColor);
  }, [unifiedItems, primaryColor, secondaryColor, textColor]);

  // Handle opening the modal
  const openModal = (item: UnifiedItem) => {
    setSelectedItem(item);
    if ('service' in item) {
      setNewStatus(item.status);
    } else {
      setNewStatus(item.status || item.order?.status || "PENDING");
      setRider(item.order?.rider || "");
    }
    setIsModalOpen(true);
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

    try {
      if ('service' in selectedItem) { // It's an AppointmentItem
        // Simulate API call for appointment status update
        await new Promise(resolve => setTimeout(resolve, 800));
        setUnifiedItems(prev =>
          prev.map(item =>
            item.id === selectedItem.id ? { ...item, status: newStatus as AppointmentItem["status"] } : item
          )
        );
        toast.success(`Appointment "${selectedItem.service}" status updated to "${newStatus}"!`);
      } else { // It's an OrderItem
        // Mock API call for order item status update - REPLACE WITH YOUR REAL API
        console.log(`Simulating API call to update OrderItem ${selectedItem.id} to status: ${newStatus}, Rider: ${rider}`);
        const res = await fetch(
          `${apiBaseUrl}/admin/orders/${selectedItem.id}/status`, // Example API endpoint
          {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, riderId: rider }), // Ensure your backend expects riderId
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || res.statusText);
        }

        const updatedOrder = await res.json(); // Assuming backend returns the updated item
        // setUnifiedItems(prev =>
        //   prev.map(item =>
        //     item.id === selectedItem.id ? {
        //       ...item,
        //       status: updatedOrder.status,
        //       order: { ...item.order, status: updatedOrder.status, rider: updatedOrder.rider }
        //     } : item
        //   )
        // );
        setUnifiedItems(prev =>
            prev.map(item => {
              if (item.id === selectedItem.id && "order" in item) {
                return {
                  ...item,
                  status: updatedOrder.status,
                  order: { ...item.order, status: updatedOrder.status, rider: updatedOrder.rider }
                };
              }
              return item;
            })
          );

          toast.success(`Order for "${selectedItem.marketplaceListing?.name || selectedItem.name}" updated to "${newStatus}"!`);
      }
      closeModal();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(`Error: ${error.message || "Failed to update status. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge component (enhanced for visual appeal)
  const StatusBadge = ({ status }: { status: string }) => {
    let colorClass = "";
    let icon = null;
    let text = status;

    switch (status) {
      case "Scheduled":
      case "PENDING":
      case "PROCESSING":
        colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200";
        icon = <ClockIcon className="w-4 h-4" />;
        break;
      case "Completed":
      case "DELIVERED":
        colorClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200";
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* react-hot-toast Toaster */}
      {/* Place this at a high level, e.g., in your main layout or app.tsx */}
      {/* <Toaster position="top-right" reverseOrder={false} /> */}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center sm:text-left">
            Manage <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Schedule & Deliveries</span>
          </h1>
        </div>

        {/* FullCalendar Component */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            initialView="dayGridMonth"
            events={fullCalendarEvents}
            eventColor={primaryColor} // Default event color, can be overridden by individual event properties
            eventTextColor={textColor}
            height="auto" // Calendar height adjusts to content
            dayMaxEvents={true} // Shows "more" link if too many events
            eventClick={(info) => {
              // Open modal with the original item stored in extendedProps
              openModal(info.event.extendedProps.originalItem as UnifiedItem);
            }}
            eventClassNames={({ event }) => {
              // Add specific classes to events for custom styling in global.css
              const originalItem = event.extendedProps.originalItem as UnifiedItem;
              if ('service' in originalItem) return ['event-appointment'];
              return ['event-order'];
            }}
            noEventsContent={() => (
              <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500 dark:text-gray-400">
                <CalendarDaysIcon className="w-16 h-16 mb-3" />
                <p className="text-lg font-semibold">No events scheduled for this view.</p>
                <p className="text-sm">Try navigating to a different date or changing the view.</p>
              </div>
            )}
            loading={(isLoadingFullCalendar) => {
                if (isLoadingFullCalendar) {
                    return (
                        <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 z-10">
                            <ArrowPathIcon className="w-8 h-8 animate-spin mr-2" />
                            Loading calendar events...
                        </div>
                    );
                }
                return null;
            }}
          />
        </motion.div>

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
                    <span className="font-semibold">Scheduled:</span> {selectedItem.date} @ {selectedItem.timeSlot}
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
    </div>
  );
}