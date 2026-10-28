"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  HiXMark,
  HiBolt,
  HiClipboardDocument,
  HiShare,
  HiCheck,
  HiLockClosed,
  HiSparkles,
  HiCalendar,
  HiArrowPath,
  HiChevronUpDown,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

interface DirectPayLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  products?: any[];
  companyId: string;
  onLinkCreated?: (newLink: any) => void;
}

export const DirectPayLinkModal: React.FC<DirectPayLinkModalProps> = ({
  isOpen,
  onClose,
  product: initialProduct,
  products = [],
  companyId,
  onLinkCreated,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<any>(initialProduct || products[0] || null);
  const [productSearch, setProductSearch] = useState<string>("");
  const [isSelectingProduct, setIsSelectingProduct] = useState<boolean>(false);

  // Sync when initialProduct or products list changes
  React.useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
    } else if (products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [initialProduct]);

  const product = selectedProduct || initialProduct || products[0];

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.companyName?.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const [checkoutType, setCheckoutType] = useState<
    "BUY_VARIANT" | "CHOOSE_VARIANT" | "FIXED_CONFIGURATION"
  >("BUY_VARIANT");
  const [defaultQuantity, setDefaultQuantity] = useState<number>(1);
  const [expiryOption, setExpiryOption] = useState<"NEVER" | "7_DAYS" | "30_DAYS">("NEVER");
  const [maxUsesOption, setMaxUsesOption] = useState<"UNLIMITED" | "ONE_TIME" | "CUSTOM">("UNLIMITED");
  const [customMaxUses, setCustomMaxUses] = useState<number>(10);
  const [customFixedPrice, setCustomFixedPrice] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{
    link: any;
    payUrl: string;
    whatsAppUrl: string;
    shareText: string;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse grouped variants from product
  const groupedVariants = useMemo(() => {
    if (!product?.option) return {};
    let options: any[] = [];
    if (typeof product.option === "string") {
      try {
        options = JSON.parse(product.option);
      } catch {
        options = [];
      }
    } else if (Array.isArray(product.option)) {
      options = product.option;
    }

    const grouped = options.reduce((acc: Record<string, any[]>, item: any) => {
      if (!item.category) return acc;
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    // Pre-populate default selection
    if (Object.keys(selectedVariants).length === 0 && Object.keys(grouped).length > 0) {
      const initial: Record<string, string> = {};
      Object.entries(grouped).forEach(([cat, items]: [string, any]) => {
        if (items.length > 0) initial[cat] = items[0].name;
      });
      setSelectedVariants(initial);
    }

    return grouped;
  }, [product?.option, selectedVariants]);

  if (!isOpen || !product) return null;

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate Expiry Date
      let expiresAt: string | null = null;
      const now = new Date();
      if (expiryOption === "7_DAYS") {
        now.setDate(now.getDate() + 7);
        expiresAt = now.toISOString();
      } else if (expiryOption === "30_DAYS") {
        now.setDate(now.getDate() + 30);
        expiresAt = now.toISOString();
      }

      const maxUses =
        maxUsesOption === "ONE_TIME"
          ? 1
          : maxUsesOption === "CUSTOM"
            ? Math.max(1, Number(customMaxUses) || 1)
            : null;

      const payload = {
        companyId,
        productId: product.productId || product._id || product.id,
        marketplaceListingId: product._id || product.id,
        name: `Pay Link: ${product.name} (${defaultQuantity}x)`,
        title: product.name,
        image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
        basePrice: Number(product.sellingPrice || product.price || 0),
        currency: "KES",
        variantConfig:
          checkoutType === "CHOOSE_VARIANT" ? null : selectedVariants,
        defaultQuantity,
        allowQuantityChange: checkoutType === "CHOOSE_VARIANT",
        allowVariantChange: checkoutType === "CHOOSE_VARIANT",
        checkoutType,
        fixedPrice: customFixedPrice ? Number(customFixedPrice) : null,
        expiresAt,
        maxUses,
        source: "DIRECT_PAY_LINK",
      };

      const res = await fetch("/api/pay-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create direct pay link.");
      }

      setGeneratedResult(data);
      if (onLinkCreated) onLinkCreated(data.link);
      toast.success("Direct Pay Link created successfully!");
    } catch (err: any) {
      console.error("[CreatePayLink Error]", err);
      toast.error(err.message || "Could not generate link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (generatedResult?.payUrl) {
      navigator.clipboard.writeText(generatedResult.payUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setGeneratedResult(null);
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <HiBolt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Direct Pay Link</h2>
              <p className="text-xs text-slate-400">
                Shareable 1-tap checkout for <strong className="text-slate-200">{product.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {generatedResult ? (
            /* Result Screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <HiCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Your Pay Link is Ready!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Send this link to your customer. They will land directly on checkout with the product and options pre-filled.
                </p>
              </div>

              {/* Link Input Box */}
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-2.5 rounded-2xl">
                <input
                  type="text"
                  readOnly
                  value={generatedResult.payUrl}
                  className="bg-transparent text-xs text-slate-200 font-mono w-full px-2 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-emerald-500/20"
                >
                  <HiClipboardDocument className="w-4 h-4" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Instant WhatsApp Share */}
              <a
                href={generatedResult.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2.5 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#25D366]/20"
              >
                <FaWhatsapp className="w-5 h-5" />
                <span>Share Instantly on WhatsApp</span>
              </a>

              <div className="pt-2 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white underline transition"
                >
                  Generate another configuration
                </button>
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreateLink} className="space-y-6">
              {/* Product Selection Section */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Target Product
                  </label>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsSelectingProduct(!isSelectingProduct)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1 transition"
                    >
                      <span>{isSelectingProduct ? "Close Selection" : "Change Product"}</span>
                      <HiChevronUpDown className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Selected Product Card */}
                {product && (
                  <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800/80 p-3 rounded-xl">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name || "Product"}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm truncate">
                        {product.name}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-emerald-400 font-bold">
                          KES {Number(product.sellingPrice || product.price || 0).toLocaleString()}
                        </span>
                        {product.companyName && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 truncate">
                            {product.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dropdown Product Picker */}
                {isSelectingProduct && products.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="relative">
                      <HiMagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search product from catalog..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-52 overflow-y-auto space-y-1.5 divide-y divide-slate-800/40 pr-1">
                      {filteredProducts.map((p: any) => {
                        const isSelected = (p.id || p._id) === (product?.id || product?._id);
                        return (
                          <div
                            key={p.id || p._id}
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedVariants({});
                              setCustomFixedPrice("");
                              setIsSelectingProduct(false);
                            }}
                            className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition ${
                              isSelected
                                ? "bg-emerald-500/15 border border-emerald-500/40"
                                : "hover:bg-slate-900 border border-transparent"
                            }`}
                          >
                            <div className="relative w-9 h-9 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                              {p.image ? (
                                <Image
                                  src={p.image}
                                  alt={p.name || "Product"}
                                  fill
                                  className="object-cover"
                                  sizes="36px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                                  IMG
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">
                                {p.name}
                              </div>
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                                <span className="font-mono text-emerald-400 font-semibold">
                                  KES {Number(p.sellingPrice || p.price || 0).toLocaleString()}
                                </span>
                                {p.companyName && (
                                  <span className="text-[9px] text-slate-500 truncate">
                                    • {p.companyName}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                                <HiCheck className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredProducts.length === 0 && (
                        <div className="text-center py-4 text-xs text-slate-500">
                          No matching products found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Option 1: Checkout Type */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  1. Checkout Type
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "BUY_VARIANT",
                      title: "Buy this variant — product options preselected",
                      desc: "The link opens checkout with the selected product and variant already filled in.",
                    },
                    {
                      id: "CHOOSE_VARIANT",
                      title: "Let customer choose options",
                      desc: "Customer selects their preferred size, color, or quantity before payment.",
                    },
                    {
                      id: "FIXED_CONFIGURATION",
                      title: "Fixed quantity and product configuration",
                      desc: "Locks both quantity and options strictly to prevent alterations.",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start p-3.5 rounded-2xl border cursor-pointer transition ${
                        checkoutType === opt.id
                          ? "bg-slate-950 border-emerald-500/80 ring-1 ring-emerald-500/30"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="checkoutType"
                        checked={checkoutType === opt.id}
                        onChange={() => setCheckoutType(opt.id as any)}
                        className="text-emerald-500 mt-1 h-4 w-4 bg-slate-900 border-slate-700"
                      />
                      <div className="ml-3">
                        <span className="text-xs font-bold text-white block">
                          {opt.title}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {opt.desc}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Option 2: Choose Preselected Variants (if not letting customer choose) */}
              {checkoutType !== "CHOOSE_VARIANT" && Object.keys(groupedVariants).length > 0 && (
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">
                    Choose Pre-Configured Variant Options
                  </span>
                  {Object.entries(groupedVariants).map(([category, items]: [string, any]) => (
                    <div key={category} className="space-y-1">
                      <span className="text-[11px] text-slate-400 uppercase font-medium">
                        {category}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {items.map((opt: any) => {
                          const isSel = selectedVariants[category] === opt.name;
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [category]: opt.name,
                                }))
                              }
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                                isSel
                                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                  : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600"
                              }`}
                            >
                              {opt.name}
                              {opt.extraPrice ? ` (+KES ${opt.extraPrice})` : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Option 3: Default Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  2. Default Quantity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setDefaultQuantity(q)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        defaultQuantity === q
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {q} {q === 1 ? "item" : "items"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 4: Link Expiry */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  3. Link Expiry
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "NEVER", label: "No expiry" },
                    { id: "7_DAYS", label: "7 days" },
                    { id: "30_DAYS", label: "30 days" },
                  ].map((exp) => (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExpiryOption(exp.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        expiryOption === exp.id
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {exp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option 5: Usage Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  4. Maximum Uses (Protection Against Over-sharing)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "UNLIMITED", label: "Unlimited" },
                    { id: "ONE_TIME", label: "Single Use (1x)" },
                    { id: "CUSTOM", label: "Custom Limit" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMaxUsesOption(opt.id as any)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        maxUsesOption === opt.id
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {maxUsesOption === "CUSTOM" && (
                  <div className="mt-2">
                    <input
                      type="number"
                      min={1}
                      value={customMaxUses}
                      onChange={(e) => setCustomMaxUses(Number(e.target.value))}
                      placeholder="Enter max number of successful orders"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Expected Customer Journey Preview */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-1.5">
                <span className="font-bold text-slate-300 block mb-1">
                  Expected Customer Journey:
                </span>
                <p className="text-slate-400">
                  Open link → confirm selected product and variant ({defaultQuantity} item) → enter essential details → pay via M-Pesa / Card.
                </p>
                <p className="text-[11px] text-emerald-400 pt-1 font-mono">
                  Expiry: {expiryOption === "NEVER" ? "Until revoked" : expiryOption.replace("_", " ")}. Limit: {maxUsesOption === "UNLIMITED" ? "Unlimited" : maxUsesOption === "ONE_TIME" ? "1-time single purchase" : `${customMaxUses} uses`}.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <HiArrowPath className="w-5 h-5 animate-spin" />
                    <span>Generating Cryptographic Pay Link...</span>
                  </>
                ) : (
                  <>
                    <HiBolt className="w-5 h-5" />
                    <span>Generate Shareable Direct Pay Link</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
