"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { OrderItem } from "./page";

export interface AppointmentItem {
  id: string;
  service: string;
  date: string;   // YYYY-MM-DD
  timeSlot: string;   // e.g. "10:00 AM"
  client: {
    name: string;
    email: string;
    phone: string;
  };
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

interface Props {
  initialAppointments: AppointmentItem[];
  initialOrderItems: OrderItem[];
}

export default function AdminAppointmentsClient({ initialAppointments, initialOrderItems }: Props) {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selected, setSelected] = useState<AppointmentItem | null>(null);
  const [newStatus, setNewStatus] = useState<AppointmentItem["status"]>("Scheduled");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [rider, setRider] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialOrderItems);

  // on mount, load sample data
  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const openModal = (apt: AppointmentItem) => {
    setSelected(apt);
    setNewStatus(apt.status);
  };
  const closeModal = () => setSelected(null);

  const updateOrder = async () => {
    if (!selectedOrder) return;
  
    const res = await fetch(
      `/api/admin/orders/${selectedOrder.id}?status=${encodeURIComponent(
        status
      )}&riderId=${encodeURIComponent(rider)}`,
      {
        method: "PUT",
      }
    );
  
    const data = await res.json();
  
    if (!res.ok || !data.success) {
      alert("Failed to update order");
      return;
    }
  
    // Optimistically update UI
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === selectedOrder.id
          ? {
              ...item,
              order: {
                ...item.order,
                status,
                rider,
              },
            }
          : item
      )
    );
  
    alert("Order updated successfully");
    closeModal();
  };

  const saveStatus = () => {
    if (!selected) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === selected.id ? { ...a, status: newStatus } : a
      )
    );
    closeModal();
  };

  const badge = (status: AppointmentItem["status"]) => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
          <CheckCircleIcon className="w-4 h-4" /> Completed
        </span>
      );
    }
    if (status === "Scheduled") {
      return (
        <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
          <ClockIcon className="w-4 h-4" /> Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
        <XMarkIcon className="w-4 h-4" /> Cancelled
      </span>
    );
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-5xl font-extrabold text-center dark:text-white mb-12">
        Appointments
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {initialOrderItems.map((apt) => (
          <div
            key={apt.id}
            onClick={() => "openModal(apt)"}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform hover:scale-[1.02] transition"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold">{apt.marketplaceListing?.name || apt.marketplaceListing?.title || apt.order?.name ||apt.order?.title || apt.order?.consumer?.name || apt.order?.name || apt.order?.email || "N/A"}</h2>
              {badge((apt.status ?? "Scheduled") as AppointmentItem["status"])}
            </div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">When:</span> {apt.date} at {apt.timeSlot}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Client:</span> {apt.order?.name || apt.order?.consumer?.name || apt.order?.email || "N/A"}
            </p>
            {/* {apt.notes && (
              <p className="text-gray-500 italic text-sm">&ldquo;{apt.notes}&rdquo;</p>
            )} */}
          </div>
        ))}
        
        {appointments.map((apt) => (
          <div
            key={apt.id}
            onClick={() => openModal(apt)}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer transform hover:scale-[1.02] transition"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold">{apt.service}</h2>
              {badge(apt.status)}
            </div>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">When:</span> {apt.date} at {apt.timeSlot}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Client:</span> {apt.client.name}
            </p>
            {apt.notes && (
              <p className="text-gray-500 italic text-sm">&ldquo;{apt.notes}&rdquo;</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold mb-4">{selected.service}</h3>

            <div className="space-y-2 mb-6">
              <p>
                <span className="font-medium">Date & Time:</span> {selected.date} @ {selected.timeSlot}
              </p>
              <p>
                <span className="font-medium">Client:</span> {selected.client.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selected.client.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {selected.client.phone}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <div className="flex gap-3">
                {["Scheduled", "Completed", "Cancelled"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s as AppointmentItem["status"])}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      newStatus === s
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <PencilSquareIcon className="w-5 h-5 inline-block mr-2" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveStatus}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
