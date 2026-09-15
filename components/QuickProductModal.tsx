"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  BoltIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  TagIcon,
  CurrencyDollarIcon,
  Square3Stack3DIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import MediaUploadGateway, { UploadedMediaItem } from "@/components/media/MediaUploadGateway";
import { IStoreCategory } from "@/types/typings";

interface QuickProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  categories: IStoreCategory[];
  onProductCreated?: (product: any) => void;
  onOpenDetailedForm?: (prefilledData: any) => void;
}

export default function QuickProductModal({
  isOpen,
  onClose,
  companyId,
  categories,
  onProductCreated,
  onOpenDetailedForm,
}: QuickProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.displayName || "General");
  const [productCategoryId, setProductCategoryId] = useState(categories[0]?.categoryId || "");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [sku, setSku] = useState("");
  const [publishToMarketplace, setPublishToMarketplace] = useState(false);
  const [images, setImages] = useState<UploadedMediaItem[]>([]);
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => nameInputRef.current?.focus(), 150);
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setCategory(selectedName);
    const match = categories.find((c) => c.displayName === selectedName);
    setProductCategoryId(match?.categoryId || "");
  };

  const handleSave = async (addAnother = false) => {
    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      nameInputRef.current?.focus();
      return;
    }

    const parsedSellingPrice = parseFloat(sellingPrice) || 0;
    if (parsedSellingPrice < 0) {
      setErrorMessage("Selling price cannot be negative.");
      return;
    }

    const parsedCostPrice = parseFloat(costPrice) || 0;
    const parsedQuantity = parseInt(quantity, 10) || 1;

    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        name: name.trim(),
        category,
        productCategoryId: productCategoryId || undefined,
        sellingPrice: parsedSellingPrice,
        costPrice: parsedCostPrice,
        finalPrice: parsedSellingPrice,
        quantity: parsedQuantity,
        model: sku.trim() || undefined,
        publishToMarketplace,
        images: images.map((img) => img.url),
        companyId,
      };

      const res = await fetch("/api/admin/post-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to save product");
      }

      onProductCreated?.(data.data);
      setSuccessToast(`Saved "${name}"!`);
      setTimeout(() => setSuccessToast(""), 3000);

      if (addAnother) {
        // Reset fields but keep category & tax setting for rapid sequential entry
        setName("");
        setSellingPrice("");
        setCostPrice("");
        setQuantity("1");
        setSku("");
        setImages([]);
        nameInputRef.current?.focus();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 dark:shadow-none">
              <BoltIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Quick Add Product</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add directly to inventory in seconds
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

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ergonomic Office Chair, 128GB Flash Drive"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
          </div>

          {/* Category & SKU Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={handleCategorySelect}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.categoryId || cat.displayName} value={cat.displayName}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                SKU / Barcode <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. SKU-1049"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Selling Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-3.5 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Cost Price <span className="text-gray-400 font-normal">(internal)</span>
              </label>
              <input
                type="number"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Optional Media Dropdown */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMediaUpload(!showMediaUpload)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <PhotoIcon className="w-4 h-4" />
              {showMediaUpload ? "Hide Media Upload" : "+ Add Images / Photos (optional)"}
            </button>

            {showMediaUpload && (
              <div className="mt-3">
                <MediaUploadGateway
                  companyId={companyId}
                  mediaType="image"
                  maxFiles={5}
                  onMediaChanged={setImages}
                />
              </div>
            )}
          </div>

          {/* Direct Marketplace Publishing Checkbox */}
          <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input
                id="quick-publish"
                type="checkbox"
                checked={publishToMarketplace}
                onChange={(e) => setPublishToMarketplace(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <label htmlFor="quick-publish" className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                Publish to Ghuba Marketplace immediately
              </label>
            </div>
            <span className="text-[10px] text-gray-400">Public visibility</span>
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
                category,
                sellingPrice: parseFloat(sellingPrice) || 0,
                costPrice: parseFloat(costPrice) || 0,
                quantity: parseInt(quantity, 10) || 1,
                model: sku,
              });
            }}
            className="text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Switch to Detailed Form →
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" /> Save & Add Another
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Product"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
