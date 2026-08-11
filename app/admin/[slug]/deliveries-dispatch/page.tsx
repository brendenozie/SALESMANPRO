"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  UserCircleIcon,
  CubeIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { findCompanyCached } from "@/lib/company-fetcher";

// ======================================================
// VelocityHub Dispatch Center V2
// Premium Enterprise Logistics Planner
// ======================================================

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

// ======================================================
// TYPES
// ======================================================

type Order = {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  productName: string;
  quantity: number;
  totalFinalPrice: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  pickupAddress?: string;
};

type Rider = {
  id: string;
  name: string;
};

type Cluster = {
  area: string;
  orders: Order[];
};

type DeliveryPayload = {
  riderId?: string;
  orderIds: string[];
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  packageValue: number;
  deliveryFee: number;
  companyId: string;
};

// ======================================================
// HELPERS
// ======================================================

const areaFromAddress = (address: string) => {
  if (!address) return "Unknown Zone";
  return address.split(",")[0].trim();
};

const currency = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);

// ======================================================
// COMPONENT
// ======================================================
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DispatchCenterV2({ params }: PageProps) {
  const { slug } = await params;

  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selected, setSelected] = useState<Order[]>([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [search, setSearch] = useState("");
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // ======================================================
  // FETCH DATA
  // ======================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [oRes, rRes] = await Promise.all([
        fetch(
          `${apiBaseUrl}/admin/deliveries/orders?companyId=${companyId}`
        ),
        fetch(
          `${apiBaseUrl}/admin/transport/store-drivers?companyId=${companyId}`
        ),
      ]);

      const oData = await oRes.json();
      const rData = await rRes.json();

      setOrders(oData?.data?.items || []);
      setRiders(rData?.data || []);
    } catch (err) {
      toast.error("Failed to sync dispatch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId]);

  // ======================================================
  // CLUSTERS
  // ======================================================

  const clusters = useMemo(() => {
    const grouped: Record<string, Order[]> = {};

    orders
      .filter(
        (o) =>
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.deliveryAddress?.toLowerCase().includes(search.toLowerCase())
      )
      .forEach((order) => {
        const zone = areaFromAddress(order.deliveryAddress);
        if (!grouped[zone]) grouped[zone] = [];
        grouped[zone].push(order);
      });

    return Object.entries(grouped).map(([area, orders]) => ({
      area,
      orders,
    }));
  }, [orders, search]);

  // ======================================================
  // SELECTION
  // ======================================================

  const toggleOrder = (order: Order) => {
    const exists = selected.find((x) => x.id === order.id);

    if (exists) {
      setSelected((prev) => prev.filter((x) => x.id !== order.id));
    } else {
      setSelected((prev) => [...prev, order]);
    }
  };

  const selectCluster = (cluster: Cluster) => {
    const ids = new Set(selected.map((x) => x.id));

    const merged = [...selected];

    cluster.orders.forEach((o) => {
      if (!ids.has(o.id)) merged.push(o);
    });

    setSelected(merged);
  };

  // ======================================================
  // SUMMARY
  // ======================================================

  const summary = useMemo(() => {
    const total = selected.reduce(
      (sum, x) => sum + Number(x.totalFinalPrice || 0),
      0
    );

    const fee = selected.length * 120;

    return {
      stops: selected.length,
      total,
      fee,
    };
  }, [selected]);

  // ======================================================
  // DISPATCH
  // ======================================================

  const dispatchRoute = async () => {
    if (!selected.length) return toast.error("Select at least one order");

    try {
      setDispatching(true);

      const payload: DeliveryPayload = {
        riderId: selectedRider || undefined,
        orderIds: selected.map((x) => x.orderId),
        pickupAddress: selected[0]?.pickupAddress || "Main Hub",
        deliveryAddress: `${selected.length} Stops`,
        packageDescription: selected
          .map((x) => x.productName)
          .slice(0, 8)
          .join(", "),
        packageValue: summary.total,
        deliveryFee: summary.fee,
        companyId: companyId as string,
      };

      const res = await fetch(`${apiBaseUrl}/admin/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success("Dispatch created successfully");
      setSelected([]);
      fetchData();
    } catch {
      toast.error("Failed to create dispatch");
    } finally {
      setDispatching(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-end lg:justify-between mb-10">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            VelocityHub
          </h1>
          <p className="uppercase tracking-[0.35em] text-xs font-bold text-indigo-500 mt-2">
            Dispatch Center V2
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-4 text-slate-400" />
          <input
            placeholder="Search address or customer..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 font-bold text-slate-500">
            Loading dispatch planner...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT PANEL */}
          <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-xl text-slate-900">
                Delivery Zones
              </h2>

              <span className="text-xs font-bold text-slate-400 uppercase">
                {orders.length} Orders
              </span>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
              {clusters.map((cluster) => (
                <div
                  key={cluster.area}
                  className="rounded-3xl border border-slate-100 overflow-hidden"
                >
                  <div className="p-5 bg-slate-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-indigo-600" />
                        {cluster.area}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase mt-1">
                        {cluster.orders.length} Stops Nearby
                      </p>
                    </div>

                    <button
                      onClick={() => selectCluster(cluster)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase"
                    >
                      Select Cluster
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cluster.orders.map((order) => {
                      const active = selected.find((x) => x.id === order.id);

                      return (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          key={order.id}
                          onClick={() => toggleOrder(order)}
                          className={`w-full text-left p-5 transition ${
                            active
                              ? "bg-indigo-50"
                              : "bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <h4 className="font-black text-slate-900">
                                {order.customerName}
                              </h4>
                              <p className="text-sm text-slate-500 mt-1">
                                {order.deliveryAddress}
                              </p>

                              <div className="flex gap-4 mt-3 text-xs font-bold text-slate-400 uppercase">
                                <span>{order.productName}</span>
                                <span>Qty {order.quantity}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-black text-indigo-700">
                                {currency(order.totalFinalPrice)}
                              </p>

                              {active && (
                                <CheckCircleIcon className="h-6 w-6 text-green-500 ml-auto mt-3" />
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="xl:col-span-5 space-y-8">
            {/* Summary */}
            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="h-7 w-7" />
                <h2 className="font-black text-2xl">Route Builder</h2>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between">
                  <span className="opacity-80">Stops</span>
                  <span className="font-black">{summary.stops}</span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-80">Package Value</span>
                  <span className="font-black">
                    {currency(summary.total)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="opacity-80">Delivery Fee</span>
                  <span className="font-black">
                    {currency(summary.fee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rider */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100">
              <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                Assign Rider
              </h3>

              <select
                value={selectedRider}
                onChange={(e) => setSelectedRider(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-200 font-semibold"
              >
                <option value="">Auto Assign Later</option>

                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Stops */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100">
              <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                <CubeIcon className="h-6 w-6 text-indigo-600" />
                Selected Stops
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selected.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <p className="font-bold text-slate-900">
                      {s.customerName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {s.deliveryAddress}
                    </p>
                  </div>
                ))}

                {!selected.length && (
                  <p className="text-slate-400 text-sm">
                    No stops selected yet.
                  </p>
                )}
              </div>
            </div>

            {/* Action */}
            <button
              disabled={dispatching}
              onClick={dispatchRoute}
              className="w-full py-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl"
            >
              {dispatching ? "Creating Route..." : "Dispatch Route"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}