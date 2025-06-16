"use client";

import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  provider: {
    name: string;
    email: string;
    phone: string;
  };
  status: "Active" | "Pending" | "Completed";
}

interface Props {
  initialServices: ServiceItem[];
}

export default function AdminServicesClient({ initialServices }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceItem["status"]>("Active");

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const openModal = (svc: ServiceItem) => {
    setSelected(svc);
    setNewStatus(svc.status);
  };
  const closeModal = () => setSelected(null);

  const saveStatus = () => {
    if (!selected) return;
    setServices((prev) =>
      prev.map((s) =>
        s.id === selected.id ? { ...s, status: newStatus } : s
      )
    );
    closeModal();
  };

  const statusBadge = (status: ServiceItem["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
            <CheckCircleIcon className="w-4 h-4" /> Active
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <ClockIcon className="w-4 h-4" /> Pending
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full text-xs">
            <PencilSquareIcon className="w-4 h-4" /> Completed
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-12">
        Services
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((svc) => (
          <div
            key={svc.id}
            onClick={() => openModal(svc)}
            className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform hover:scale-[1.02] transition"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {svc.name}
              </h2>
              {statusBadge(svc.status)}
            </div>

            <p className="text-gray-600 mb-2">
              <span className="font-medium">Category:</span> {svc.category}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Price:</span> ${svc.price}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Duration:</span> {svc.duration}
            </p>

            <div className="text-gray-500 text-sm">
              <p>
                <span className="font-medium">Provider:</span> {svc.provider.name}
              </p>
              <p>Email: {svc.provider.email}</p>
              <p>Phone: {svc.provider.phone}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold mb-4 text-gray-800">
              {selected.name}
            </h3>

            <div className="space-y-2 mb-6 text-gray-700">
              <p>
                <span className="font-medium">Category:</span> {selected.category}
              </p>
              <p>
                <span className="font-medium">Price:</span> ${selected.price}
              </p>
              <p>
                <span className="font-medium">Duration:</span> {selected.duration}
              </p>
              <p>
                <span className="font-medium">Provider:</span> {selected.provider.name}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <div className="flex gap-3">
                {(["Active", "Pending", "Completed"] as ServiceItem["status"][]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      className={`flex-1 py-2 rounded-lg font-medium transition \
                        ${newStatus === s
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                      `}
                    >
                      {s}
                    </button>
                  )
                )}
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
