"use client";

import React, { useEffect, useState } from "react";
import {
  XMarkIcon as X,
  ArrowPathIcon as Loader2,
  ArrowUturnLeftIcon as RotateCcw,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Agent {
  id: string;
  name?: string;
  loginCode?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface ReturnProductModalProps {
  productId?: string;
  product?: any;
  companyId?: string;
  initialAgents?: Agent[];
  agents?: Agent[];
  showReturnProductModal?: boolean;
  setShowReturnProductModal?: (show: boolean) => void;
  refreshInventory?: () => Promise<void> | void;
  onClose?: () => void;
}

const ReturnProductModal: React.FC<ReturnProductModalProps> = ({
  productId: rawProductId,
  product,
  companyId: rawCompanyId,
  initialAgents = [],
  agents: passedAgents = [],
  showReturnProductModal = true,
  setShowReturnProductModal,
  refreshInventory,
  onClose,
}) => {
  const resolvedProductId = rawProductId || product?.id || "";
  const resolvedCompanyId = rawCompanyId || product?.companyId || "";
  const seedAgents =
    initialAgents.length > 0 ? initialAgents : passedAgents;

  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const [salesAgentId, setSalesAgentId] = useState<string>(
    seedAgents[0]?.id || "",
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [damaged, setDamaged] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingAgents, setFetchingAgents] = useState<boolean>(false);

  const handleClose = () => {
    if (setShowReturnProductModal) setShowReturnProductModal(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    if (seedAgents.length > 0) {
      setAgents(seedAgents);
      if (!salesAgentId) setSalesAgentId(seedAgents[0].id);
      return;
    }
    if (!resolvedCompanyId) return;

    const fetchAgents = async () => {
      setFetchingAgents(true);
      try {
        const res = await fetch(
          `/api/admin/get-all-agents?companyId=${encodeURIComponent(
            resolvedCompanyId,
          )}`,
        );
        const data = await res.json();
        const list = data?.data?.results || data?.results || [];
        if (Array.isArray(list)) {
          setAgents(list);
          if (list.length > 0) setSalesAgentId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setFetchingAgents(false);
      }
    };
    fetchAgents();
  }, [resolvedCompanyId]);

  if (!showReturnProductModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedProductId) {
      toast.error("Missing product ID for return.");
      return;
    }
    if (!salesAgentId) {
      toast.error("Please select the sales agent returning the stock.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Return quantity must be at least 1.");
      return;
    }
    if (damaged > quantity) {
      toast.error("Damaged units cannot exceed total returned quantity.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/post-restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: resolvedProductId,
          companyId: resolvedCompanyId,
          salesAgentId,
          quantity: Number(quantity),
          damaged: Number(damaged || 0),
          reason:
            reason.trim() || "Returned from agent allocation to warehouse",
          action: "RETURN",
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to process stock return.");
      }

      toast.success(
        data?.message || "Stock returned to warehouse successfully!",
      );
      if (refreshInventory) {
        await refreshInventory();
      }
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process return.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Return Agent Stock to Warehouse
              </h2>
              <p className="text-xs text-slate-500">
                {product?.name
                  ? `Product: ${product.name}`
                  : "Reconcile unsold or damaged units back into inventory"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Sales Agent
            </label>
            {fetchingAgents ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading agents...
              </div>
            ) : agents.length === 0 ? (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No sales agents registered for this store yet.
              </div>
            ) : (
              <select
                value={salesAgentId}
                onChange={(e) => setSalesAgentId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select Sales Agent</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name ||
                      agent.user?.name ||
                      agent.user?.email ||
                      agent.loginCode ||
                      agent.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Total Returned Qty
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-full px-3 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Damaged Units (if any)
              </label>
              <input
                type="number"
                min={0}
                max={quantity}
                value={damaged}
                onChange={(e) =>
                  setDamaged(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full px-3 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              Net Sellable Units Restored to Warehouse:
            </span>
            <span className="font-bold text-emerald-700 text-sm">
              +{Math.max(0, quantity - damaged)} units
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Return Reason / Notes
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g., End of field route reconciliation"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || agents.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Processing..." : "Confirm Return"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnProductModal;
