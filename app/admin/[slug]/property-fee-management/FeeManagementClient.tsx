"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { 
  BanknotesIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  FunnelIcon,
  ArrowUpRightIcon,
  XMarkIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

// 1. Updated Interface to accept necessary relational data
interface FeeManagementClientProps {
  initialFees: any[];
  analytics: any;
  companyId: string;
  activeMembers: any[]; // Array of active hostel members to populate the dropdown
  rooms: any[];         // Array of available rooms
}

const FeeManagementClient: React.FC<FeeManagementClientProps> = ({ 
  initialFees, 
  analytics, 
  companyId,
  activeMembers,
  rooms
}) => {
  const router = useRouter();
  const [fees, setFees] = useState(initialFees);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    hostelMemberId: "",
    roomId: "",
    rentAmount: "",
    messAmount: "",
    dueDate: "",
  });

  // Handle Form Inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // get rentPerMonth from selected room to auto-fill rentAmount when room is selected
    if (e.target.name === "roomId") {
      const selectedRoom = rooms.find(room => room.id === e.target.value);
      if (selectedRoom) {
        setFormData(prev => ({
          ...prev,
          rentAmount: selectedRoom.rentPerMonth.toString()
        }));
      }
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create New Fee Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/property/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Generate a random invoice number for now, or handle on backend
          invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`, 
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to create invoice");

      toast.success("Invoice generated successfully!");
      setIsModalOpen(false);
      
      // Reset form
      setFormData({ hostelMemberId: "", roomId: "", rentAmount: "", messAmount: "", dueDate: "" });
      
      // Refresh server data
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Collect Payment (Existing logic)
  const handleCollectPayment = async (feeId: string, currentTotal: number) => {
    const inputAmount = window.prompt(`Enter amount received for this invoice (Total: $${currentTotal}):`);
    if (!inputAmount) return; 
    
    const paymentAmount = parseFloat(inputAmount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/property/fees/${feeId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: paymentAmount }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to process payment");

      if (json.data.addedToWallet > 0) {
        toast.success(`Paid! $${json.data.addedToWallet.toFixed(2)} added to student wallet.`);
      } else {
        toast.success("Payment processed successfully!");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Financial Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Monthly Audit
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>
        </header>

        {/* Revenue Analytics (Unchanged) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Revenue</p>
            <h3 className="text-3xl font-black text-white mt-1">${analytics?.expectedRevenue?.toFixed(2) || '0.00'}</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
            <h3 className="text-3xl font-black text-rose-500 mt-1">$3,420.15</h3>
            <p className="mt-4 text-[10px] text-slate-500 font-medium">From 12 Residents</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Rate</p>
            <h3 className="text-3xl font-black text-white mt-1">92.4%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%]" />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-400" />
              Resident Invoices
            </h3>
            <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
              <FunnelIcon className="h-4 w-4" /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Resident / Invoice</th>
                  <th className="p-6">Hostel Rent</th>
                  <th className="p-6">Mess Bill</th>
                  <th className="p-6">Total Amount</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {fees && fees.map((inv) => (
                  <tr key={inv.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{inv.studentName || 'Unknown Student'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-600">{inv.invoiceNumber}</span>
                        <span className="h-1 w-1 bg-slate-800 rounded-full" />
                        <span className="text-[10px] text-slate-500">Room {inv.room?.roomNumber}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${inv.rentAmount.toFixed(2)}</td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${inv.messAmount.toFixed(2)}</td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white">${inv.totalAmount.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                        Due: {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        inv.status === 'OVERDUE' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {inv.status === 'PAID' ? <CheckBadgeIcon className="h-3 w-3" /> : <ExclamationCircleIcon className="h-3 w-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleCollectPayment(inv.id, inv.totalAmount)}
                        disabled={isProcessing || inv.status === 'PAID'}
                        className="p-2 text-slate-600 hover:text-emerald-400 transition-colors disabled:opacity-50"
                      >
                        <ArrowUpRightIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- CREATE INVOICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
          <div className="bg-[#0A0D14] border border-slate-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Generate Invoice</h2>
            
            <form onSubmit={handleCreateInvoice} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resident</label>
                <select 
                  name="hostelMemberId"
                  value={formData.hostelMemberId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select Resident</option>
                  {activeMembers?.map(member => (
                    <option key={member.id} value={member.id}>{member.consumer?.user?.name || 'Unnamed'} ({member.memberId})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Room</label>
                <select 
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select Room</option>
                  {rooms?.map(room => (
                    <option key={room.id} value={room.id}>Room {room.roomNumber}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rent Amount</label>
                  <input 
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-slate-900/50 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mess Amount</label>
                  <input 
                    type="number"
                    name="messAmount"
                    value={formData.messAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0.00"
                    className="w-full bg-slate-900/50 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
                <input 
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 color-scheme-dark"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold py-3 transition-all disabled:opacity-50"
                >
                  {isProcessing ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default FeeManagementClient;