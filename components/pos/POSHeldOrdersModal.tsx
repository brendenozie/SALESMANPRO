'use client';

import React from 'react';
import {
  XMarkIcon,
  ClockIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { POSHeldOrder } from '@/types/pos';

interface POSHeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: POSHeldOrder[];
  onResumeOrder: (heldOrder: POSHeldOrder) => void;
  onDeleteHeldOrder: (heldOrderId: string) => void;
  currencySymbol?: string;
}

export default function POSHeldOrdersModal({
  isOpen,
  onClose,
  heldOrders,
  onResumeOrder,
  onDeleteHeldOrder,
  currencySymbol = 'KES',
}: POSHeldOrdersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-md">
              <ClockIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Held & Open Orders ({heldOrders.length})
              </h3>
              <p className="text-xs text-slate-500">
                Resume active customer carts or suspended transactions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* List of Held Orders */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 custom-scroll">
          {heldOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShoppingBagIcon className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No orders are currently on hold
              </p>
              <p className="text-xs text-slate-400 mt-1">
                You can hold any active cart using the "Hold Order" button in checkout
              </p>
            </div>
          ) : (
            heldOrders.map((ho) => {
              const timeStr = new Date(ho.heldAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ho.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-600 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black rounded-lg">
                        HELD AT {timeStr}
                      </span>
                      {ho.tableNumber && (
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-black rounded-lg">
                          TABLE {ho.tableNumber}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        {ho.items.length} {ho.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="font-black text-slate-900 dark:text-white text-base">
                      {ho.customer ? ho.customer.name : 'Walk-in / Anonymous Customer'}
                    </div>

                    {ho.note && (
                      <div className="text-xs text-slate-500 italic">
                        "{ho.note}"
                      </div>
                    )}

                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                      <span>Total: <strong className="text-slate-900 dark:text-white font-mono">{currencySymbol} {ho.total.toFixed(2)}</strong></span>
                      {ho.discount > 0 && <span>Discount: -{ho.discount}%</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this held order? This action cannot be undone.')) {
                          onDeleteHeldOrder(ho.id);
                        }
                      }}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Discard held order"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResumeOrder(ho);
                        onClose();
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <ArrowUturnLeftIcon className="w-4 h-4" />
                      <span>Resume Order</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
