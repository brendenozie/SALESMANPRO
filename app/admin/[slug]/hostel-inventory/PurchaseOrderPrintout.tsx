"use client";

import React from "react";

const PurchaseOrderPrintout = ({ data }: { data: any }) => {
  if (!data) return null;
  const { poNumber, vendor, company, items } = data;

  return (
    <div className="hidden print:block p-12 bg-white text-black min-h-screen">
      <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Purchase Order</h1>
          <p className="text-sm font-mono mt-1">Ref: {poNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">{company.name}</h2>
          <p className="text-xs text-slate-600">{company.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Vendor</p>
          <p className="font-bold">{vendor.name}</p>
          <p className="text-sm">{vendor.email}</p>
          <p className="text-sm">{vendor.phone}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Ship To</p>
          <p className="font-bold">Hostel Receiving Dept.</p>
          <p className="text-sm">{company.address}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-12">
        <thead>
          <tr className="bg-slate-100 text-[10px] font-black uppercase">
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-center">Qty</th>
            <th className="p-4 text-right">Unit Price</th>
            <th className="p-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, i: number) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="p-4 text-sm font-medium">{item.item}</td>
              <td className="p-4 text-center text-sm">{item.orderQty}</td>
              <td className="p-4 text-right text-sm">${item.unitPrice || 0}</td>
              <td className="p-4 text-right text-sm font-bold">${(item.orderQty * (item.unitPrice || 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${data.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-black border-t-2 border-black pt-2">
            <span>Total Due</span>
            <span>${data.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <footer className="mt-24 pt-8 border-t border-slate-200 text-[10px] text-slate-400 uppercase font-bold text-center">
        This is an electronically generated document. No signature required.
      </footer>
    </div>
  );
};

export default PurchaseOrderPrintout;