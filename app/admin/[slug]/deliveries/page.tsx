"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  QueueListIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

/* =========================================================
   TYPES
========================================================= */

type DeliveryStatus =
  | "PENDING"
  | "INPROGRESS"
  | "DELIVERED"
  | "CANCELLED";

interface Order {
  id: string;
  productName: string;
  totalFinalPrice: number;
  lat?: number;
  lng?: number;
  deliveryAddress: string;
  pickupAddress: string;
  customerName: string;
  customerPhone?: string;
  weight?: number;
}

interface Rider {
  id: string;
  name: string;
}

interface Delivery {
  id: string;
  trackingNumber: string;
  status: DeliveryStatus;
  riderId?: string;
  riderName?: string;

  pickupAddress?: string;
  deliveryAddress?: string;

  packageDescription?: string;
  packageValue?: number;
  weightKg?: number;
  deliveryFee?: number;

  orderIds?: string[];
  scheduledFor?: string;
  createdAt?: string;
}

/* =========================================================
   CONFIG
========================================================= */

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

/* =========================================================
   HELPERS
========================================================= */

const statusLabel = (status: DeliveryStatus) => {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "INPROGRESS":
      return "In Progress";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

const statusColor = (status: DeliveryStatus) => {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "INPROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildAggregateFromOrders = (
  selectedIds: string[],
  allOrders: Order[]
) => {
  const selected = allOrders.filter((o) => selectedIds.includes(o.id));

  return {
    packageDescription: selected.map((o) => o.productName).join(", "),
    packageValue: selected.reduce(
      (sum, item) => sum + item.totalFinalPrice,
      0
    ),
    weightKg: selected.reduce(
      (sum, item) => sum + (item.weight || 0.5),
      0
    ),
    pickupAddress: selected[0]?.pickupAddress || "",
    deliveryAddress:
      selected.length > 1
        ? `${selected.length} Stops`
        : selected[0]?.deliveryAddress || "",
    customerName: selected[0]?.customerName || "",
  };
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color,
}: any) => (
  <div
    className={`${color} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden`}
  >
    <div className="absolute -right-4 -bottom-4 opacity-10">
      <Icon className="h-28 w-28" />
    </div>

    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-black opacity-70">
          {title}
        </p>
        <h3 className="text-4xl font-black mt-2">{value}</h3>
      </div>

      <div className="p-3 rounded-2xl bg-white/15">
        <Icon className="h-7 w-7" />
      </div>
    </div>
  </div>
);

/* =========================================================
   MODAL
========================================================= */

/* =========================================================
   MODAL V2 — VelocityHub Dispatch Builder
========================================================= */

function DeliveryModal({
  isOpen,
  onClose,
  riders,
  orders,
  delivery,
  onSave,
  isSubmitting,
}: any) {
  const [form, setForm] = useState<any>({
    status: "PENDING",
    orderIds: [],
    deliveryFee: 150,
  });

  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const [clusteredOrders, setClusteredOrders] = useState<any[]>([]);

  /* =========================================================
     INIT
  ========================================================= */

  useEffect(() => {
    if (!isOpen) return;

    if (delivery) {
      setForm(delivery);

      const selected = orders.filter((o: any) =>
        delivery.orderIds?.includes(o.id)
      );

      setSelectedOrders(selected.length>0 ? selected : delivery.CustomerOrders || []);
    } else {
      setForm({
        status: "PENDING",
        orderIds: [],
        deliveryFee: 150,
        trackingNumber: `VH-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`,
      });

      setSelectedOrders([]);
    }
  }, [delivery, isOpen, orders]);

  /* =========================================================
     GROUP ORDERS BY LOCATION
  ========================================================= */

  useEffect(() => {
    const grouped: Record<string, any[]> = {};

    orders
      .filter(
        (o: any) =>
          o.customerName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          o.deliveryAddress
            ?.toLowerCase()
            .includes(search.toLowerCase())
      )
      .forEach((order: any) => {
        const zone =
          order.deliveryAddress?.split(",")[0]?.trim() ||
          "Unknown Area";

        if (!grouped[zone]) grouped[zone] = [];

        grouped[zone].push(order);
      });

    const clusters = Object.entries(grouped).map(
      ([area, items]) => ({
        area,
        items,
      })
    );

    setClusteredOrders(clusters);
  }, [orders, search]);

  /* =========================================================
     SELECT ORDER
  ========================================================= */

  const toggleOrder = (order: any) => {
    const exists = selectedOrders.find(
      (x) => x.id === order.id
    );

    let next = [];

    if (exists) {
      next = selectedOrders.filter(
        (x) => x.id !== order.id
      );
    } else {
      next = [...selectedOrders, order];
    }

    setSelectedOrders(next);
    syncForm(next);
  };

  const selectCluster = (cluster: any) => {
    const ids = new Set(
      selectedOrders.map((x) => x.id)
    );

    const merged = [...selectedOrders];

    cluster.items.forEach((o: any) => {
      if (!ids.has(o.id)) merged.push(o);
    });

    setSelectedOrders(merged);
    syncForm(merged);
  };

  /* =========================================================
     AGGREGATE DATA
  ========================================================= */

  const syncForm = (items: any[]) => {
    const totalValue = items.reduce(
      (sum, x) =>
        sum + Number(x.totalFinalPrice || 0),
      0
    );

    const weight = items.reduce(
      (sum, x) => sum + Number(x.weight || 1),
      0
    );

    setForm((prev: any) => ({
      ...prev,
      orderIds: items.map((x) => x.id),
      pickupAddress:
        items[0]?.pickupAddress || "",
      deliveryAddress:
        items.length > 1
          ? `${items.length} Stops`
          : items[0]?.deliveryAddress || "",
      packageDescription: items
        .map((x) => x.productName)
        .slice(0, 8)
        .join(", "),
      packageValue: totalValue,
      weightKg: weight,
    }));
  };

  if (!isOpen) return null;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">

        {/* HEADER */}
        <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {delivery
                ? "Update Dispatch Route"
                : "Create Smart Dispatch"}
            </h2>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500 mt-2">
              VelocityHub Enterprise Planner
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-12 w-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 p-8 max-h-[85vh] overflow-y-auto"
        >
          {/* =========================================================
              LEFT PANEL - ORDER CLUSTERS
          ========================================================= */}
          <div className="xl:col-span-6 space-y-5">

            <div className="flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-900">
                Select Orders
              </h3>

              <span className="text-xs font-bold uppercase text-slate-400">
                {orders.length} Available
              </span>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-4 text-slate-400" />

              <input
                placeholder="Search customer or address..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 font-semibold"
              />
            </div>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">

              {clusteredOrders.map(
                (cluster: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-slate-100 overflow-hidden"
                  >
                    <div className="p-4 bg-slate-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-slate-900">
                          📍 {cluster.area}
                        </h4>

                        <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                          {cluster.items.length} Nearby Orders
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          selectCluster(cluster)
                        }
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase"
                      >
                        Select Cluster
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">

                      {cluster.items.map((order: any) => {
                        const active =
                          selectedOrders.find(
                            (x) =>
                              x.id === order.id
                          );

                        return (
                          <button
                            type="button"
                            key={order.id}
                            onClick={() =>
                              toggleOrder(order)
                            }
                            className={`w-full text-left p-4 transition ${
                              active
                                ? "bg-indigo-50"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex justify-between gap-4">
                              <div>
                                <p className="font-black text-slate-900">
                                  {order.customerName}
                                </p>

                                <p className="text-sm text-slate-500 mt-1">
                                  {order.deliveryAddress}
                                </p>

                                <p className="text-xs text-slate-400 font-bold uppercase mt-2">
                                  {order.productName}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-black text-indigo-600">
                                  KES{" "}
                                  {Number(
                                    order.totalFinalPrice || 0
                                  ).toLocaleString()}
                                </p>

                                {active && (
                                  <p className="text-xs text-emerald-600 font-black mt-2">
                                    SELECTED
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* =========================================================
              RIGHT PANEL
          ========================================================= */}
          <div className="xl:col-span-6 space-y-6">

            {/* SUMMARY */}
            <div className="rounded-[2rem] bg-gradient-to-br from-indigo-700 to-indigo-950 text-white p-7 space-y-6 shadow-xl">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs uppercase opacity-70 font-black">
                    Tracking Number
                  </p>

                  <p className="font-mono text-xl font-bold mt-1">
                    {form.trackingNumber}
                  </p>
                </div>

                <TruckIcon className="h-10 w-10 opacity-30" />
              </div>

              <div className="grid grid-cols-3 gap-4">

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase opacity-60">
                    Stops
                  </p>

                  <p className="text-2xl font-black">
                    {selectedOrders.length}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase opacity-60">
                    Weight
                  </p>

                  <p className="text-2xl font-black">
                    {form.weightKg || 0}kg
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase opacity-60">
                    Value
                  </p>

                  <p className="text-lg font-black">
                    KES{" "}
                    {Number(
                      form.packageValue || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="grid md:grid-cols-2 gap-4">

              <textarea
                rows={3}
                placeholder="Pickup Address"
                value={form.pickupAddress || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pickupAddress:
                      e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <textarea
                rows={3}
                placeholder="Delivery Address"
                value={form.deliveryAddress || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryAddress:
                      e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <input
                placeholder="Package Description"
                value={
                  form.packageDescription || ""
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    packageDescription:
                      e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4 md:col-span-2"
              />

              <input
                type="number"
                placeholder="Delivery Fee"
                value={form.deliveryFee || 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryFee: Number(
                      e.target.value
                    ),
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <input
                type="datetime-local"
                value={
                  form.scheduledFor || ""
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    scheduledFor:
                      e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <select
                value={form.riderId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    riderId: e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4 md:col-span-2"
              >
                <option value="">
                  Assign Rider Later
                </option>

                {riders.map((r: any) => (
                  <option
                    key={r.id}
                    value={r.id}
                  >
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ACTION */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl"
            >
              {isSubmitting
                ? "Saving Route..."
                : delivery
                ? "Update Dispatch"
                : "Create Dispatch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function DeliveriesPage() {
  const { slug } = useParams();

  const companyId = Array.isArray(slug) ? slug[0] : slug;
  const navigate = (url: string) => {
    window.location.href = url;
  };

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<string>("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editing, setEditing] =
    useState<Delivery | null>(null);

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    setIsLoading(true);

    try {
      const query = new URLSearchParams({
        companyId,
        ...(filter !== "ALL" && { status: filter }),
      }).toString();

      const [dRes, rRes, oRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/deliveries?${query}`, {
          credentials: "include",
        }),
        fetch(
          `${apiBaseUrl}/admin/transport/store-drivers?companyId=${companyId}`,
          { credentials: "include" }
        ),
        fetch(
          `${apiBaseUrl}/admin/deliveries/orders?companyId=${companyId}`,
          { credentials: "include" }
        ),
      ]);

      const dJson = await dRes.json();
      const rJson = await rRes.json();
      const oJson = await oRes.json();

      setDeliveries(dJson.data || []);
      setRiders(rJson.data || []);

      const mappedOrders =
        (oJson.data.items || []).map((item: any) => ({
          id: item.id,
          productName:
            item.productName ||
            item.marketplaceListing?.name ||
            "Order Item",
          totalFinalPrice:
            item.totalFinalPrice ||
            item.price ||
            0,
          lat:
            item.shippingAddress?.lat ||
            item.deliveryLat,
          lng:
            item.shippingAddress?.lng ||
            item.deliveryLng,
          deliveryAddress:
            item.shippingAddress?.display_name ||
            item.deliveryAddress ||
            "Destination",
          pickupAddress:
            item.pickupAddress ||
            "Warehouse",
          customerName:
            item.name || "Customer",
          customerPhone:
            item.phone,
        })) || [];

      setOrders(mappedOrders);
    } catch (error) {
      toast.error("Failed to sync deliveries.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =======================================================
     SAVE
  ======================================================= */

  const saveDelivery = async (payload: any) => {
    setIsSubmitting(true);

    try {
      const method = editing ? "PATCH" : "POST";

      const url = editing
        ? `${apiBaseUrl}/admin/deliveries/${editing.id}`
        : `${apiBaseUrl}/admin/deliveries`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...payload,
          companyId,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success(
        editing
          ? "Delivery updated"
          : "Dispatch created"
      );

      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error("Could not save dispatch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteDelivery = async (id: string) => {
    if (!confirm("Delete this delivery?")) return;

    try {
      const res = await fetch(
        `${apiBaseUrl}/admin/deliveries/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error();

      toast.success("Deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* =======================================================
     FILTERED
  ======================================================= */

  const filtered = useMemo(() => {
    return deliveries.filter((d) => {
      const term = search.toLowerCase();

      return (
        d.trackingNumber
          ?.toLowerCase()
          .includes(term) ||
        d.riderName
          ?.toLowerCase()
          .includes(term) ||
        d.deliveryAddress
          ?.toLowerCase()
          .includes(term)
      );
    });
  }, [deliveries, search]);

  const stats = useMemo(() => {
    return {
      total: deliveries.length,
      active: deliveries.filter(
        (x) => x.status === "INPROGRESS"
      ).length,
      pending: deliveries.filter(
        (x) => x.status === "PENDING"
      ).length,
      done: deliveries.filter(
        (x) => x.status === "DELIVERED"
      ).length,
    };
  }, [deliveries]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 space-y-10">
      <Toaster position="bottom-center" />

      {/* HERO */}
      <div className="flex flex-col lg:flex-row justify-between gap-5">
        <div>
          <h1 className="text-5xl font-black text-indigo-950 tracking-tight">
            VelocityHub
          </h1>
          <p className="uppercase tracking-[0.35em] text-xs text-slate-400 font-bold mt-2">
            Logistics Operations Center
          </p>
        </div>

        <button
          onClick={() => {
            // deliveries-dispatch
            setEditing(null);
            //navigate to deliveries-dispatch page
            navigate(`/admin/${companyId}/deliveries-dispatch`);
          }}
          className="px-7 py-4 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest flex items-center gap-3"
        >
          <PlusCircleIcon className="h-6 w-6" />
          New Dispatch
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total"
          value={stats.total}
          icon={ArchiveBoxIcon}
          color="bg-indigo-950"
        />
        <SummaryCard
          title="In Progress"
          value={stats.active}
          icon={TruckIcon}
          color="bg-blue-600"
        />
        <SummaryCard
          title="Pending"
          value={stats.pending}
          icon={ClockIcon}
          color="bg-amber-500"
        />
        <SummaryCard
          title="Delivered"
          value={stats.done}
          icon={ClipboardDocumentCheckIcon}
          color="bg-emerald-600"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden">
        {/* Top Bar */}
        <div className="p-6 border-b flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative w-full lg:w-96">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search tracking / rider / destination"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl bg-slate-50 pl-12 pr-4 py-4"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "ALL",
              "PENDING",
              "INPROGRESS",
              "DELIVERED",
              "CANCELLED",
            ].map((x) => (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`px-4 py-3 rounded-xl text-xs font-black tracking-widest ${
                  filter === x
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-20 flex flex-col items-center">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-3 text-sm font-bold text-slate-400">
              Loading deliveries...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-6 py-4 text-xs">
                    Tracking
                  </th>
                  <th className="px-6 py-4 text-xs">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs">
                    Route
                  </th>
                  <th className="px-6 py-4 text-xs">
                    Rider
                  </th>
                  <th className="px-6 py-4 text-xs">
                    Fee
                  </th>
                  <th className="px-6 py-4 text-xs">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-black text-indigo-950">
                      #{row.trackingNumber}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-2 rounded-full border text-xs font-black ${statusColor(
                          row.status
                        )}`}
                      >
                        {statusLabel(row.status)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-xs text-slate-400 flex gap-2">
                          <MapPinIcon className="h-4 w-4" />
                          {row.pickupAddress}
                        </div>
                        <div className="font-bold text-sm flex gap-2">
                          <TruckIcon className="h-4 w-4 text-indigo-600" />
                          {row.deliveryAddress}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 font-semibold">
                      {row.riderName || "Unassigned"}
                    </td>

                    <td className="px-6 py-5 font-black text-emerald-600">
                      KES {row.deliveryFee || 0}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(row);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-xl bg-slate-100"
                        >
                          <PencilSquareIcon className="h-5 w-5 text-indigo-600" />
                        </button>

                        <button
                          onClick={() =>
                            deleteDelivery(row.id)
                          }
                          className="p-2 rounded-xl bg-slate-100"
                        >
                          <TrashIcon className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-slate-400 font-semibold"
                    >
                      No deliveries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <DeliveryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditing(null);
        }}
        riders={riders}
        orders={orders}
        delivery={editing}
        onSave={saveDelivery}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}