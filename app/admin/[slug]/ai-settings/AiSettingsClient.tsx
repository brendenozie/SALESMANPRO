"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  CpuChipIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ChartBarIcon,
  BoltIcon,
  PlusCircleIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  useAICredits,
  useAIModels,
  useAICreditTransactions,
  useAIUsageAnalytics,
  useBuyAICredits,
} from "@/hooks/useAI";

interface Props {
  companyId: string;
}

export default function AiSettingsClient({ companyId }: Props) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [phoneForPayment, setPhoneForPayment] = useState("");

  const { data: creditsData, isLoading: creditsLoading, refetch: refetchCredits } = useAICredits();
  const { data: modelsData, isLoading: modelsLoading } = useAIModels();
  const { data: transactionsData } = useAICreditTransactions(1, 15);
  const { data: usageData } = useAIUsageAnalytics("month");
  const buyCreditsMutation = useBuyAICredits();

  const balance = creditsData?.balance ?? 0;
  const companyName = creditsData?.companyName || "Store";

  const handlePurchase = async (pkg: any) => {
    try {
      await buyCreditsMutation.mutateAsync({
        packageId: pkg.id,
        phone: phoneForPayment || undefined,
        paymentMethod: "MPESA",
      });
      setShowBuyModal(false);
      refetchCredits();
      toast.success(`Successfully top-up ${pkg.credits.toLocaleString()} credits!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment top-up");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-4 md:p-6 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Central AI Control Center
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <CpuChipIcon className="h-6 w-6 text-indigo-500" />
              AI Wallet & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Infrastructure.</span>
            </h1>
          </div>

          {/* Top-up CTA */}
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition"
          >
            <PlusCircleIcon className="w-4 h-4 stroke-2" />
            <span>Top Up Credits</span>
          </button>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BoltIcon className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Available Credit Balance</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {creditsLoading ? "..." : balance.toLocaleString()} Credits
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Monthly Requests</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 block">
                {(usageData?.totalRequests || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Infrastructure Engine</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                Unified SalesmanPro Cluster
              </span>
            </div>
          </div>
        </div>

        {/* Model Catalog Section */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Model Registry & Credit Rates</h3>
              <p className="text-xs text-slate-500">Unified pricing across Web AI Studio and WhatsApp AI Concierge</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(modelsData || []).map((model: any) => (
              <div
                key={model.id}
                className="p-4 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{model.displayName}</span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                      {model.provider}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{model.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>
                    {model.imageCreditCost
                      ? `${model.imageCreditCost} Credits / Image`
                      : model.videoCreditCost
                      ? `${model.videoCreditCost} Credits / Sec`
                      : `${model.inputCreditCost} in / ${model.outputCreditCost} out per 1k tok`}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packages */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Credit Top-Up Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(creditsData?.packages || []).map((pkg: any) => (
              <div
                key={pkg.name}
                className={`p-5 rounded-2xl border flex flex-col justify-between relative bg-slate-50 dark:bg-black/30 ${
                  pkg.isPopular
                    ? "border-indigo-600 shadow-md ring-2 ring-indigo-50 dark:ring-indigo-950/40"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {pkg.badge && (
                  <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                    {pkg.badge}
                  </span>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pkg.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">${pkg.price}</span>
                    <span className="text-xs font-semibold text-slate-500">/ {pkg.currency}</span>
                  </div>
                  <span className="inline-block mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {pkg.credits.toLocaleString()} Credits
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedPackage(pkg);
                    setShowBuyModal(true);
                  }}
                  className={`w-full mt-5 py-2.5 rounded-xl font-bold text-xs transition ${
                    pkg.isPopular
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Buy Package
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Recent Credit Ledger Entries</h4>
            <p className="text-xs text-slate-500">Immutable accounting records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-black/40 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Balance After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(transactionsData?.transactions || []).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap font-medium">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          tx.type === "PURCHASE" || tx.type === "BONUS"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                            : tx.type === "REFUND" || tx.type === "RELEASE"
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 dark:text-slate-200 font-semibold">{tx.description}</td>
                    <td
                      className={`px-6 py-3.5 font-bold ${
                        tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-medium">
                      {tx.balanceAfter != null ? `${tx.balanceAfter.toLocaleString()} Credits` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top-Up Payment Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Top Up AI Credits ({selectedPackage?.name || "Starter AI"})
              </h3>
              <button onClick={() => setShowBuyModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 stroke-2" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">M-Pesa / Contact Phone</label>
              <input
                type="tel"
                value={phoneForPayment}
                onChange={(e) => setPhoneForPayment(e.target.value)}
                placeholder="e.g. 254712345678"
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Credits to Add:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedPackage?.credits?.toLocaleString() || "1,000"} Credits
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">${selectedPackage?.price || "10.00"}</span>
              </div>
            </div>

            <button
              disabled={buyCreditsMutation.isPending}
              onClick={() =>
                handlePurchase(
                  selectedPackage || { id: "starter", name: "Starter AI", credits: 1000, price: 10 },
                )
              }
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {buyCreditsMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Confirm & Credit Wallet</span>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}