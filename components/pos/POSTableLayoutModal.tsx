"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  SparklesIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export interface RestaurantTableItem {
  id: string;
  tableNumber: string;
  name?: string | null;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "BILL_REQUESTED" | "CLEANING";
  areaId?: string | null;
}

export interface RestaurantAreaItem {
  id: string;
  name: string;
  slug: string;
  tables: RestaurantTableItem[];
}

const STATUS_STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  AVAILABLE: {
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    text: "text-emerald-400",
    ring: "ring-emerald-500/50",
    label: "Available",
  },
  OCCUPIED: {
    bg: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30",
    text: "text-rose-400",
    ring: "ring-rose-500/50",
    label: "Occupied",
  },
  BILL_REQUESTED: {
    bg: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30",
    text: "text-amber-400",
    ring: "ring-amber-500/50",
    label: "Bill Req.",
  },
  RESERVED: {
    bg: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/30",
    text: "text-purple-400",
    ring: "ring-purple-500/50",
    label: "Reserved",
  },
  CLEANING: {
    bg: "bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    text: "text-zinc-400",
    ring: "ring-zinc-500/50",
    label: "Cleaning",
  },
};

export default function POSTableLayoutModal({
  isOpen,
  onClose,
  companyId,
  selectedTableNumber,
  onSelectTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  selectedTableNumber?: string | null;
  onSelectTable: (table: RestaurantTableItem | null) => void;
}) {
  const [areas, setAreas] = useState<RestaurantAreaItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [transferringTable, setTransferringTable] = useState<RestaurantTableItem | null>(null);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadTables();
  }, [isOpen, companyId]);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/tables?companyId=${companyId}`);
      const data = await res.json();
      if (data.areas) {
        setAreas(data.areas);
      }
    } catch (e) {
      console.error("Failed to load restaurant tables:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (table: RestaurantTableItem, newStatus: string) => {
    try {
      await fetch("/api/pos/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STATUS",
          companyId,
          tableId: table.id,
          status: newStatus,
        }),
      });
      loadTables();
    } catch (e) {
      console.error("Update table status error:", e);
    }
  };

  const handleTransfer = async (targetTableNumber: string) => {
    if (!transferringTable || !targetTableNumber) return;
    setIsSaving(true);
    try {
      await fetch("/api/pos/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRANSFER_TABLE",
          companyId,
          fromTableNumber: transferringTable.tableNumber,
          toTableNumber: targetTableNumber,
        }),
      });
      setTransferringTable(null);
      loadTables();
    } catch (e) {
      console.error("Table transfer error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filter tables by selected area
  const visibleTables =
    selectedAreaId === "all"
      ? areas.flatMap((a) => a.tables)
      : areas.find((a) => a.id === selectedAreaId)?.tables || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Dine-In Floor Plan & Tables
                {selectedTableNumber && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    Selected: {selectedTableNumber}
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                Click any table to attach to current POS order, manage occupancy, or request bill
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {companyId && (
              <a
                href={`/admin/${companyId}/settings/tables`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 hover:bg-indigo-500/10 transition inline-flex items-center gap-1.5"
                title="Configure dining tables, add bar stools, and manage floor sections"
              >
                <span>Manage Tables & Bars</span>
                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {selectedTableNumber && (
              <button
                onClick={() => {
                  onSelectTable(null);
                  onClose();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 transition"
              >
                Clear Table Selection
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Area Navigation Tabs & Status Legend */}
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedAreaId("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedAreaId === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-white"
              }`}
            >
              All Areas ({areas.reduce((acc, a) => acc + a.tables.length, 0)})
            </button>
            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => setSelectedAreaId(area.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedAreaId === area.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-white"
                }`}
              >
                {area.name} ({area.tables.length})
              </button>
            ))}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            {Object.entries(STATUS_STYLES).map(([st, style]) => (
              <div key={st} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${style.bg} border`} />
                <span>{style.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floor Plan Visual Grid */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="text-center py-20 text-zinc-500 text-sm flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-5 h-5 animate-spin text-indigo-400" />
              Loading restaurant floor plan…
            </div>
          ) : visibleTables.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-sm">
              No tables configured in this area.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {visibleTables.map((table) => {
                const style = STATUS_STYLES[table.status] || STATUS_STYLES.AVAILABLE;
                const isCurrentSelected = selectedTableNumber === table.tableNumber;

                return (
                  <div
                    key={table.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                      style.bg
                    } ${
                      isCurrentSelected
                        ? "ring-2 ring-indigo-500 bg-indigo-950/40 border-indigo-500"
                        : ""
                    }`}
                  >
                    {/* Top Row: Table Name + Capacity */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xl font-black text-white">{table.tableNumber}</span>
                        {table.name && table.name !== `Table ${table.tableNumber}` && (
                          <p className="text-[10px] text-zinc-400 truncate max-w-[100px]">{table.name}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 flex items-center gap-1">
                        <UserGroupIcon className="w-3 h-3" />
                        {table.capacity}
                      </span>
                    </div>

                    {/* Middle Status Pill */}
                    <div className="my-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 border border-white/10 inline-block">
                        {style.label}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTable(table);
                          if (table.status === "AVAILABLE") {
                            handleUpdateStatus(table, "OCCUPIED");
                          }
                          onClose();
                        }}
                        className="flex-1 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                      >
                        {isCurrentSelected ? "Active" : "Select"}
                      </button>

                      {table.status === "OCCUPIED" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(table, "BILL_REQUESTED")}
                          title="Mark Bill Requested"
                          className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition"
                        >
                          Bill
                        </button>
                      )}

                      {table.status !== "AVAILABLE" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(table, "AVAILABLE")}
                          title="Vacate Table"
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition"
                        >
                          Vacate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
