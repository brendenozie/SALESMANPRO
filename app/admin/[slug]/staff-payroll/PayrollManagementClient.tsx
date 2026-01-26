"use client";

import React, { useState, useEffect } from "react";
import { 
  BanknotesIcon, ArrowDownTrayIcon, DocumentCheckIcon, CalculatorIcon, 
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import EditSalaryModal from "./EditSalaryModal";
import PayslipPreviewModal from "./PayslipPreviewModal";
import BoardApprovalToggle from "./BoardApprovalToggle";

const PayrollManagementClient = ({ initialData, companyId }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("logs"); // "logs" or "setup"
  const [previewData, setPreviewData] = useState<any>(null);
  const [payrollData, setPayrollData] = useState(initialData?.data || []);
  const [isLocked, setIsLocked] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const missingCount = payrollData.filter((p: any) => !p.bankAccount || !p.bankCode).length;
  const [summary, setSummary] = useState(initialData?.summary || { totalLiability: 0, totalTax: 0 });

  const runPayroll = async () => {
    setIsProcessing(true);
    // Simulate a heavy processing task
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      const res = await fetch(`/api/admin/payroll?companyId=${companyId}`);
      const json = await res.json();
      setPayrollData(json.data);
      setSummary(json.summary);
      alert("Success: Monthly payroll batch generated and locked.");
    } catch (err) {
      alert("Error: Calculation engine failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Financial Compliance</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Engine.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button 
              onClick={() => setIsSalaryModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs"
            >
              <CalculatorIcon className="h-4 w-4" /> Edit Salary Structure
            </button>
             <button 
               onClick={runPayroll}
               disabled={isProcessing}
               className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-amber-900/40 disabled:opacity-50"
             >
                <ArrowDownTrayIcon className={`h-4 w-4 ${isProcessing ? 'animate-bounce' : ''}`} /> 
                {isProcessing ? 'Calculating...' : 'Run Monthly Payroll'}
             </button>
             <button 
                onClick={() => setIsSalaryModalOpen(true)}
                disabled={isLocked} // DISABLED WHEN LOCKED
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-xs"
              >
                <CalculatorIcon className="h-4 w-4" /> Salary Structures
              </button>
              <button 
                onClick={runPayroll}
                disabled={isProcessing || isLocked} // DISABLED WHEN LOCKED
                className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-amber-900/40 disabled:bg-slate-800 disabled:shadow-none"
              >
                <ArrowDownTrayIcon className="h-4 w-4" /> 
                {isProcessing ? 'Calculating...' : 'Run Monthly Payroll'}
              </button>
          </div>
        </header>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Net Liability</p>
                <h3 className="text-3xl font-black text-white mt-1">${summary.totalLiability.toLocaleString()}</h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                    Automated Calculation
                </div>
             </div>
             <BanknotesIcon className="h-24 w-24 absolute -right-6 -bottom-6 text-white/[0.03] rotate-12" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tax Withholding</p>
             <h3 className="text-3xl font-black text-rose-500 mt-1">${summary.totalTax.toLocaleString()}</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Estimated Income Tax (15%)</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-amber-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Pay Date</p>
             <h3 className="text-3xl font-black text-white mt-1">Jan 28th</h3>
             <p className="mt-4 text-[10px] text-amber-500 font-bold uppercase animate-pulse">Ready for Disbursement</p>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <DocumentCheckIcon className="h-5 w-5 text-amber-500" />
              Payroll Disbursement Log
            </h3>
          </div>

        <div className="flex gap-6 mb-6 border-b border-slate-800 pb-4">
          <button 
            onClick={() => setActiveSubTab("logs")}
            className={`text-[10px] font-black uppercase tracking-widest ${activeSubTab === "logs" ? "text-amber-500" : "text-slate-500"}`}
          >
            Disbursement Log
          </button>
          <button 
            onClick={() => setActiveSubTab("setup")}
            className={`text-[10px] font-black uppercase tracking-widest ${activeSubTab === "setup" ? "text-amber-500" : "text-slate-500"}`}
          >
            Bank Setup {missingCount > 0 && <span className="ml-2 bg-rose-600 text-white px-1.5 rounded-full">{missingCount}</span>}
          </button>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Base Salary</th>
                  <th className="p-6">Deductions (Tax)</th>
                  <th className="p-6">Net Payable</th>
                  <th className="p-6 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {payrollData.map((row: any) => (
                  <tr key={row.id} className="group hover:bg-amber-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{row.staff}</p>
                      <p className="text-[10px] font-mono text-slate-600">{row.id}</p>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${row.base.toLocaleString()}</td>
                    <td className="p-6 text-xs text-rose-500 font-mono">-${row.tax.toLocaleString()}</td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white italic">${row.net.toLocaleString()}</p>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {row.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => setPreviewData(row)}
                        className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all"
                        title="Preview Payslip"
                      >
                        <ArrowUpRightIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <EditSalaryModal 
        isOpen={isSalaryModalOpen} 
        onClose={() => setIsSalaryModalOpen(false)} 
        companyId={companyId}
        onSuccess={runPayroll} // Reuse the runPayroll function to refresh data
      />
      <PayslipPreviewModal 
        isOpen={!!previewData} 
        onClose={() => setPreviewData(null)} 
        data={previewData} 
      />
      <BoardApprovalToggle 
        companyId={companyId} 
        initialLocked={isLocked} 
        onLockChange={(val: boolean) => setIsLocked(val)} 
      />
    </main>
  );
};

export default PayrollManagementClient;