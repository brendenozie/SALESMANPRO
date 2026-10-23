"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  CreditCardIcon, UserGroupIcon, PlusIcon, ArrowPathIcon,
  CheckCircleIcon, XMarkIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
  BanknotesIcon, DocumentTextIcon, ClockIcon, ChevronDownIcon,
  ArrowUpIcon, ArrowDownIcon, PrinterIcon
} from "@heroicons/react/24/outline";
import { executeUnifiedPrint } from "@/lib/printing/unifiedPrintClient";

interface CreditAccount {
  id: string;
  creditLimit: number;
  currentBalance: number;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  paymentTermDays: number;
  notes?: string;
  updatedAt: string;
  consumer: {
    id: string;
    user: { name: string; email: string; phone: string };
  };
  transactions?: CreditTx[];
}

interface CreditTx {
  id: string;
  txType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  reference?: string;
  dueDate?: string;
  clearedAt?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  SUSPENDED: "bg-yellow-500/20 text-yellow-400",
  CLOSED: "bg-slate-500/20 text-slate-400",
};

const TX_COLORS: Record<string, string> = {
  TOP_UP: "text-emerald-400",
  PURCHASE: "text-red-400",
  REPAYMENT: "text-blue-400",
  ADJUSTMENT: "text-yellow-400",
  REFUND: "text-cyan-400",
};

export default function CreditAccountsClient({ companyId, slug }: { companyId: string; slug: string }) {
  const [accounts, setAccounts] = useState<CreditAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalOwed, setTotalOwed] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState<{ account: CreditAccount; type: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // New account form
  const [newForm, setNewForm] = useState({ consumerPhone: "", creditLimit: 5000, paymentTermDays: 30, notes: "" });
  // Transaction form
  const [txForm, setTxForm] = useState({ amount: 0, reference: "", description: "" });

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/credit?companyId=${companyId}`);
      const data = await r.json();
      setAccounts(data.accounts ?? []);
      setTotalOwed(data.totalOwed ?? 0);
    } finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const loadAccount = async (id: string) => {
    const acct = accounts.find(a => a.id === id);
    if (!acct) return;
    const r = await fetch(`/api/credit?companyId=${companyId}&consumerId=${acct.consumer.id}`);
    const data = await r.json();
    setSelectedAccount(data.account);
  };

  const filtered = useMemo(() =>
    accounts.filter(a =>
      a.consumer.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.consumer.user.phone?.includes(search) ||
      a.consumer.user.email?.toLowerCase().includes(search.toLowerCase())
    ), [accounts, search]);

  const handlePrintThermalSlip = async (account: CreditAccount, tx: CreditTx) => {
    const isCredit = tx.amount > 0;
    const slipHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", monospace; font-size: 11px; color: #000; margin: 0; padding: 4px; }
            .text-center { text-align: center; }
            .header { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .title { font-size: 13px; font-weight: bold; margin: 4px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .big-amount { font-size: 16px; font-weight: bold; margin: 6px 0; text-align: center; }
            .footer { font-size: 9px; text-align: center; margin-top: 8px; color: #333; }
          </style>
        </head>
        <body>
          <div class="header text-center">
            <div style="font-size: 14px; font-weight: bold;">SALESMAN PRO</div>
            <div class="title">${tx.txType.replace(/_/g, " ")} SLIP</div>
            <div>${new Date(tx.createdAt).toLocaleString("en-KE")}</div>
          </div>
          <div class="row"><span>Customer:</span><strong>${account.consumer.user.name}</strong></div>
          <div class="row"><span>Phone:</span><span>${account.consumer.user.phone || "N/A"}</span></div>
          <div class="row"><span>Ref / Tx ID:</span><span>${tx.reference || tx.id.slice(-8).toUpperCase()}</span></div>
          <div class="divider"></div>
          <div class="big-amount">
            ${isCredit ? "+" : ""}${kes(tx.amount)}
          </div>
          <div class="divider"></div>
          <div class="row"><span>Balance Before:</span><span>${kes(tx.balanceBefore)}</span></div>
          <div class="row"><span>Balance After:</span><strong>${kes(tx.balanceAfter)}</strong></div>
          <div class="row"><span>Credit Limit:</span><span>${kes(account.creditLimit)}</span></div>
          <div class="row"><span>Available Credit:</span><strong style="color: #000;">${kes(Math.max(0, account.creditLimit - tx.balanceAfter))}</strong></div>
          <div class="divider"></div>
          <div class="footer">
            <div>Thank you for your business!</div>
            <div>Keep this slip as official proof of payment.</div>
          </div>
        </body>
      </html>
    `;

    try {
      await executeUnifiedPrint({
        jobId: `CREDIT-SLIP-${tx.id.slice(-6)}`,
        jobType: "RECEIPT",
        printerAction: "POS_RECEIPT",
        companyId,
        contentHtml: slipHtml,
        paperWidth: "80mm",
        copies: 1,
      }, slipHtml);
      showToast("Thermal slip sent to printer ✓");
    } catch {
      const w = window.open("", "_blank", "width=380,height=500");
      if (w) {
        w.document.write(slipHtml);
        w.document.close();
        w.focus();
        w.print();
      }
    }
  };

  const handlePrintStatement = async (account: CreditAccount) => {
    const txRows = (account.transactions ?? []).map(tx => `
      <tr>
        <td style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px;">${new Date(tx.createdAt).toLocaleDateString("en-KE")}</td>
        <td style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px;">${tx.txType.replace(/_/g, " ")}<br><small style="color:#666;">${tx.description || tx.reference || ""}</small></td>
        <td style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px; text-align: right; font-weight: bold; color: ${tx.amount > 0 ? '#16a34a' : '#dc2626'}">${tx.amount > 0 ? '+' : ''}${kes(tx.amount)}</td>
        <td style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px; text-align: right;">${kes(tx.balanceAfter)}</td>
      </tr>
    `).join("");

    const statementHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Statement - ${account.consumer.user.name}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; color: #111; margin: 0; padding: 10px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
            .summary-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 6px 4px; font-size: 10px; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="font-size: 18px; margin: 0; color: #1e293b;">CUSTOMER CREDIT STATEMENT</h1>
              <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Account Statement & Ledger History</p>
            </div>
            <div style="text-align: right; font-size: 11px;">
              <div>Date: <strong>${new Date().toLocaleDateString("en-KE")}</strong></div>
              <div>Account Status: <strong style="color: #16a34a;">${account.status}</strong></div>
            </div>
          </div>

          <div style="margin-bottom: 14px; font-size: 12px;">
            <strong>Customer Details:</strong>
            <div>Name: ${account.consumer.user.name}</div>
            <div>Phone: ${account.consumer.user.phone || "N/A"}</div>
            <div>Email: ${account.consumer.user.email || "N/A"}</div>
          </div>

          <div class="summary-box">
            <div><small style="color: #64748b;">CREDIT LIMIT</small><div style="font-size: 16px; font-weight: bold;">${kes(account.creditLimit)}</div></div>
            <div><small style="color: #64748b;">CURRENT OUTSTANDING</small><div style="font-size: 16px; font-weight: bold; color: ${account.currentBalance < 0 ? '#dc2626' : '#16a34a'};">${kes(account.currentBalance)}</div></div>
            <div><small style="color: #64748b;">AVAILABLE CREDIT</small><div style="font-size: 16px; font-weight: bold; color: #2563eb;">${kes(Math.max(0, account.creditLimit - account.currentBalance))}</div></div>
          </div>

          <h3 style="font-size: 13px; margin: 16px 0 6px;">Transaction History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type & Reference</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: right;">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              ${txRows || '<tr><td colspan="4" style="text-align:center; padding: 12px; color: #666;">No recorded transactions</td></tr>'}
            </tbody>
          </table>

          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; text-align: center;">
            Terms: Payment due within ${account.paymentTermDays} days of purchase. Please include your phone number as reference on all payments.
          </div>
        </body>
      </html>
    `;

    try {
      await executeUnifiedPrint({
        jobId: `STMT-${account.id.slice(-6)}`,
        jobType: "REPORT",
        printerAction: "A4_PRINT",
        companyId,
        contentHtml: statementHtml,
        paperWidth: "80mm",
        copies: 1,
      }, statementHtml);
      showToast("Statement dispatched to printer ✓");
    } catch {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(statementHtml);
        w.document.close();
        w.focus();
        w.print();
      }
    }
  };

  const openAccount = async () => {
    setSaving(true);
    try {
      // First find consumer by phone
      const cr = await fetch(`/api/credit?companyId=${companyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "OPEN_ACCOUNT",
          companyId,
          consumerId: newForm.consumerPhone, // will resolve server-side — for now pass phone as placeholder
          creditLimit: newForm.creditLimit,
          paymentTermDays: newForm.paymentTermDays,
          notes: newForm.notes,
        }),
      });
      const data = await cr.json();
      if (!cr.ok) throw new Error(data.error);
      showToast("Credit account opened ✓");
      setShowNewModal(false);
      load();
    } catch (e: any) { showToast(e.message, false); }
    finally { setSaving(false); }
  };

  const recordTx = async () => {
    if (!showTxModal) return;
    setSaving(true);
    try {
      const r = await fetch("/api/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: showTxModal.type,
          companyId,
          consumerId: showTxModal.account.consumer.id,
          amount: txForm.amount,
          reference: txForm.reference,
          description: txForm.description,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      showToast(`${showTxModal.type.replace("_", " ")} recorded ✓`);
      setShowTxModal(null);
      load();
      if (selectedAccount?.id === showTxModal.account.id) {
        loadAccount(showTxModal.account.id);
      }
    } catch (e: any) { showToast(e.message, false); }
    finally { setSaving(false); }
  };

  const kes = (n: number) => `KES ${Math.abs(n).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white font-semibold ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.ok ? <CheckCircleIcon className="h-5 w-5" /> : <XMarkIcon className="h-5 w-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-blue-600/30"><CreditCardIcon className="h-7 w-7 text-blue-300" /></div>
            <h1 className="text-3xl font-black text-white">Credit Accounts</h1>
          </div>
          <p className="text-slate-400 text-sm ml-14">Run-on-account, credit limits & aging statements</p>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all">
          <PlusIcon className="h-4 w-4" /> Open Credit Account
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Accounts", value: accounts.length, icon: UserGroupIcon, color: "from-blue-600 to-blue-400" },
          { label: "Total Outstanding", value: kes(totalOwed), icon: ExclamationTriangleIcon, color: "from-red-600 to-red-400" },
          { label: "Active Accounts", value: accounts.filter(a => a.status === "ACTIVE").length, icon: CheckCircleIcon, color: "from-emerald-600 to-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}><Icon className="h-6 w-6 text-white" /></div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone or email..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><ArrowPathIcon className="h-8 w-8 animate-spin text-blue-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-white/10">
                  {["Customer", "Credit Limit", "Balance", "Status", "Payment Term", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(acct => {
                  const balance = acct.currentBalance;
                  const available = acct.creditLimit + balance;
                  const overdue = balance < 0;
                  return (
                    <tr key={acct.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white text-sm">{acct.consumer.user.name}</div>
                        <div className="text-slate-400 text-xs">{acct.consumer.user.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold text-sm">{kes(acct.creditLimit)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${overdue ? "text-red-400" : "text-emerald-400"}`}>
                          {overdue ? `-${kes(balance)}` : kes(available)}
                        </span>
                        <div className="text-slate-500 text-xs">{overdue ? "owed" : "available"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${STATUS_COLORS[acct.status]}`}>{acct.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{acct.paymentTermDays} days</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => loadAccount(acct.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                            View
                          </button>
                          <button onClick={() => { setShowTxModal({ account: acct, type: "REPAYMENT" }); setTxForm({ amount: 0, reference: "", description: "" }); }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold transition-all">
                            Repayment
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-12 text-sm">No credit accounts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Account Detail Panel */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60">
          <div className="w-full max-w-lg h-full bg-slate-900 border-l border-white/10 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">{selectedAccount.consumer.user.name}</h2>
                <p className="text-slate-400 text-sm">{selectedAccount.consumer.user.phone}</p>
              </div>
              <button onClick={() => setSelectedAccount(null)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/60 border border-blue-500/20 rounded-2xl p-5 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Outstanding Balance</p>
                    <p className={`text-3xl font-black ${selectedAccount.currentBalance < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {selectedAccount.currentBalance < 0 ? `-${kes(selectedAccount.currentBalance)}` : kes(selectedAccount.currentBalance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Credit Limit</p>
                    <p className="text-white font-bold text-lg">{kes(selectedAccount.creditLimit)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handlePrintStatement(selectedAccount)}
                    className="flex-1 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/30 text-blue-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                    <PrinterIcon className="w-3.5 h-3.5" /> Statement
                  </button>
                  {["REPAYMENT", "TOP_UP", "ADJUSTMENT"].map(type => (
                    <button key={type} onClick={() => { setShowTxModal({ account: selectedAccount, type }); setTxForm({ amount: 0, reference: "", description: "" }); }}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
                      {type.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions */}
              <h3 className="text-white font-bold mb-3 text-sm">Transaction History</h3>
              <div className="space-y-2">
                {(selectedAccount.transactions ?? []).map(tx => (
                  <div key={tx.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/10`}>
                      {tx.amount > 0 ? <ArrowUpIcon className="h-4 w-4 text-emerald-400" /> : <ArrowDownIcon className="h-4 w-4 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold ${TX_COLORS[tx.txType] ?? "text-white"}`}>{tx.txType.replace("_", " ")}</span>
                        <span className={`font-bold text-sm ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}{kes(tx.amount)}
                        </span>
                      </div>
                      {tx.description && <p className="text-slate-400 text-xs mt-0.5">{tx.description}</p>}
                      <p className="text-slate-500 text-xs mt-0.5">{new Date(tx.createdAt).toLocaleDateString("en-KE")}</p>
                    </div>
                    <button
                      onClick={() => handlePrintThermalSlip(selectedAccount, tx)}
                      title="Print Thermal Slip"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <PrinterIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(selectedAccount.transactions ?? []).length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-6">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">{showTxModal.type.replace("_", " ")}</h2>
              <button onClick={() => setShowTxModal(null)} className="text-slate-400 hover:text-white"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Amount (KES)</label>
                <input type="number" min={0.01} step={0.01} value={txForm.amount || ""}
                  onChange={e => setTxForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Reference (optional)</label>
                <input value={txForm.reference} onChange={e => setTxForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="MPesa code, receipt no..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Note (optional)</label>
                <textarea value={txForm.description} onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTxModal(null)} className="flex-1 py-3 rounded-xl border border-white/20 text-slate-400 hover:text-white transition-all">Cancel</button>
                <button onClick={recordTx} disabled={saving || !txForm.amount}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                  {saving ? "Recording..." : "Record"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Open Credit Account</h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Customer Phone Number</label>
                <input value={newForm.consumerPhone} onChange={e => setNewForm(f => ({ ...f, consumerPhone: e.target.value }))}
                  placeholder="+254..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1">Credit Limit (KES)</label>
                  <input type="number" min={0} value={newForm.creditLimit}
                    onChange={e => setNewForm(f => ({ ...f, creditLimit: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold block mb-1">Payment Term (days)</label>
                  <input type="number" min={1} value={newForm.paymentTermDays}
                    onChange={e => setNewForm(f => ({ ...f, paymentTermDays: parseInt(e.target.value) || 30 }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold block mb-1">Notes</label>
                <textarea value={newForm.notes} onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNewModal(false)} className="flex-1 py-3 rounded-xl border border-white/20 text-slate-400">Cancel</button>
                <button onClick={openAccount} disabled={saving || !newForm.consumerPhone}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
                  Open Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
