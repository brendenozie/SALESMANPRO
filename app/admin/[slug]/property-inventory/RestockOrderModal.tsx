"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, TruckIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const RestockOrderModal = ({ inventory, schoolId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [poData, setPoData] = useState<any>(null);

const handleProcessPO = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/admin/hostel/inventory/po", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        vendorId: orderItems[0].vendorId, // Assuming group by vendor
        items: orderItems,
        companyId: schoolId 
      }),
    });

    const result = await res.json();
    if (result.success) {
      setPoData(result.poData);
      toast.success("PO Generated. Opening Print Dialog...");
      
      // Allow state to update then print
      setTimeout(() => {
        window.print();
        onSuccess();
        onClose();
      }, 500);
    }
  } catch (err) {
    toast.error("Failed to generate PO");
  } finally {
    setLoading(false);
  }
};

  // Auto-populate with low stock items on mount
  useEffect(() => {
    const lowStock = inventory?.filter((item: any) => item.stock <= item.min)
      .map((item: any) => ({
        ...item,
        orderQty: Math.max(item.min * 2 - item.stock, 5) // Suggested order amount
      }));
    setOrderItems(lowStock);
  }, [inventory]);

  const updateQty = (dbId: string, val: number) => {
    setOrderItems(prev => prev.map(item => 
      item.dbId === dbId ? { ...item, orderQty: Math.max(0, val) } : item
    ));
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) return toast.error("No items to order");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/hostel/inventory/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems, companyId: schoolId }),
      });

      if (res.ok) {
        toast.success("Restock Order Processed");
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error("Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-2xl rounded-[3rem] p-10 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TruckIcon className="h-6 w-6 text-teal-500" />
            <h2 className="text-3xl font-black text-white italic">Supply <span className="text-teal-500">Replenishment.</span></h2>
          </div>
          <p className="text-sm text-slate-500 font-medium font-mono">
            {orderItems?.length} items flagged for low stock levels.
          </p>
        </header>

        <div className="max-h-[400px] overflow-y-auto space-y-4 mb-8 pr-2 custom-scrollbar">
          {orderItems?.length > 0 ? (
            orderItems?.map((item) => (
              <div key={item.dbId} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group">
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{item.item}</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                    Current: <span className="text-rose-500 font-black">{item.stock}</span> / Min: {item.min} {item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <label className="text-[9px] font-black text-slate-600 uppercase mb-1">Order Qty</label>
                    <input 
                      type="number"
                      value={item.orderQty}
                      onChange={(e) => updateQty(item.dbId, parseInt(e.target.value))}
                      className="w-20 bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm text-teal-400 font-black focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500 text-sm italic">Inventory is healthy. No items require restocking.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="py-4 bg-slate-900 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:text-white transition-all"
          >
            Cancel Order
          </button>
          <button 
            disabled={loading || orderItems?.length === 0}
            onClick={handleSubmit}
            className="py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-teal-900/40 disabled:opacity-30"
          >
            {loading ? "Processing..." : "Confirm & Restock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestockOrderModal;