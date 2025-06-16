"use client";

import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PlusIcon,
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
  const [formMode, setFormMode] = useState<"edit" | "create">("edit");
  const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>({
    name: "",
    category: "",
    price: 0,
    duration: "",
    provider: { name: "", email: "", phone: "" },
    status: "Active",
  });

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const openModal = (svc?: ServiceItem) => {
    if (svc) {
      setFormMode("edit");
      setSelected(svc);
      setFormData({
        name: svc.name,
        category: svc.category,
        price: svc.price,
        duration: svc.duration,
        provider: { ...svc.provider },
        status: svc.status,
      });
    } else {
      setFormMode("create");
      setSelected(null);
      setFormData({ name: "", category: "", price: 0, duration: "", provider: { name: "", email: "", phone: "" }, status: "Active" });
    }
  };

  const closeModal = () => {
    setSelected(null);
    setFormData({ name: "", category: "", price: 0, duration: "", provider: { name: "", email: "", phone: "" }, status: "Active" });
  };

  const saveService = () => {
    if (formMode === "edit" && selected) {
      setServices((prev) => prev.map((s) => s.id === selected.id ? { ...selected, ...formData } : s));
    } else {
      const newService: ServiceItem = {
        id: `svc_${Date.now()}`,
        ...formData,
      };
      setServices((prev) => [newService, ...prev]);
    }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-800">Services</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Add Service
        </button>
      </div>

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
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {(selected !== null || formMode === "create") && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative overflow-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold mb-4 text-gray-800">
              {formMode === "create" ? "Add New Service" : `Edit: ${selected?.name}`}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <label className="block">
                <span className="text-gray-700">Name</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Category</span>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </label>

              <div className="flex gap-4">
                <label className="flex-1 block">
                  <span className="text-gray-700">Price ($)</span>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </label>
                <label className="flex-1 block">
                  <span className="text-gray-700">Duration</span>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </label>
              </div>

              <fieldset className="border-t pt-4">
                <legend className="text-gray-700">Provider Info</legend>
                <label className="block mt-2">
                  <span className="text-gray-700">Name</span>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                    value={formData.provider.name}
                    onChange={(e) => setFormData({ ...formData, provider: { ...formData.provider, name: e.target.value } })}
                  />
                </label>
                <label className="block mt-2">
                  <span className="text-gray-700">Email</span>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                    value={formData.provider.email}
                    onChange={(e) => setFormData({ ...formData, provider: { ...formData.provider, email: e.target.value } })}
                  />
                </label>
                <label className="block mt-2">
                  <span className="text-gray-700">Phone</span>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                    value={formData.provider.phone}
                    onChange={(e) => setFormData({ ...formData, provider: { ...formData.provider, phone: e.target.value } })}
                  />
                </label>
              </fieldset>

              <div className="mt-4">
                <span className="text-gray-700">Status</span>
                <select
                  className="mt-1 block w-full rounded-lg border-gray-300 p-2"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceItem["status"] })}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeModal}
                className="px-6 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveService}
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                {formMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
