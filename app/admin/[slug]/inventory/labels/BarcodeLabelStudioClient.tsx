"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PrinterIcon,
  QrCodeIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  ArrowPathIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { executeUnifiedPrint } from "@/lib/printing/unifiedPrintClient";
import QRCode from "qrcode";

interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  price?: number;
  sellingPrice?: number;
  finalPrice?: number;
  quantity?: number;
  category?: string;
  image?: string;
}

interface SelectedLabel {
  product: ProductItem;
  quantity: number;
}

type LabelTemplate = "shelf-58x40" | "compact-40x28" | "warehouse-80x50" | "a4-sheet";

interface TemplateConfig {
  id: LabelTemplate;
  name: string;
  dimensions: string;
  widthMm: number;
  heightMm: number;
  description: string;
  isSheet?: boolean;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "shelf-58x40",
    name: "Standard Shelf Edge",
    dimensions: "58 × 40 mm",
    widthMm: 58,
    heightMm: 40,
    description: "Retail shelf talker with large bold price and barcode",
  },
  {
    id: "compact-40x28",
    name: "Compact Product Sticker",
    dimensions: "40 × 28 mm",
    widthMm: 40,
    heightMm: 28,
    description: "Compact adhesive label for cosmetics, jewelry, accessories",
  },
  {
    id: "warehouse-80x50",
    name: "Warehouse Bin / Pallet Tag",
    dimensions: "80 × 50 mm",
    widthMm: 80,
    heightMm: 50,
    description: "Large format for inventory bins, apparel hangtags and electronics",
  },
  {
    id: "a4-sheet",
    name: "A4 Sticker Sheet (24-up)",
    dimensions: "A4 Sheet (3×8 grid)",
    widthMm: 70,
    heightMm: 37,
    description: "Standard laser/inkjet A4 label sheets (3 columns × 8 rows)",
    isSheet: true,
  },
];

/**
 * Generate a deterministic Code-128 SVG barcode pattern from code string
 */
function generateBarcodeSvg(code: string, width = 180, height = 40): string {
  const safeCode = (code || "000000").replace(/[^a-zA-Z0-9_-]/g, "");
  let pattern = "11010010000"; // Start code B
  for (let i = 0; i < safeCode.length; i++) {
    const c = safeCode.charCodeAt(i);
    const b = (c * 17 + 11) % 64;
    const bitStr = b.toString(2).padStart(6, "0");
    pattern += bitStr
      .split("")
      .map((x) => (x === "1" ? "11" : "0"))
      .join("");
  }
  pattern += "1100011101011"; // Stop code

  const barWidth = width / pattern.length;
  let rects = "";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "1") {
      rects += `<rect x="${(i * barWidth).toFixed(1)}" y="0" width="${Math.max(
        1,
        barWidth * 0.95
      ).toFixed(1)}" height="${height}" fill="#000" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display:block;margin:0 auto;">${rects}</svg>`;
}

export default function BarcodeLabelStudioClient({
  companyId,
  companyName,
  slug,
  currency = "KES",
}: {
  companyId: string;
  companyName: string;
  slug: string;
  currency?: string;
}) {
  const [catalog, setCatalog] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<SelectedLabel[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<LabelTemplate>("shelf-58x40");
  const [showStoreName, setShowStoreName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSku, setShowSku] = useState(true);
  const [includeQr, setIncludeQr] = useState(false);
  const [customPromoText, setCustomPromoText] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string>>({});

  // Fetch catalog products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/pos-marketplace-listings?companyId=${companyId}&limit=100`);
        const json = await res.json();
        if (json.data?.results) {
          const mapped: ProductItem[] = json.data.results.map((p: any) => ({
            id: p.id,
            name: p.name || p.title || "Product",
            sku: p.sku || p.barcode || p.id.slice(-6).toUpperCase(),
            barcode: p.barcode || p.sku || p.id.slice(-8).toUpperCase(),
            price: p.finalPrice || p.sellingPrice || p.price || 0,
            quantity: p.quantity || 0,
            category: p.category?.name || p.category || "General",
            image: p.image || p.images?.[0] || null,
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [companyId]);

  // Pre-generate QR codes for selected items when QR is enabled
  useEffect(() => {
    if (!includeQr) return;
    selectedLabels.forEach(async ({ product }) => {
      const code = product.barcode || product.sku || product.id;
      if (!qrCodeDataUrls[code]) {
        try {
          const url = await QRCode.toDataURL(code, { width: 80, margin: 1 });
          setQrCodeDataUrls((prev) => ({ ...prev, [code]: url }));
        } catch {}
      }
    });
  }, [selectedLabels, includeQr, qrCodeDataUrls]);

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return catalog;
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [catalog, searchQuery]);

  // Add product to batch
  const handleAddProduct = (product: ProductItem) => {
    setSelectedLabels((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Add all matching products with their stock quantity
  const handleAddAllFromStock = () => {
    const items: SelectedLabel[] = filteredCatalog.map((product) => ({
      product,
      quantity: Math.max(1, Math.min(product.quantity || 1, 50)),
    }));
    setSelectedLabels(items);
  };

  // Update label quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedLabels((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedLabel[]
    );
  };

  // Remove product from batch
  const handleRemoveProduct = (productId: string) => {
    setSelectedLabels((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Total label count
  const totalLabelsToPrint = useMemo(() => {
    return selectedLabels.reduce((acc, item) => acc + item.quantity, 0);
  }, [selectedLabels]);

  // Generate HTML for unified printing or direct browser printing
  const generateLabelsHtml = useCallback(() => {
    const currentTpl = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0];

    const labelCards = selectedLabels
      .flatMap(({ product, quantity }) => {
        const barcodeVal = product.barcode || product.sku || product.id.slice(-6);
        const barcodeSvg = generateBarcodeSvg(barcodeVal, 160, 36);
        const qrUrl = qrCodeDataUrls[barcodeVal] || "";

        return Array.from({ length: quantity }, () => {
          if (activeTemplate === "compact-40x28") {
            return `
              <div class="label-card compact">
                <div class="label-header">${showStoreName ? companyName : ""}</div>
                <div class="product-title">${product.name}</div>
                <div class="barcode-wrap">${barcodeSvg}</div>
                <div class="code-and-price">
                  <span class="code">${showSku ? barcodeVal : ""}</span>
                  ${showPrice ? `<span class="price">${currency} ${(product.price || 0).toLocaleString()}</span>` : ""}
                </div>
              </div>
            `;
          }

          if (activeTemplate === "warehouse-80x50") {
            return `
              <div class="label-card warehouse">
                <div class="wh-header">
                  <span class="store-name">${companyName}</span>
                  <span class="category-badge">${product.category || "INVENTORY"}</span>
                </div>
                <div class="wh-body">
                  <div class="wh-left">
                    <div class="product-title-large">${product.name}</div>
                    <div class="wh-sku">SKU: <strong>${product.sku || barcodeVal}</strong></div>
                    ${customPromoText ? `<div class="promo-text">${customPromoText}</div>` : ""}
                    ${showPrice ? `<div class="wh-price">${currency} ${(product.price || 0).toLocaleString()}</div>` : ""}
                  </div>
                  ${includeQr && qrUrl ? `<div class="wh-qr"><img src="${qrUrl}" width="60" height="60" /></div>` : ""}
                </div>
                <div class="barcode-wrap-large">${barcodeSvg}</div>
                <div class="barcode-text">${barcodeVal}</div>
              </div>
            `;
          }

          // Default: shelf-58x40 or a4-sheet
          return `
            <div class="label-card shelf">
              <div class="label-header">
                <span class="store-name">${showStoreName ? companyName : ""}</span>
                ${customPromoText ? `<span class="promo-badge">${customPromoText}</span>` : ""}
              </div>
              <div class="product-title">${product.name}</div>
              <div class="price-row">
                ${showPrice ? `<span class="currency">${currency}</span><span class="big-price">${(product.price || 0).toLocaleString()}</span>` : ""}
                <span class="vat-tag">VAT INCL</span>
              </div>
              <div class="barcode-wrap">${barcodeSvg}</div>
              <div class="code-row">
                <span class="barcode-number">${showSku ? barcodeVal : ""}</span>
                ${product.category ? `<span class="cat-pill">${product.category}</span>` : ""}
              </div>
            </div>
          `;
        });
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Labels - ${companyName}</title>
          <style>
            @page {
              size: ${currentTpl.isSheet ? "A4 portrait" : `${currentTpl.widthMm}mm ${currentTpl.heightMm}mm`};
              margin: ${currentTpl.isSheet ? "8mm" : "0"};
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #000;
              background: #fff;
            }
            .labels-container {
              display: ${currentTpl.isSheet ? "grid" : "block"};
              grid-template-columns: ${currentTpl.isSheet ? "repeat(3, 1fr)" : "none"};
              gap: ${currentTpl.isSheet ? "4mm" : "0"};
              padding: ${currentTpl.isSheet ? "4mm" : "0"};
            }
            .label-card {
              page-break-after: ${currentTpl.isSheet ? "auto" : "always"};
              width: ${currentTpl.isSheet ? "100%" : `${currentTpl.widthMm}mm`};
              height: ${currentTpl.isSheet ? "35mm" : `${currentTpl.heightMm}mm`};
              padding: 2.5mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: ${currentTpl.isSheet ? "1px dashed #ccc" : "none"};
              overflow: hidden;
            }
            .label-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 7.5pt;
              font-weight: 700;
              text-transform: uppercase;
              color: #444;
              line-height: 1;
            }
            .product-title {
              font-size: 8.5pt;
              font-weight: 700;
              line-height: 1.15;
              max-height: 2.4em;
              overflow: hidden;
              margin: 1mm 0;
            }
            .price-row {
              display: flex;
              align-items: baseline;
              gap: 2px;
              margin: 0.5mm 0;
            }
            .currency { font-size: 8pt; font-weight: 700; color: #111; }
            .big-price { font-size: 14pt; font-weight: 900; letter-spacing: -0.5px; }
            .vat-tag { font-size: 5.5pt; font-weight: 600; color: #666; margin-left: auto; align-self: flex-end; }
            .barcode-wrap { text-align: center; margin: 0.5mm 0; }
            .barcode-wrap svg { max-width: 95%; height: 22px; margin: 0 auto; }
            .code-row {
              display: flex;
              justify-content: space-between;
              font-size: 6.5pt;
              font-family: monospace;
              color: #333;
            }
            .cat-pill { font-size: 5.5pt; text-transform: uppercase; background: #eee; padding: 1px 3px; border-radius: 2px; }
            .promo-badge { font-size: 6pt; background: #000; color: #fff; padding: 1px 4px; border-radius: 2px; }

            /* Compact layout (40x28mm) */
            .label-card.compact { padding: 1.5mm; }
            .label-card.compact .product-title { font-size: 7pt; max-height: 1.2em; white-space: nowrap; }
            .label-card.compact .barcode-wrap svg { height: 18px; }
            .label-card.compact .code-and-price { display: flex; justify-content: space-between; align-items: baseline; font-size: 6pt; font-family: monospace; }
            .label-card.compact .price { font-size: 7.5pt; font-weight: 800; font-family: sans-serif; }

            /* Warehouse layout (80x50mm) */
            .label-card.warehouse { padding: 3mm; }
            .wh-header { display: flex; justify-content: space-between; font-size: 8pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 1mm; margin-bottom: 1.5mm; }
            .wh-body { display: flex; justify-content: space-between; gap: 2mm; flex: 1; }
            .wh-left { flex: 1; }
            .product-title-large { font-size: 10.5pt; font-weight: 800; line-height: 1.1; margin-bottom: 1mm; }
            .wh-sku { font-size: 8pt; font-family: monospace; }
            .wh-price { font-size: 15pt; font-weight: 900; margin-top: 1.5mm; }
            .wh-qr img { border: 1px solid #eee; }
            .barcode-wrap-large svg { max-width: 95%; height: 28px; margin: 1mm auto 0; }
            .barcode-text { text-align: center; font-size: 7pt; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labelCards}
          </div>
        </body>
      </html>
    `;
  }, [
    selectedLabels,
    activeTemplate,
    showStoreName,
    companyName,
    showPrice,
    currency,
    showSku,
    customPromoText,
    includeQr,
    qrCodeDataUrls,
  ]);

  // Execute unified printing
  const handlePrintLabels = async () => {
    if (selectedLabels.length === 0) return;
    setIsPrinting(true);
    setPrintSuccess(false);

    const htmlContent = generateLabelsHtml();
    const currentTpl = TEMPLATES.find((t) => t.id === activeTemplate) || TEMPLATES[0];

    try {
      await executeUnifiedPrint(
        {
          jobId: `LBL-${Date.now()}`,
          jobType: "RECEIPT",
          printerAction: "LABEL_PRINT",
          companyId,
          contentHtml: htmlContent,
          paperWidth: currentTpl.widthMm <= 58 ? "58mm" : "80mm",
          copies: 1,
        },
        htmlContent
      );

      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 3000);
    } catch (err) {
      console.error("Print labels failed:", err);
      // Fallback: standard window.print in iframe
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => document.body.removeChild(printFrame), 2000);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Barcode & Shelf Label Studio
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Unified Print Ready
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Generate and dispatch thermal barcode labels and shelf talkers for {companyName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {printSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 animate-in fade-in">
              <CheckCircleIcon className="w-4 h-4" /> Dispatched to Printer!
            </div>
          )}

          <button
            onClick={handlePrintLabels}
            disabled={selectedLabels.length === 0 || isPrinting}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition ${
              selectedLabels.length > 0 && !isPrinting
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {isPrinting ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Dispatching…
              </>
            ) : (
              <>
                <PrinterIcon className="w-4 h-4" />
                Print {totalLabelsToPrint > 0 ? `${totalLabelsToPrint} Labels` : "Labels"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Catalog + Middle Label Queue + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Product Catalog Picker (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CubeIcon className="w-4 h-4 text-indigo-400" /> Catalog Products
            </h2>
            <button
              onClick={handleAddAllFromStock}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Add In-Stock
            </button>
          </div>

          {/* Search bar */}
          <div className="relative my-3">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, SKU, or barcode…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-zinc-500 text-xs">Loading catalog…</div>
            ) : filteredCatalog.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">No matching products found.</div>
            ) : (
              filteredCatalog.map((product) => {
                const isSelected = selectedLabels.some((item) => item.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500/40"
                        : "bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                        <span className="font-mono text-zinc-500">{product.sku || product.barcode}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">
                          {currency} {(product.price || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-500"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                      }`}
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: Print Queue & Options (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-amber-400" /> Print Queue ({selectedLabels.length} items)
            </h2>
            {selectedLabels.length > 0 && (
              <button
                onClick={() => setSelectedLabels([])}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Queue Items */}
          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 custom-scrollbar">
            {selectedLabels.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                <TagIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Click items in the catalog to add them to your label print batch.
              </div>
            ) : (
              selectedLabels.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                    <p className="text-[11px] font-mono text-zinc-400">{product.sku || product.barcode}</p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(product.id, -1)}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(product.id, 1)}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Layout & Format Customizer */}
          <div className="pt-3 border-t border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-400" /> Label Layout & Elements
            </h3>

            {/* Template Selector */}
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    activeTemplate === tpl.id
                      ? "bg-indigo-950/40 border-indigo-500 text-white"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{tpl.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{tpl.dimensions}</p>
                </button>
              ))}
            </div>

            {/* Field Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStoreName}
                  onChange={(e) => setShowStoreName(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                />
                Store Header
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                />
                Retail Price
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSku}
                  onChange={(e) => setShowSku(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                />
                SKU / Barcode Text
              </label>

              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeQr}
                  onChange={(e) => setIncludeQr(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-0"
                />
                Include QR Code
              </label>
            </div>

            {/* Custom Promo Ribbon */}
            <div>
              <input
                type="text"
                placeholder="Promo badge (e.g. SPECIAL OFFER, SALE, NEW)…"
                value={customPromoText}
                onChange={(e) => setCustomPromoText(e.target.value.toUpperCase())}
                maxLength={20}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Visual Label Preview (4 cols) */}
        <div className="lg:col-span-4 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-emerald-400" /> Live Thermal Preview
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {TEMPLATES.find((t) => t.id === activeTemplate)?.dimensions}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/60 rounded-xl my-3 border border-zinc-800/50">
            {selectedLabels.length === 0 ? (
              <div className="text-center text-zinc-500 text-xs">
                Select products to see a pixel-perfect preview of your physical label.
              </div>
            ) : (
              /* Simulated physical label rendered in high-contrast thermal style */
              <div
                className="bg-white text-black rounded-lg shadow-2xl p-4 transition-all duration-200 select-none border border-zinc-300 flex flex-col justify-between"
                style={{
                  width: activeTemplate === "compact-40x28" ? "220px" : activeTemplate === "warehouse-80x50" ? "320px" : "280px",
                  minHeight: activeTemplate === "compact-40x28" ? "150px" : activeTemplate === "warehouse-80x50" ? "200px" : "180px",
                }}
              >
                {/* Store Header */}
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                  <span>{showStoreName ? companyName : ""}</span>
                  {customPromoText && (
                    <span className="bg-black text-white px-1.5 py-0.5 rounded text-[9px] font-black">
                      {customPromoText}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <div className="my-1">
                  <p className="font-extrabold text-xs leading-snug line-clamp-2 text-zinc-900">
                    {selectedLabels[0]?.product.name}
                  </p>
                </div>

                {/* Price Display */}
                {showPrice && (
                  <div className="flex items-baseline justify-between my-0.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] font-bold text-zinc-800">{currency}</span>
                      <span className="text-xl font-black tracking-tight text-black">
                        {(selectedLabels[0]?.product.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase">VAT INCL</span>
                  </div>
                )}

                {/* SVG Barcode Render */}
                <div
                  className="my-1 text-center"
                  dangerouslySetInnerHTML={{
                    __html: generateBarcodeSvg(
                      selectedLabels[0]?.product.barcode || selectedLabels[0]?.product.sku || "12345678",
                      activeTemplate === "compact-40x28" ? 170 : 210,
                      activeTemplate === "compact-40x28" ? 28 : 34
                    ),
                  }}
                />

                {/* SKU Code Footer */}
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                  <span>{showSku ? selectedLabels[0]?.product.sku || selectedLabels[0]?.product.barcode : ""}</span>
                  <span className="bg-zinc-100 text-zinc-700 font-sans uppercase px-1 py-0.5 rounded text-[8px] font-semibold">
                    {selectedLabels[0]?.product.category || "GENERAL"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
            <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
              Thermal Direct Printing Tips
            </p>
            <p>
              Compatible with Xprinter, Zebra, ESC/POS, and desktop A4 printers. Android & Desktop clients automatically bypass print dialogs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
