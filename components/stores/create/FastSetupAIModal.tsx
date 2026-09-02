"use client";

import React, { useState, useEffect } from "react";
import {
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShoppingBagIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  SwatchIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  TagIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface FastSetupAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (blueprint: any) => void;
  siteCategories?: any[];
  availableCategories?: any[];
  currentBusinessCategory?: string;
  initialCategoryId?: string;
}

export default function FastSetupAIModal({
  isOpen,
  onClose,
  onApply,
  siteCategories = [],
  availableCategories = [],
  currentBusinessCategory = "",
  initialCategoryId = "",
}: FastSetupAIModalProps) {
  const [businessDescription, setBusinessDescription] = useState("");
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState(currentBusinessCategory);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [brandTone, setBrandTone] = useState("Modern & Premium");
  const [currency, setCurrency] = useState("KES");
  const [loading, setLoading] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategoryId(initialCategoryId);
    }
  }, [initialCategoryId]);

  useEffect(() => {
    if (currentBusinessCategory) {
      setSelectedBusinessCategory(currentBusinessCategory);
    }
  }, [currentBusinessCategory]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!businessDescription.trim() || businessDescription.trim().length < 5) {
      toast.error("Please describe your business idea (at least 5 characters).");
      return;
    }

    setLoading(true);
    try {
      const selectedCategoryObj = availableCategories.find(
        (c) => c.id === selectedCategoryId,
      );

      const res = await fetch("/api/ai/store-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDescription.trim(),
          businessCategory: selectedBusinessCategory || undefined,
          categoryId: selectedCategoryId || undefined,
          categoryName: selectedCategoryObj?.name || undefined,
          brandTone,
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.blueprint) {
        setBlueprint(data.blueprint);
        toast.success("Store blueprint generated and synced with database categories!");
      } else {
        toast.error(data.error || "Failed to generate store blueprint.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!blueprint) return;
    onApply({
      ...blueprint,
      selectedIndustry: blueprint.suggestedIndustry || selectedBusinessCategory,
    });
    toast.success(`Applied "${blueprint.name}" and synced category to store!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 transition-all duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-100">

        {/* HEADER */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Fast Setup with AI
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  5 Credits
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Architect your store profile, industry taxonomy, and database-synced catalog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {!blueprint ? (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mb-2">
                  <span>What are you selling? (Business description)</span>
                  <span className="text-slate-500">(Required)</span>
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={4}
                  placeholder="e.g. A boutique specialty coffee roastery and organic bakery in Nairobi offering fresh beans, pastry bundles, and barista equipment..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Business Category & Database Product Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Store Business Industry (from siteCategories) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <BriefcaseIcon className="w-4 h-4 text-amber-400" />
                    <span>Store Industry / Business Category</span>
                  </label>
                  <select
                    value={selectedBusinessCategory}
                    onChange={(e) => setSelectedBusinessCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all truncate"
                  >
                    <option value="">🤖 Auto-detect Store Industry</option>
                    {siteCategories.map((sc: any) => (
                      <option key={sc.name} value={sc.name}>
                        {sc.icon ? `${sc.icon} ` : ""}{sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Database Canonical Product Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
                    <span>Database Product Category</span>
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all truncate"
                  >
                    <option value="">🤖 Auto-match DB Category</option>
                    {availableCategories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Tone Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <SwatchIcon className="w-4 h-4 text-slate-400" />
                    <span>Brand Tone</span>
                  </label>
                  <select
                    value={brandTone}
                    onChange={(e) => setBrandTone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Modern & Premium">Modern & Premium</option>
                    <option value="Friendly & Approachable">Friendly & Approachable</option>
                    <option value="Bold & Energetic">Bold & Energetic</option>
                    <option value="Minimalist & Clean">Minimalist & Clean</option>
                  </select>
                </div>

                {/* Currency Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <CurrencyDollarIcon className="w-4 h-4 text-slate-400" />
                    <span>Currency</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="KES">KES (Kenyan Shilling)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW OF GENERATED BLUEPRINT */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
                    AI Generated Identity
                  </span>
                  <button
                    onClick={() => setBlueprint(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{blueprint.name}</h3>
                <p className="text-xs font-medium text-indigo-300/80 italic">"{blueprint.tagline}"</p>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{blueprint.description}</p>
              </div>

              {/* INDUSTRY & DATABASE CATEGORY SYNC */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <BriefcaseIcon className="w-4 h-4 text-amber-400" />
                    <span>Store Industry:</span>
                    <strong className="text-amber-300">
                      {blueprint.suggestedIndustry || selectedBusinessCategory || "Retail & Commerce"}
                    </strong>
                  </div>

                  {blueprint.matchedCategory && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
                      <span>DB Catalog:</span>
                      <strong className="text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                        {blueprint.matchedCategory.name}
                      </strong>
                    </div>
                  )}
                </div>

                {Array.isArray(blueprint.matchedCategory?.newSubcategories) &&
                  blueprint.matchedCategory.newSubcategories.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-start gap-2 pt-1 border-t border-indigo-500/10">
                      <TagIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300">Added to StoreCategory: </strong>
                        {blueprint.matchedCategory.newSubcategories.join(", ")}
                      </span>
                    </div>
                  )}

                {Array.isArray(blueprint.matchedCategory?.newBrands) &&
                  blueprint.matchedCategory.newBrands.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-start gap-2">
                      <SwatchIcon className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-300">Store Brands: </strong>
                        {blueprint.matchedCategory.newBrands.join(", ")}
                      </span>
                    </div>
                  )}
              </div>

              {/* STARTER PRODUCTS */}
              {Array.isArray(blueprint.starterProducts) && blueprint.starterProducts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBagIcon className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Generated Catalog ({blueprint.starterProducts.length} Items - Synced with Main DB Category)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {blueprint.starterProducts.map((p: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200 truncate max-w-[170px]">{p.name}</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            {blueprint.currency} {p.price?.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-indigo-400 font-medium">
                          {p.subcategory ? `${p.categoryName} > ${p.subcategory}` : p.categoryName}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* POLICIES & GREETING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <TruckIcon className="w-4 h-4 text-amber-400" />
                    <span>Shipping Presets</span>
                  </span>
                  <p className="text-slate-200 font-mono text-[11px]">
                    Standard: {blueprint.currency} {blueprint.shipping?.standardRate ?? 250} | Express: {blueprint.currency} {blueprint.shipping?.expressRate ?? 500}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Greeting</span>
                  </span>
                  <p className="text-slate-300 truncate italic">"{blueprint.whatsappGreeting}"</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <InformationCircleIcon className="w-4 h-4 shrink-0" />
            <span>Synced with main DB product category and store industry</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            {!blueprint ? (
              <button
                onClick={handleGenerate}
                disabled={loading || !businessDescription.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Architecting...</span>
                  </>
                ) : (
                  <>
                    <BoltIcon className="w-4 h-4 text-indigo-200" />
                    <span>Generate Blueprint</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Apply & Sync Category</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}