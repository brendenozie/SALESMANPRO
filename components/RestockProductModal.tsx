import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { BuildingStorefrontIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface RestockProductModalProps {
  showRestockProductModal: boolean;
  setShowRestockProductModal: (show: boolean) => void;
  product: any;
  companyId?: string;
  refreshInventory: () => void;
}

const RestockProductModal: React.FC<RestockProductModalProps> = ({
  showRestockProductModal,
  setShowRestockProductModal,
  product,
  companyId,
  refreshInventory,
}) => {
  const [restockQuantity, setRestockQuantity] = useState<number>(0);
  const [damagedQuantity, setDamagedQuantity] = useState<number>(0);
  const [supplierId, setSupplierId] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    if (showRestockProductModal && product) {
      setRestockQuantity(0);
      setDamagedQuantity(0);
      setErrorMessage("");
      setSupplierId(product.supplierId || "");
      setSupplierName(product.supplierName || "");

      const compId = product.companyId;
      if (compId) {
        setLoadingSuppliers(true);
        fetch(`${apiBaseUrl}/admin/suppliers?companyId=${encodeURIComponent(compId)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setSuppliers(data.data);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingSuppliers(false));
      }
    }
  }, [showRestockProductModal, product, apiBaseUrl]);

  const handleRestock = async () => {
    if (!restockQuantity || restockQuantity <= 0) {
      setErrorMessage("Please enter a valid quantity greater than 0 to restock.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `restock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const targetCompanyId = product.companyId || companyId;
      const restockUrl = targetCompanyId
        ? `${apiBaseUrl}/admin/post-restock?companyId=${encodeURIComponent(targetCompanyId)}`
        : `${apiBaseUrl}/admin/post-restock`;

      const response = await fetch(restockUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          productId: product.id,
          companyId: targetCompanyId,
          quantity: Number(restockQuantity),
          damaged: Number(damagedQuantity) || 0,
          action: "RESTOCK",
          supplierId: supplierId || undefined,
          supplierName: supplierName || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to restock product.");
      }

      setShowRestockProductModal(false);
      refreshInventory();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to restock product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={showRestockProductModal}
      onClose={() => setShowRestockProductModal(false)}
      title={`Restock: ${product.name}`}
    >
      <div className="space-y-5 p-5 bg-white dark:bg-gray-900 rounded-2xl text-gray-900 dark:text-gray-100">
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Current Info */}
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <p className="text-gray-400 font-medium">SKU / Model</p>
            <p className="font-bold font-mono text-gray-700 dark:text-gray-300">
              {product.model || product.sku || "N/A"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 font-medium">Current Stock</p>
            <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
              {product.productItem?.quantity ?? product.quantity ?? 0} units
            </p>
          </div>
        </div>

        {/* Optional Supplier Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <BuildingStorefrontIcon className="w-3.5 h-3.5 text-indigo-500" />
            Supplier / Vendor <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <select
            value={supplierId}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSupplierId(selectedId);
              const found = suppliers.find((s) => s.id === selectedId);
              setSupplierName(found ? found.name : "");
            }}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={loadingSuppliers}
          >
            <option value="">No Supplier / General Sourcing</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name} {sup.contactName || sup.contactPerson ? `(${sup.contactName || sup.contactPerson})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Restock Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="restockQuantity" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Quantity to Add <span className="text-red-500">*</span>
            </label>
            <input
              id="restockQuantity"
              type="number"
              min="1"
              placeholder="e.g. 25"
              value={restockQuantity || ""}
              onChange={(e) => setRestockQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Damaged Quantity */}
          <div className="space-y-1.5">
            <label htmlFor="damagedQuantity" className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Damaged In Transit <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="damagedQuantity"
              type="number"
              min="0"
              placeholder="0"
              value={damagedQuantity || ""}
              onChange={(e) => setDamagedQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Restock Action Button */}
        <button
          onClick={handleRestock}
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-2"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="w-4 h-4 animate-spin" /> Restocking...
            </>
          ) : (
            `Confirm & Add ${restockQuantity || 0} Units`
          )}
        </button>
      </div>
    </Modal>
  );
};

export default RestockProductModal;