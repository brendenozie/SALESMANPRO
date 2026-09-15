"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  LinkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

interface LinkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  listing: {
    id: string;
    name: string;
    sellingPrice: number;
    category?: string;
    images?: any[];
    productId?: string | null;
  } | null;
  onLinkSuccess?: () => void;
}

export default function ProductListingLinkerModal({
  isOpen,
  onClose,
  companyId,
  listing,
  onLinkSuccess,
}: LinkerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [pricePreference, setPricePreference] = useState<"PRODUCT" | "LISTING">("PRODUCT");
  const [syncSpecs, setSyncSpecs] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    if (isOpen && listing) {
      setSearchQuery(listing.name.slice(0, 20));
      setSelectedProduct(null);
      setErrorMessage("");
      searchProducts(listing.name.slice(0, 20));
    }
  }, [isOpen, listing]);

  const searchProducts = async (q: string) => {
    if (!q.trim()) {
      setCandidates([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/admin/marketplace/link?action=SEARCH_CANDIDATES&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data || []);
      }
    } catch (err) {
      console.warn("Candidate search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmLink = async () => {
    if (!listing || !selectedProduct) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/marketplace/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LINK",
          listingId: listing.id,
          productId: selectedProduct.id,
          pricePreference,
          syncSpecs,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to link records");
      }

      setSuccessToast("Listing and Product successfully connected!");
      setTimeout(() => {
        onLinkSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during linking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    if (!listing) return;
    if (!window.confirm("Are you sure you want to disconnect this listing from its product? Neither record will be deleted.")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/marketplace/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UNLINK",
          listingId: listing.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to unlink");
      }

      setSuccessToast("Listing unlinked from Product.");
      setTimeout(() => {
        onLinkSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Unlink failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProductFromListing = async () => {
    if (!listing) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/marketplace/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_PRODUCT_FROM_LISTING",
          listingId: listing.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to create product");
      }

      setSuccessToast("New Inventory Product created and linked!");
      setTimeout(() => {
        onLinkSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Product creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-md shadow-purple-200 dark:shadow-none">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                Product ↔ Marketplace Linker
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect customer listing with internal warehouse inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          {successToast && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" /> {successToast}
            </div>
          )}

          {/* Current Listing Card */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-md">
                Current Marketplace Listing
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                {listing.name}
              </h3>
              <p className="text-xs text-gray-500">
                Selling Price: <strong className="text-gray-800 dark:text-gray-200">KES {listing.sellingPrice}</strong> • Category: {listing.category || "General"}
              </p>
            </div>

            {listing.productId && (
              <button
                type="button"
                onClick={handleUnlink}
                disabled={isSubmitting}
                className="text-xs text-red-600 font-bold hover:underline px-3 py-1.5 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Search Inventory Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select Inventory Product to Link
              </label>
              <button
                type="button"
                onClick={handleCreateProductFromListing}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                <PlusCircleIcon className="w-4 h-4" /> Create new Product from Listing
              </button>
            </div>

            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchProducts(e.target.value);
                }}
                placeholder="Search inventory by title, SKU, or ID..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {isSearching && <p className="text-xs text-gray-400">Searching inventory...</p>}

            {/* Candidate list */}
            <div className="max-h-48 overflow-y-auto space-y-2">
              {candidates.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedProduct?.id === prod.id
                      ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {prod.name}
                      </span>
                      {prod.model && (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono">
                          {prod.model}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Price: KES {prod.sellingPrice} • Stock: {prod.quantity} units • Cost: KES {prod.costPrice || 0}
                    </p>
                  </div>

                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {selectedProduct?.id === prod.id ? "Selected ✓" : "Select"}
                  </span>
                </div>
              ))}

              {!isSearching && candidates.length === 0 && searchQuery && (
                <p className="text-xs text-center text-gray-400 py-3">
                  No matching products found. Click "Create new Product from Listing" above.
                </p>
              )}
            </div>
          </div>

          {/* Conflict Resolution Section (Shown when candidate selected) */}
          {selectedProduct && (
            <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                <ArrowsRightLeftIcon className="w-4 h-4 text-purple-600" />
                <span>Link Conflict Preferences</span>
              </div>

              {selectedProduct.sellingPrice !== listing.sellingPrice ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>Price Discrepancy Detected</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Product Price: <strong>KES {selectedProduct.sellingPrice}</strong> vs Listing Price: <strong>KES {listing.sellingPrice}</strong>
                  </p>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200 cursor-pointer">
                      <input
                        type="radio"
                        name="pricePref"
                        checked={pricePreference === "PRODUCT"}
                        onChange={() => setPricePreference("PRODUCT")}
                        className="text-purple-600"
                      />
                      <span>Use Product Price (Update listing to KES {selectedProduct.sellingPrice})</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200 cursor-pointer">
                      <input
                        type="radio"
                        name="pricePref"
                        checked={pricePreference === "LISTING"}
                        onChange={() => setPricePreference("LISTING")}
                        className="text-purple-600"
                      />
                      <span>Keep Listing Price (Retain custom channel price KES {listing.sellingPrice})</span>
                    </label>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Prices are aligned (KES {listing.sellingPrice})
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="sync-specs"
                  type="checkbox"
                  checked={syncSpecs}
                  onChange={(e) => setSyncSpecs(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="sync-specs" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Sync technical specifications (brand, dimensions, colors) from Product
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedProduct || isSubmitting}
            onClick={handleConfirmLink}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 dark:shadow-none transition-all flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" /> Connecting...
              </>
            ) : (
              "Confirm Link"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
