"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PhotoIcon,
  LinkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MediaUploadGateway, { UploadedMediaItem } from "@/components/media/MediaUploadGateway";
import { IStoreCategory } from "@/types/typings";

interface QuickMarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  categories: IStoreCategory[];
  onListingCreated?: (listing: any) => void;
  onOpenDetailedForm?: (prefilledData: any) => void;
}

export default function QuickMarketplaceModal({
  isOpen,
  onClose,
  companyId,
  categories,
  onListingCreated,
  onOpenDetailedForm,
}: QuickMarketplaceModalProps) {
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState(categories[0]?.displayName || "General");
  const [productCategoryId, setProductCategoryId] = useState(categories[0]?.categoryId || "");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedMediaItem[]>([]);

  // Attached Product Linking state
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 150);
      setErrorMessage("");
    }
  }, [isOpen]);

  const searchProducts = async (query: string) => {
    setSearchProductQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/admin/marketplace/link?action=SEARCH_CANDIDATES&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data || []);
      }
    } catch (err) {
      console.warn("Product search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: any) => {
    setAttachedProduct(product);
    setShowProductSearch(false);
    // Auto-prefill if empty
    if (!name.trim()) setName(product.name);
    if (!sellingPrice) setSellingPrice(String(product.sellingPrice || ""));
    if (product.category) {
      setCategory(product.category);
      const match = categories.find((c) => c.displayName === product.category);
      if (match) setProductCategoryId(match.categoryId);
    }
  };

  const handleSave = async (status: "ACTIVE" | "DRAFT" = "ACTIVE", addAnother = false) => {
    if (!name.trim()) {
      setErrorMessage("Listing title is required.");
      titleInputRef.current?.focus();
      return;
    }

    const parsedPrice = parseFloat(sellingPrice) || 0;
    if (parsedPrice <= 0) {
      setErrorMessage("Please specify a valid public selling price.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        name: name.trim(),
        sellingPrice: parsedPrice,
        finalPrice: parsedPrice,
        category,
        productCategoryId: productCategoryId || undefined,
        description: description.trim() || undefined,
        productId: attachedProduct?.id || undefined,
        images: images.map((img) => img.url),
        companyId,
        status,
        showOnGhuba: status === "ACTIVE",
      };

      const res = await fetch("/api/admin/post-market-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to save marketplace listing");
      }

      onListingCreated?.(data.data);
      setSuccessToast(`Listing "${name}" published!`);
      setTimeout(() => setSuccessToast(""), 3000);

      if (addAnother) {
        setName("");
        setSellingPrice("");
        setDescription("");
        setImages([]);
        setAttachedProduct(null);
        titleInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while publishing.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200 dark:shadow-none">
              <ShoppingBagIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Quick Add to Marketplace</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Publish a customer-facing listing to Ghuba
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

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* Attached Inventory Product Selector */}
          <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
            {attachedProduct ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      Linked to Inventory Product
                    </p>
                    <p className="text-[11px] text-gray-500 truncate max-w-xs">
                      {attachedProduct.name} • SKU: {attachedProduct.model || "N/A"} • Stock: {attachedProduct.quantity}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedProduct(null)}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Unlink
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <LinkIcon className="w-4 h-4" />
                  {showProductSearch ? "Close Product Search" : "Link to existing Inventory Product (optional)"}
                </button>

                {showProductSearch && (
                  <div className="mt-2.5 space-y-2">
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchProductQuery}
                        onChange={(e) => searchProducts(e.target.value)}
                        placeholder="Search inventory by name, SKU, or barcode..."
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {isSearching && <p className="text-xs text-gray-400">Searching products...</p>}

                    {searchResults.length > 0 && (
                      <div className="max-h-36 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
                        {searchResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelectProduct(p)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {p.name}
                            </span>
                            <span className="text-gray-500">
                              KES {p.sellingPrice} (Stock: {p.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Listing Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Modern Executive Mesh Chair, Nike Air Max 90"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
          </div>

          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Customer Price (Selling Price) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Marketplace Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const sel = e.target.value;
                  setCategory(sel);
                  const m = categories.find((c) => c.displayName === sel);
                  setProductCategoryId(m?.categoryId || "");
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.categoryId || cat.displayName} value={cat.displayName}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Marketing Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Short Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight top features for customers..."
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Customer Product Photos
            </label>
            <MediaUploadGateway
              companyId={companyId}
              mediaType="image"
              maxFiles={4}
              onMediaChanged={setImages}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDetailedForm?.({
                name,
                sellingPrice: parseFloat(sellingPrice) || 0,
                category,
                description,
                productId: attachedProduct?.id,
              });
            }}
            className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            Full Marketplace Setup →
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("DRAFT", false)}
              className="px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
            >
              Save Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("ACTIVE", true)}
              className="px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center gap-1"
            >
              <PlusIcon className="w-3.5 h-3.5" /> Publish & Add Another
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave("ACTIVE", false)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
