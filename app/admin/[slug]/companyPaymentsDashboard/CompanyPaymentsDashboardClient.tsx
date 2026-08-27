"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckCircleIcon, 
  ClockIcon, 
  BanknotesIcon, 
  DevicePhoneMobileIcon,
  CreditCardIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export type PaymentStatus = "INITIATED" | "PENDING" | "COMPLETED";
export type PaymentOption = 
  | "cod" 
  | "pickupatshop" 
  | "mpesa" 
  | "card" 
  | "paystack" 
  | "ghuba" 
  | "stripe" 
  | "paypal" 
  | "cash" 
  | "split" 
  | "pending";

export interface OrderPayment {
  id: string;
  trackingNumber: string;
  customerName: string;
  companyId: string;
  totalFinalPrice: number;
  paymentOption: PaymentOption;
  paymentStatus: PaymentStatus;
  date: string;
}


interface DashboardClientProps {
  companyId: string;
  initialPayments: OrderPayment[];
}

export default function CompanyPaymentsDashboardClient({ 
  companyId, 
  initialPayments 
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "COMPLETED" | "PENDING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState<OrderPayment[]>(initialPayments);

  // Filter Payments by Tab & Search Query
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesTab = activeTab === "ALL" || payment.paymentStatus === activeTab;
      const matchesSearch = 
        payment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [payments, activeTab, searchQuery]);

  // Aggregate Metric Totals
  const totalRevenue = useMemo(() => {
    return payments
      .filter((p) => p.paymentStatus === "COMPLETED")
      .reduce((sum, p) => sum + p.totalFinalPrice, 0);
  }, [payments]);

  const completedCount = useMemo(() => {
    return payments.filter((p) => p.paymentStatus === "COMPLETED").length;
  }, [payments]);

  const pendingCount = useMemo(() => {
    return payments.filter((p) => p.paymentStatus === "PENDING").length;
  }, [payments]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/payments?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setPayments(json.data);
        }
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPaymentDetails = (option: PaymentOption) => {
    switch (option) {
      case "mpesa":
        return { 
          gateway: "M-Pesa", 
          method: "Mobile Money", 
          icon: DevicePhoneMobileIcon, 
          color: "text-emerald-600 bg-emerald-50" 
        };
      case "paystack":
      case "stripe":
      case "paypal":
      case "card":
        return { 
          gateway: option.charAt(0).toUpperCase() + option.slice(1), 
          method: "Card / Online", 
          icon: CreditCardIcon, 
          color: "text-blue-600 bg-blue-50" 
        };
      case "ghuba":
        return { 
          gateway: "Ghuba Platform", 
          method: "Internal Wallet", 
          icon: BuildingStorefrontIcon, 
          color: "text-purple-600 bg-purple-50" 
        };
      case "cash":
      case "cod":
      case "pickupatshop":
        return { 
          gateway: "POS / Direct", 
          method: "Cash / Physical", 
          icon: BanknotesIcon, 
          color: "text-amber-600 bg-amber-50" 
        };
      default:
        return { 
          gateway: "Other", 
          method: option ? option.toUpperCase() : "N/A", 
          icon: BanknotesIcon, 
          color: "text-gray-600 bg-gray-50" 
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-gray-900">
      <div className="mx-auto max-w-7xl">
        
        {/* Header & Metrics */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Payment Ledger
              </h1>
              <button 
                onClick={handleRefresh}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                title="Refresh ledger"
              >
                <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm min-w-[140px]">
              <div className="flex items-center gap-1.5">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</p>
              </div>
              <p className="mt-1 text-xl font-bold text-gray-900">
                KES {totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm min-w-[110px]">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{completedCount}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm min-w-[110px]">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-500">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(["ALL", "COMPLETED", "PENDING"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors
                  ${activeTab === tab
                    ? "border-indigo-600 text-indigo-600 font-semibold"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }
                `}
              >
                {tab === "ALL" ? "All Transactions" : tab}
              </button>
            ))}
          </nav>

          <div className="relative min-w-[240px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search order or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Payment Data Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order / Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gateway & Method</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredPayments.map((payment) => {
                  const details = getPaymentDetails(payment.paymentOption);
                  const Icon = details.icon;
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.trackingNumber}</div>
                        <div className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString()}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${details.color} mr-3`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{details.gateway}</div>
                            <div className="text-xs text-gray-500">{details.method}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          KES {payment.totalFinalPrice.toLocaleString()} 
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
                          ${payment.paymentStatus === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                            payment.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                            'bg-gray-100 text-gray-700'}
                        `}>
                          {payment.paymentStatus === 'COMPLETED' ? (
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                          ) : (
                            <ClockIcon className="h-3.5 w-3.5" />
                          )}
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <BanknotesIcon className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">No payment records found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}