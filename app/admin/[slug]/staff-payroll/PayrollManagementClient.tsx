"use client";

import React, { useState, useEffect } from "react";
import { 
  BanknotesIcon, 
  ArrowDownTrayIcon, 
  DocumentCheckIcon, 
  CalculatorIcon, 
  ArrowUpRightIcon,
  SunIcon,
  MoonIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import EditSalaryModal from "./EditSalaryModal";
import PayslipPreviewModal from "./PayslipPreviewModal";
import BoardApprovalToggle from "./BoardApprovalToggle";

interface PayrollRow {
  id: string;
  staff: string;
  base: number;
  tax: number;
  net: number;
  status: string;
  bankAccount?: string;
  bankCode?: string;
}

interface PayrollSummary {
  totalLiability: number;
  totalTax: number;
}

interface PayrollManagementClientProps {
  initialData: {
    data?: PayrollRow[];
    summary?: PayrollSummary;
  };
  initialStaff: any[];
  companyId: string;
}

const PayrollManagementClient = ({ initialData, initialStaff, companyId }: PayrollManagementClientProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"logs" | "setup">("logs");
  const [previewData, setPreviewData] = useState<PayrollRow | null>(null);
  const [payrollData, setPayrollData] = useState<PayrollRow[]>(initialData?.data || []);
  const [isLocked, setIsLocked] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [summary, setSummary] = useState<PayrollSummary>(
    initialData?.summary || { totalLiability: 0, totalTax: 0 }
  );

  const missingCount = payrollData.filter((p) => !p.bankAccount || !p.bankCode).length;

  // Sync systemic theme wrapper with document standard
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const runPayroll = async () => {
    setIsProcessing(true);
    // Simulate a heavy processing task
    await new Promise((r) => setTimeout(r, 2000));
    
    try {
      const res = await fetch(`/api/admin/payroll?companyId=${companyId}`);
      if (!res.ok) throw new Error("Calculation failure");
      const json = await res.json();
      setPayrollData(json.data);
      setSummary(json.summary);
      toast.success("Monthly payroll batch compiled and synchronized");
    } catch (err) {
      toast.error("Calculation Engine Error: Check tax thresholds");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            fontSize: "12px",
            fontWeight: "bold"
          }
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">

        {/* Top Control Utility Bar */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Treasury & Statutory Compliance Roster
            </span>
          </div>
          
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all shadow-sm"
            aria-label="Toggle structural light/dark themes"
          >
            {darkMode ? <SunIcon className="h-4 w-4" />} : <MoonIcon className="h-4 w-4" />}
          </button> */}
        </div>

        {/* Header Action Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-450 text-[10px] font-black uppercase tracking-[0.2em]">Accounting Ledger</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Payroll Engine
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm font-medium">
              Manage salary components, track corporate tax withholdings, and execute scheduled monthly disbursements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto shrink-0">
            <button 
              onClick={() => setIsSalaryModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <CalculatorIcon className="h-4 w-4" /> Edit Salary Structure
            </button>             
            <button 
              onClick={runPayroll}
              disabled={isProcessing || isLocked}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-950 text-white disabled:text-slate-400 dark:disabled:text-slate-650 border border-transparent dark:disabled:border-slate-850 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:shadow-none shadow-sm shadow-amber-600/10"
            >
              <ArrowDownTrayIcon className={`h-4 w-4 ${isProcessing ? "animate-bounce" : ""}`} /> 
              {isProcessing ? "Calculating..." : "Run Monthly Payroll"}
            </button>
          </div>
        </header>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Net Liability */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Total Net Liability</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">
                ${summary.totalLiability.toLocaleString()}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wide bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 w-fit">
              <CheckBadgeIcon className="h-3 w-3" /> Automated Computation
            </span>
            <BanknotesIcon className="h-16 w-16 absolute -right-3 -bottom-3 text-slate-200/20 dark:text-slate-800/10 rotate-12" />
          </div>

          {/* Tax Withholding */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Tax Withholding</p>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-500 mt-1">
                ${summary.totalTax.toLocaleString()}
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-slate-600 dark:text-slate-450 font-bold uppercase tracking-wide bg-slate-50 dark:bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-150 dark:border-slate-850 w-fit">
              Estimated Statutory Deduction (15%)
            </span>
          </div>

          {/* Next Pay Date */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-between h-36">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Next Pay Date</p>
              <h3 className="text-3xl font-black text-slate-950 dark:text-white mt-1">Jan 28th</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wide bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/30 w-fit">
              <CalendarDaysIcon className="h-3.5 w-3.5" /> Ready for Disbursement
            </span>
          </div>
        </div>

        {/* Payroll Table Board */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Internal Tab Bar & Heading */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/20">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
              <DocumentCheckIcon className="h-4.5 w-4.5 text-amber-500" />
              Payroll Management Workspace
            </h3>

            {/* Custom Tab Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 w-fit self-start md:self-auto">
              <button 
                onClick={() => setActiveSubTab("logs")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeSubTab === "logs" 
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                Disbursement Log
              </button>
              <button 
                onClick={() => setActiveSubTab("setup")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  activeSubTab === "setup" 
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200/50 dark:border-slate-800" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                }`}
              >
                Bank Setup 
                {missingCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {missingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {activeSubTab === "logs" ? (
            <>
              {/* --- DESKTOP TABLE VIEW --- */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest border-b border-slate-150 dark:border-slate-850">
                      <th className="p-6">Staff Member</th>
                      <th className="p-6">Base Salary</th>
                      <th className="p-6">Deductions (Tax)</th>
                      <th className="p-6">Net Payable</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {payrollData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-20 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                          No computed payroll logs found for this tracking period.
                        </td>
                      </tr>
                    ) : (
                      payrollData.map((row: PayrollRow) => (
                        <tr key={row.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-950/20 transition-colors">
                          <td className="p-6">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{row.staff}</p>
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-650">UID: {row.id.substring(0, 8)}</p>
                            </div>
                          </td>
                          <td className="p-6 font-mono text-xs text-slate-650 dark:text-slate-350">
                            ${row.base.toLocaleString()}
                          </td>
                          <td className="p-6 font-mono text-xs text-rose-600 dark:text-rose-450">
                            -${row.tax.toLocaleString()}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-950 dark:text-white">${row.net.toLocaleString()}</span>
                              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-450">
                                {row.status}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              <button 
                                className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                                title="Download Payslip PDF"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => setPreviewData(row)}
                                className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                                title="Preview Payslip"
                              >
                                <ArrowUpRightIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* --- MOBILE CARDS VIEW --- */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-850">
                {payrollData.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-550 text-xs italic">
                    No compiled payroll logs found for this tracking period.
                  </div>
                ) : (
                  payrollData.map((row: PayrollRow) => (
                    <div key={row.id} className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-sm font-black text-slate-950 dark:text-white">{row.staff}</h4>
                          <p className="text-[9px] font-mono text-slate-400 dark:text-slate-650 mt-0.5">UID: {row.id.substring(0, 8)}</p>
                        </div>

                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 text-emerald-755 dark:text-emerald-400">
                          {row.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Base Salary</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">${row.base.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Deductions</p>
                          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">-${row.tax.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">Net Payable</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">${row.net.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                        <button className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg">
                          <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setPreviewData(row)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
                        >
                          <ArrowUpRightIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* --- BANK SETUP DIRECTORY PANEL --- */
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-white">Active Payment Routing Diagnostics</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payrollData.map((row) => {
                  const hasBank = row.bankAccount && row.bankCode;
                  return (
                    <div 
                      key={row.id} 
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                        hasBank 
                          ? "bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850" 
                          : "bg-rose-50/20 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/30"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-950 dark:text-white">{row.staff}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono mt-0.5">
                          {hasBank ? `${row.bankCode} • ${row.bankAccount}` : "Missing settlement destination"}
                        </p>
                      </div>

                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        hasBank 
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-450" 
                          : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/20 text-rose-700 dark:text-rose-450 animate-pulse"
                      }`}>
                        {hasBank ? "Configured" : "Required"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Board Approval Container Wrapper */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <BoardApprovalToggle 
            companyId={companyId} 
            initialLocked={isLocked} 
            onLockChange={(val: boolean) => setIsLocked(val)} 
          />
        </div>
      </div>

      <EditSalaryModal 
        isOpen={isSalaryModalOpen} 
        onClose={() => setIsSalaryModalOpen(false)} 
        companyId={companyId}
        onSuccess={runPayroll}
      />

      <PayslipPreviewModal 
        isOpen={!!previewData} 
        onClose={() => setPreviewData(null)} 
        data={previewData} 
      />
      
    </main>
  );
};

export default PayrollManagementClient;