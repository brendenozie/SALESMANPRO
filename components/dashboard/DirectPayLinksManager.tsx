"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  HiBolt,
  HiClipboardDocument,
  HiArrowPath,
  HiXCircle,
  HiCheckCircle,
  HiEye,
  HiShoppingBag,
  HiBanknotes,
  HiPlus,
  HiShare,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { DirectPayLinkModal } from "./DirectPayLinkModal";

interface DirectPayLinksManagerProps {
  companyId: string;
  initialLinks?: any[];
  products?: any[];
}

export const DirectPayLinksManager: React.FC<DirectPayLinksManagerProps> = ({
  companyId,
  initialLinks = [],
  products = [],
}) => {
  const [links, setLinks] = useState<any[]>(initialLinks);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pay-links?companyId=${companyId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error("[FetchLinks Error]", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialLinks.length === 0) {
      fetchLinks();
    }
  }, [companyId]);

  const handleRevoke = async (link: any) => {
    if (!confirm(`Are you sure you want to revoke pay link "${link.code}"? Customers will no longer be able to start new orders with this link.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pay-links/${link.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", companyId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Pay link ${link.code} revoked.`);
        fetchLinks();
      } else {
        toast.error(data.error || "Failed to revoke link.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke link.");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  // Funnel Metrics Calculation
  const metrics = useMemo(() => {
    const totalLinks = links.length;
    const totalVisits = links.reduce((sum, l) => sum + (l.visitCount || 0), 0);
    const totalStarts = links.reduce((sum, l) => sum + (l.checkoutStartCount || 0), 0);
    const totalOrders = links.reduce((sum, l) => sum + (l.ordersCreatedCount || 0), 0);
    const totalPaid = links.reduce((sum, l) => sum + (l.successfulUses || 0), 0);
    const conversionRate =
      totalVisits > 0 ? Number(((totalPaid / totalVisits) * 100).toFixed(1)) : 0;

    return {
      totalLinks,
      totalVisits,
      totalStarts,
      totalOrders,
      totalPaid,
      conversionRate,
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        !searchQuery ||
        link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || link.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [links, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Funnel Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Links
          </span>
          <div className="text-2xl font-black text-white">{metrics.totalLinks}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <HiEye className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Visits
            </span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalVisits}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <HiShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Orders Created
            </span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.totalOrders}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center space-x-1 text-slate-400 mb-1">
            <HiBanknotes className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Paid Orders
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.totalPaid}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Conversion Rate
          </span>
          <div className="text-2xl font-black text-teal-400">
            {metrics.conversionRate}%
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by product or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none focus:border-emerald-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <button
            onClick={fetchLinks}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh links"
          >
            <HiArrowPath className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          {products.length > 0 && (
            <button
              onClick={() => {
                setSelectedProductForModal(products[0]);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20"
            >
              <HiPlus className="w-4 h-4" />
              <span>New Pay Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product / Link</th>
                <th className="py-3.5 px-4">Configuration</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Visits</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-center">Paid</th>
                <th className="py-3.5 px-4 text-center">Conv %</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No Direct Pay Links found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((link) => {
                  const isRevoked = link.status === "REVOKED";
                  return (
                    <tr
                      key={link.id}
                      className="hover:bg-slate-800/30 transition group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-emerald-400 transition">
                          {link.title || link.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {link.code} • KES {link.basePrice?.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-medium text-slate-300 block">
                          {link.checkoutType?.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Qty: {link.defaultQuantity} {link.allowQuantityChange ? "(Editable)" : "(Fixed)"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            link.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : link.status === "REVOKED"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : link.status === "COMPLETED"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {link.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {link.visitCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {link.ordersCreatedCount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                        {link.successfulUses || 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-teal-400">
                        {link.conversionRate}%
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCopy(link.payUrl)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            title="Copy Pay Link"
                          >
                            <HiClipboardDocument className="w-4 h-4" />
                          </button>

                          <a
                            href={link.whatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#25D366] hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                            title="Share on WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </a>

                          {!isRevoked && (
                            <button
                              onClick={() => handleRevoke(link)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition"
                              title="Revoke Link"
                            >
                              <HiXCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {isModalOpen && selectedProductForModal && (
        <DirectPayLinkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProductForModal}
          companyId={companyId}
          onLinkCreated={() => {
            fetchLinks();
          }}
        />
      )}
    </div>
  );
};
