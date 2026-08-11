'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  TruckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  riders: any[];
  orders: any[];
  delivery: any;
  onSave: (payload: any) => void;
  isSubmitting: boolean;
}

export default function DeliveryModal({
  isOpen,
  onClose,
  riders,
  orders,
  delivery,
  onSave,
  isSubmitting,
}: DeliveryModalProps) {
  const [form, setForm] = useState<any>({
    status: 'PENDING',
    orderIds: [],
    deliveryFee: 150,
  });

  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
  const [clusteredOrders, setClusteredOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (delivery) {
      setForm(delivery);

      const selected = orders.filter((o: any) =>
        delivery.orderIds?.includes(o.id)
      );

      setSelectedOrders(selected.length > 0 ? selected : delivery.CustomerOrders || []);
    } else {
      setForm({
        status: 'PENDING',
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

  useEffect(() => {
    const grouped: Record<string, any[]> = {};

    orders
      .filter(
        (o: any) =>
          o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          o.deliveryAddress?.toLowerCase().includes(search.toLowerCase())
      )
      .forEach((order: any) => {
        const zone =
          order.deliveryAddress?.split(',')[0]?.trim() || 'Unknown Area';

        if (!grouped[zone]) grouped[zone] = [];

        grouped[zone].push(order);
      });

    const clusters = Object.entries(grouped).map(([area, items]) => ({
      area,
      items,
    }));

    setClusteredOrders(clusters);
  }, [orders, search]);

  const toggleOrder = (order: any) => {
    const exists = selectedOrders.find((x) => x.id === order.id);

    let next = [];

    if (exists) {
      next = selectedOrders.filter((x) => x.id !== order.id);
    } else {
      next = [...selectedOrders, order];
    }

    setSelectedOrders(next);
    syncForm(next);
  };

  const selectCluster = (cluster: any) => {
    const ids = new Set(selectedOrders.map((x) => x.id));

    const merged = [...selectedOrders];

    cluster.items.forEach((o: any) => {
      if (!ids.has(o.id)) merged.push(o);
    });

    setSelectedOrders(merged);
    syncForm(merged);
  };

  const syncForm = (items: any[]) => {
    const totalValue = items.reduce(
      (sum, x) => sum + Number(x.totalFinalPrice || 0),
      0
    );

    const weight = items.reduce(
      (sum, x) => sum + Number(x.weight || 1),
      0
    );

    setForm((prev: any) => ({
      ...prev,
      orderIds: items.map((x) => x.id),
      pickupAddress: items[0]?.pickupAddress || '',
      deliveryAddress:
        items.length > 1
          ? `${items.length} Stops`
          : items[0]?.deliveryAddress || '',
      packageDescription: items
        .map((x) => x.productName)
        .slice(0, 8)
        .join(', '),
      packageValue: totalValue,
      weightKg: weight,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        {/* HEADER */}
        <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {delivery ? 'Update Dispatch Route' : 'Create Smart Dispatch'}
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
          {/* LEFT PANEL - ORDER CLUSTERS */}
          <div className="xl:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-900">Select Orders</h3>

              <span className="text-xs font-bold uppercase text-slate-400">
                {orders.length} Available
              </span>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-4 text-slate-400" />

              <input
                placeholder="Search customer or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 font-semibold"
              />
            </div>

            <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-2">
              {clusteredOrders.map((cluster: any, idx: number) => (
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
                      onClick={() => selectCluster(cluster)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase"
                    >
                      Select Cluster
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {cluster.items.map((order: any) => {
                      const active = selectedOrders.find((x) => x.id === order.id);

                      return (
                        <button
                          type="button"
                          key={order.id}
                          onClick={() => toggleOrder(order)}
                          className={`w-full text-left p-4 transition ${
                            active ? 'bg-indigo-50' : 'hover:bg-slate-50'
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
                                KES{' '}
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
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
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
                  <p className="text-[10px] uppercase opacity-60">Stops</p>

                  <p className="text-2xl font-black">
                    {selectedOrders.length}
                  </p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase opacity-60">Weight</p>

                  <p className="text-2xl font-black">{form.weightKg || 0}kg</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] uppercase opacity-60">Value</p>

                  <p className="text-lg font-black">
                    KES {Number(form.packageValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="grid md:grid-cols-2 gap-4">
              <textarea
                rows={3}
                placeholder="Pickup Address"
                value={form.pickupAddress || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pickupAddress: e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <textarea
                rows={3}
                placeholder="Delivery Address"
                value={form.deliveryAddress || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deliveryAddress: e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <input
                placeholder="Package Description"
                value={form.packageDescription || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    packageDescription: e.target.value,
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
                    deliveryFee: Number(e.target.value),
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <input
                type="datetime-local"
                value={form.scheduledFor || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scheduledFor: e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4"
              />

              <select
                value={form.riderId || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    riderId: e.target.value,
                  })
                }
                className="rounded-2xl bg-slate-50 p-4 md:col-span-2"
              >
                <option value="">Assign Rider Later</option>

                {riders.map((r: any) => (
                  <option key={r.id} value={r.id}>
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
                ? 'Saving Route...'
                : delivery
                ? 'Update Dispatch'
                : 'Create Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}